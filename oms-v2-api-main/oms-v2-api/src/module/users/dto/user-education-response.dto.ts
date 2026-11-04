import { ApiProperty } from '@nestjs/swagger';

export class UserEducationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  userId?: number;

  @ApiProperty()
  instituteName: string;

  @ApiProperty()
  isForeignInstitute: boolean;

  @ApiProperty({ required: false })
  instituteCountryId?: number;

  @ApiProperty({ required: false })
  educationLevelId?: number;

  @ApiProperty({ required: false })
  groupId?: number;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty({ required: false })
  yearOfPassing?: number;

  @ApiProperty({ required: false })
  resultTypeId?: number;

  @ApiProperty({ required: false })
  result?: string;

  @ApiProperty({ required: false })
  serial?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}
