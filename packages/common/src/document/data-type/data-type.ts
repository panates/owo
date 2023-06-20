import { RequiredSome, Type } from 'ts-gems';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import {
  colorFgMagenta,
  colorFgYellow,
  colorReset,
  nodeInspectCustom
} from '../utils/inspect.util.js';

export namespace DataType {
  export interface InitArguments {
    name?: string;
    description?: string;
  }

  export interface DecoratorOptions extends InitArguments {
  }

  export interface Metadata extends RequiredSome<DecoratorOptions, 'name'> {
    kind: OpraSchema.DataType.Kind;
  }

  export interface OwnProperties {
  }

}

export abstract class DataType {
  readonly document: ApiDocument;
  readonly kind: OpraSchema.DataType.Kind;
  readonly name?: string;
  readonly base?: DataType;
  readonly own: DataType.OwnProperties;
  readonly description?: string;
  readonly isAnonymous: boolean;

  protected constructor(document: ApiDocument, init?: DataType.InitArguments) {
    this.document = document;
    this.name = init?.name;
    this.own = {};
    this.description = init?.description;
    this.isAnonymous = !this.name;
  }

  decode(v: any): any {
    return this._getDecoder()(v, {coerce: true});
  }

  encode(v: any): any {
    return this._getEncoder()(v, {coerce: true});
  }

  validate(v: any): any {
    return this._getEncoder()(v);
  }

  protected abstract _getDecoder(): vg.Validator<any, any>;

  protected abstract _getEncoder(): vg.Validator<any, any>;

  exportSchema(): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.description
    });
  }

  extendsFrom(type: string | Type | DataType): any {
    const dataType = type instanceof DataType ? type : this.document.getDataType(type);
    let t = this.base;
    while (t) {
      if (t === dataType)
        return true;
      t = t.base;
    }
    return false;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#anonymous'}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
