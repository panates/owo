import {
  BadRequestError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  OpraException,
} from '@opra/exception';
import {
  ComplexType,
  ContainerResource,
  DataType, EntityResource,
  IResourceContainer,
  OpraAnyQuery, OpraCreateInstanceQuery, OpraDeleteCollectionQuery, OpraDeleteInstanceQuery,
  OpraGetFieldQuery,
  OpraGetInstanceQuery, OpraGetSchemaQuery,
  OpraSchema,
  OpraSearchCollectionQuery, OpraUpdateCollectionQuery, OpraUpdateInstanceQuery,
  ResponsiveMap
} from '@opra/schema';
import { OpraURL } from '@opra/url';
import { HttpHeaders, HttpStatus } from '../enums/index.js';
import { IHttpExecutionContext } from '../interfaces/execution-context.interface.js';
import { OpraAdapter } from './adapter.js';
import { QueryContext } from './query-context.js';

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

export class OpraHttpAdapter<TExecutionContext extends IHttpExecutionContext> extends OpraAdapter<IHttpExecutionContext> {

  protected prepareRequests(executionContext: TExecutionContext): QueryContext[] {
    const req = executionContext.getRequestWrapper();
    // todo implement batch requests
    if (this.isBatch(executionContext)) {
      throw new Error('not implemented yet');
    }
    const url = new OpraURL(req.getUrl());
    return [
      this.prepareRequest(
          executionContext,
          url,
          req.getMethod(),
          new ResponsiveMap(req.getHeaders()),
          req.getBody())
    ];
  }

  prepareRequest(
      executionContext: IHttpExecutionContext,
      url: OpraURL,
      method: string,
      headers: Map<string, string>,
      body?: any
  ): QueryContext {
    if (!url.path.size)
      throw new BadRequestError();
    if (method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();
    const query = this.buildQuery(url, method, body);
    if (!query)
      throw new MethodNotAllowedError({
        message: `Method "${method}" is not allowed by target endpoint`
      });
    return new QueryContext({
      service: this.service,
      executionContext,
      query,
      headers,
      params: url.searchParams,
      continueOnError: query.operation === 'read'
    });
  }

  buildGetSchemaQuery(url: OpraURL): OpraGetSchemaQuery {
    const pathLen = url.path.size;
    const resourcePath: string[] = [];
    let pathIndex = 0;
    while (pathIndex < pathLen) {
      const p = url.path.get(pathIndex++);
      if (p.key)
        throw new BadRequestError();
      if (p.resource !== '$schema') {
        if (pathIndex === 1)
          resourcePath.push('resources');
        resourcePath.push(p.resource);
      }
    }
    const opts = {
      pick: url.searchParams.get('$pick'),
      omit: url.searchParams.get('$omit'),
      include: url.searchParams.get('$include'),
      resourcePath
    }
    return new OpraGetSchemaQuery(opts);
  }

  buildQuery(url: OpraURL, method: string, body?: any): OpraAnyQuery | undefined {
    let container: IResourceContainer = this.service;
    try {
      const pathLen = url.path.size;

      // Check if requesting metadata
      for (let i = 0; i < pathLen; i++) {
        const p = url.path.get(i);
        if (p.resource === '$schema') {
          if (method !== 'GET')
            return;
          return this.buildGetSchemaQuery(url);
        }
      }

      let pathIndex = 0;
      while (pathIndex < pathLen) {
        let p = url.path.get(pathIndex++);
        const resource = container.getResource(p.resource);
        // Move through path directories (containers)
        if (resource instanceof ContainerResource) {
          container = resource;
          continue;
        }

        method = method.toUpperCase();

        if (resource instanceof EntityResource) {
          const scope: OpraSchema.QueryScope = p.key ? 'instance' : 'collection';

          if (pathIndex < pathLen && !(method === 'GET' && scope === 'instance'))
            return;

          let query: OpraAnyQuery | undefined;

          switch (method) {

            case 'GET': {
              if (scope === 'collection') {
                query = new OpraSearchCollectionQuery(resource, {
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
                query = new OpraGetInstanceQuery(resource, p.key, {
                  pick: url.searchParams.get('$pick'),
                  omit: url.searchParams.get('$omit'),
                  include: url.searchParams.get('$include')
                });

                // Move through properties
                let dataType: DataType = resource.dataType;
                const curPath: string[] = [];
                let parent: OpraGetInstanceQuery | OpraGetFieldQuery = query;
                while (pathIndex < pathLen) {
                  if (!(dataType instanceof ComplexType))
                    throw new TypeError(`"${resource.name}.${curPath.join()}" is not a ComplexType and has no fields.`);
                  p = url.path.get(pathIndex++);
                  curPath.push(p.resource);
                  const field = dataType.getField(p.resource);
                  parent.nested = new OpraGetFieldQuery(parent, field.name);
                  parent = parent.nested;
                  dataType = parent.dataType;
                }
              }
              break;
            }

            case 'DELETE': {
              query = scope === 'collection'
                  ? new OpraDeleteCollectionQuery(resource, {
                    filter: url.searchParams.get('$filter'),
                  })
                  : new OpraDeleteInstanceQuery(resource, p.key);
              break;
            }

            case 'POST': {
              if (scope === 'collection') {
                query = new OpraCreateInstanceQuery(resource, body, {
                  pick: url.searchParams.get('$pick'),
                  omit: url.searchParams.get('$omit'),
                  include: url.searchParams.get('$include')
                });
              }
              break;
            }

            case 'PATCH': {
              query = scope === 'collection'
                  ? new OpraUpdateCollectionQuery(resource, body, {
                    filter: url.searchParams.get('$filter')
                  })
                  : new OpraUpdateInstanceQuery(resource, p.key, body, {
                    pick: url.searchParams.get('$pick'),
                    omit: url.searchParams.get('$omit'),
                    include: url.searchParams.get('$include')
                  });
              break;
            }
          }

          return query;
        }
      }
      throw new InternalServerError();
    } catch (e: any) {
      throw BadRequestError.wrap(e);
    }
  }

  protected async sendResponse(executionContext: TExecutionContext, queryContexts: QueryContext[]) {

    const outputPackets: PreparedOutput[] = [];
    for (const ctx of queryContexts) {
      const v = this.createOutput(ctx);
      outputPackets.push(v);
    }

    if (this.isBatch(executionContext)) {
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
    const resp = executionContext.getResponseWrapper();

    resp.setStatus(out.status);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraSchema.Version);
    if (out.headers) {
      for (const [k, v] of Object.entries(out.headers)) {
        resp.setHeader(k, v);
      }
    }
    resp.send(JSON.stringify(out.body));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected isBatch(executionContext: TExecutionContext): boolean {
    return false;
  }

  protected createOutput(ctx: QueryContext): PreparedOutput {
    const {query} = ctx;
    let status = ctx.response.status;
    let body = ctx.response.value || {};

    const errors = ctx.response.errors?.map(e => OpraException.wrap(e));

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
      status = status || (query.operation === 'create' ? HttpStatus.CREATED : HttpStatus.OK);
    }

    // Convert headers map to object
    const headers = Array.from(ctx.response.headers.keys()).map(k => k.toLowerCase()).sort()
        .reduce((a, k) => {
          a[k] = ctx.response.headers.get(k);
          return a;
        }, {});

    body = this.i18n.deep(body);
    return {
      status,
      headers,
      body
    }
  }

  protected async sendError(executionContext: TExecutionContext, error: OpraException) {
    const resp = executionContext.getResponseWrapper();
    resp.setStatus(error.status || 500);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraSchema.Version);
    const body = {errors: [this.i18n.deep(error.response)]};
    resp.send(JSON.stringify(body));
  }


}
