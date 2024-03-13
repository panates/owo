import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { Country } from './entities/country.entity.js';
import { Customer } from './entities/customer.entity.js';
import { Profile } from './entities/profile.entity.js';
import { GenderEnum } from './enums/gender.enum.js';
import { RootResource } from './service1/root.resource.js';
import { Address } from './types/address.type.js';
import { Note } from './types/note.type.js';
import { Person } from './types/person.type.js';
import { Record } from './types/record.type.js';

export * from './entities/country.entity.js';
export * from './entities/customer.entity.js';
export * from './entities/profile.entity.js';
export * from './enums/gender.enum.js';
export * from './types/address.type.js';
export * from './types/note.type.js';
export * from './types/person.type.js';
export * from './types/record.type.js';
export * from './service1/auth.controller.js';
export * from './service1/countries.collection.js';
export * from './service1/countries.resource.js';
export * from './service1/customers.collection.js';
export * from './service1/customers.resource.js';
export * from './service1/my-profile.resource.js';
export * from './service1/root.resource.js';


export const testApiDocumentDef: ApiDocumentFactory.InitArguments = {
  spec: OpraSchema.SpecVersion,
  info: {
    title: 'TestDocument',
    version: 'v1',
    description: 'Document description',
  },
  types: [Record, Person, GenderEnum, Address, Note, Country, Customer, Profile],
  services: {
    TestService: {
      protocol: 'http',
      description: 'test service',
      url: '/test',
      root: RootResource
    }
  }
};
