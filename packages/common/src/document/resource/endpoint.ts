import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { Parameter } from './parameter.js';
import type { Resource } from './resource';

/**
 *
 * @class Endpoint
 */
export abstract class Endpoint {
  abstract readonly kind: 'action' | 'operation';
  description?: string;
  parameters: ResponsiveMap<Parameter>;
  options: any = {};

  protected constructor(readonly resource: Resource, readonly name: string, init: Endpoint.InitArguments) {
    Object.assign(this, init);
    this.parameters = new ResponsiveMap();
    if (init.parameters) {
      for (const [n, p] of Object.entries(init.parameters)) {
        this.defineParameter(n, p);
      }
    }
  }

  getFullPath(documentPath?: boolean): string {
    return this.resource.getFullPath(documentPath) +
        (this.kind === 'action' ? (documentPath ? '/actions/' : '/') + this.name : '')
  }

  defineParameter(name: string, init: Endpoint.ParameterInit): Parameter {
    const type = init.type && init.type instanceof DataType
        ? init.type : this.resource.document.getDataType(init.type || 'any');
    const prm = new Parameter(name, {
      ...init,
      type
    });
    this.parameters.set(prm.name, prm);
    return prm;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Endpoint {
    const schema = omitUndefined<OpraSchema.Action>({
      description: this.description
    });
    if (Object.keys(this.options).length)
      schema.options = {...this.options};
    if (this.parameters.size) {
      let i = 0;
      const parameters = {};
      for (const [name, param] of this.parameters.entries()) {
        if (!param.isBuiltin) {
          parameters[name] = param.exportSchema(options);
          i++;
        }
      }
      if (i)
        schema.parameters = parameters;
    }
    return schema;
  }

}

export namespace Endpoint {
  export interface InitArguments extends StrictOmit<OpraSchema.Endpoint, 'parameters'> {
    parameters?: Record<string, ParameterInit>;
  }

  export type ParameterInit = StrictOmit<Parameter.InitArguments, 'type'> &
      { type?: DataType | string | Type }
}

