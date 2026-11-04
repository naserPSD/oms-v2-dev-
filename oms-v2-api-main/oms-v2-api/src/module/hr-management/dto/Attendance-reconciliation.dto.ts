import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AttendanceReconciliation } from '../entities/Attendance-reconciliation.entity';

export class RequestMyAttendanceReconciliationDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  attendanceId: number;

  @ApiProperty({ example: 'Traffic on the way to the office' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ required: false, example: 'both', enum: ['check_in', 'check_out', 'both'] })
  @IsOptional()
  @IsString()
  requestType?: 'check_in' | 'check_out' | 'both';

  @ApiProperty({ required: false, example: '09:00:00' })
  @IsOptional()
  @IsString()
  requestedCheckInTime?: string | null;

  @ApiProperty({ required: false, example: '18:00:00' })
  @IsOptional()
  @IsString()
  requestedCheckOutTime?: string | null;
}

export class CreateAttendanceReconciliationDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  empId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  attendanceId: number;

  @ApiProperty({ required: false, example: '2025-10-22' })
  @IsOptional()
  @IsDateString()
  attendanceDate?: string | null;

  @ApiProperty({ required: false, example: '11:00:00' })
  @IsOptional()
  @IsString()
  inTime?: string | null;

  @ApiProperty({ required: false, example: '19:00:00' })
  @IsOptional()
  @IsString()
  outTime?: string | null;

  @ApiProperty({ required: false, example: 'Late arrival due to traffic' })
  @IsOptional()
  @IsString()
  inTimeRemarks?: string | null;

  @ApiProperty({ required: false, example: 'Left early' })
  @IsOptional()
  @IsString()
  outTimeRemarks?: string | null;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  inTimeStatusId?: number;

  @ApiProperty({ required: false, example: '2025-10-22 19:00:00' })
  @IsOptional()
  @IsDateString()
  inTimeApproveDate?: string | null;

  @ApiProperty({ required: false, example: 'Approved by supervisor' })
  @IsOptional()
  @IsString()
  inTimeSupervisorRemarks?: string | null;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  outTimeStatusId?: number;

  @ApiProperty({ required: false, example: '2025-10-22 19:00:00' })
  @IsOptional()
  @IsDateString()
  outTimeApproveDate?: string | null;

  @ApiProperty({ required: false, example: 'Approved by supervisor' })
  @IsOptional()
  @IsString()
  outTimeSupervisorRemarks?: string | null;
}

export class CheckInApproveReconciliationDto {
  reconciliationId?: number;

  @ApiProperty({ required: true, example: 'Approved by supervisor' })
  @IsString()
  @IsNotEmpty()
  inTimeSupervisorRemarks: string;

  @ApiProperty({
    required: true,
    example: 160,
    description: 'pending',
  })
  @IsInt()
  inTimeStatusId: number;
}

export class CheckOutApproveReconciliationDto {
  @ApiProperty({ required: true, example: 'Approved by supervisor' })
  @IsString()
  @IsNotEmpty()
  outTimeSupervisorRemarks: string;

  @ApiProperty({
    required: true,
    example: 160,
    description: 'pending',
  })
  @IsInt()
  outTimeStatusId: number;
}

export class UpdateAttendanceReconciliationDto extends CreateAttendanceReconciliationDto {}

export class AttendanceReconciliationResponseDto {
  id: number;
  appId?: number | null;
  empId: number;
  attendanceId?: number | null;
  attendanceDate?: string | null;
  inTime?: string | null;
  outTime?: string | null;
  inTimeRemarks?: string | null;
  outTimeRemarks?: string | null;
  inTimeStatusId?: number | null;
  inTimeApproveDate?: string | null;
  inTimeSupervisorRemarks?: string | null;
  outTimeStatusId?: number | null;
  outTimeApproveDate?: string | null;
  outTimeSupervisorRemarks?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(
    entity: AttendanceReconciliation,
  ): AttendanceReconciliationResponseDto {
    const dto = new AttendanceReconciliationResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId;
    dto.attendanceId = entity.attendanceId ?? null;
    dto.attendanceDate = entity.attendanceDate ?? null;
    dto.inTime = entity.inTime ?? null;
    dto.outTime = entity.outTime ?? null;
    dto.inTimeRemarks = entity.inTimeRemarks ?? null;
    dto.outTimeRemarks = entity.outTimeRemarks ?? null;
    dto.inTimeStatusId = entity.inTimeStatusId ?? null;
    dto.inTimeApproveDate = entity.inTimeApproveDate?.toISOString() ?? null;
    dto.inTimeSupervisorRemarks = entity.inTimeSupervisorRemarks ?? null;
    dto.outTimeStatusId = entity.outTimeStatusId ?? null;
    dto.outTimeApproveDate = entity.outTimeApproveDate?.toISOString() ?? null;
    dto.outTimeSupervisorRemarks = entity.outTimeSupervisorRemarks ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
