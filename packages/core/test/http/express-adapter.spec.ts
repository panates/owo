import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import supertest from 'supertest';
import { ApiDocument, OpraSchema } from '@opra/common';
import { ExpressAdapter } from '@opra/core';
import { createTestApi } from '../_support/test-api/index.js';

describe('ExpressAdapter', function () {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapter;

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    app.use(cookieParser());
    adapter = await ExpressAdapter.create(app, document, { basePath: 'api' });
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should init all routes', async () => {
    const routerStack = app._router.stack.find(x => x.name === 'router');
    expect(routerStack).toBeDefined();
    const paths = routerStack.handle.stack
      .filter(x => x.route)
      .map(x => {
        return x.route.path + ' | ' + Object.keys(x.route.methods).join(',').toUpperCase();
      });

    expect(paths).toEqual([
      '* | GET',
      '/ping | GET',
      '/Auth/login | GET',
      '/Auth/logout | GET',
      '/Auth/getToken | GET',
      '/Auth/getRawToken | GET',
      '/Customers | POST',
      '/Customers | DELETE',
      '/Customers | PATCH',
      '/Customers | GET',
      '/Customers/sendMessageAll | GET',
      '/Customers@:customerId | GET',
      '/Customers@:customerId | DELETE',
      '/Customers@:customerId | PATCH',
      '/Customers@:customerId/sendMessage | GET',
      '/Customers@:customerId/Addresses | POST',
      '/Customers@:customerId/Addresses | GET',
      '/Customers@:customerId/Addresses@:addressId | GET',
      '/Files | POST',
      '/MyProfile | POST',
      '/MyProfile | DELETE',
      '/MyProfile | GET',
      '/MyProfile | PATCH',
    ]);
  });

  it('Should return 404 error if route not found', async () => {
    const resp = await supertest(app).get('/api/notexist?x=1');
    expect(resp.status).toStrictEqual(404);
    expect(resp.body).toEqual({
      errors: [
        {
          code: 'NOT_FOUND',
          message: 'No endpoint found for [GET]/api/notexist',
          severity: 'error',
          details: {
            method: 'GET',
            path: '/api/notexist',
          },
        },
      ],
    });
  });

  it('Should GET:/$schema return api schema ', async () => {
    const resp = await supertest(app).get('/api/$schema');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toEqual({
      payload: expect.any(Object),
    });
    expect(resp.body.payload.spec).toEqual(OpraSchema.SpecVersion);
  });
});