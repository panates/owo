import { Class, StrictOmit, Type, Writable } from 'ts-gems';
import {
  applyMixins,
  inheritPropertyInitializers,
  omitUndefined,
  ResponsiveMap
} from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { MappedType } from './mapped-type.js';

/**
 * @namespace UnionType
 */
export namespace UnionType {

  export interface InitArguments extends DataType.InitArguments {
    types: (ComplexType | UnionType | MappedType)[]
  }

  export interface OwnProperties extends DataType.OwnProperties {
    types: (ComplexType | UnionType | MappedType)[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.UnionType, 'types'> {
    types: Type[];
  }
}

/**
 * Type definition of UnionType prototype
 * @type UnionType
 */
export interface UnionType extends StrictOmit<DataType, 'own' | 'exportSchema'>,
    Pick<ComplexType, 'additionalFields' | 'fields'>, UnionType.OwnProperties {
  readonly own: UnionType.OwnProperties;

  exportSchema(): OpraSchema.UnionType;
}

/**
 * Type definition of UnionType constructor type
 * @type UnionTypeConstructor
 */
export interface UnionTypeConstructor {
  prototype: UnionType;

  new(document: ApiDocument, init: UnionType.InitArguments): UnionType;

  <A1 extends any[], I1, S1,
      A2 extends any[], I2, S2,
      A3 extends any[], I3, S3,
      A4 extends any[], I4, S4,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >(
      c1: Class<A1, I1, S1>,
      c2: Class<A2, I2, S2>,
      c3?: Class<A3, I3, S3>,
      c4?: Class<A4, I4, S4>
  ): Class<any[], I1 & I2 & I3 & I4, S1 & S2 & S3 & S4>;

  _applyMixin(target: Type, ...sources: [Type]): void;
}

/**
 * @class UnionType
 */
export const UnionType = function (
    this: UnionType,
    ...args: any[]
) {

  // UnionType helper
  if (!this) {
    return mapToUnionType(...args);
  }

  // Constructor
  // call super()
  DataType.apply(this, args);

  const [, init] = args as [never, UnionType.InitArguments];
  const _this = this as Writable<UnionType>;
  _this.fields = new ResponsiveMap();
  const own = _this.own as Writable<UnionType.OwnProperties>
  own.types = [];

  for (const base of init.types) {
    if (!(base instanceof ComplexType || base instanceof UnionType || base instanceof MappedType))
      throw new TypeError(`${OpraSchema.UnionType.Kind} shall contain ${OpraSchema.ComplexType.Kind}, ` +
          `${OpraSchema.UnionType.Kind} of ${OpraSchema.MappedType.Kind} types.`);
    own.types.push(base);
    if (base.additionalFields)
      _this.additionalFields = true;
    _this.fields.setAll(base.fields);
  }

  _this.kind = 'UnionType';
  _this.types = [...own.types];
} as UnionTypeConstructor;

UnionType._applyMixin = () => void 0;

const proto = {

  exportSchema(): OpraSchema.UnionType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.UnionType;
    Object.assign(out, omitUndefined({
      types: this.own.types.map(t => t.name ? t.name : t.exportSchema())
    }));
    return out;
  }

} as UnionType;

Object.assign(UnionType.prototype, proto);
Object.setPrototypeOf(UnionType.prototype, DataType.prototype);

/**
 *
 */
function mapToUnionType(...args: any[]) {
  // Filter undefined items
  const clasRefs = [...args].filter(x => !!x) as [Type];
  if (!clasRefs.length)
    throw new TypeError('No Class has been provided');
  if (clasRefs.length === 1)
    return clasRefs[0] as any;

  class UnionClass {
    constructor() {
      for (const c of clasRefs)
        inheritPropertyInitializers(this, c);
    }
  }

  const metadata: UnionType.Metadata = {
    kind: OpraSchema.UnionType.Kind,
    types: []
  };
  Reflect.defineMetadata(METADATA_KEY, metadata, UnionClass);

  for (const c of clasRefs) {
    const itemMeta = Reflect.getMetadata(METADATA_KEY, c);
    if (!(itemMeta && (itemMeta.kind === OpraSchema.ComplexType.Kind || itemMeta.kind === OpraSchema.UnionType.Kind ||
        itemMeta.kind === OpraSchema.MappedType.Kind)))
      throw new TypeError(`Class "${c.name}" is not a ${OpraSchema.ComplexType.Kind}, ${OpraSchema.UnionType.Kind} or ${OpraSchema.MappedType.Kind}`);
    metadata.types.push(c);
    applyMixins(UnionClass, c);
  }

  UnionType._applyMixin(UnionClass, ...clasRefs);

  return UnionClass as any;
}
