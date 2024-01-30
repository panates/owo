import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiParameter } from './api-parameter';

export interface ResourceDecorator {
  Action: (options?: ResourceDecorator.OperationOptions) => ResourceDecorator;
}

export function ResourceDecorator<O extends ResourceDecorator.Options>(
    kind: OpraSchema.Resource.Kind,
    meta?: O
): ClassDecorator {
  const namePattern = new RegExp(`^(.*)(${kind}|Resource|Controller)$`);
  return function (target: Function) {
    let name = meta?.name;
    if (!name) {
      name = namePattern.exec(target.name)?.[1] || target.name;
      // Containers may start with lowercase
      if (kind === 'Container')
        name = name.charAt(0).toLowerCase() + name.substring(1);
    }
    const metadata: ResourceDecorator.Metadata = {kind, name};
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind,
      name,
      ...omit(meta, ['kind', 'name', 'controller'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  }
}

/**
 * @namespace ResourceDecorator
 */
export namespace ResourceDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.ResourceBase, 'actions'> {
    name: string;
    actions?: Record<string, ActionMetadata>;
    operations?: Record<string, OperationMetadata>;
  }

  export interface Options extends Partial<StrictOmit<Metadata, 'kind' | 'actions' | 'operations'>> {
  }


  export interface OperationMetadata extends StrictOmit<OpraSchema.Endpoint, 'parameters'> {
    parameters?: ApiParameter.DecoratorMetadata[];
  }

  export interface ActionMetadata extends StrictOmit<OpraSchema.Action, 'parameters' | 'returnType'> {
    parameters?: ApiParameter.DecoratorMetadata[];
    returnType?: TypeThunkAsync | string;
  }

  export interface OperationOptions extends Partial<StrictOmit<OpraSchema.Endpoint, 'parameters'>> {
  }

  export interface ActionOptions extends Partial<StrictOmit<OpraSchema.Action, 'parameters' | 'returnType'>> {
    returnType?: TypeThunkAsync | string;
  }

}
