import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Subscription } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  appId: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  userId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  planId: number;

  @ApiProperty({ required: true, example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: true, example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: true, example: 228 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  statusId: number;

  @ApiProperty({ required: false, example: 'credit_card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string | null;

  @ApiProperty({ required: true, default: false })
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  autoRenew: boolean;
}

export class SubscribeDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  planId: number;

  @ApiProperty({ required: true, example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: true, example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: true, example: 228 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  statusId: number;

  @ApiProperty({ required: false, example: 'credit_card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string | null;

  @ApiProperty({ required: true, default: false })
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  autoRenew: boolean;
}

export class UpdateSubscriptionDto extends CreateSubscriptionDto {}

export class SubscriptionResponseDto {
  id: number;
  appId: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  statusId: number;
  paymentMethod?: string | null;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: Subscription): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.userId = entity.userId;
    dto.planId = entity.planId;
    dto.startDate = entity.startDate.toISOString();
    dto.endDate = entity.endDate.toISOString();
    dto.statusId = entity.statusId;
    dto.paymentMethod = entity.paymentMethod ?? null;
    dto.autoRenew = entity.autoRenew;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
