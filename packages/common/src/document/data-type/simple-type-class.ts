import * as vg from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DataType } from './data-type.js';
import type { SimpleType } from './simple-type.js';

/**
 * @class SimpleType
 */
export class SimpleTypeClass extends DataType {
  readonly kind = OpraSchema.SimpleType.Kind
  readonly base?: SimpleType;
  readonly own: SimpleType.OwnProperties;
  readonly decode: vg.Validator<any, any>;
  readonly encode: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: SimpleType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.decode = init.decoder || init.base?.decode || vg.isAny();
    this.encode = init.encoder || init.base?.encode || vg.isAny();
  }

  exportSchema(): OpraSchema.SimpleType {
    // noinspection UnnecessaryLocalVariableJS
    const out = super.exportSchema() as OpraSchema.SimpleType;
    // Object.assign(out, omitUndefined({
    //   base: this.base ?
    //       (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
    // }));
    return out;
  }

}