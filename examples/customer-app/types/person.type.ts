import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ApiField()
  @Column({fieldName: 'given_name', notNull: true})
  givenName: string;

  @ApiField()
  @Column({fieldName: 'family_name', notNull: true})
  familyName: string;

  @ApiField({enum: GenderEnum})
  @Column({notNull: true})
  gender: string;

  @ApiField()
  @Column({fieldName: 'birth_name', dataType: DataType.DATE})
  birthDate: Date;
}
