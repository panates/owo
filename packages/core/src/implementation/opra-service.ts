import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { OpraVersion } from '../constants.js';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { internalDataTypes } from '../utils/internal-data-types.js';
import { Responsive } from '../utils/responsive-object.js';
import { EntityType } from './data-type/entity-type.js';
import { OpraDocument } from './opra-document.js';
import { BaseControllerWrapper } from './resource/base-controller-wrapper.js';
import { EntityControllerWrapper } from './resource/entity-controller-wrapper.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument implements IResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = Responsive<BaseControllerWrapper>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Record<string, BaseControllerWrapper> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends BaseControllerWrapper>(name: string): T {
    const t = this.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityControllerWrapper {
    const t = this.getResource(name);
    if (!(t instanceof EntityControllerWrapper))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

  getMetadata(jsonOnly?: boolean) {
    const out: OpraSchema.ServiceMetadata = {
      '@opra:schema': 'http://www.oprajs.com/reference/v1/schema',
      version: OpraVersion,
      servers: this.servers?.map(x => merge({}, x, {deep: true})) as any,
      info: merge({}, this.info, {deep: true}) as any,
      types: [],
      resources: []
    };
    for (const [k, dataType] of Object.entries(this.types)) {
      if (!internalDataTypes.has(k))
        out.types.push(dataType.getMetadata(jsonOnly));
    }
    for (const resource of Object.values(this.resources)) {
      out.resources.push(resource.getMetadata(jsonOnly));
    }
    return out;
  }

  protected _addResources(resources: OpraSchema.Resource[]): void {
    for (const r of resources) {
      if (OpraSchema.isEntityResource(r)) {
        const dataType = this.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in EntityResource (${r.name}) does not exists`);
        if (!(dataType instanceof EntityType))
          throw new TypeError(`${r.type} is not an EntityType`);
        this.resources[r.name] = new EntityControllerWrapper(this, dataType, r);
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    // Sort data types by name
    const newResources = Responsive<BaseControllerWrapper>();
    Object.keys(this.resources).sort()
        .forEach(name => newResources[name] = this.resources[name]);
    this._resources = newResources;
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}
