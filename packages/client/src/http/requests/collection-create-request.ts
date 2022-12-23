import { CollectionCreateQueryOptions, CollectionResourceInfo, OpraURLSearchParams, PartialInput } from '@opra/common';
import { HttpRequest } from '../http-request.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionCreateRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequest<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public data: PartialInput<T>,
      public options: CollectionCreateQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    const searchParams = new OpraURLSearchParams();
    if (this.options.include)
      searchParams.set('$include', this.options.include);
    if (this.options.pick)
      searchParams.set('$pick', this.options.pick);
    if (this.options.omit)
      searchParams.set('$omit', this.options.omit);
    return mergeRawHttpRequests({
          method: 'POST',
          path: this.resource.name,
          params: searchParams,
          body: this.data,
        },
        this.options.http
    );
  }
}
