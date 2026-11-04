import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  IsString,
  IsDate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EmpSalaryGradeRule } from '../entities/employee-salary-grade-rules.entity';

export class CreateEmpSalaryGradeRuleDto {
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
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  gradeId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  payItemId: number;

  @ApiProperty({ required: true, example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBasic: number;

  @ApiProperty({ required: true, example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBasic: number;

  @ApiProperty({ required: false, example: 204 })
  @IsOptional()
  @IsInt()
  calculationMethodId?: number | null;

  @ApiProperty({ required: true, example: 10.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ required: false, example: 5000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fixedAmount?: number | null;

  @ApiProperty({ required: false, example: 'min_basic * 0.10' })
  @IsOptional()
  @IsString()
  formula?: string | null;

  @ApiProperty({ required: false, example: 'For senior employees' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  @IsInt()
  updatedBy?: number | null;

  @ApiProperty({ required: true, example: '2025-11-20' })
  @IsString()
  @IsDateString({}, { message: 'effectiveFrom must be a valid date string' })
  @Transform(({ value }) => (value === '' ? null : value))
  effectiveFrom: string;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  @IsString()
  @IsDateString({}, { message: 'effectiveTo must be a valid date string' })
  @Transform(({ value }) => (value === '' ? null : value))
  effectiveTo?: string | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null;
}

export class UpdateEmpSalaryGradeRuleDto extends CreateEmpSalaryGradeRuleDto {}

export class EmpSalaryGradeRuleResponseDto {
  id: number;
  appId?: number | null;
  gradeId: number;
  payItemId: number;
  minBasic: number;
  maxBasic: number;
  calculationMethodId?: number | null;
  percentage: number;
  fixedAmount?: number | null;
  formula?: string | null;
  remarks?: string | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean | null;
  updatedBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpSalaryGradeRule): EmpSalaryGradeRuleResponseDto {
    const dto = new EmpSalaryGradeRuleResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.gradeId = entity.gradeId;
    dto.payItemId = entity.payItemId;
    dto.minBasic = Number(entity.minBasic);
    dto.maxBasic = Number(entity.maxBasic);
    dto.calculationMethodId = entity.calculationMethodId ?? null;
    dto.percentage = Number(entity.percentage);
    dto.fixedAmount = entity.fixedAmount ?? null;
    dto.formula = entity.formula ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.effectiveFrom = entity.effectiveFrom;
    dto.effectiveTo = entity.effectiveTo ?? null;
    dto.isActive = entity.isActive ?? null;
    dto.updatedBy = entity.updatedBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
