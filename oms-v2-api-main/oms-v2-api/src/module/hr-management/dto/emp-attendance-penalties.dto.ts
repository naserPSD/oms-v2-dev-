import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpAttendancePenalty } from '../entities/emp-attendance-penalties.entity';

export class CreateEmpAttendancePenaltyDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  empId?: number | null;

  @ApiProperty({
    required: false,
    example: 9,
    description: 'Month number (1-12)',
  })
  @IsOptional()
  @IsInt()
  month?: number | null;

  @ApiProperty({ required: false, example: 2026 })
  @IsOptional()
  @IsInt()
  year?: number | null;

  @ApiProperty({ required: false, example: '2026-01-29T10:00:00' })
  @IsOptional()
  @IsDateString()
  entryTime?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  entryStatusId?: number | null;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsInt()
  amount?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  applicationStatusId?: number | null;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsInt()
  approvedUserId?: number | null;

  @ApiProperty({ required: false, example: 'Late entry due to traffic' })
  @IsOptional()
  @IsString()
  details?: string | null;
}

export class UpdateEmpAttendancePenaltyDto extends CreateEmpAttendancePenaltyDto {}

export class EmpAttendancePenaltyResponseDto {
  id: number;
  appId?: number | null;
  empId?: number | null;
  month?: number | null;
  year?: number | null;
  entryTime?: Date | null;
  entryStatusId?: number | null;
  amount?: number | null;
  applicationStatusId?: number | null;
  approvedUserId?: number | null;
  details?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(
    entity: EmpAttendancePenalty,
  ): EmpAttendancePenaltyResponseDto {
    const dto = new EmpAttendancePenaltyResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId ?? null;
    dto.month = entity.month ?? null;
    dto.year = entity.year ?? null;
    dto.entryTime = entity.entryTime ?? null;
    dto.entryStatusId = entity.entryStatusId ?? null;
    dto.amount = entity.amount ?? null;
    dto.applicationStatusId = entity.applicationStatusId ?? null;
    dto.approvedUserId = entity.approvedUserId ?? null;
    dto.details = entity.details ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
