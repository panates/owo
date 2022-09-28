import { OprComplexType, OprField } from '@opra/schema';

@OprComplexType({
  description: 'Person information'
})
export class Person {

  @OprField()
  givenName: string;

  @OprField()
  familyName: string;

  @OprField()
  gender: string;

  @OprField()
  birthDate: string;
}
