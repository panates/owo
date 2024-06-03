/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocumentFactory, ComplexType, DataType, EnumType, SimpleType } from '@opra/common';
import { Country, GenderEnum, testApiDocumentDef } from '../_support/test-api/index.js';

describe('DocumentNode', function () {
  afterAll(() => global.gc && global.gc());

  it('Should findDataType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.findDataType('string')).toBeInstanceOf(DataType);
    expect(doc.node.findDataType('string')!.name).toStrictEqual('string');
  });

  it('Should findDataType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.findDataType(String)).toBeInstanceOf(DataType);
    expect(doc.node.findDataType(String)!.name).toStrictEqual('string');
  });

  it('Should findDataType(name) return `undefined` if not found', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.findDataType('unknown')).not.toBeDefined();
  });

  it('Should getDataType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getDataType('string')).toBeInstanceOf(DataType);
    expect(doc.node.getDataType('string').name).toStrictEqual('string');
  });

  it('Should getDataType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getDataType(String)).toBeInstanceOf(DataType);
    expect(doc.node.getDataType(String).name).toStrictEqual('string');
  });

  it('Should getDataType(unknown: string) throw if not found', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.node.getDataType('notexists')).toThrow('Unknown data type');
  });

  it('Should getSimpleType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getSimpleType('string')).toBeInstanceOf(SimpleType);
    expect(doc.node.getSimpleType('string').name).toStrictEqual('string');
    expect(doc.node.getSimpleType('string').kind).toStrictEqual('SimpleType');
  });

  it('Should getSimpleType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getSimpleType(String)).toBeInstanceOf(SimpleType);
    expect(doc.node.getSimpleType(String).name).toStrictEqual('string');
    expect(doc.node.getSimpleType(String).kind).toStrictEqual('SimpleType');
  });

  it('Should getSimpleType(name) throw if DataType is not SimpleType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.node.getSimpleType('object')).toThrow('is not');
  });

  it('Should getSimpleType(ctor: Class) throw if DataType is not SimpleType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.node.getSimpleType(Country)).toThrow('is not');
  });

  it('Should getComplexType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getComplexType('country')).toBeInstanceOf(ComplexType);
    expect(doc.node.getComplexType('country').name).toStrictEqual('Country');
    expect(doc.node.getComplexType('country').kind).toStrictEqual('ComplexType');
  });

  it('Should getComplexType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getComplexType(Country)).toBeInstanceOf(ComplexType);
    expect(doc.node.getComplexType(Country).name).toStrictEqual('Country');
    expect(doc.node.getComplexType(Country).kind).toStrictEqual('ComplexType');
  });

  it('Should getComplexType(name) throw if DataType is not ComplexType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.node.getComplexType('string')).toThrow('is not');
  });

  it('Should getComplexType(ctor: Class) throw if DataType is not ComplexType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.node.getComplexType(String)).toThrow('is not');
  });

  it('Should getEnumType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getEnumType('GenderEnum')).toBeInstanceOf(EnumType);
    expect(doc.node.getEnumType('GenderEnum').name).toStrictEqual('GenderEnum');
    expect(doc.node.getEnumType('GenderEnum').kind).toStrictEqual('EnumType');
  });

  it('Should getEnumType(Obj) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.node.getEnumType(GenderEnum)).toBeInstanceOf(EnumType);
    expect(doc.node.getEnumType(GenderEnum).name).toStrictEqual('GenderEnum');
    expect(doc.node.getEnumType(GenderEnum).kind).toStrictEqual('EnumType');
  });
});