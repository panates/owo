import { EntityResourceInfo } from '../implementation/resource/entity-resource-info.js';
import { ResourceInfo } from '../implementation/resource/resource-info.js';

export interface ResourceContainer {
  getResource<T extends ResourceInfo>(name: string): T;
  getEntityResource(name: string): EntityResourceInfo;
}
