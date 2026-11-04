import { ApiProperty } from '@nestjs/swagger';
import { OfficeShift } from '../../module/hr-management/entities/office-shift.entity';

export class CommonResponseDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  label: string | null;

  @ApiProperty()
  code?: string | null;

  @ApiProperty()
  departmentId?: number | null;

  @ApiProperty()
  employeeId?: number | null;

  @ApiProperty()
  hasShift?: boolean | null;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  OfficeShifts?: [];

  @ApiProperty()
  designation?: string;
}
