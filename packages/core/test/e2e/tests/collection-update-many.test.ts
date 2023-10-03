import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';

export function collectionUpdateManyTests(args: { client: OpraTestClient }) {

  describe('Collection:updateMany', function () {

    it('Should update many instances', async () => {
      const data = {
        uid: faker.string.hexadecimal({length: 5})
      }
      const resp1 = await args.client.collection('Customers')
          .updateMany(data, {filter: '_id<=50'})
          .getResponse();
      resp1.expect
          .toSuccess()
          .toReturnOperationResult()
          .toBeAffectedMin(1);

      const resp2 = await args.client.collection('Customers')
          .findMany({
            filter: '_id<=50 and uid="' + data.uid + '"',
            limit: 1000000
          })
          .getResponse();
      resp2.expect
          .toSuccess()
          .toReturnCollection()
          .toMatch(data);
    })

  })
}
