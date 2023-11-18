import { Db } from 'mongodb';
import { Collection } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { MongoCollectionResource, MongoCollectionService } from '../../../src/index.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource extends MongoCollectionResource<Customer> {
  service: MongoCollectionService<Customer>;

  constructor(readonly db: Db) {
    super();
    this.service = new MongoCollectionService('Customers', {db});
  }

  @Collection.Create()
  create;

  @Collection.Delete()
  delete;

  @Collection.DeleteMany()
  deleteMany;

  @Collection.Get()
  get;

  @Collection.Update()
  update;

  @Collection.UpdateMany()
  updateMany;

  @Collection.FindMany()
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.countryCode')
      .DefaultSort('givenName')
      .Filter('_id')
      .Filter('givenName')
      .Filter('familyName')
      .Filter('gender')
      .Filter('uid')
      .Filter('address.countryCode')
      .Filter('deleted')
      .Filter('active')
      .Filter('birthDate')
      .Filter('rate')
  findMany;

  getService(ctx: RequestContext) {
    return this.service.forContext(ctx);
  }

}
