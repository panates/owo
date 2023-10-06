/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  OpraSchema,
  Singleton,
} from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - Singleton resource with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add Singleton resource', async () => {
    @Singleton(Country, {
      description: 'Country singleton',
    })
    class MyCountryResource {

    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [MyCountryResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Singleton.Kind);
    expect(t.name).toStrictEqual('MyCountry');
    expect(t.description).toStrictEqual('Country singleton');
    expect(t.type.name).toEqual('Country');
    expect(t.ctor).toBe(MyCountryResource);
  })


  it('Should define "create" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Create()
      create() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [MyCountryResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.ctor).toBe(MyCountryResource);
    expect(t.getOperation('create')).toBeDefined();
  })

  it('Should define "get" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Get()
      get() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [MyCountryResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.ctor).toBe(MyCountryResource);
    expect(t.getOperation('get')).toBeDefined();
  })

  it('Should define "update" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Update()
      update() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [MyCountryResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.ctor).toBe(MyCountryResource);
    expect(t.getOperation('update')).toBeDefined();
  })

  it('Should define "deleteOne" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Delete()
      delete() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [MyCountryResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.ctor).toBe(MyCountryResource);
    expect(t.getOperation('delete')).toBeDefined();
  })

});