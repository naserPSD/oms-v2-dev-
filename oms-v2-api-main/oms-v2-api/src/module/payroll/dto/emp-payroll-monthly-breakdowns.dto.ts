import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmpPayrollMonthlyBreakdown } from '../entities/emp-payroll-monthly-breakdowns.entity';

export class CreateEmpPayrollMonthlyBreakdownDto {
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
  @IsInt()
  empId?: number | null;

  @ApiProperty({ required: true, example: 15 })
  @IsInt()
  payItemId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  month: number;

  @ApiProperty({ required: true, example: 2026 })
  @IsInt()
  year: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string | null;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;

  @ApiProperty({ required: true, example: '5000.00' })
  @IsString()
  amount: number;
}

export class EmpPayrollMonthlyBreakdownResponseDto {
  id: number;
  appId?: number | null;
  empId?: number | null;
  payItemId: number;
  month: number;
  year: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  amount: number;
  createdAt?: Date | null;

  static fromEntity(entity: EmpPayrollMonthlyBreakdown) {
    const dto = new EmpPayrollMonthlyBreakdownResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId ?? null;
    dto.payItemId = entity.payItemId;
    dto.month = entity.month;
    dto.year = entity.year;
    dto.effectiveFrom = entity.effectiveFrom?.toISOString() ?? null;
    dto.effectiveTo = entity.effectiveTo?.toISOString() ?? null;
    dto.amount = entity.amount;
    dto.createdAt = entity.createdAt ?? null;
    return dto;
  }
}
