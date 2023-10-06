import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionCreateTests(args: { client: OpraTestClient }) {

  describe('Collection:create', function () {

    afterAll(() => global.gc && global.gc());

    it('Should create instance', async () => {
      const data = {
        _id: 1001,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      let resp = await args.client.collection('Customers')
          .create(data)
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toMatch({...data, address: undefined});
      resp = await args.client.collection('Customers')
          .get(1001)
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({...data, address: undefined});
    })

    it('Should pick fields to be returned', async () => {
      const data = {
        _id: 1002,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      const resp = await args.client.collection('Customers')
          .create(data, {pick: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toHaveFieldsOnly(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const data = {
        _id: 1003,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        gender: 'M',
        address: {city: 'Izmir'}
      }
      const resp = await args.client.collection('Customers')
          .create(data, {omit: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const data = {
        _id: 1004,
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        countryCode: 'TR',
        gender: 'M',
        address: {city: 'Izmir', countryCode: 'TR',}
      }
      const resp = await args.client.collection('Customers')
          .create(data, {include: ['address']})
          .getResponse();
      resp.expect
          .toSuccess(201)
          .toReturnObject()
          .toHaveFields(['address']);
    })
  })
}