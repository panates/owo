import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import { ApiDocument, HttpOperation } from '@opra/common';
import { ExpressAdapter, HttpIncoming, HttpOutgoing, MultipartItem, NodeIncomingMessage } from '@opra/core';
import type { ExpressAdapterHost } from '@opra/core/server/http/adapters/express-adapter.host';
import { HttpContextHost } from '@opra/core/server/http/http-context.host';
import { createTestApi } from '../_support/test-api/index.js';

describe('HttpContext', function () {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapterHost;

  function createContext(operation: HttpOperation, request: HttpIncoming) {
    const response = HttpOutgoing.from({ req: request });
    return new HttpContextHost({
      adapter,
      document,
      operation,
      resource: operation.owner,
      platform: { name: 'express' },
      request,
      response,
    });
  }

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    app.use(cookieParser());
    adapter = (await ExpressAdapter.create(app, document)) as ExpressAdapterHost;
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should getBody() retrieve body content', async () => {
    const resource = document.api?.findController('Customer');
    const operation = resource!.operations.get('update')!;
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            'F',
            '{"active":true}',
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    await adapter.parseRequest(context);
    const body = await context.getBody();
    expect(body).toEqual({ active: true });
  });

  it('Should validate body content', async () => {
    const resource = document.api?.findController('Customer');
    const operation = resource!.operations.get('update')!;
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            'C',
            '{"rate":"x"}',
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    await await expect(() => adapter.parseRequest(context)).rejects.toThrow('not a valid number');
  });

  it('Should return MultipartReader if content is multipart', async () => {
    const resource = document.api?.findController('Files');
    const operation = resource!.operations.get('post')!;
    const s = [
      '--AaB03x',
      'content-disposition: form-data; name="notes"',
      '',
      'Joe Blow\r\nalmost tricked you!',
      '',
      '--AaB03x',
      'content-disposition: form-data; name="file1"; filename="file1.txt"',
      'Content-Type: text/plain',
      '',
      '... contents of file1.txt ...',
      '--AaB03x',
      'content-disposition: form-data; name="notes2"',
      '',
      'Ignore this!',
      '',
      '--AaB03x--',
    ].join('\r\n');
    const context = createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customer HTTP/1.1',
            'Content-Type: multipart/form-data; boundary=AaB03x',
            'Content-Length: ' + s.length,
            '',
            s,
            '',
          ].join('\r\n'),
        ),
      ),
    );
    await adapter.parseRequest(context);
    const reader = await context.getMultipartReader();
    let parts = await reader.getAll();
    expect(parts).toBeDefined();
    expect(parts.length).toEqual(3);
    parts = await context.getBody<MultipartItem[]>();
    expect(parts).toBeDefined();
    expect(parts.length).toEqual(2);
  });
});
