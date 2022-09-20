import { OpraURL } from '@opra/url';
import { OpraVersion } from '../../constants.js';
import { HttpHeaders, HttpStatus } from '../../enums/index.js';
import {
  ApiException,
  BadRequestError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
} from '../../exception/index.js';
import { wrapError } from '../../exception/wrap-error.js';
import { IHttpAdapterContext } from '../../interfaces/adapter-context.interface.js';
import { ExecutionQuery, PropertyQuery } from '../../interfaces/execution-query.interface.js';
import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { KeyValue, QueryScope } from '../../types.js';
import { Headers, HeadersObject } from '../../utils/headers.js';
import { ComplexType } from '../data-type/complex-type.js';
import { ExecutionContext } from '../execution-context.js';
import { ContainerResourceHandler } from '../resource/container-resource-handler.js';
import { EntityResourceHandler } from '../resource/entity-resource-handler.js';
import { OpraAdapter } from './adapter.js';

export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    prefix?: string;
  }
}

interface PreparedOutput {
  status: number;
  headers?: Record<string, string>;
  body?: any;
}

export class OpraHttpAdapter<TAdapterContext extends IHttpAdapterContext> extends OpraAdapter<IHttpAdapterContext> {

  protected prepareRequests(adapterContext: TAdapterContext): ExecutionContext[] {
    const req = adapterContext.getRequest();
    // todo implement batch requests
    if (this.isBatch(adapterContext)) {
      throw new Error('not implemented yet');
    }
    const url = new OpraURL(req.getUrl());
    return [
      this.prepareRequest(
          adapterContext,
          url,
          req.getMethod(),
          Headers.from(req.getHeaders()),
          req.getBody())
    ];
  }

  prepareRequest(
      adapterContext: IHttpAdapterContext,
      url: OpraURL,
      method: string,
      headers: HeadersObject,
      body?: any
  ): ExecutionContext {
    if (!url.path.size)
      throw new BadRequestError();
    if (method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();
    const query = this.buildQuery(url, method, body);
    if (!query)
      throw new MethodNotAllowedError({
        message: `Method "${method}" is not allowed by target resource`
      });
    return new ExecutionContext({
      service: this.service,
      adapterContext,
      query,
      headers,
      params: url.searchParams,
      continueOnError: query.operationType === 'read'
    });
  }

  buildQuery(url: OpraURL, method: string, body?: any): ExecutionQuery | undefined {
    let container: IResourceContainer = this.service;
    try {
      let pathIndex = 0;
      const pathLen = url.path.size;
      while (pathIndex < pathLen) {
        let p = url.path.get(pathIndex++);
        const resource = container.getResource(p.resource);

        // Move through path directories (containers)
        if (resource instanceof ContainerResourceHandler) {
          container = resource;
        } else {
          method = method.toUpperCase();

          if (resource instanceof EntityResourceHandler) {
            const scope: QueryScope = p.key ? 'instance' : 'collection';

            if (pathIndex < pathLen && !(method === 'GET' && scope === 'instance'))
              return;

            let query: ExecutionQuery | undefined;

            switch (method) {

              case 'GET': {
                if (scope === 'collection') {
                  query = ExecutionQuery.forSearch(resource, {
                    filter: url.searchParams.get('$filter'),
                    limit: url.searchParams.get('$limit'),
                    skip: url.searchParams.get('$skip'),
                    distinct: url.searchParams.get('$distinct'),
                    count: url.searchParams.get('$count'),
                    sort: url.searchParams.get('$sort'),
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                    include: url.searchParams.get('$include'),
                  });

                } else {
                  query = ExecutionQuery.forGet(resource, p.key as KeyValue, {
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                    include: url.searchParams.get('$include')
                  });

                  // Move through properties
                  let nested: PropertyQuery | undefined;
                  let path = resource.name;
                  while (pathIndex < pathLen) {
                    const dataType = nested
                        ? this.service.getDataType(nested.property.type || 'string')
                        : query.resource.dataType;
                    if (!(dataType instanceof ComplexType))
                      throw new Error(`"${path}" is not a ComplexType and has no properties.`);
                    p = url.path.get(pathIndex++);
                    path += '.' + p.resource;
                    const prop = dataType.properties?.[p.resource];
                    if (!prop)
                      throw new NotFoundError({message: `Invalid or unknown resource path (${path})`});
                    const q = ExecutionQuery.forGetProperty(prop);
                    if (nested) {
                      nested.nested = q;
                    } else {
                      query.nested = q;
                    }
                    nested = q;
                  }
                }
                break;
              }

              case 'DELETE': {
                if (scope === 'collection') {
                  query = ExecutionQuery.forDeleteMany(resource, {
                    filter: url.searchParams.get('$filter'),
                  });
                } else {
                  query = ExecutionQuery.forDelete(resource, p.key as KeyValue);
                }
                break;
              }

              case 'POST': {
                if (scope === 'collection') {
                  query = ExecutionQuery.forCreate(resource, body, {
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                    include: url.searchParams.get('$include')
                  });
                }
                break;
              }

              case 'PATCH': {
                if (scope === 'collection') {
                  query = ExecutionQuery.forUpdateMany(resource, body, {
                    filter: url.searchParams.get('$filter')
                  });
                } else {
                  query = ExecutionQuery.forUpdate(resource, p.key as KeyValue, body, {
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                    include: url.searchParams.get('$include')
                  });
                }
                break;
              }

            }

            return query;
          }
        }
      }
      throw new InternalServerError();
    } catch (e: any) {
      if (e instanceof ApiException)
        throw e;
      throw new BadRequestError({message: e.message});
    }
  }

  protected async sendResponse(adapterContext: TAdapterContext, executionContexts: ExecutionContext[]) {

    const outputPackets: PreparedOutput[] = [];
    for (const ctx of executionContexts) {
      const v = this.createOutput(ctx);
      outputPackets.push(v);
    }

    if (this.isBatch(adapterContext)) {
      // this.writeError([], new InternalServerError({message: 'Not implemented yet'}));
      return;
    }

    if (!outputPackets.length) {
      const err = new NotFoundError()
      outputPackets.push({
            status: err.status,
            body: {
              errors: [err.response]
            }
          }
      )
    }

    const out = outputPackets[0];
    const resp = adapterContext.getResponse();

    resp.setStatus(out.status);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraVersion);
    if (out.headers) {
      for (const [k, v] of Object.entries(out.headers)) {
        resp.setHeader(k, v);
      }
    }
    resp.send(JSON.stringify(out.body));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected isBatch(adapterContext: TAdapterContext): boolean {
    return false;
  }

  protected createOutput(ctx: ExecutionContext): PreparedOutput {
    const {query} = ctx;
    let status = ctx.response.status;
    let body = ctx.response.value || {};

    const errors = ctx.response.errors?.map(e => wrapError(e));

    if (errors && errors.length) {
      if (!status || status < 400) {
        status = 0;
        for (const e of errors) {
          status = Math.max(status, e.status || status);
        }
        if (status < HttpStatus.BAD_REQUEST)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      body.errors = errors.map(e => e.response);
    } else {
      delete body.errors;
      status = status || (query.operationType === 'create' ? HttpStatus.CREATED : HttpStatus.OK);
    }

    body = this.i18n.deep(body);
    return {
      status,
      headers: ctx.response.headers,
      body
    }

  }

  protected async sendError(adapterContext: TAdapterContext, error: ApiException) {
    const resp = adapterContext.getResponse();
    resp.setStatus(error.status || 500);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraVersion);
    resp.send(JSON.stringify(error.response));
  }


}
