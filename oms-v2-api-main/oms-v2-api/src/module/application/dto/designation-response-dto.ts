import { ApiProperty } from '@nestjs/swagger';
import { Designation } from '../entities/designations.entity';

export class DesignationResponseDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  label: string | null;

  @ApiProperty()
  code?: string | null;
}
