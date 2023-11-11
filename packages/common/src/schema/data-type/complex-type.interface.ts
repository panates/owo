import { StrictOmit, Type } from 'ts-gems';
import type { DataType, DataTypeBase } from './data-type.interface.js';
import type { Field } from './field.interface.js';
import type { MappedType } from './mapped-type.interface.js';
import type { MixinType } from './mixin-type.interface.js';

export interface ComplexType extends StrictOmit<DataTypeBase, 'kind'> {
  kind: ComplexType.Kind;
  ctor?: Type;
  base?: DataType.Name | ComplexType | MixinType | MappedType;
  abstract?: boolean;
  fields?: Record<Field.Name, Field | DataType.Name>;
  additionalFields?: boolean | 'error' | string | DataType;
}

export namespace ComplexType {
  export const Kind = 'ComplexType';
  export type Kind = 'ComplexType';

}
