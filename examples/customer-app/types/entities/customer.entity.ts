import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Column, DataType, Embedded, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer information',
})
@Entity({tableName: 'customers'})
export class Customer extends MixinType(Record, Person) {

  @ApiField()
  @Embedded(Address, {fieldNamePrefix: 'address_'})
  address?: Address;

  @ApiField()
  @Link({exclusive: true})
      .toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

  @ApiField()
  @Column({dataType: DataType.JSON, fieldName: 'created_by'})
  createdBy?: Person;
}
