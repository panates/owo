/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  ApiField,
  ComplexType,
  OpraSchema,
  UnionType
} from '@opra/common';

describe('ApiDocumentFactory - UnionType with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add UnionType', async () => {
    @ComplexType()
    class Type1 {
      @ApiField()
      id: number
    }

    @ComplexType()
    class Type2 {
      @ApiField()
      name: string
    }

    @ComplexType({
      additionalFields: true
    })
    class Type3 {
      @ApiField()
      age: number
    }

    @ComplexType()
    class Union1 extends UnionType(Type1, UnionType(Type2, Type3)) {

    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Union1]
    })
    expect(doc).toBeDefined();
    const t1 = doc.types.get('union1') as UnionType;
    expect(t1).toBeDefined();
    expect(t1.kind).toStrictEqual('ComplexType');
    expect(t1.name).toStrictEqual('Union1');
    expect(t1.additionalFields).toStrictEqual(true);
    expect(Array.from(t1.fields.keys())).toStrictEqual(['id', 'name', 'age']);
  })

})
