import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpLeaveRequest } from '../entities/employee-leave-request.entity';

export class CreateEmpLeaveRequestDto {
  @ApiPropertyOptional({
    description: 'Leave request ID. Omit or send 0 to create a new request.',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === 'null' || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  id?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  appId?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  empId?: number;

  @ApiProperty({
    description: 'Leave type ID from GET /hr-management/get-leave-types',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  leaveTypeId?: number;

  @ApiProperty({
    description: 'Leave start date (ISO date string)',
    example: '2026-09-10T00:00:00',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Leave end date (ISO date string)',
    example: '2026-09-10T23:59:59',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Reason for leave',
    example: 'Family emergency',
  })
  @IsString()
  @IsOptional()
  reason?: string | null;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Optional attachment (image/PDF). Use multipart upload endpoint only.',
  })
  @IsOptional()
  attachmentMedia?: any;

  @IsOptional()
  attachmentMediaId?: number | null;

  @ApiPropertyOptional({
    description:
      'Approval status ID. For create, backend sets pending status automatically.',
    example: 51,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  approvalStatusId?: number =51;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  approvedBy?: number | null;

  @IsDateString()
  @IsOptional()
  approvalDate?: string | null;
}

export class UpdateEmpLeaveRequestDto extends CreateEmpLeaveRequestDto {}

export class UpdateLeaveRequestDto {
  @ApiProperty({ required: true, example: 'Vacation leave' })
  @IsString()
  reason: string;

  @ApiProperty({ required: true, example: 51 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  approvalStatusId: number;
}

export class LeavePolicyTypeBalanceDto {
  @ApiProperty({ example: 14 })
  total: number;

  @ApiProperty({ example: 2 })
  used: number;

  @ApiProperty({ example: 12 })
  remaining: number;
}

export class LeavePolicyTotalDto {
  @ApiProperty({ example: 39 })
  totalLeave: number;

  @ApiProperty({ example: 2 })
  totalUsed: number;

  @ApiProperty({ example: 37 })
  totalRemaining: number;
}

export class LeavePolicyResponseDataDto {
  @ApiProperty({
    description: 'Balance by leave type name',
    example: {
      'Annual Leave': { total: 14, used: 0, remaining: 14 },
      'Casual Leave': { total: 10, used: 1, remaining: 9 },
    },
  })
  leaveOverview: Record<string, LeavePolicyTypeBalanceDto>;

  @ApiProperty({ type: LeavePolicyTotalDto })
  total: LeavePolicyTotalDto;
}

export class EmpLeaveRequestResponseDto {
  id: number;
  empId: number;
  leaveTypeId: number;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
  attachmentMediaId?: number | null;
  approvalStatusId: number;
  approvedBy?: number | null;
  approvalDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpLeaveRequest): EmpLeaveRequestResponseDto {
    const dto = new EmpLeaveRequestResponseDto();
    dto.id = entity.id;
    dto.empId = entity.empId;
    dto.leaveTypeId = entity.leaveTypeId;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.reason = entity.reason;
    dto.attachmentMediaId = entity.attachmentMediaId;
    dto.approvalStatusId = entity.approvalStatusId;
    dto.approvedBy = entity.approvedBy;
    dto.approvalDate = entity.approvalDate;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
