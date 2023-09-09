import {
  BadRequestError, HttpHeaderCodes,
  HttpStatusCodes, InternalServerError,
  IssueSeverity, OpraException,
  OpraSchema,
  wrapException
} from '@opra/common';
import { ExecutionContextHost } from '../execution-context.host.js';
import { ExecutionContext } from '../execution-context.js';
import { RequestHandler } from '../interfaces/request-handler.interface.js';
import { PlatformAdapterHost } from '../platform-adapter.host.js';
import type { Protocol } from '../platform-adapter.js';
import { HttpServerRequest } from './http-server-request.js';
import { HttpServerResponse } from './http-server-response.js';
import { EntityRequestHandler } from './request-handlers/entity-request-handler.js';
import { StorageRequestHandler } from './request-handlers/storage-request-handler.js';

/**
 *
 * @class HttpAdapterBase
 */
export abstract class HttpAdapterBase extends PlatformAdapterHost {
  _protocol = 'http' as Protocol;
  _requestHandlers: RequestHandler[] = [
    new EntityRequestHandler(this),
    new StorageRequestHandler(this)
  ];

  /**
   * Main http request handler
   * @param incoming
   * @param outgoing
   * @protected
   */
  protected async handleIncoming(incoming: HttpServerRequest, outgoing: HttpServerResponse): Promise<void> {
    const context = new ExecutionContextHost(this.api, this.platform, {http: {incoming, outgoing}});
    try {
      /* istanbul ignore next */
      if (!this._initialized)
        throw new InternalServerError(`${Object.getPrototypeOf(this).constructor.name} has not been initialized yet`);

      outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
      // Expose headers if cors enabled
      if (outgoing.getHeader(HttpHeaderCodes.Access_Control_Allow_Origin)) {
        // Expose X-Opra-* headers
        outgoing.appendHeader(HttpHeaderCodes.Access_Control_Expose_Headers,
            Object.values(HttpHeaderCodes)
                .filter(k => k.toLowerCase().startsWith('x-opra-'))
        );
      }

      let i = 0;
      let requestProcessed = false;
      const next = async () => {
        while (i < this._interceptors.length) {
          const interceptor = this._interceptors[i++];
          if (interceptor)
            await interceptor(context, next);
        }
        if (!requestProcessed) {
          requestProcessed = true;
          await this.processRequest(context);
        }
      }
      await next();
    } catch (error) {
      context.errors.push(wrapException(error));
    }
    // If no response returned to the client we send an error
    if (!outgoing.writableEnded) {
      if (!context.errors.length)
        context.errors.push(new BadRequestError(`Server can not process this request`));
      await this.handleError(context);
    }
  }

  async processRequest(context: ExecutionContext): Promise<void> {
    try {
      const {incoming, outgoing} = context.switchToHttp();
      if (incoming.method === 'GET' && !incoming.parsedUrl.path.length) {
        outgoing.setHeader('content-type', 'application/json');
        outgoing.end(JSON.stringify(this.api.exportSchema({webSafe: true})));
        return;
      }

      const {parsedUrl} = incoming;
      if (!parsedUrl.path.length) {
        // Batch
        if (incoming.headers['content-type'] === 'multipart/mixed') {
          // todo
        }
        throw new BadRequestError();
      }

      // Iterate through request handlers until one of them sends response (end outgoing stream)
      for (const requestHandler of this._requestHandlers) {
        await requestHandler.processRequest(context);
        if (outgoing.writableEnded)
          return;
        if (context.errors.length) {
          await this.handleError(context);
          return;
        }
      }
    } finally {
      await (context as ExecutionContextHost).emitAsync('finish');
    }
  }

  protected async handleError(context: ExecutionContext): Promise<void> {
    const {errors} = context;
    const {outgoing} = context.switchToHttp();
    if (outgoing.headersSent) {
      outgoing.end();
      return;
    }
    errors.forEach(x => {
      if (x instanceof OpraException) {
        switch (x.severity) {
          case "fatal":
            this._logger.fatal(x);
            break;
          case "warning":
            this._logger.warn(x);
            break;
          default:
            this._logger.error(x);
        }
      } else this._logger.fatal(x);
    });

    const wrappedErrors = errors.map(wrapException);
    // Sort errors from fatal to info
    wrappedErrors.sort((a, b) => {
      const i = IssueSeverity.Keys.indexOf(a.severity) - IssueSeverity.Keys.indexOf(b.severity);
      if (i === 0)
        return b.status - a.status;
      return i;
    });

    let status = outgoing.statusCode || 0;
    if (!status || status < Number(HttpStatusCodes.BAD_REQUEST)) {
      status = wrappedErrors[0].status;
      if (status < Number(HttpStatusCodes.BAD_REQUEST))
        status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
    outgoing.statusCode = status;

    const body = {
      errors: wrappedErrors.map(x => this._i18n.deep(x.toJSON()))
    };

    outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/opra+json; charset=utf-8');
    outgoing.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Expires, '-1');
    outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

}
