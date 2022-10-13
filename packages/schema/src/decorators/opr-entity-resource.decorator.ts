import "reflect-metadata";
import _ from 'lodash';
import { PartialSome, StrictOmit } from 'ts-gems';
import { RESOURCE_METADATA } from '../constants.js';
import { EntityResourceMetadata } from '../interfaces/metadata/opra-schema.metadata.js';
import { TypeThunkAsync } from '../types.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';

export type EntityResourceOptions = PartialSome<StrictOmit<EntityResourceMetadata, 'kind' | 'type'>, 'keyFields'>;

const NAME_PATTERN = /^(.*)Resource$/;

export function OprEntityResource(
    entityFunc: TypeThunkAsync,
    options?: EntityResourceOptions
) {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: EntityResourceMetadata = {
      kind: 'EntityResource',
      type: entityFunc,
      name
    };
    Object.assign(meta, _.omit(options, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}

