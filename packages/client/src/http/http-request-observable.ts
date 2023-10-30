import { lastValueFrom, Observable } from 'rxjs';
import typeIs from '@browsery/type-is';
import { OpraURL } from '@opra/common';
import { kBackend, kContext } from '../constants.js';
import { ClientError } from '../core/client-error.js';
import { URLSearchParamsInit } from '../types.js';
import { HttpObserveType } from './enums/http-observable-type.enum.js';
import { HttpBackend } from './http-backend.js';
import { HttpInterceptorHandler } from './http-interceptor-handler.js';
import { HttpResponse } from './http-response.js';
import {
  HttpEvent,
  HttpEventType
} from './interfaces/http-event.js';

/**
 *
 * @class HttpRequestObservable
 */
export class HttpRequestObservable<
    /* Determines type of observable value */
    T,
    /* Determines type of body */
    TBody = T,
    /* Determines type of http request options */
    TRequestOptions = {},
    /* Determines type of object which extending HttpResponse */
    TResponseExt = {}
> extends Observable<T> {
  [kBackend]: HttpBackend;
  [kContext]: {
    observe: HttpObserveType;
    method: string;
    url: OpraURL;
    headers: Headers;
    [key: string]: any;
  }

  constructor(
      backend: HttpBackend,
      init?: HttpBackend.RequestInit,
  ) {
    super((subscriber) => {
      const observe = this[kContext].observe;
      new HttpInterceptorHandler(backend.interceptors || [], this[kBackend])
          .handle(this[kContext])
          .subscribe({
            next(event) {
              if (observe === HttpObserveType.Events) {
                subscriber.next(event as T);
                return;
              }

              if (observe === HttpObserveType.ResponseHeader && event.type === HttpEventType.ResponseHeader) {
                subscriber.next(event.response as T);
                subscriber.complete();
                return;
              }

              if (event.type === HttpEventType.Response) {
                const {response} = event;

                if (observe === HttpObserveType.Response) {
                  subscriber.next(response as T);
                  subscriber.complete();
                  return;
                }

                const isOpraResponse = typeIs.is(event.response.contentType || '', ['application/opra+json']);

                if (response.status >= 400 && response.status < 600) {
                  subscriber.error(new ClientError({
                    message: response.status + ' ' + response.statusText,
                    status: response.status,
                    issues: isOpraResponse ? response.body.errors : undefined
                  }));
                  subscriber.complete();
                  return;
                }

                subscriber.next(event.response.body);
                subscriber.complete();
              }
            },
            error(error) {
              subscriber.error(error)
            },
            complete() {
              subscriber.complete()
            }
          })
    });
    Object.defineProperty(this, kBackend, {
      enumerable: false,
      value: backend
    })
    const url = new OpraURL(init?.url, backend.serviceUrl.toString());
    Object.defineProperty(this, kContext, {
      enumerable: false,
      value: {
        ...init,
        observe: HttpObserveType.Body,
        headers: new Headers(init?.headers),
        url,
      }
    })
  }

  clone() {
    return new HttpRequestObservable<T, TBody, TRequestOptions, TResponseExt>(this[kBackend], this[kContext]);
  }

  options(options: TRequestOptions): HttpRequestObservable<T, TBody, TRequestOptions, TResponseExt> {
    Object.assign(this[kContext], options);
    return this;
  }

  header(headers: HeadersInit): this
  header(name: string, value?: string | number | boolean | null): this
  header(arg0: string | HeadersInit, value?: string | number | boolean | null): this {
    const target = this[kContext].headers;
    if (typeof arg0 === 'object') {
      const h = arg0 instanceof Headers
          ? arg0
          : new Headers(arg0);
      h.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') {
          target.append(k, v);
        } else target.set(k, v);
      });
      return this;
    }
    if (value == null || value === '')
      target.delete(arg0)
    else
      target.append(arg0, String(value));
    return this;
  }

  param(params: URLSearchParamsInit): this
  param(name: string, value: any): this
  param(arg0: string | URLSearchParamsInit, value?: any): this {
    const target = this[kContext].url.searchParams;
    if (typeof arg0 === 'object') {
      const h = arg0 instanceof URLSearchParams
          ? arg0
          : new URLSearchParams(arg0);
      h.forEach((v, k) => target.set(k, v));
      return this;
    }
    if (value == null)
      target.delete(arg0)
    else
      target.set(arg0, String(value));
    return this;
  }

  observe(
      observe: HttpObserveType.Body
  ): HttpRequestObservable<TBody, TBody, TRequestOptions, TResponseExt>
  observe(
      observe: HttpObserveType.ResponseHeader
  ): HttpRequestObservable<HttpResponse<void> & TResponseExt, TBody, TRequestOptions, TResponseExt>
  observe(
      observe: HttpObserveType.Response
  ): HttpRequestObservable<HttpResponse<TBody> & TResponseExt, TBody, TRequestOptions, TResponseExt>
  observe(
      observe: HttpObserveType.Events
  ): HttpRequestObservable<HttpEvent<TBody, TResponseExt>, TBody, TRequestOptions, TResponseExt>
  observe(observe: HttpObserveType): Observable<any> {
    if (observe === this[kContext].observe)
      return this;
    const cloned = this.clone();
    cloned[kContext].observe = observe || HttpObserveType.Body;
    return cloned;
  }

  getBody(): Promise<TBody> {
    return lastValueFrom(this.observe(HttpObserveType.Body));
  }

  getResponse(): Promise<HttpResponse<TBody> & TResponseExt> {
    return lastValueFrom(this.observe(HttpObserveType.Response));
  }

}
