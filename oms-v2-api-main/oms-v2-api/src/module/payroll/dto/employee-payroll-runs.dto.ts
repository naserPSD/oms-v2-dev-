import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmpPayrollRun } from '../entities/employee-payroll-runs.entity';

export class CreateEmpPayrollRunDto {
  @IsOptional()
  @IsInt()
  id?: number | null;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @IsOptional()
  @IsString()
  payrollCode: string;

  @ApiProperty({ required: true, example: 11 })
  @IsInt()
  @Min(1)
  payPeriodMonth: number;

  @ApiProperty({ required: true, example: 2025 })
  @IsInt()
  payPeriodYear: number;

  @ApiProperty({ required: true, example: '2025-11-01' })
  @IsOptional()
  // @IsDateString()
  payPeriodStart?: string;

  @ApiProperty({ required: true, example: '2025-11-30' })
  @IsOptional()
  // @IsDateString()
  payPeriodEnd?: string;

  @ApiProperty({ required: false, example: '2025-11-30' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string | null;

  @ApiProperty({ required: false, example: 182 })
  @IsOptional()
  @IsInt()
  paymentStatusId?: number | null;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsInt()
  totalEmployees?: number | null;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  payable?: number | null;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  forceReRun?: boolean | null;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  paid?: number | null;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  due?: number | null;

  @ApiProperty({ required: false, example: 'Monthly payroll remarks' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  //@ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  processedBy?: number | null;

  @IsOptional()
  processedAt?: Date | null;
}

export class EmployeePayrollSubmitDto {
  @ApiProperty({ example: 11 })
  @IsInt()
  payPeriodMonth: number;

  @ApiProperty({ example: 2025 })
  @IsInt()
  payPeriodYear: number;

  @ApiProperty({ example: '2025-11-01' })
  @IsOptional()
  @IsDateString()
  payPeriodStart?: string;

  @ApiProperty({ example: '2025-11-30' })
  @IsOptional()
  @IsDateString()
  payPeriodEnd?: string;

  @ApiProperty({ example: [1, 9, 15, 16] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  employeeIds: number[];

  @ApiProperty({ required: false, example: 'Monthly payroll remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateEmpPayrollRunDto extends CreateEmpPayrollRunDto {}

export class EmpPayrollRunResponseDto {
  id: number;
  appId: number | null;
  payrollCode: string;
  payPeriodMonth: number;
  payPeriodYear: number;
  payPeriodStart: string | null;
  payPeriodEnd: string | null;
  paymentDate: string | null;
  paymentStatusId: number | null;
  totalEmployees: number | null;
  payable: number | null;
  paid: number | null;
  due: number | null;
  remarks: string | null;
  processedBy: number | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: EmpPayrollRun): EmpPayrollRunResponseDto {
    const dto = new EmpPayrollRunResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.payrollCode = entity.payrollCode;
    dto.payPeriodMonth = entity.payPeriodMonth;
    dto.payPeriodYear = entity.payPeriodYear;
    dto.payPeriodStart = entity.payPeriodStart ?? null;
    dto.payPeriodEnd = entity.payPeriodEnd ?? null;
    dto.paymentDate = entity.paymentDate ?? null;
    dto.paymentStatusId = entity.paymentStatusId ?? null;
    dto.totalEmployees = entity.totalEmployees ?? 0;
    dto.payable = Number(entity.payable ?? 0);
    dto.paid = Number(entity.paid ?? 0);
    dto.due = Number(entity.due ?? 0);
    dto.remarks = entity.remarks ?? null;
    dto.processedBy = entity.processedBy ?? null;
    dto.processedAt = entity.processedAt ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
