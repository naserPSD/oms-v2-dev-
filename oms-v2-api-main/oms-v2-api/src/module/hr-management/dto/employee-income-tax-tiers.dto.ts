import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpIncomeTaxTier } from '../entities/employee-income-tax-tiers.entity';

export class CreateEmpIncomeTaxTierDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  @IsInt()
  @IsOptional()
  appId?: number | null;

  @ApiProperty({ required: true, example: '2024-25' })
  @IsString()
  financialYear: string;

  @ApiProperty({ required: true, example: 'Tier 1' })
  @IsString()
  tierName: string;

  @ApiProperty({ required: true, example: 300000 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsNumber()
  minIncome: number;

  @ApiProperty({ required: false, nullable: true, example: 700000 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  maxIncome?: number | null;

  @ApiProperty({ required: true, example: 10 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsNumber()
  taxRate: number;

  @ApiProperty({ required: true, example: 5000 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsNumber()
  taxAmount: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmpIncomeTaxTierDto extends CreateEmpIncomeTaxTierDto {}

export class EmpIncomeTaxTierResponseDto {
  id: number;
  appId: number | null;
  financialYear: string;
  tierName: string;
  minIncome: number;
  maxIncome?: number | null;
  taxRate: number;
  taxAmount: number;
  isActive: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpIncomeTaxTier): EmpIncomeTaxTierResponseDto {
    const dto = new EmpIncomeTaxTierResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.financialYear = entity.financialYear;
    dto.tierName = entity.tierName;
    dto.minIncome = Number(entity.minIncome);
    dto.maxIncome = entity.maxIncome ?? null;
    dto.taxRate = Number(entity.taxRate);
    dto.taxAmount = Number(entity.taxAmount);
    dto.isActive = !!entity.isActive;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
