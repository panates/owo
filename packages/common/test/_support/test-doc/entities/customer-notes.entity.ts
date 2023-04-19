import { ComplexField, ComplexType, UnionType } from '@opra/common';
import { Note } from '../types/note.type.js';
import { Record } from './record.entity.js';

@ComplexType()
export class CustomerNotes extends UnionType(Record, Note) {

  @ComplexField()
  customerId: number;

}
