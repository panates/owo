import { OpraSchema } from '../../opra-schema.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { ComplexType } from '../data-type/complex-type.js';
import { OpraService } from '../opra-service.js';
import { OpraResource } from './base-resource.js';

export class EntityResource extends OpraResource {
  declare readonly metadata: OpraSchema.EntityResource;
  readonly dataType: ComplexType;

  constructor(
      service: OpraService,
      dataType: ComplexType,
      metadata: OpraSchema.EntityResource
  ) {
    // noinspection SuspiciousTypeOfGuard
    if (!(dataType instanceof ComplexType))
      throw new TypeError(`You should provide a ComplexType as "dataType" argument`);
    if (!metadata.keyFields)
      throw new TypeError(`You should provide key fields for ${metadata.name}`);
    super(service, metadata);
    metadata.keyFields = Array.isArray(metadata.keyFields) ? metadata.keyFields : [metadata.keyFields];
    metadata.keyFields.forEach(f => dataType.getField(f));
    this.dataType = dataType;
    if (metadata.methods.search && metadata.methods.search.sortFields) {
      metadata.methods.search.sortFields = normalizeFieldArray(service, dataType, metadata.methods.search.sortFields);
    }
  }

  get keyFields(): string[] {
    return this.metadata.keyFields as string[];
  }

  get methods() {
    return this.metadata.methods;
  }

  getSchema(jsonOnly?: boolean): OpraSchema.EntityResource {
    const out = super.getSchema(jsonOnly) as OpraSchema.EntityResource;
    if (out.keyFields.length < 2)
      out.keyFields = out.keyFields[0];
    if (out.methods) {
      for (const k of Object.keys(out.methods)) {
        if (typeof out.methods[k] === 'object' && !Object.keys(out.methods[k]).length)
          out.methods[k] = true;
      }
    }
    return out;
  }

}
