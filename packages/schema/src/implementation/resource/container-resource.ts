import { OpraSchema } from '../../interfaces/opra-schema.interface.js';
import { IResourceContainer } from '../../interfaces/resource-container.interface.js';
import { OpraService } from '../opra-service.js';
import { BaseResource } from './base-resource.js';
import { EntityResource } from './entity-resource.js';

export class ContainerResource extends BaseResource implements IResourceContainer {
  declare readonly metadata: OpraSchema.ContainerResource;

  constructor(service: OpraService, metadata: OpraSchema.ContainerResource) {
    super(service, metadata);
  }

  getResource<T extends BaseResource>(name: string): T {
    const t = this.metadata.resources[name];
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getEntityResource(name: string): EntityResource {
    const t = this.getResource(name);
    if (!(t instanceof EntityResource))
      throw new Error(`"${name}" is not an EntityResource`);
    return t;
  }

}
