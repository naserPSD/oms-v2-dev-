import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  EmpSalaryHistory,
  ApprovalStatus,
} from '../entities/emp-salary-history.entity';

interface ComponentChange {
  payItemId: number;
  oldValue: number;
  newValue: number;
}

export class CreateEmpSalaryHistoryDto {
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

  @IsOptional()
  @IsInt()
  salaryStructureId?: number | null;

  @IsOptional()
  @IsInt()
  salaryEventTypeId?: number | null;

  @IsOptional()
  @IsString()
  changeReason?: string | null;

  @IsOptional()
  @IsInt()
  oldGradeId?: number | null;

  @IsOptional()
  @IsInt()
  newGradeId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  oldBasicSalary?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  newBasicSalary?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  oldGrossSalary?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  newGrossSalary?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  oldNetSalary?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  newNetSalary?: number | null;

  @IsOptional()
  @IsString()
  oldCurrency?: string | null;

  @IsOptional()
  @IsString()
  newCurrency?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  basicIncrementPercentage?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  basicIncrementAmount?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  grossIncrementPercentage?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsNumber()
  grossIncrementAmount?: number | null;

  @IsOptional()
  componentChanges?: ComponentChange[] | null;

  @ApiProperty({ required: true, example: '2025-01-01' })
  effectiveFrom: Date;

  @IsOptional()
  effectiveTo?: Date | null;

  @IsOptional()
  @IsInt()
  approvedBy?: number | null;

  @IsOptional()
  approvedAt?: Date | null;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @IsOptional()
  @IsString()
  approvalRemarks?: string | null;

  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @IsOptional()
  @IsString()
  referenceDocument?: string | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  additionalData?: Record<string, any> | null;

  @IsOptional()
  @IsInt()
  createdBy?: number | null;

  @IsOptional()
  @IsInt()
  changedBy?: number | null;
}

export class UpdateEmpSalaryHistoryDto extends CreateEmpSalaryHistoryDto {}

export class EmpSalaryHistoryResponseDto {
  id: number;
  appId?: number | null;
  empId: number;
  salaryStructureId?: number | null;
  salaryEventTypeId?: number | null;
  changeReason?: string | null;
  oldGradeId?: number | null;
  newGradeId?: number | null;
  oldBasicSalary?: number | null;
  newBasicSalary?: number | null;
  oldGrossSalary?: number | null;
  newGrossSalary?: number | null;
  oldNetSalary?: number | null;
  newNetSalary?: number | null;
  oldCurrency?: string | null;
  newCurrency?: string | null;
  basicIncrementPercentage?: number | null;
  basicIncrementAmount?: number | null;
  grossIncrementPercentage?: number | null;
  grossIncrementAmount?: number | null;
  componentChanges?: ComponentChange[] | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  approvedBy?: number | null;
  approvedAt?: Date | null;
  approvalStatus: ApprovalStatus;
  approvalRemarks?: string | null;
  referenceNumber?: string | null;
  referenceDocument?: string | null;
  remarks?: string | null;
  additionalData?: Record<string, any> | null;
  createdBy?: number | null;
  changedBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpSalaryHistory): EmpSalaryHistoryResponseDto {
    const dto = new EmpSalaryHistoryResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId;
    dto.salaryStructureId = entity.salaryStructureId ?? null;
    dto.salaryEventTypeId = entity.salaryEventTypeId ?? null;
    dto.changeReason = entity.changeReason ?? null;
    dto.oldGradeId = entity.oldGradeId ?? null;
    dto.newGradeId = entity.newGradeId ?? null;
    dto.oldBasicSalary = entity.oldBasicSalary ?? null;
    dto.newBasicSalary = entity.newBasicSalary ?? null;
    dto.oldGrossSalary = entity.oldGrossSalary ?? null;
    dto.newGrossSalary = entity.newGrossSalary ?? null;
    dto.oldNetSalary = entity.oldNetSalary ?? null;
    dto.newNetSalary = entity.newNetSalary ?? null;
    dto.oldCurrency = entity.oldCurrency ?? null;
    dto.newCurrency = entity.newCurrency ?? null;
    dto.basicIncrementPercentage = entity.basicIncrementPercentage ?? null;
    dto.basicIncrementAmount = entity.basicIncrementAmount ?? null;
    dto.grossIncrementPercentage = entity.grossIncrementPercentage ?? null;
    dto.grossIncrementAmount = entity.grossIncrementAmount ?? null;
    dto.componentChanges = entity.componentChanges ?? null;
    dto.effectiveFrom = entity.effectiveFrom;
    dto.effectiveTo = entity.effectiveTo ?? null;
    dto.approvedBy = entity.approvedBy ?? null;
    dto.approvedAt = entity.approvedAt ?? null;
    dto.approvalStatus = entity.approvalStatus;
    dto.approvalRemarks = entity.approvalRemarks ?? null;
    dto.referenceNumber = entity.referenceNumber ?? null;
    dto.referenceDocument = entity.referenceDocument ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.additionalData = entity.additionalData ?? null;
    dto.createdBy = entity.createdBy ?? null;
    dto.changedBy = entity.changedBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
