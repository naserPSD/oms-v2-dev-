import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Coupon } from '../entities/coupons.entity';

export class CreateCouponDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  code: string;

  @ApiProperty({ required: true, example: 'Welcome Offer' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Discount for new users' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: true, example: 'percentage' })
  @IsString()
  discountType: string;

  @ApiProperty({ required: true, example: 10 })
  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @ApiProperty({ required: false, example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @IsOptional()
  @IsDateString()
  validFrom?: string | null;

  @IsOptional()
  @IsDateString()
  validUntil?: string | null;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxRedemptions?: number | null;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  redemptionCount?: number | null;

  @ApiProperty({ required: false, example: 'all' })
  @IsOptional()
  @IsString()
  appliesTo?: string | null;

  @ApiProperty({ required: false, example: [1, 2, 3] })
  @IsOptional()
  applicablePlans?: number[] | null;

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minimumAmount?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxUsesPerCompany?: number | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  firstTimeOnly?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  isRedeemable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : Number(value),
  )
  createdBy?: number;
}

export class UpdateCouponDto extends CreateCouponDto {}

export class CouponResponseDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  currency?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  maxRedemptions?: number | null;
  redemptionCount?: number | null;
  appliesTo?: string | null;
  applicablePlans?: number[] | null;
  minimumAmount?: number | null;
  maxUsesPerCompany?: number | null;
  firstTimeOnly: boolean;
  isActive: boolean;
  isRedeemable: boolean;
  createdBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: Coupon): CouponResponseDto {
    const dto = new CouponResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.discountType = entity.discountType;
    dto.discountValue = entity.discountValue;
    dto.currency = entity.currency ?? null;
    dto.validFrom = entity.validFrom ? entity.validFrom.toISOString() : null;
    dto.validUntil = entity.validUntil ? entity.validUntil.toISOString() : null;
    dto.maxRedemptions = entity.maxRedemptions ?? null;
    dto.redemptionCount = entity.redemptionCount ?? null;
    dto.appliesTo = entity.appliesTo ?? null;
    dto.applicablePlans = entity.applicablePlans ?? null;
    dto.minimumAmount = entity.minimumAmount ?? null;
    dto.maxUsesPerCompany = entity.maxUsesPerCompany ?? null;
    dto.firstTimeOnly = entity.firstTimeOnly;
    dto.isActive = entity.isActive;
    dto.isRedeemable = entity.isRedeemable;
    dto.createdBy = entity.createdBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
