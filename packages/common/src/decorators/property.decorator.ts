import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DATATYPE_PROPERTIES } from '../constants.js';
import { OpraSchema } from '../interfaces/opra-schema.js';
import { TypeThunkAsync } from '../types.js';

export type PropertyMetadata =
    StrictOmit<OpraSchema.Property, 'type'> &
    {
      type?: string | TypeThunkAsync;
    }

export function Property(args?: Partial<PropertyMetadata>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as Property`);

    const designType = Reflect.getMetadata('design:type', target, propertyKey);

    const metadata: PropertyMetadata = {
      name: propertyKey,
      type: args?.type || designType
    }
    Object.assign(metadata, _.omit(args, Object.keys(metadata)));

    const properties = Reflect.getOwnMetadata(DATATYPE_PROPERTIES, target) || {};
    properties[propertyKey] = metadata;
    Reflect.defineMetadata(DATATYPE_PROPERTIES, properties, target);
  };
}
