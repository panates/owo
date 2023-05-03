/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  Collection,
  ComplexType,
  DataType,
  DocumentFactory,
  OpraSchema,
  SimpleType, Singleton,
} from '@opra/common';
import { Country } from '../_support/test-api/index.js';
import { CountriesResource } from '../_support/test-api/resources/countries.resource.js';
import { CustomersResource } from '../_support/test-api/resources/customers.resource.js';
import { MyProfileResource } from '../_support/test-api/resources/my-profile.resource.js';

describe('ApiDocument', function () {
  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    resources: [CustomersResource, CountriesResource, MyProfileResource]
  };

  it('Should create ApiDocument instance', async () => {
    expect(OpraSchema.Container.Kind).toStrictEqual('Container');
  })

  it('Should create ApiDocument instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.info).toBeDefined();
    expect(doc.info).toStrictEqual(baseArgs.info);
  })

  it('Should getDataType(name) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getDataType('string')).toBeInstanceOf(DataType);
    expect(doc.getDataType('string').name).toStrictEqual('string');
  })

  it('Should getDataType(ctor: Class) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getDataType(String)).toBeInstanceOf(DataType);
    expect(doc.getDataType(String).name).toStrictEqual('string');
  })

  it('Should getDataType(unknown: string) throw if not found', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getDataType('notexists')).toThrow('does not exists');
  })

  it('Should getSimpleType(name) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType('string')).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType('string').name).toStrictEqual('string');
    expect(doc.getSimpleType('string').kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(ctor: Class) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType(String)).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType(String).name).toStrictEqual('string');
    expect(doc.getSimpleType(String).kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(name) throw if DataType is not SimpleType', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType('object')).toThrow('is not');
  })

  it('Should getSimpleType(ctor: Class) throw if DataType is not SimpleType', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType(Country)).toThrow('is not');
  })

  it('Should getComplexType(name) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getComplexType('country')).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType('country').name).toStrictEqual('Country');
    expect(doc.getComplexType('country').kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(ctor: Class) return DataType instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getComplexType(Country)).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType(Country).name).toStrictEqual('Country');
    expect(doc.getComplexType(Country).kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(name) throw if DataType is not ComplexType', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType('string')).toThrow('is not');
  })

  it('Should getComplexType(ctor: Class) throw if DataType is not ComplexType', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType(String)).toThrow('is not');
  })

  it('Should include built-in types by default', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.references.size).toStrictEqual(1);
    const ref = doc.references.get('opra');
    expect(ref).toBeDefined();
    expect(ref?.getDataType('any')).toBeDefined();
    expect(ref?.getDataType('any').kind).toStrictEqual('SimpleType');
    expect(ref?.getDataType('base64')).toBeDefined();
    expect(ref?.getSimpleType('base64').ctor).toStrictEqual(ArrayBuffer);
    expect(() =>
        ref?.getSimpleType('base64').validate(Buffer.from('12').toString('base64'))
    ).not.toThrow();
    expect(ref?.getDataType('bigint')).toBeDefined();
    expect(() =>
        ref?.getSimpleType('bigint').validate(BigInt(123))
    ).not.toThrow();
    expect(() =>
        ref?.getSimpleType('bigint').validate(123)
    ).not.toThrow();
    expect(ref?.getDataType('boolean')).toBeDefined();
    expect(ref?.getSimpleType('boolean').ctor).toStrictEqual(Boolean);
    expect(ref?.getSimpleType('boolean').own.ctor).toStrictEqual(Boolean);
    expect(ref?.getDataType('date')).toBeDefined();
    expect(ref?.getSimpleType('date').ctor).toStrictEqual(Date);
    expect(ref?.getSimpleType('date').own.ctor).toStrictEqual(undefined);
    expect(ref?.getDataType('guid')).toBeDefined();
    expect(ref?.getSimpleType('guid').ctor).toStrictEqual(String);
    expect(ref?.getSimpleType('guid').own.ctor).toStrictEqual(undefined);
    expect(ref?.getDataType('integer')).toBeDefined();
    expect(ref?.getSimpleType('integer').ctor).toStrictEqual(Number);
    expect(ref?.getSimpleType('integer').own.ctor).toStrictEqual(undefined);
    expect(ref?.getDataType('number')).toBeDefined();
    expect(ref?.getSimpleType('number').ctor).toStrictEqual(Number);
    expect(ref?.getSimpleType('number').own.ctor).toStrictEqual(Number);
    expect(ref?.getDataType('object')).toBeDefined();
    expect(ref?.getComplexType('object')).toBeDefined();
    expect(ref?.getComplexType('object').additionalFields).toStrictEqual(true);
    expect(ref?.getDataType('string')).toBeDefined();
    expect(ref?.getSimpleType('string').ctor).toStrictEqual(String);
    expect(ref?.getSimpleType('string').own.ctor).toStrictEqual(String);
  })

  it('Should getResource(name) return Resource instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getResource('Customers')).toBeInstanceOf(Collection);
    expect(doc.getResource('Customers').name).toStrictEqual('Customers');
  })

  it('Should getResource(name) throw if resource not a found', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(() => doc.getResource('unknownResource')).toThrow('not found');
  })

  it('Should getResource(name, silent) return undefined if resource not a found', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc.getResource('unknownResource', true)).not.toBeDefined();
  })

  it('Should getCollection(name) return Collection instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getCollection('Customers')).toBeInstanceOf(Collection);
  })

  it('Should getCollection(name) throw if resource is not a Collection', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(() => doc.getCollection('MyProfile')).toThrow('is not a Collection');
  })

  it('Should getCollection(name, silent) return undefined if resource is not a Collection', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getCollection('MyProfile')).toThrow('is not a Collection');
  })

  it('Should getSingleton(name) return Singleton instance', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSingleton('MyProfile')).toBeInstanceOf(Singleton);
  })

  it('Should getSingleton(name) throw if resource is not a Singleton', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(() => doc.getSingleton('Customers')).toThrow('is not a Singleton');
  })

  it('Should getSingleton(name, silent) return undefined if resource is not a Singleton', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSingleton('Customers')).toThrow('is not a Singleton');
  })

  it('Should exportSchema() return document schema', async () => {
    const doc = await DocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    const sch = doc.exportSchema();
    expect(sch.version).toStrictEqual(OpraSchema.SpecVersion);
    expect(sch.info).toStrictEqual(baseArgs.info);
    expect(sch.types).toBeDefined();
    expect(Object.keys(sch.types!).sort())
        .toEqual(['Address', 'Country', 'Customer',
          'GenderEnum', 'Note', 'Person', 'Profile', 'Record'].sort());
    expect(sch.types?.Record).toBeDefined();
    expect(sch.types?.Record).toEqual(
        expect.objectContaining({
          kind: 'ComplexType',
          description: 'Base Record schema',
          abstract: true
        })
    );
    expect(sch.resources).toBeDefined();
    expect(Object.keys(sch.resources!).sort())
        .toEqual(['Countries', 'Customers', 'MyProfile'].sort());
  })

});