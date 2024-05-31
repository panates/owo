import 'reflect-metadata';
import { asMutable, Combine, Type, TypeThunkAsync } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { DocumentElement } from '../common/document-element.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { DECORATOR } from '../constants.js';
import { ApiField } from './api-field.js';
import { ComplexTypeBase } from './complex-type-base.js';
import { DataType } from './data-type.js';
import { ComplexTypeDecorator } from './decorators/complex-type.decorator.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * @namespace ComplexType
 */
export namespace ComplexType {
  export interface Metadata
    extends Combine<
      {
        kind: OpraSchema.ComplexType.Kind;
        fields?: Record<string, ApiField.Metadata>;
        additionalFields?: boolean | string | TypeThunkAsync | ['error'] | ['error', string];
      },
      DataType.Metadata,
      OpraSchema.ComplexType
    > {}

  export interface Options
    extends Combine<
      Pick<Metadata, 'additionalFields' | 'keyField'>,
      DataType.Options,
      Pick<OpraSchema.ComplexType, 'abstract'>
    > {}

  export interface InitArguments
    extends Combine<
      {
        kind: OpraSchema.ComplexType.Kind;
        base?: ComplexType | MappedType | MixinType;
        fields?: Record<string, ApiField.InitArguments | ApiField>;
        additionalFields?: boolean | DataType | ['error'] | ['error', string];
      },
      DataType.InitArguments,
      ComplexType.Metadata
    > {}

  export interface ParsedFieldPath {
    fieldName: string;
    dataType: DataType;
    field?: ApiField;
    additionalField?: boolean;
    sign?: '+' | '-';
  }
}

/**
 * Type definition for MixinType
 * @class ComplexType
 */
export interface ComplexTypeStatic {
  /**
   * Class constructor of ComplexType
   *
   * @param owner
   * @param args
   * @param context
   * @constructor
   */
  new (owner: DocumentElement, args?: ComplexType.InitArguments, context?: DocumentInitContext): ComplexType;

  (options?: ComplexType.Options): ClassDecorator;

  prototype: ComplexType;

  extend<T extends Type>(typeClass: T, fields: Record<string, ApiField.Options>): T;
}

/**
 * Type definition of ComplexType prototype
 * @interface ComplexType
 */
export interface ComplexType extends ComplexTypeClass {}

/**
 * ComplexType constructor
 */
export const ComplexType = function (this: ComplexType | void, ...args: any[]) {
  // Decorator
  if (!this) return ComplexType[DECORATOR].apply(undefined, args);
  // Constructor
  const [owner, initArgs] = args as [DocumentElement, ComplexType.InitArguments];
  const context: DocumentInitContext = args[2] || new DocumentInitContext({ maxErrors: 0 });
  ComplexTypeBase.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.kind = OpraSchema.ComplexType.Kind;
  _this.additionalFields = initArgs.additionalFields;
  _this.keyField = initArgs.keyField;
  if (initArgs.base) {
    context.enter('.base', () => {
      // noinspection SuspiciousTypeOfGuard
      if (!(initArgs.base instanceof ComplexTypeBase))
        throw new TypeError(`"${(initArgs.base! as DataType).kind}" can't be set as base for a "${this.kind}"`);
      _this.base = initArgs.base;
      if (_this.additionalFields == null && _this.base.additionalFields)
        _this.additionalFields = _this.base.additionalFields;

      /** Copy fields from base */
      for (const v of _this.base.fields.values()) {
        this.fields.set(v.name, new ApiField(this, v));
      }
    });
  }
  _this.ctor = initArgs.ctor || _this.base?.ctor;

  /** Add own fields */
  if (initArgs.fields) {
    context.enter('.fields', () => {
      for (const [k, v] of Object.entries(initArgs.fields!)) {
        const field = new ApiField(this, {
          ...v,
          name: k,
        });
        this.fields.set(field.name, field);
      }
    });
  }
} as Function as ComplexTypeStatic;

/**
 *
 * @class ComplexType
 */
abstract class ComplexTypeClass extends ComplexTypeBase {
  readonly kind: OpraSchema.ComplexType.Kind;
  readonly base?: ComplexType | MappedType | MixinType;
  readonly ctor?: Type;

  extendsFrom(baseType: DataType): boolean {
    if (!(baseType instanceof ComplexTypeBase)) return false;
    if (baseType === this) return true;
    return !!this.base?.extendsFrom(baseType);
  }

  toJSON(): OpraSchema.ComplexType {
    const out = omitUndefined<OpraSchema.ComplexType>({
      ...ComplexTypeBase.prototype.toJSON.call(this),
      kind: this.kind,
      base: this.base ? (this.base.name ? this.base.name : this.base.toJSON()) : undefined,
    });
    if (this.additionalFields) {
      if (this.additionalFields instanceof DataType) {
        out.additionalFields = this.additionalFields[1].name
          ? this.additionalFields[1].name
          : (this.additionalFields[1].toJSON() as OpraSchema.DataType);
      } else out.additionalFields = this.additionalFields;
    }
    if (this.fields.size) {
      const fields = {};
      let i = 0;
      for (const field of this.fields.values()) {
        if (field.origin === this) {
          fields[field.name] = field.toJSON();
          i++;
        }
      }
      if (i) out.fields = fields;
    }
    return omitUndefined(out);
  }
}

ComplexType.prototype = ComplexTypeClass.prototype;
Object.assign(ComplexType, ComplexTypeDecorator);
ComplexType[DECORATOR] = ComplexTypeDecorator;
