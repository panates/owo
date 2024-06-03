import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateTests(args: { client: OpraTestClient }) {
  describe('Collection:updateOne', function () {
    afterAll(() => global.gc && global.gc());

    it('Should update instance', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
      };
      let resp = await args.client.collection('Customers').get(85).getResponse();
      resp.expect.toSuccess().toReturnObject();
      const oldData = resp.body.payload;

      resp = await args.client.collection('Customers').update(85, data).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });

      resp = await args.client.collection('Customers').get(85).getResponse();
      resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({ ...oldData, ...data, address: undefined });
    });

    it('Should pick fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
      };
      let resp = await args.client.collection('Customers').get(100).getResponse();
      const oldData = resp.body.payload;
      resp.expect.toSuccess().toReturnObject();

      resp = await args.client
        .collection('Customers')
        .update(oldData._id, data, { pick: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainAllFields(['_id', 'givenName']);
    });

    it('Should omit fields to be returned', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
      };
      let resp = await args.client.collection('Customers').get(100).getResponse();
      const oldData = resp.body.payload;
      resp.expect.toSuccess().toReturnObject();

      resp = await args.client
        .collection('Customers')
        .update(oldData._id, data, { omit: ['_id', 'givenName'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().not.toContainFields(['_id', 'givenName']);
    });

    it('Should include exclusive fields if requested', async () => {
      const data = {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: { city: 'Izmir' },
      };
      let resp = await args.client.collection('Customers').get(100).getResponse();
      const oldData = resp.body.payload;
      resp.expect.toSuccess().toReturnObject();

      resp = await args.client
        .collection('Customers')
        .update(oldData._id, data, { include: ['address'] })
        .getResponse();
      resp.expect.toSuccess().toReturnObject().toContainFields(['address']);
    });
  });
}