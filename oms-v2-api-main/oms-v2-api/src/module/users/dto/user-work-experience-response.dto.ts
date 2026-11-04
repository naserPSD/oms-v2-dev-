import { ApiProperty } from '@nestjs/swagger';

export class UserWorkExperienceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false, nullable: true })
  userId: number | null;

  @ApiProperty({ required: false, nullable: true })
  jobTitle: string | null;

  @ApiProperty({ required: false, nullable: true })
  companyName: string | null;

  @ApiProperty({ required: false, nullable: true })
  responsibility: string | null;

  @ApiProperty({ required: false, nullable: true })
  addressId: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date',
  })
  startDate: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date',
  })
  endDate: Date | null;

  @ApiProperty({ required: false, nullable: true })
  isCurrent: boolean | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  createdAt: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  updatedAt: Date | null;
}
