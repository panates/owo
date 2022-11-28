import { AxiosRequestConfig } from 'axios';
import { CollectionDeleteManyQueryOptions, CollectionResourceInfo } from '@opra/schema';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions } from '../types.js';

export class CollectionDeleteManyRequest<T, TResponse extends ClientResponse<T>>
    extends OpraClientRequest<T, TResponse> {
  constructor(
      readonly client: OpraClient,
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      readonly resource: CollectionResourceInfo,
      public options: CollectionDeleteManyQueryOptions & CommonQueryOptions = {}
  ) {
    super(client, send, options);
  }

  prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.client.serviceUrl);
    url.path.join(this.resource.name);
    if (this.options.filter)
      url.searchParams.set('$filter', this.options.filter);
    return {
      method: 'DELETE',
      url: url.address,
      params: url.searchParams
    }
  }
}
