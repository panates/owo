import { ApiField, ComplexType } from '@opra/common';
import { Column, PrimaryKey } from '@sqb/connect';

@ComplexType({
  abstract: true,
  description: 'Base Record schema',
})
export class Record {
  @ApiField({ required: true })
  @Column({ autoGenerated: 'increment' })
  @PrimaryKey()
  _id: number;

  @ApiField()
  @Column()
  deleted?: boolean;
}
