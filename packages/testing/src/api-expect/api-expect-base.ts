import '../jest-extend/index.js';
import { HttpResponse } from '@opra/client';

export class ApiExpectBase {
  readonly response: HttpResponse
  protected readonly isNot?: boolean;

  constructor(response: HttpResponse, isNot?: boolean) {
      this.response = response;
      this.isNot = isNot;
  }

  protected _expect(expected: any): jest.Matchers<any> {
    const out = expect(expected);
    if (this.isNot) return out.not;
    return out;
  }

}

