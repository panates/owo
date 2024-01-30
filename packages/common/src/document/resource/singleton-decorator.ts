import { Combine, StrictOmit, Type } from 'ts-gems';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { ApiActionDecorator, createActionDecorator } from './api-action.decorator.js';
import type { ApiAction } from './api-action.js';
import type { ApiOperation } from './api-operation.js';
import type { ApiParameter } from './api-parameter.js';
import { CollectionDecorator } from './collection-decorator.js';
import { ResourceDecorator } from './resource-decorator.js';
import type { Singleton } from './singleton.js';

type ErrorMessage<T, Error> = [T] extends [never] ? Error : T;
const operationProperties = ['create', 'delete', 'get', 'update'] as const;
type OperationProperties = typeof operationProperties[number];

export function SingletonDecorator(type: Type | string, options?: Singleton.DecoratorOptions): ClassDecorator {
  return ResourceDecorator(OpraSchema.Singleton.Kind, {...options, type})
}

Object.assign(SingletonDecorator, ResourceDecorator);


export interface SingletonDecorator extends StrictOmit<ResourceDecorator, 'Action'> {
  <T>(type: Type<T> | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  Action: (options?: ApiAction.DecoratorOptions) => (
      <T, K extends keyof T>(
          target: T,
          propertyKey: ErrorMessage<Exclude<K, OperationProperties>,
              `'${string & K}' property is reserved for operation endpoints and can not be used for actions`>) => void
      ) & ApiActionDecorator;

  Create: typeof SingletonDecorator.Create;
  Delete: typeof SingletonDecorator.Delete;
  Get: typeof SingletonDecorator.Get;
  Update: typeof SingletonDecorator.Update;
}

/**
 * @namespace SingletonDecorator
 */
export namespace SingletonDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.Singleton, 'kind' | 'type' | 'operations' | 'actions'> {
    kind: OpraSchema.Singleton.Kind;
    name: string;
    type: TypeThunkAsync | string;
    actions?: Record<string, ApiOperation.DecoratorMetadata>;
    operations?: {
      create: Create.Metadata;
      delete: Delete.Metadata;
      get: Get.Metadata;
      update: Update.Metadata;
    }
  }

  /**
   * @namespace Create
   */
  export namespace Create {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Singleton.Operations.Create> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Singleton.Operations.Create>> {
    }
  }

  /**
   * @namespace Delete
   */
  export namespace Delete {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Singleton.Operations.Delete> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Singleton.Operations.Delete>> {
    }
  }

  /**
   * @namespace Get
   */
  export namespace Get {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Singleton.Operations.Get> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Singleton.Operations.Get>> {
    }
  }

  /**
   * @namespace Update
   */
  export namespace Update {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Metadata extends Combine<ApiOperation.DecoratorMetadata, OpraSchema.Singleton.Operations.Update> {
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options extends Combine<ApiOperation.DecoratorOptions,
        Partial<OpraSchema.Singleton.Operations.Update>> {
    }
  }

}


/*
 * Action PropertyDecorator
 */
export namespace SingletonDecorator {
  /**
   * Action PropertyDecorator
   */
  export function Action(options: ApiOperation.DecoratorOptions): ApiActionDecorator {
    const list: ((operationMeta: any) => void)[] = [];
    return createActionDecorator(options, operationProperties, list);
  }

  /**
   * Create PropertyDecorator
   */
  export type CreateDecorator = ((target: Object, propertyKey: 'create') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): CreateDecorator;
    InputMaxContentSize(sizeInBytes: number): CreateDecorator;
    InputPickFields(...fields: Field.QualifiedName[]): CreateDecorator;
    InputOmitFields(...fields: Field.QualifiedName[]): CreateDecorator;
    InputOverwriteFields(fields: Record<string, CollectionDecorator.FieldDecoratorOptions>): CreateDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): CreateDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): CreateDecorator;
    OutputOverwriteFields(fields: Record<string, CollectionDecorator.FieldDecoratorOptions>): CreateDecorator;
  };

  export function Create(options?: Create.Options): CreateDecorator {
    return CollectionDecorator.Create(options);
  }
}

/*
 * Get PropertyDecorator
 */
export namespace SingletonDecorator {
  export type GetDecorator = ((target: Object, propertyKey: 'get') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): GetDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): GetDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): GetDecorator;
    OutputOverwriteFields(fields: Record<string, CollectionDecorator.FieldDecoratorOptions>): GetDecorator;
  };

  export function Get(options?: Get.Options): GetDecorator {
    return CollectionDecorator.Get(options);
  }
}

/*
 * Delete PropertyDecorator
 */
export namespace SingletonDecorator {
  export type DeleteDecorator = ((target: Object, propertyKey: 'delete') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): DeleteDecorator;
  };

  export function Delete(options?: Delete.Options): DeleteDecorator {
    return CollectionDecorator.Delete(options);
  }

}

/*
 * Update PropertyDecorator
 */
export namespace SingletonDecorator {
  export type UpdateDecorator = ((target: Object, propertyKey: 'update') => void) & {
    Parameter(name: string | RegExp, optionsOrType?: ApiParameter.DecoratorOptions | string | Type): UpdateDecorator;
    InputMaxContentSize(sizeInBytes: number): UpdateDecorator;
    InputPickFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    InputOmitFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    InputOverwriteFields(fields: Record<string, CollectionDecorator.FieldDecoratorOptions>): UpdateDecorator;
    OutputPickFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    OutputOmitFields(...fields: Field.QualifiedName[]): UpdateDecorator;
    OutputOverwriteFields(fields: Record<string, CollectionDecorator.FieldDecoratorOptions>): UpdateDecorator;
  };

  export function Update(options?: Update.Options): UpdateDecorator {
    return CollectionDecorator.Update(options);
  }
}

