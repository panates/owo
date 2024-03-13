/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory, HttpAction, HttpApi,
  HttpOperation, HttpResource, OpraSchema,
} from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - HttpResource() decorated class', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should import decorated resource class', async () => {
    @HttpResource({
      description: 'Country collection'
    })
    class CountriesResource {
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: [CountriesResource]
        }
      }
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = (doc.api as HttpApi)
        .root.getResource('countries');
    expect(t).toBeDefined();
    expect(t!.ctor).toBe(CountriesResource);
  })

  it('Should import operation endpoint', async () => {
    @HttpResource()
    class CountriesResource {
      @HttpOperation({
        method: 'POST',
        description: 'operation description',
        requestBody: {
          description: 'requestBody description',
          required: true,
          maxContentSize: 1000
        }
      }).RequestContent({
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        type: Country,
        description: 'content description',
        example: 'example1',
      }).RequestContent({
        contentType: 'application/xml',
        contentEncoding: 'utf-16',
        type: Country,
        description: 'content description',
        example: 'example2',
      })
      create() {
        return 1;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: [CountriesResource]
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('countries');
    expect(t!.ctor).toBe(CountriesResource);
    const endpoint = t!.getOperation('create');
    expect(endpoint).toBeDefined();
    expect(endpoint!.method).toStrictEqual('POST');
    expect(endpoint!.description).toStrictEqual('operation description');
    expect(endpoint!.requestBody?.description).toStrictEqual('requestBody description');
    expect(endpoint!.requestBody?.required).toStrictEqual(true);
    expect(endpoint!.requestBody?.maxContentSize).toStrictEqual(1000);
    expect(endpoint!.requestBody?.content.length).toStrictEqual(2);
    expect(endpoint!.requestBody?.content[0].contentType).toStrictEqual('application/json');
    expect(endpoint!.requestBody?.content[0].contentEncoding).toStrictEqual('utf-8');
    expect(endpoint!.requestBody?.content[0].type?.name).toBe('Country');
    expect(endpoint!.requestBody?.content[0].example).toBe('example1');
    expect(endpoint!.requestBody?.content[1].contentType).toStrictEqual('application/xml');
    expect(endpoint!.requestBody?.content[1].contentEncoding).toStrictEqual('utf-16');
    expect(endpoint!.requestBody?.content[1].type!.name).toBe('Country');
    expect(endpoint!.requestBody?.content[1].example).toBe('example2');
  })

  it('Should import action endpoint', async () => {
    @HttpResource()
    class CountriesResource {

      @HttpAction({
        description: 'action description'
      })
      ping() {
        return 'pong';
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: [CountriesResource]
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('countries');
    expect(t!.ctor).toBe(CountriesResource);
    const endpoint = t!.getAction('ping');
    expect(endpoint).toBeDefined();
    expect(endpoint!.description).toStrictEqual('action description');
  })

  it('Should import HttpOperation.Entity.Create operation', async () => {
    @HttpResource()
    class CountriesResource {
      @HttpOperation.Entity.Create(Country)
      create() {
        return 1;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: [CountriesResource]
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('countries');
    expect(t!.ctor).toBe(CountriesResource);
    const endpoint = t!.getOperation('create');
    expect(endpoint).toBeDefined();
    expect(endpoint!.method).toStrictEqual('POST');
  })

});
