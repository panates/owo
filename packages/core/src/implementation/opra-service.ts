import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { Responsive } from '../utils/responsive-object.js';
import { EntityType } from './data-type/entity-type.js';
import { OpraDocument } from './opra-document.js';
import { EntityResourceInfo } from './resource/entity-resource-info.js';
import { ResourceInfo } from './resource/resource-info.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'>;

export class OpraService extends OpraDocument implements IResourceContainer {
  protected declare readonly _args: OpraServiceArgs;
  protected _resources = Responsive<ResourceInfo>();

  constructor(schema: OpraSchema.Service) {
    super(schema);
    if (schema.resources)
      this._addResources(schema.resources);
  }

  get resources(): Record<string, ResourceInfo> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._args.servers;
  }

  getResource<T extends ResourceInfo>(name: string): T {
    const t = this.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof EntityResourceInfo))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

  protected _addResources(resources: OpraSchema.Resource[]): void {
    for (const r of resources) {
      if (OpraSchema.isEntityResource(r)) {
        const dataType = this.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in EntityResource (${r.name}) does not exists`);
        if (!(dataType instanceof EntityType))
          throw new TypeError(`${r.type} is not an EntityType`);
        this.resources[r.name] = new EntityResourceInfo({...r, service: this, dataType});
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    // Sort data types by name
    const newResources = Responsive<ResourceInfo>();
    Object.keys(this.resources).sort()
        .forEach(name => newResources[name] = this.resources[name]);
    this._resources = newResources;
  }

  static async create(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraService> {
    const schema = await SchemaGenerator.generateServiceSchema(args);
    return new OpraService(schema);
  }

}