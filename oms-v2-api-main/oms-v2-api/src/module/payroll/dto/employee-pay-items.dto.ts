import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpPayItem } from '../entities/employee-pay-items.entity';

export class CreateEmpPayItemDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 'BASIC' })
  @IsString()
  itemCode: string;

  @ApiProperty({ required: true, example: 'Basic Salary' })
  @IsString()
  itemName: string;

  @ApiProperty({ required: true, example: 194 })
  @IsInt()
  payItemTypeId: number;

  @ApiProperty({ required: true, example: 200 })
  @IsInt()
  payItemCategoryId: number;

  @ApiProperty({ required: true, example: 201 })
  @IsInt()
  recurrenceTypeId: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  recurrenceCount: number;

  @ApiProperty({ required: false, example: 204 })
  @IsInt()
  calculationMethodId?: number | null;

  @ApiProperty({ required: false, example: 0.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calcValue?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  affectsGrossSalary?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  affectsNetSalary?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isTaxable: boolean;

  @ApiProperty({ required: false, example: '80C' })
  @IsOptional()
  @IsString()
  taxSection?: string | null;

  @ApiProperty({ required: false, example: 100000.0 })
  @IsOptional()
  @IsNumber()
  maxLimit?: number | null;

  @ApiProperty({ required: false, example: 1000.0 })
  @IsOptional()
  @IsNumber()
  minLimit?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number | null;
}

export class UpdateEmpPayItemDto extends CreateEmpPayItemDto {}

export class EmpPayItemResponseDto {
  id: number;
  appId?: number | null;
  itemCode: string;
  itemName: string;
  payItemTypeId: number;
  payItemCategoryId: number;
  recurrenceTypeId: number;
  recurrenceCount: number;
  calculationMethodId?: number | null;
  calcValue?: number | null;
  affectsGrossSalary?: boolean;
  affectsNetSalary?: boolean;
  isStatutory?: boolean;
  isTaxable: boolean;
  taxSection?: string | null;
  maxLimit?: number | null;
  minLimit?: number | null;
  isActive: boolean;
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpPayItem): EmpPayItemResponseDto {
    const dto = new EmpPayItemResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.itemCode = entity.itemCode;
    dto.itemName = entity.itemName;
    dto.payItemTypeId = entity.payItemTypeId;
    dto.payItemCategoryId = entity.payItemCategoryId;
    dto.recurrenceTypeId = entity.recurrenceTypeId;
    dto.recurrenceCount = entity.recurrenceCount ?? 1;
    dto.calculationMethodId = entity.calculationMethodId ?? null;
    dto.calcValue = Number(entity.calcValue ?? 0);
    dto.affectsGrossSalary = entity.affectsGrossSalary;
    dto.affectsNetSalary = entity.affectsNetSalary;
    dto.isStatutory = entity.isStatutory;
    dto.taxSection = entity.taxSection ?? null;
    dto.maxLimit = Number(entity.maxLimit ?? 0);
    dto.minLimit = Number(entity.minLimit ?? 0);
    dto.isTaxable = entity.isTaxable;
    dto.isActive = entity.isActive;
    dto.sortOrder = entity.sortOrder ?? 0;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
