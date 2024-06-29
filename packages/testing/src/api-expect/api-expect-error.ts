import '../jest-extend/index.js';
import { ErrorIssue, omitNullish } from '@opra/common';
import { ApiExpectBase } from './api-expect-base.js';

export interface MatchingErrorIssue {
  message?: ErrorIssue['message'] | RegExp;
  system?: ErrorIssue['system'] | RegExp;
  code?: ErrorIssue['code'] | RegExp;
  details?: ErrorIssue['details'] | RegExp;
  diagnostics?: ErrorIssue['diagnostics'] | RegExp;

  [index: string]: any;
}

export class ApiExpectError extends ApiExpectBase {
  toMatch(expected: string | RegExp | MatchingErrorIssue) {
    try {
      if (typeof expected === 'string') expected = { message: expected } as MatchingErrorIssue;
      else if (expected instanceof RegExp) {
        expected = { message: expect.stringMatching(expected) } as MatchingErrorIssue;
      } else expected = omitNullish(expected);
      this._expect(this.response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining(expected)]));
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }
}
