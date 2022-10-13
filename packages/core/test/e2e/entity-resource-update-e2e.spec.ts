import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraService } from '@opra/schema';
import { opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:update', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should update instance', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await api.entity('Customers')
        .get(100).send();
    const oldData = resp.body;

    resp = await api.entity('Customers')
        .update(oldData.id, data).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});

    resp = await api.entity('Customers')
        .get(oldData.id).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});
  })

  it('Should pick fields to be returned', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await api.entity('Customers')
        .get(100).send();
    const oldData = resp.body;

    resp = await api.entity('Customers')
        .update(oldData.id, data)
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainAllKeys(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await api.entity('Customers')
        .get(100).send();
    const oldData = resp.body;

    resp = await api.entity('Customers')
        .update(oldData.id, data)
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await api.entity('Customers')
        .get(100).send();
    const oldData = resp.body;

    resp = await api.entity('Customers')
        .update(oldData.id, data)
        .include('address')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['address']);
  })

});
