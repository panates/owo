import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A MongoDB ObjectID value',
})
export class ObjectIdType {
  constructor(attributes?: Partial<ObjectIdType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](): Validator {
    return vg.isObjectId({ coerce: true });
  }

  protected [ENCODER](): Validator {
    return vg.isObjectId({ coerce: true });
  }
}