import request, { Response } from 'supertest';
import { CreateInstanceQueryOptions } from '@opra/schema';
import { OpraURL } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester.js';

export type OpraEntityCreateTesterParams = OpraEntityTesterParams & {
  data: {};
  options: CreateInstanceQueryOptions;
}

export class OpraEntityCreateTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntityCreateTesterParams;

  constructor(params: OpraEntityCreateTesterParams) {
    super(params);
  }

  data(data: {}): this {
    this._params.data = data;
    return this;
  }

  omit(...fields: (string | string[])[]): this {
    this._params.options.omit = fields.flat();
    return this;
  }

  pick(...fields: (string | string[])[]): this {
    this._params.options.pick = fields.flat();
    return this;
  }

  include(...fields: (string | string[])[]): this {
    this._params.options.include = fields.flat();
    return this;
  }

  protected async _send(): Promise<Response> {
    const url = new OpraURL(this._params.path);
    url.pathPrefix = this._params.prefix;
    if (this._params.options.include)
      url.searchParams.set('$include', this._params.options.include);
    if (this._params.options.pick)
      url.searchParams.set('$pick', this._params.options.pick);
    if (this._params.options.omit)
      url.searchParams.set('$omit', this._params.options.omit);
    const req = request(this._params.app);
    const test = req.post(url.toString());
    this._prepare(test);
    return test.send(this._params.data);
  }


}
