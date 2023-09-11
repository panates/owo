/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';

describe('SimpleType', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    }
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  it('Should exportSchema() return schema', async () => {
    const dt = api.getSimpleType('string');
    const x = dt.exportSchema();
    expect(x).toBeDefined();
    expect(x).toStrictEqual({
      kind: 'SimpleType',
      description: 'A sequence of characters'
    })
  })

});
