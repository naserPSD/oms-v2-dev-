import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateStatusDto {
  @ApiProperty({
    example: 1,
    description: 'Status group id',
  })
  status_group_id: number;

  @ApiProperty({
    example: 'Standard',
    description: 'status name',
  })
  name: string;

  @ApiProperty({
    example: 'commission_type_standard',
    description: 'status code',
    uniqueItems: true,
  })
  code: string;

  @ApiProperty({
    example: 'success',
    description: 'Label Color Name',
    required: false,
  })
  @IsOptional()
  color_name: string;

  @ApiProperty({
    example: {
      key1: 'value1',
    },
    description: 'Json Object for multiple values with key value pair',
    required: false,
  })
  @IsOptional()
  data: object;

  @ApiProperty({
    example: 1,
    description: 'Serial number',
    required: false,
  })
  @IsOptional()
  serial: number;

  @ApiProperty({
    example: true,
    description: 'Active status',
    required: false,
  })
  @IsOptional()
  is_active: boolean;
}
