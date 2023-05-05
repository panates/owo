import type { ApiField } from '../../../document/data-type/api-field.js';
import { DataType } from '../../../document/data-type/data-type.js';
import { Literal } from '../abstract/literal.js';

export class QualifiedIdentifier extends Literal {
  dataType: DataType;
  field?: ApiField;

  constructor(value: string) {
    super('' + value);
  }
}
