import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { Collection, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import _transformFilter from './transform-filter.js';
import _transformKeyValues from './transform-key-values.js'
import _transformPatch from './transform-patch.js';
import _transformProjection from './transform-projection.js';
import _transformSort from './transform-sort.js';

export namespace MongoAdapter {

  export const transformFilter = _transformFilter;
  export const transformKeyValues = _transformKeyValues;
  export const transformPatch = _transformPatch;
  export const transformProjection = _transformProjection;
  export const transformSort = _transformSort;

  export function transformRequest(request: Request): any {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {params, operation} = request;
      let options: any = {};
      let filter;

      if (operation === 'create' || operation === 'update' ||
          operation === 'get' || operation === 'findMany'
      ) {
        options.projection = transformProjection(resource.type, params)
      }

      if (resource instanceof Collection &&
          (operation === 'delete' || operation === 'get' || operation === 'update')
      ) {
        filter = transformKeyValues(resource, (request as any).key);
      }

      if (params?.filter) {
        const f = transformFilter(params.filter);
        filter = filter ? {$and: [filter, f]} : f;
      }

      if (operation === 'findMany') {
        options.sort = params?.sort;
        options.limit = params?.limit;
        options.skip = params?.skip;
        options.distinct = params?.distinct;
        options.count = params?.count;
      }

      options = omitBy(options, isNil);

      switch (operation) {
        case 'create': {
          return {
            method: 'insertOne',
            data: (request as any).data,
            options,
            args: [(request as any).data, options]
          }
        }
        case 'delete':
        case 'deleteMany': {
          return {
            method: (operation === 'delete' ? 'deleteOne' : 'deleteMany'),
            filter,
            options,
            args: [filter, options]
          };
        }
        case 'get': {
          return {
            method: 'findOne',
            filter,
            options,
            args: [filter, options]
          }
        }
        case 'findMany': {
          const out: any = {
            method: 'find',
            filter,
            options,
            args: [filter, options]
          };
          out.count = params?.count;
          return out;
        }
        case 'update': {
          const update = transformPatch((request as any).data);
          filter = filter || {};
          return {
            method: 'updateOne',
            filter,
            update,
            options,
            args: [filter, update, options]
          }
        }
        case 'updateMany': {
          const update = transformPatch((request as any).data);
          return {
            method: 'updateMany',
            filter,
            update,
            options,
            args: [filter, update, options]
          }
        }
      }

    }
    throw new TypeError(`Unimplemented request kind (${request.resource.kind}.${request.operation})`);
  }


}
