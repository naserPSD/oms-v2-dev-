import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmpSalaryStructure } from '../entities/employee-salary-structure.entity';
//import { CreateEmpSalaryStructureDetailsDto } from './employee-salary-structure-details.dto';

export class CreateEmpSalaryStructureDetailsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  payItemId: number;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiProperty({ required: false, example: 550.0 })
  @IsOptional()
  @IsNumber()
  calculatedAmount?: number;
}

export class CreateEmpSalaryStructureDto {
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
  empId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  gradeId: number;

  @ApiProperty({ required: true, example: 15000.0 })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ required: true, example: '2025-11-20' })
  @IsString()
  effectiveFrom: string;

  @ApiProperty({ required: false, example: '2026-11-20' })
  @IsOptional()
  @IsString()
  effectiveTo?: string | null;

  @ApiProperty({ required: false, example: 20000.0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  grossSalary: number = 0.0;

  @ApiProperty({ required: false, example: 1000.0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  totalDeductions: number = 0.0;

  @ApiProperty({ required: false, example: 1000.0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  netSalary: number = 0.0;

  @ApiProperty({ required: false, example: 'BDT' })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @ApiProperty({ required: false, example: 'Bank' })
  @IsOptional()
  @IsString()
  paymentMode?: string | null;

  @IsOptional()
  @IsInt()
  approvedBy?: number | null;

  @IsOptional()
  approvedAt?: Date | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ required: false, example: 'Salary adjustment' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  @IsInt()
  createdBy?: number | null;

  @IsOptional()
  @IsInt()
  updatedBy?: number | null;

  @ApiProperty({
    required: false,
    type: [CreateEmpSalaryStructureDetailsDto],
    description: 'Salary structure breakdown',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEmpSalaryStructureDetailsDto)
  empSalaryStructureDetails?: CreateEmpSalaryStructureDetailsDto[];
}

export class UpdateEmpSalaryStructureDto extends CreateEmpSalaryStructureDto {}

export class EmpSalaryStructureResponseDto {
  id: number;
  appId?: number | null;
  empId: number;
  gradeId: number;
  basicSalary: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  grossSalary?: number | null;
  totalDeductions?: number | null;
  netSalary?: number | null;
  currency?: string | null;
  paymentMode?: string | null;
  approvedBy?: number | null;
  approvedAt?: Date | null;
  isApproved: boolean;
  isActive: boolean;
  remarks?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpSalaryStructure): EmpSalaryStructureResponseDto {
    const dto = new EmpSalaryStructureResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId;
    dto.gradeId = entity.gradeId;
    dto.basicSalary = Number(entity.basicSalary);
    dto.effectiveFrom = entity.effectiveFrom;
    dto.effectiveTo = entity.effectiveTo ?? null;
    dto.grossSalary = entity.grossSalary ?? null;
    dto.totalDeductions = entity.totalDeductions ?? null;
    dto.netSalary = entity.netSalary ?? null;
    dto.currency = entity.currency ?? null;
    dto.paymentMode = entity.paymentMode ?? null;
    dto.approvedBy = entity.approvedBy ?? null;
    dto.approvedAt = entity.approvedAt ?? null;
    dto.isApproved = entity.isApproved;
    dto.isActive = entity.isActive;
    dto.remarks = entity.remarks ?? null;
    dto.createdBy = entity.createdBy ?? null;
    dto.updatedBy = entity.updatedBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
