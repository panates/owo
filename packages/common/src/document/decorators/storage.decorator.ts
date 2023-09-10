import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { Storage } from '../resource/storage.js';
import {
  ActionDecorator,
  createActionDecorator,
  createOperationDecorator,
  ResourceDecorator
} from './resource.decorator.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['delete', 'get', 'post'] as const;
type OperationProperties = typeof operationProperties[number];

export function StorageDecorator(options?: Storage.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Storage.Kind, options)
}

Object.assign(StorageDecorator, ResourceDecorator);


export interface StorageDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  (options?: Storage.DecoratorOptions): ClassDecorator;

  Action: (options?: ResourceDecorator.ActionOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ActionDecorator;

  Delete: typeof StorageDecorator.Delete;
  Get: typeof StorageDecorator.Get;
  Post: typeof StorageDecorator.Post;
}

/*
 * Action PropertyDecorator
 */
export namespace StorageDecorator {
  export function Action(options: ResourceDecorator.ActionOptions): ActionDecorator
  export function Action(description: string): ActionDecorator
  export function Action(arg0?: any): ActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    return createActionDecorator(options, operationProperties, list);
  }
}

/*
 * Delete PropertyDecorator
 */
export namespace StorageDecorator {
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => DeleteDecorator;
  };

  export function Delete(options?: OpraSchema.Storage.Operations.Delete): DeleteDecorator
  export function Delete(description?: string): DeleteDecorator
  export function Delete(arg0?: any): DeleteDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    return createOperationDecorator<DeleteDecorator>('delete', options, list);
  }
}


/*
 * Get PropertyDecorator
 */
export namespace StorageDecorator {
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => GetDecorator;
  };

  export function Get(options?: OpraSchema.Storage.Operations.Get): GetDecorator
  export function Get(description?: string): GetDecorator
  export function Get(arg0?: any): GetDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    return createOperationDecorator<GetDecorator>('get', options, list);
  }
}


/*
 * Post PropertyDecorator
 */
export namespace StorageDecorator {
  export type PostDecorator = ((target: Object, propertyKey: 'post') => void) & {
    Parameter: (name: string, optionsOrType?: ResourceDecorator.ParameterOptions | string | Type) => PostDecorator;
    MaxFields: (amount: number) => PostDecorator;
    MaxFieldSize: (sizeInBytes: number) => PostDecorator;
    MaxFiles: (amount: number) => PostDecorator;
    MaxFileSize: (sizeInBytes: number) => PostDecorator;
    MaxTotalFileSize: (sizeInBytes: number) => PostDecorator;
    MinFileSize: (sizeInBytes: number) => PostDecorator;
  };

  export function Post(options?: OpraSchema.Storage.Operations.Post): PostDecorator
  export function Post(description?: string): PostDecorator
  export function Post(arg0?: any): PostDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    const options = typeof arg0 === 'string' ? {description: arg0} : {...arg0};
    const decorator = createOperationDecorator<PostDecorator>('post', options, list);
    decorator.MaxFields = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFields = amount);
      return decorator;
    }
    decorator.MaxFieldSize = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFieldsSize = amount);
      return decorator;
    }
    decorator.MaxFiles = (amount: number) => {
      list.push(operationMeta => operationMeta.maxFiles = amount);
      return decorator;
    }
    decorator.MaxFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.maxFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MaxTotalFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.maxTotalFileSize = sizeInBytes);
      return decorator;
    }
    decorator.MinFileSize = (sizeInBytes: number) => {
      list.push(operationMeta => operationMeta.minFileSize = sizeInBytes);
      return decorator;
    }
    return decorator;
  }
}
