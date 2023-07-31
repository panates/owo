/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { jest } from '@jest/globals'
import { ApiDocument, Collection } from '@opra/common';
import { OpraHttpAdapter, RequestContext } from '@opra/core';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Collection', function () {

  let document: ApiDocument;
  let adapter: OpraHttpAdapter;
  let resource: Collection;
  const data = {
    id: 1001,
    givenName: 'abcd',
    familyName: 'efgh',
  }

  beforeAll(async () => {
    document = await createTestApi();
    adapter = await OpraHttpAdapter.create(document);
    resource = document.getCollection('customers');
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "create" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.create!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return data;
            });
    await supertest(adapter.server).post('/Customers').send(data);
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toStrictEqual(data);
    expect(ctx.request.operation).toStrictEqual('create');
    expect(ctx.request.args.data).toStrictEqual(data);
    mockFn.mockRestore();
  });

  it('Should execute "get" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.get!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return data;
            });
    await supertest(adapter.server).get('/Customers@1');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toStrictEqual(data);
    expect(ctx.request.operation).toStrictEqual('get');
    expect(ctx.request.args.key).toStrictEqual(1);
    mockFn.mockRestore();
  });

  it('Should execute "search" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.findMany!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return [data];
            });
    await supertest(adapter.server).get('/Customers');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toEqual([data]);
    expect(ctx.request.operation).toStrictEqual('findMany');
    mockFn.mockRestore();
  });

  it('Should execute "delete" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.delete!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return true;
            });
    await supertest(adapter.server).delete('/Customers@1');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toStrictEqual({affected: 1, operation: 'delete'});
    expect(ctx.request.operation).toStrictEqual('delete');
    expect(ctx.request.args.key).toStrictEqual(1);
    mockFn.mockRestore();
  });

  it('Should execute "deleteMany" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.deleteMany!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return 10;
            });
    await supertest(adapter.server).delete('/Customers');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toEqual({affected: 10, operation: 'delete'});
    expect(ctx.request.operation).toStrictEqual('deleteMany');
    mockFn.mockRestore();
  });

  it('Should execute "update" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.update!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return data;
            });
    await supertest(adapter.server).patch('/Customers@1').send(data);
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toEqual(data);
    expect(ctx.request.operation).toStrictEqual('update');
    expect(ctx.request.args.key).toStrictEqual(1);
    expect(ctx.request.args.data).toStrictEqual(data);
    mockFn.mockRestore();
  });

  it('Should execute "updateMany" endpoint', async () => {
    let ctx!: RequestContext;
    const mockFn =
        jest.spyOn(resource.operations.updateMany!, 'handler')
            .mockImplementation((c) => {
              ctx = c;
              return 8;
            });
    await supertest(adapter.server).patch('/Customers').send(data);
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response.value).toEqual({affected: 8, operation: 'update'});
    expect(ctx.request.operation).toStrictEqual('updateMany');
    expect(ctx.request.args.data).toStrictEqual(data);
    mockFn.mockRestore();
  });

});
