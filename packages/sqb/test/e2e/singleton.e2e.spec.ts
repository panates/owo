import '@opra/sqb';
import { OpraTestClient } from '@opra/testing';
import { singletonTests } from '../../../core/test/http/e2e/tests/index.js';
import { createTestApp, TestApp } from '../_support/test-app/index.js';

describe('e2e:Singleton', function () {
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
  singletonTests.call(this, testArgs);

});

