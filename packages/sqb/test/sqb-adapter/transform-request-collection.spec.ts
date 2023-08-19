/* eslint-disable import/no-duplicates */
import '@opra/sqb';
import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { SQBAdapter } from '@opra/sqb';
import { Eq } from '@sqb/builder';
import { createTestApp } from '../_support/test-app/index.js';

describe('SQBAdapter.transformRequest (Collection)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    const app = await createTestApp();
    api = app.api;
  });

  /*
   *
   */
  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'create',
        data
      } as unknown as Request;
      const options = {};
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'create',
        data,
        params: {
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });
  });

  /*
   *
   */
  describe('Convert "delete" request', function () {
    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'delete',
        key: 1
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {};
      expect(o.method).toStrictEqual('delete');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });
  });

  /*
   *
   */
  describe('Convert "deleteMany" request', function () {

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'deleteMany'
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "filter" option', async () => {
      const source = api.getCollection('customers');
      const request = {
        source,
        endpoint: 'deleteMany',
        params: {filter: source.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq('givenName', 'John')
      }
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    })
  });

  /*
   *
   */
  describe('Convert "get" request', function () {

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'get',
        key: 1
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {}
      expect(o.method).toStrictEqual('find');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'get',
        key: 1,
        params: {
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });

  })

  /*
   *
   */
  describe('Convert "findMany" request', function () {

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'findMany'
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "filter" option', async () => {
      const source = api.getCollection('customers');
      const request = {
        source,
        endpoint: 'findMany',
        params: {filter: source.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq('givenName', 'John')
      }
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'findMany',
        params: {
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });
  });

  /*
   *
   */
  describe('Convert "update" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'update',
        key: 1,
        data
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {}
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, data, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'update',
        key: 1,
        data,
        params: {
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, data, options]);
    });
  });

  /*
   *
   */
  describe('Convert "updateMany" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        source: api.getCollection('customers'),
        endpoint: 'updateMany',
        data
      } as unknown as Request;
      const options = {};
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "filter" option', async () => {
      const source = api.getCollection('customers');
      const request = {
        source,
        endpoint: 'updateMany',
        data,
        params: {filter: source.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq('givenName', 'John')
      }
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    })

  });

});

