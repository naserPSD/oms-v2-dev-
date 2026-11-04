import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LateAttendanceRule } from '../entities/late-attendance-rules.entity';

export class CreateLateAttendanceRuleDto {
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
  officeId?: number | null;

  @ApiProperty({ example: 5 })
  @IsInt()
  minLateMinutes: number;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsInt()
  maxLateMinutes?: number | null;

  @ApiProperty({ required: false, example: 50.0 })
  @IsOptional()
  @IsNumber()
  fineAmount?: number | null;

  @ApiProperty({
    required: false,
    example: 1,
    description: '1 = per day, N = per N late days',
  })
  @IsOptional()
  @IsInt()
  fineIntervalDays?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @ApiProperty({ required: false, example: 'Late beyond 30 minutes' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLateAttendanceRuleDto extends CreateLateAttendanceRuleDto {}

export class LateAttendanceRuleResponseDto {
  id: number;
  appId?: number | null;
  officeId?: number | null;
  minLateMinutes: number;
  maxLateMinutes?: number | null;
  fineAmount?: number | null;
  fineIntervalDays?: number | null;
  isAbsent?: boolean | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt: Date;

  static fromEntity(entity: LateAttendanceRule): LateAttendanceRuleResponseDto {
    const dto = new LateAttendanceRuleResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.officeId = entity.officeId ?? null;
    dto.minLateMinutes = entity.minLateMinutes;
    dto.maxLateMinutes = entity.maxLateMinutes ?? null;
    dto.fineAmount = entity.fineAmount ?? null;
    dto.fineIntervalDays = entity.fineIntervalDays ?? null;
    dto.isAbsent = entity.isAbsent ?? null;
    dto.description = entity.description ?? null;
    dto.isActive = entity.isActive ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
