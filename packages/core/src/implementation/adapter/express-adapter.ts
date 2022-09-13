import type { Application, Request, Response } from 'express';
import { normalizePath } from '@opra/url';
import type { HttpAdapterContext, HttpRequest, HttpResponse } from '../../interfaces/http-context.interface.js';
import type { OpraService } from '../opra-service.js';
import { OpraHttpAdapter } from './http-adapter.js';

export namespace OpraExpressAdapter {
  export interface Options extends OpraHttpAdapter.Options {
    userContext?: (request: Request) => object | Promise<object>;
  }
}

export class OpraExpressAdapter extends OpraHttpAdapter<HttpAdapterContext, OpraExpressAdapter.Options> {

  static init(
      app: Application,
      service: OpraService,
      options?: OpraExpressAdapter.Options
  ): OpraExpressAdapter {
    const adapter = new OpraExpressAdapter(service, options);
    const prefix = '/' + normalizePath(options?.prefix, true);
    const userContextResolver = options?.userContext;
    app.use(prefix, (request, response, next) => {
      (async () => {
        const userContext = userContextResolver && await userContextResolver(request);
        const req = new ExpressRequestWrapper(request);
        const res = new ExpressResponseWrapper(response);
        const adapterContext: HttpAdapterContext = {
          getRequest: () => req,
          getResponse: () => res
        }
        await adapter.handler(adapterContext, userContext);
      })().catch(e => next(e));
    });
    return adapter;
  }

}

class ExpressRequestWrapper implements HttpRequest {
  constructor(readonly instance: Request) {
  }

  getInstance(): any {
    return this.instance;
  }

  getMethod(): string {
    return this.instance.method;
  }

  getUrl(): string {
    return this.instance.url;
  }

  getHeaderNames(): string[] {
    return Object.keys(this.instance.headers);
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }

  getHeaders(): Record<string, any> {
    return this.instance.headers;
  }

  getBody(): any {
    return this.instance.body;
  }

}


class ExpressResponseWrapper implements HttpResponse {
  constructor(readonly instance: Response) {
  }

  getInstance(): any {
    return this.instance;
  }

  getHeaderNames(): string[] {
    return this.instance.getHeaderNames();
  }

  getHeader(name: string): string | undefined {
    return this.instance.get(name);
  }

  setHeader(name: string, value: string): this {
    this.instance.setHeader(name, value);
    return this;
  }

  getStatus(): number | undefined {
    return this.instance.statusCode;
  }

  setStatus(value: number): this {
    // noinspection SuspiciousTypeOfGuard
    this.instance.status(typeof value === 'number'
        ? value
        : parseInt(value, 10) || 500);
    return this;
  }

  send(body: any): this {
    if (typeof body === 'string' || Buffer.isBuffer(body))
      this.instance.send(body);
    else this.instance.json(body);
    return this;
  }

  end(): this {
    this.instance.end();
    return this;
  }

}
