import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CouponRedemption } from '../entities/coupon-redemptions.entity';

export class CreateCouponRedemptionDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  couponId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  appId: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subscriptionId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  invoiceId?: number | null;

  @ApiProperty({ required: true, example: 50.0 })
  @IsNumber()
  @Type(() => Number)
  discountApplied: number;

  @ApiProperty({ required: false, example: 'promo_12345' })
  @IsOptional()
  @IsString()
  stripePromotionCodeId?: string | null;
}

export class UpdateCouponRedemptionDto extends CreateCouponRedemptionDto {}

export class CouponRedemptionResponseDto {
  id: number;
  couponId: number;
  appId: number;
  subscriptionId?: number | null;
  invoiceId?: number | null;
  discountApplied: number;
  stripePromotionCodeId?: string | null;
  createdAt: Date;

  static fromEntity(entity: CouponRedemption): CouponRedemptionResponseDto {
    const dto = new CouponRedemptionResponseDto();
    dto.id = entity.id;
    dto.couponId = entity.couponId;
    dto.appId = entity.appId;
    dto.subscriptionId = entity.subscriptionId ?? null;
    dto.invoiceId = entity.invoiceId ?? null;
    dto.discountApplied = entity.discountApplied;
    dto.stripePromotionCodeId = entity.stripePromotionCodeId ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
