import { StrictOmit, Type } from 'ts-gems';
import { isPromise } from 'util/types';
import { DATATYPE_METADATA, DATATYPE_PROPERTIES, OpraSchema, PropertyMetadata } from '@opra/schema';
import { RESOURCE_METADATA } from '../constants.js';
import { ThunkAsync } from '../types.js';
import { isConstructor, resolveClassAsync } from '../utils/class-utils.js';
import { builtinClassMap, internalDataTypes, primitiveDataTypeNames } from '../utils/internal-data-types.js';

export namespace SchemaGenerator {

  export type GenerateDocumentArgs = StrictOmit<OpraSchema.Document, 'version' | 'types'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
  }

  export type GenerateServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
    resources: any[];
  }

}

const entityMethods = ['search', 'create', 'read', 'update', 'updateMany', 'delete', 'deleteMany'];

export class SchemaGenerator {
  protected _dataTypes: Record<string, OpraSchema.DataType> = {};
  protected _resources: Record<string, OpraSchema.Resource> = {};

  protected constructor() {
    //
  }

  protected async addDataType(thunk: ThunkAsync<Type | OpraSchema.DataType>): Promise<OpraSchema.DataType> {
    let schema: OpraSchema.DataType | undefined;

    thunk = isPromise(thunk) ? await thunk : thunk;
    if (typeof thunk === 'function' && !isConstructor(thunk))
      thunk = await thunk();

    if (!isConstructor(thunk) || OpraSchema.isDataType(thunk))
      throw new TypeError(`Function must return a type class or type schema`);

    if (isConstructor(thunk)) {
      const ctor = thunk;
      const metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, ctor);
      if (!metadata)
        throw new TypeError(`Class "${ctor}" has no type metadata`);

      schema = this._dataTypes[metadata.name];
      if (schema) {
        if (schema.kind !== metadata.kind ||
            (OpraSchema.isComplexType(schema) && schema.ctor !== ctor)
        )
          throw new Error(`An other instance of "${schema.name}" data type previously defined`);
        return schema;
      }

      // Add base data type
      let base: string | undefined;
      let baseCtor = Object.getPrototypeOf(ctor);
      if (Reflect.hasMetadata(DATATYPE_METADATA, baseCtor)) {
        while (!Reflect.hasOwnMetadata(DATATYPE_METADATA, baseCtor)) {
          baseCtor = Object.getPrototypeOf(baseCtor);
        }
        const baseSchema = await this.addDataType(baseCtor);
        base = baseSchema.name;
      }

      if (OpraSchema.isComplexType(metadata) || OpraSchema.isEntityType(metadata)) {
        schema = {
          ...metadata,
          ctor,
          base
        };

        const properties: Record<string, PropertyMetadata> = Reflect.getMetadata(DATATYPE_PROPERTIES, ctor.prototype);
        if (properties) {
          for (const [k, p] of Object.entries(properties)) {
            let type: string;
            if (isConstructor(p.type) && builtinClassMap.has(p.type))
              type = builtinClassMap.get(p.type);
            else if (typeof p.type === 'function' || typeof p.type === 'object') {
              const t = await this.addDataType(p.type);
              type = t.name;
            } else type = p.type || 'string';
            if (internalDataTypes.has(type) && !this._dataTypes[type])
              this._dataTypes[type] = internalDataTypes.get(type.toLowerCase()) as OpraSchema.DataType;
            schema.properties = schema.properties || {};
            schema.properties[k] = {...p, type};
          }
        }

      } else if (OpraSchema.isSimpleType(metadata)) {
        if (!primitiveDataTypeNames.includes(metadata.type))
          throw new Error(`"type" of SimpleType schema must be one of enumerated value (${primitiveDataTypeNames})`);
        schema = {
          ...metadata
        }
      } else
          /* istanbul ignore next */
        throw new TypeError(`Invalid metadata`);

    } else if (OpraSchema.isDataType(thunk)) {
      schema = thunk;
    } else
      throw new TypeError(`Invalid data type schema`);

    this._dataTypes[schema.name] = schema;
    return schema;
  }

  async addResource(instance: any): Promise<void> {
    if (isConstructor(instance))
      throw new Error(`You should provide Resource instance instead of Resource class`);
    const proto = Object.getPrototypeOf(instance);
    const ctor = proto.constructor;
    const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);

    let resourceSchema: OpraSchema.Resource;
    if (metadata) {
      const name = metadata.name || ctor.name.replace(/Resource$/, '');
      const t = typeof metadata.type === 'function'
          ? await resolveClassAsync(metadata.type)
          : metadata.type;
      const type = typeof t === 'function'
          ? (await this.addDataType(t)).name
          : t;

      resourceSchema = {
        ...metadata,
        type,
        name
      }

      if (OpraSchema.isEntityResource(resourceSchema)) {
        for (const methodName of entityMethods) {
          const fn = instance[methodName];
          if (typeof fn === 'function') {
            resourceSchema[methodName] = fn.bind(instance);
          }
        }
      }
    } else resourceSchema = instance;

    if (OpraSchema.isResource(resourceSchema)) {
      if (OpraSchema.isEntityResource(resourceSchema)) {
        const t = this._dataTypes[resourceSchema.type];
        if (!t)
          throw new Error(`Resource registration error. Type "${resourceSchema.type}" not found.`);
        if (this._resources[resourceSchema.name])
          throw new Error(`An other instance of "${resourceSchema.name}" resource previously defined`);
        this._resources[resourceSchema.name] = resourceSchema;
        return;
      }
      throw new Error(`Invalid resource metadata`);
    }
    throw new Error(`Invalid resource object`);
  }

  static async generateDocumentSchema(args: SchemaGenerator.GenerateDocumentArgs): Promise<OpraSchema.Document> {
    const generator = new SchemaGenerator();
    if (args.types) {
      for (const thunk of args.types) {
        await generator.addDataType(thunk);
      }
    }

    const types = Object.keys(generator._dataTypes).sort()
        .map(name => generator._dataTypes[name]);

    return {
      version: '1',
      ...args,
      types
    }
  }

  static async generateServiceSchema(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraSchema.Service> {
    const generator = new SchemaGenerator();
    if (args.types) {
      for (const thunk of args.types) {
        await generator.addDataType(thunk);
      }
    }
    if (args.resources) {
      for (const resource of args.resources) {
        await generator.addResource(resource);
      }
    }

    const types = Object.keys(generator._dataTypes).sort()
        .map(name => generator._dataTypes[name]);

    const resources = Object.keys(generator._resources).sort()
        .map(name => generator._resources[name]);

    return {
      version: '1',
      ...args,
      types,
      resources
    }
  }

}