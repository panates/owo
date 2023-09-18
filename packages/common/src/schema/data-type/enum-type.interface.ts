import type { DataType, DataTypeBase } from './data-type.interface.js';

export interface EnumType extends DataTypeBase<EnumType.Kind> {
  base?: DataType.Name | EnumType;
  values: Record<EnumType.Value, EnumType.ValueInfo>;
}

export namespace EnumType {
  export const Kind = 'EnumType';
  export type Kind = typeof Kind;
  export type Value = string | number;

  export interface ValueInfo {
    key?: string;
    description?: string;
  }
}
