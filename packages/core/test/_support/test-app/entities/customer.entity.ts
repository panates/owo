import { MixinType, OprComplexType, OprField } from '@opra/schema';
import { Address } from '../types/address.type.js';
import { Note } from '../types/note.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Customer information'
})
export class Customer extends MixinType(Record, Person) {

  @OprField()
  cid?: string;

  @OprField()
  identity?: string;

  @OprField()
  city?: string;

  @OprField()
  countryCode?: string;

  @OprField()
  active?: boolean;

  @OprField()
  vip?: boolean;

  @OprField({
    exclusive: true
  })
  address?: Address;

  @OprField({
    exclusive: true,
    type: Note
  })
  notes?: CustomerNotes[];

}