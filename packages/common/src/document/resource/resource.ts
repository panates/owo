import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { omitUndefined } from '../../helpers/object-utils.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { Endpoint } from './endpoint.js';

export abstract class Resource {
  readonly document: ApiDocument;
  abstract readonly kind: OpraSchema.Resource.Kind;
  readonly name: string;
  description?: string;
  controller?: object | Type;
  abstract operations: Record<string, any>;
  actions = new ResponsiveMap<Endpoint>();

  protected constructor(
      document: ApiDocument,
      init: Resource.InitArguments
  ) {
    this.document = document;
    this.name = init.name;
    this.description = init.description;
    this.controller = init.controller;
    if (init.actions) {
      for (const [name, meta] of Object.entries(init.actions)) {
        this.actions.set(name, new Endpoint({...meta, name}));
      }
    }
  }

  exportSchema(): OpraSchema.ResourceBase {
    const schema = omitUndefined<OpraSchema.ResourceBase>({
      kind: this.kind,
      description: this.description,
    });
    if (this.actions.size) {
      schema.actions = {};
      for (const action of this.actions.values()) {
        schema.actions[action.name] = action.exportSchema();
      }
    }
    return schema;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }
}

export namespace Resource {
  export interface InitArguments extends StrictOmit<OpraSchema.ResourceBase, 'kind'> {
    name: string;
    controller?: object | Type;
  }

  export interface DecoratorOptions extends Partial<Pick<InitArguments, 'name' | 'description'>> {
  }

  export interface Metadata extends OpraSchema.ResourceBase {
    name: string;
  }

  export interface ActionOptions {

  }

}
