import * as vg from 'valgen';
import type { DataTypeBase } from './data-type.interface.js';
import { DataType } from './data-type.interface.js';

export interface SimpleType extends DataTypeBase<SimpleType.Kind> {
  base?: DataType.Name | SimpleType;
  decoder?: vg.Validator;
  encoder?: vg.Validator;
}

export namespace SimpleType {
  export const Kind = 'SimpleType';
  export type Kind = 'SimpleType';
}
