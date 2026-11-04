import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { EmpAttendance } from '../entities/employee-attendance.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCheckInDto {
  @IsOptional()
  @IsDateString()
  attendanceDate?: string | null;

  userAgent?: string;

  ipAddress?: string;

  @ApiProperty({ required: false, example: 'lat,long' })
  @IsOptional()
  checkInLatLong?: string | null;
}

export class CreateCheckOutDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  userAgent?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  earlyLeaveReasonId?: number | null;

  @ApiProperty({ required: false, example: 'lat,long' })
  @IsOptional()
  checkOutLatLong?: string | null;
}

export class RequestForRemovingLateCountDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 'reason' })
  @IsString()
  lateReason: string;

  @ApiProperty({ required: true, example: '09:00:00' })
  @IsString()
  inTime: string;
}

export class RequestForRemovingEarlyLeaveCountDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 'reason' })
  @IsString()
  outTimeRemarks: string;

  @ApiProperty({ required: true, example: '19:30:00' })
  @IsString()
  outTime: string;
}

export class EmpAttendanceResponseDto {
  id: number;
  appId: number;
  empId: number;
  officeId?: number;
  shiftId?: number;
  attendanceDate: string;
  checkIn?: Date;
  checkOut?: Date;
  startBreak?: Date;
  endBreak?: Date;
  workedHour?: number;
  overtimeHours?: number | null;
  breakMinutes: number;
  attendanceStatusId?: number | null;
  checkInStatusId?: number | null;
  checkInMethodId?: number | null;
  checkOutStatusId?: number | null;
  checkOutMethodId?: number | null;
  lateReason?: string | null;
  lateApprovalStatusId?: number | null;
  lateApprovalUserId?: number | null;
  earlyLeaveReasonId?: number | null;
  ipAddress?: string;
  remarks?: string;
  jsonData?: string;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpAttendance): EmpAttendanceResponseDto {
    const dto = new EmpAttendanceResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.empId = entity.empId;
    dto.officeId = entity.office?.id;
    dto.shiftId = entity.shift?.id;
    dto.attendanceDate = entity.attendanceDate;

    dto.checkIn = entity.checkIn;
    dto.checkOut = entity.checkOut;
    dto.startBreak = entity.startBreak;
    dto.endBreak = entity.endBreak;

    dto.workedHour = entity.workedHour;
    dto.overtimeHours = entity.overtimeHours;
    dto.breakMinutes = entity.breakMinutes;

    dto.attendanceStatusId = entity.attendanceStatusId;
    dto.checkInStatusId = entity.checkInStatusId;
    dto.checkInMethodId = entity.checkInMethodId;
    dto.checkOutStatusId = entity.checkOutStatusId;
    dto.checkOutMethodId = entity.checkOutMethodId;

    dto.lateReason = entity.lateReason;
    dto.lateApprovalStatusId = entity.lateApprovalStatusId;
    dto.lateApprovalUserId = entity.lateApprovalUserId;

    dto.earlyLeaveReasonId = entity.earlyLeaveReasonId;

    dto.ipAddress = entity.ipAddress;
    dto.remarks = entity.remarks;
    dto.jsonData = entity.jsonData;

    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class AttendanceSummeryRequestDto {
  employeeId: number;
}
