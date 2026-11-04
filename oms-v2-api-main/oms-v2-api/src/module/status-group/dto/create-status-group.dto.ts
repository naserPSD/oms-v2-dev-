import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateStatusGroupDto {
  @ApiProperty({
    example: 'Commission Type',
    description: 'status group name',
  })
  name: string;

  @ApiProperty({
    example: 'commission_type',
    description: 'status group code',
    uniqueItems: true,
  })
  code: string;

  @ApiProperty({
    example: true,
    description: 'Active status',
    required: false,
  })
  @IsOptional()
  isActive: boolean;
}
