import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmpPayrollMonthlyRecords } from '../entities/employee-payroll-monthly-records.entity';

export class CreateEmpPayrollMonthlyRecordDto {
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
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  payrollRunId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  empId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  month: number;

  @ApiProperty({ required: true, example: 2025 })
  @IsInt()
  @Type(() => Number)
  year: number;

  @ApiProperty({ required: true, example: 60 })
  @IsInt()
  @Type(() => Number)
  salaryStructureId: number;

  @ApiProperty({ required: true, example: 15000 })
  @IsNumber()
  @Type(() => Number)
  basicSalary: number;

  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalEarnings?: number;

  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalDeductions?: number;

  @ApiProperty({ required: true, example: 20000 })
  @IsNumber()
  @Type(() => Number)
  netSalary: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  workingDays?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  presentDays?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  absentDays?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paidDays?: number | null;

  @ApiProperty({ required: true, example: 500 })
  @IsNumber()
  @Type(() => Number)
  extraAmount: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  penaltiesAmount?: number;

  @IsOptional()
  @IsBoolean()
  penaltyApply?: boolean;

  @ApiProperty({ required: true, example: 19500 })
  @IsNumber()
  @Type(() => Number)
  payable: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paid?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  due?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  payingAmount?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paymentStatusId?: number | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}

export class UpdateEmpPayrollMonthlyRecordDto extends CreateEmpPayrollMonthlyRecordDto {}

export class EmpPayrollMonthlyRecordResponseDto {
  id: number;
  appId?: number | null;
  payrollRunId?: number | null;
  empId: number;
  month: number;
  year: number;
  salaryStructureId: number;
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  workingDays?: number | null;
  presentDays?: number | null;
  absentDays?: number | null;
  paidDays?: number | null;
  extraAmount: number;
  penaltiesAmount: number;
  penaltyApply: boolean;
  payable: number;
  paid: number;
  due: number;
  paymentStatusId?: number | null;
  remarks?: string | null;
  createdAt: Date;

  static fromEntity(
    entity: EmpPayrollMonthlyRecords,
  ): EmpPayrollMonthlyRecordResponseDto {
    const dto = new EmpPayrollMonthlyRecordResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.payrollRunId = entity.payrollRunId ?? null;
    dto.empId = entity.empId;
    dto.month = entity.month;
    dto.year = entity.year;
    dto.salaryStructureId = entity.salaryStructureId;
    dto.basicSalary = Number(entity.basicSalary);
    dto.totalEarnings = Number(entity.totalEarnings);
    dto.totalDeductions = Number(entity.totalDeductions);
    dto.netSalary = Number(entity.netSalary);
    dto.workingDays = entity.workingDays ?? null;
    dto.presentDays = entity.presentDays ?? null;
    dto.absentDays = entity.absentDays ?? null;
    dto.paidDays = entity.paidDays ?? null;
    dto.extraAmount = Number(entity.extraAmount);
    dto.penaltiesAmount = Number(entity.penaltiesAmount);
    dto.penaltyApply = entity.penaltyApply;
    dto.payable = Number(entity.payable);
    dto.paid = Number(entity.paid);
    dto.due = Number(entity.due);
    dto.paymentStatusId = entity.paymentStatusId ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
