import { StrictOmit, Type } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { Parameter } from './parameter.js';
import type { Resource } from './resource';
import type { ResourceDecorator } from './resource-decorator.js';

/**
 *
 * @class Endpoint
 */
export class Endpoint {
  description?: string;
  parameters: ResponsiveMap<Parameter>;
  returnType?: DataType;
  decode: vg.Validator = vg.isAny();
  encode: vg.Validator = vg.isAny();

  [key: string]: any;

  constructor(readonly resource: Resource, readonly name: string, init: Endpoint.InitArguments) {
    Object.assign(this, init);
    this.parameters = new ResponsiveMap();
    if (init.parameters) {
      for (const [n, p] of Object.entries(init.parameters)) {
        this.defineParameter(n, p);
      }
    }
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
    const schema = omitUndefined<OpraSchema.Endpoint>({
      description: this.description
    });
    if (this.parameters.size) {
      schema.parameters = {};
      for (const [name, param] of this.parameters.entries()) {
        if (!param.isBuiltin)
          schema.parameters[name] = param.exportSchema(options);
      }
    }
    return schema;
  }

}

export namespace Endpoint {
  export interface InitArguments extends StrictOmit<ResourceDecorator.EndpointMetadata, 'parameters'> {
    parameters: Record<string, ParameterInit>;
  }

  export type ParameterInit = StrictOmit<Parameter.InitArguments, 'type'> &
      { type: DataType | string | Type | EnumType.EnumArray | EnumType.EnumObject }
}

