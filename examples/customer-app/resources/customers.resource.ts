import { Collection } from '@opra/common';
import { OperationContext } from '@opra/core';
import { SqbCollectionResource, SqbEntityService } from '@opra/sqb';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@Collection(Customer, {
  description: 'Customer resource'
})
export class CustomersResource extends SqbCollectionResource<Customer> {

  constructor(public customerService: CustomerService) {
    super();
  }

  @Collection.FindMany({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'birthDate'],
    filters: [
      {field: 'id', operators: ['=']},
      {field: 'givenName', operators: ['=', 'like', 'ilike']},
      {field: 'familyName', operators: ['=', 'like', 'ilike']},
      {field: 'gender', operators: ['=', 'in']},
      {field: 'birthDate', operators: ['=', '>', '>=', '<', '<=']}
    ],
    response: {}
  })
  search;

  @Collection.Create({
    input: {
      maxContentSize: '200k'
    }
  })
  create;

  getService(ctx: OperationContext): SqbEntityService<Customer> {
    return this.customerService.with(ctx);
  }

}