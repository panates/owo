import express from 'express';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:delete', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should delete instance', async () => {
    let resp = await client.entity('Customers')
        .delete(101).send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await client.entity('Customers')
        .get(101).send();
    resp.expect
        .toFail(404);
  })

});
