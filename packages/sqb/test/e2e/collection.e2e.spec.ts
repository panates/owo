import '@opra/sqb';
import { OpraTestClient } from '@opra/testing';
import { entityTests } from '../../../core/test/http/e2e/tests/index.js';
import { createTestApp, TestApp } from '../_support/test-app/index.js';

describe('e2e:Collection', function () {
  let app: TestApp;
  let client: OpraTestClient;
  const testArgs: any = {};

  beforeAll(async () => {
    app = await createTestApp();
    client = new OpraTestClient(app.adapter.server, {document: app.api});
    testArgs.app = app;
    testArgs.client = client;
  });

  afterAll(async () => {
    await app.adapter.close();
    await app?.db.close(0);
  })

  // @ts-ignore
  entityTests.call(this, testArgs);

});

