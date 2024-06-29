import { ApiDocument, OpraSchema } from '@opra/common';
import { Gender } from 'customer-mongo/models';
import { TestApiDocument } from '../_support/test-api/index.js';

describe('ApiDocument', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestApiDocument.create();
  });

  it('Should include built-in types by default', async () => {
    const ref = doc.references.get('opra');
    expect(ref).toBeDefined();
    expect(ref?.node.getDataType('any')).toBeDefined();
    expect(ref?.node.getDataType('any').kind).toStrictEqual('SimpleType');
    expect(ref?.node.getDataType(Object)).toBeDefined();
    expect(ref?.node.getDataType(Object).name).toStrictEqual('any');

    expect(ref?.node.getDataType('bigint')).toBeDefined();
    expect(ref?.node.getDataType(BigInt)).toBeDefined();
    expect(ref?.node.getDataType(BigInt).name).toStrictEqual('bigint');

    expect(ref?.node.getDataType('boolean')).toBeDefined();
    expect(ref?.node.getDataType(Boolean)).toBeDefined();
    expect(ref?.node.getDataType(Boolean).name).toStrictEqual('boolean');

    expect(ref?.node.getDataType('integer')).toBeDefined();

    expect(ref?.node.getDataType('number')).toBeDefined();
    expect(ref?.node.getDataType(Number)).toBeDefined();
    expect(ref?.node.getDataType(Number).name).toStrictEqual('number');

    expect(ref?.node.getDataType('object')).toBeDefined();

    expect(ref?.node.getDataType('string')).toBeDefined();
    expect(ref?.node.getDataType(String)).toBeDefined();
    expect(ref?.node.getDataType(String).name).toStrictEqual('string');

    expect(ref?.node.getDataType('time')).toBeDefined();
    expect(ref?.node.getDataType('datetime')).toBeDefined();
  });

  it('Should getDataTypeNs() return namespace of DataType', async () => {
    expect(doc.getDataTypeNs(Gender)).toStrictEqual('ns1');
    expect(doc.getDataTypeNs(String)).toStrictEqual('');
    expect(doc.getDataTypeNs('string')).toStrictEqual('');
  });

  it('Should export() return document schema', async () => {
    const sch = doc.export();
    expect(sch.spec).toStrictEqual(OpraSchema.SpecVersion);
    expect(sch.info).toBeDefined();
    expect(sch.id).toBeDefined();
    expect(sch.types).not.toBeDefined();
    expect(sch.references).toBeDefined();
    expect(sch.references!.ns1).toBeDefined();
    expect(sch.api).toBeDefined();
    expect(sch.api!.protocol).toEqual('http');
    expect(sch.api!.description).toEqual('test service');
    expect(sch.api!.url).toEqual('/test');
    expect(sch.api!.controllers).toBeDefined();
  });
});
