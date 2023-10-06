import { OpraTestClient } from '@opra/testing';

export function collectionGetTests(args: { client: OpraTestClient }) {

  describe('Collection:findOne', function () {

    afterAll(() => global.gc && global.gc());

    it('Should return object', async () => {
      const resp = await args.client.collection('Customers')
          .get(1)
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toMatch({_id: 1})
    });

    it('Should return error code if resource not found', async () => {
      await expect(() => args.client.collection('Customers')
          .get(999999)
          .toPromise()
      ).rejects.toThrow('404');
    });

    it('Should not fetch exclusive fields (unless not included for resolver)', async () => {
      const resp = await args.client.collection('Customers')
          .get(1)
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['address', 'notes']);
    })

    it('Should pick fields to be returned', async () => {
      const resp = await args.client.collection('Customers')
          .get(1, {pick: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['_id', 'givenName']);
    })

    it('Should omit fields to be returned', async () => {
      const resp = await args.client.collection('Customers')
          .get(1, {omit: ['_id', 'givenName']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .not.toHaveFields(['_id', 'givenName']);
    })

    it('Should include exclusive fields if requested', async () => {
      const resp = await args.client.collection('Customers')
          .get(2, {include: ['address']})
          .getResponse();
      resp.expect
          .toSuccess()
          .toReturnObject()
          .toHaveFields(['address']);
      expect(resp.body.data.address).toBeDefined();
    })

  })
}