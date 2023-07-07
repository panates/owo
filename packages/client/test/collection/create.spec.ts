import { HttpHeaderCodes } from '@opra/common';
import { HttpResponse, OpraHttpClient } from '../../src/index.js';
import { createMockServer, MockServer } from '../_support/create-mock-server.js';

describe('Collection.create', function () {

  let app: MockServer;
  let client: OpraHttpClient;
  const data = {id: 1, givenName: 'dfd'};

  afterAll(() => app.server.close());

  beforeAll(async () => {
    app = await createMockServer();
    client = new OpraHttpClient(app.baseUrl, {api: app.api});
    app.mockHandler((req, res) => {
      res.header(HttpHeaderCodes.X_Opra_Version, '1');
      res.header(HttpHeaderCodes.X_Opra_Data_Type, 'Customer');
      res.json(data);
    })
  });

  it('Should return OPRA headers', async () => {
    const resp = await client.collection('Customers')
        .create(data).fetch('response');
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual('1');
    expect(app.lastResponse.get(HttpHeaderCodes.X_Opra_Data_Type)).toStrictEqual('Customer');
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Version)).toStrictEqual('1');
    expect(resp.headers.get(HttpHeaderCodes.X_Opra_Data_Type)).toStrictEqual('Customer');
  });

  it('Should return body if observe=body or undefined', async () => {
    const resp = await client.collection('Customers')
        .create(data).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toEqual(data);
  });

  it('Should return HttpResponse if observe=response', async () => {
    const resp = await client.collection('Customers')
        .create(data).fetch('response');
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(resp).toBeInstanceOf(HttpResponse);
  });

  it('Should subscribe events', (done) => {
    const expectedEvents = ['sent', 'headers-received', 'response'];
    const receivedEvents: string[] = [];
    client.collection('Customers').create(data, {observe: 'events'}).subscribe({
      next: (events) => {
        receivedEvents.push(events.event);
      },
      complete: () => {
        try {
          expect(expectedEvents).toStrictEqual(receivedEvents);
        } catch (e) {
          return done(e);
        }
        done();
      },
      error: done
    });
  });

  it('Should send request with "$include" param', async () => {
    await client.collection('Customers').create(data, {include: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$include']);
    expect(app.lastRequest.query.$include).toStrictEqual('id,givenName');
  });

  it('Should send request with "$pick" param', async () => {
    await client.collection('Customers')
        .create(data, {pick: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$pick']);
    expect(app.lastRequest.query.$pick).toStrictEqual('id,givenName');
  });

  it('Should send request with "$omit" param', async () => {
    await client.collection('Customers')
        .create(data, {omit: ['id', 'givenName']}).fetch();
    expect(app.lastRequest).toBeDefined();
    expect(app.lastRequest.method).toStrictEqual('POST');
    expect(app.lastRequest.baseUrl).toStrictEqual('/Customers');
    expect(app.lastRequest.body).toStrictEqual(data);
    expect(Object.keys(app.lastRequest.query)).toStrictEqual(['$omit']);
    expect(app.lastRequest.query.$omit).toStrictEqual('id,givenName');
  });

});
