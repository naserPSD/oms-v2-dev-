import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SubscriptionChange } from '../entities/subscription-changes.entity';

export class CreateSubscriptionChangeDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  subscriptionId: number;

  @IsInt()
  @Type(() => Number)
  appId: number;

  @ApiProperty({ required: true, example: 5 })
  @IsInt()
  @Type(() => Number)
  oldUserCount: number;

  @ApiProperty({ required: true, example: 10 })
  @IsInt()
  @Type(() => Number)
  newUserCount: number;

  @ApiProperty({ required: true, example: 100.0 })
  @IsNumber()
  @Type(() => Number)
  changeAmount: number;

  @ApiProperty({ required: false, example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  proratedAmount?: number | null;

  @ApiProperty({ required: true, example: '2026-01-05T00:00:00Z' })
  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  processedAt?: string | null;

  @IsOptional()
  @IsString()
  stripeInvoiceId?: string | null;

  @ApiProperty({ required: false, example: 'Customer upgraded plan' })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  createdBy?: number | null;
}

export class UpdateSubscriptionChangeDto extends CreateSubscriptionChangeDto {}

export class SubscriptionChangeResponseDto {
  id: number;
  subscriptionId: number;
  appId: number;
  oldUserCount: number;
  newUserCount: number;
  changeAmount: number;
  proratedAmount?: number | null;
  effectiveDate: string;
  processedAt?: string | null;
  stripeInvoiceId?: string | null;
  notes?: string | null;
  createdBy?: number | null;
  createdAt: Date;

  static fromEntity(entity: SubscriptionChange): SubscriptionChangeResponseDto {
    const dto = new SubscriptionChangeResponseDto();
    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId;
    dto.appId = entity.appId;
    dto.oldUserCount = entity.oldUserCount;
    dto.newUserCount = entity.newUserCount;
    dto.changeAmount = entity.changeAmount;
    dto.proratedAmount = entity.proratedAmount ?? null;
    dto.effectiveDate = entity.effectiveDate.toISOString();
    dto.processedAt = entity.processedAt?.toISOString() ?? null;
    dto.stripeInvoiceId = entity.stripeInvoiceId ?? null;
    dto.notes = entity.notes ?? null;
    dto.createdBy = entity.createdBy ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
