import { ApiField, ComplexType, PartialDTO } from '@opra/common';

@ComplexType({
  description: 'Address information',
  additionalFields: true
})
export class Note {

  constructor(init?: PartialDTO<Note>) {
    Object.assign(this, init);
  }

  @ApiField()
  title: string;

  @ApiField()
  text: string;

}
