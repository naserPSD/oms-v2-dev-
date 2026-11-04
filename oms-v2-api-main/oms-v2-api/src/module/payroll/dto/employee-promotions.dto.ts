import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpPromotion } from '../entities/employee-promotions.entity';
import { Optional } from '@nestjs/common';

export class CreateEmpPromotionDto {
  // @ApiProperty({ required: true, default: 0 })
  // @Transform(({ value }) =>
  //   isNaN(value) || value === 'null' ? null : Number(value),
  // )
  // @IsInt()
  // id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  employeeId: number;

  @ApiProperty({ required: false, example: 235 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  actionStatusId?: number | null;

  @IsOptional()
  @IsInt()
  oldDesignationId?: number | null;

  @ApiProperty({ required: false, example: 23 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  newDesignationId?: number | null;

  @IsOptional()
  @IsInt()
  oldGradeId?: number | null;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  newGradeId?: number | null;

  @ApiProperty({ required: false, example: 15000 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  oldBasicSalary?: number | null;

  @ApiProperty({ required: false, example: 25000 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || value === 'null'
      ? undefined
      : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  newBasicSalary?: number | null;

  @ApiProperty({ required: true, example: '2025-11-12' })
  @IsDateString()
  promotionDate: string;

  //changed by soykot_podder
  @ApiProperty({ required: true, example: '2025-12-01' })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiProperty({ required: false, example: 'Outstanding performance' })
  @IsOptional()
  @IsString()
  reason?: string | null;

  @IsOptional()
  @IsInt()
  approvedBy?: number | null;
}

export class UpdateEmpPromotionDto extends CreateEmpPromotionDto {}

export class EmpPromotionResponseDto {
  id: number;
  appId?: number | null;
  employeeId: number;
  actionStatusId?: number | null;
  oldDesignationId?: number | null;
  newDesignationId?: number | null;
  oldGradeId?: number | null;
  newGradeId?: number | null;
  oldBasicSalary?: number | null;
  newBasicSalary: number | null;
  promotionDate: string;
  effectiveDate: string;
  endDate?: string | null; //Changed by Soykot_podder
  reason?: string | null;
  approvedBy?: number | null;
  createdAt: Date;

  static fromEntity(entity: EmpPromotion): EmpPromotionResponseDto {
    const dto = new EmpPromotionResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.employeeId = entity.employeeId;
    dto.actionStatusId = entity.actionStatusId ?? null;
    dto.oldDesignationId = entity.oldDesignationId ?? null;
    dto.newDesignationId = entity.newDesignationId ?? null;
    dto.oldGradeId = entity.oldGradeId ?? null;
    dto.newGradeId = entity.newGradeId ?? null;
    dto.oldBasicSalary = entity.oldBasicSalary ?? null;
    dto.newBasicSalary = entity.newBasicSalary ?? null;
    dto.promotionDate = entity.promotionDate;
    dto.effectiveDate = entity.effectiveDate;
    dto.endDate = entity.endDate ?? null; //changed by Soykot_podder
    dto.reason = entity.reason ?? null;
    dto.approvedBy = entity.approvedBy ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
