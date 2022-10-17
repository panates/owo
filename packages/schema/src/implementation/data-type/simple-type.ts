import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect-utils.js';
import type { OpraDocument } from '../opra-document.js';
import { DataType } from './data-type.js';

export class SimpleType extends DataType {
  declare protected readonly _metadata: OpraSchema.SimpleType;
  declare readonly base?: SimpleType;

  constructor(owner: OpraDocument, args: StrictOmit<OpraSchema.SimpleType, 'kind'>) {
    super(owner, {
      kind: 'SimpleType',
      ...args
    });
  }

  get type() {
    return this._metadata.type;
  }

  get format(): string | undefined {
    return this._metadata.format;
  }

  get default(): boolean | number | string | undefined {
    return this._metadata.default;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
