import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  BillingCycle,
  SubscriptionPlan,
} from '../entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  id?: number;

  @ApiProperty({
    required: true,
    example: 'Starter',
  })
  @IsNotEmpty({ message: 'Plan name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
    example: 'starter',
  })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsString()
  slug: string;

  @ApiProperty({
    required: false,
    example: 'Starter subscription plan',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    required: true,
    example: 3000,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0, { message: 'Monthly price cannot be negative' })
  monthlyPrice: number;

  @ApiProperty({
    required: true,
    example: 24000,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0, { message: 'Yearly price cannot be negative' })
  yearlyPrice: number;

  @ApiProperty({
    required: false,
    example: 12000,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsNumber()
  @Min(0, { message: 'Per user yearly price cannot be negative' })
  perUserYearlyPrice?: number;

  @ApiProperty({
    required: false,
    example: 'BDT',
  })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @ApiProperty({
    required: false,
    example:
      '<p>{"storage":"10GB","projects":5,"features":["Task Management","Basic Reports"]}</p>',
  })
  @IsOptional()
  @IsString()
  features?: string | null;

  @ApiProperty({
    required: false,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1, { message: 'minUsers must be at least 1' })
  minUsers?: number | null;

  @ApiProperty({
    required: false,
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1, { message: 'maxUsers must be at least 1' })
  maxUsers?: number | null;

  @ApiProperty({
    required: false,
    example: BillingCycle.MONTHLY,
    enum: BillingCycle,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle | null;

  @ApiProperty({
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return value;
  })
  isActive?: boolean;

  @ApiProperty({
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return value;
  })
  isPopular?: boolean;

  @ApiProperty({
    required: false,
    example: 14,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(0, { message: 'trialDays cannot be negative' })
  trialDays?: number | null;

  @ApiProperty({
    required: false,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(0, { message: 'sortOrder cannot be negative' })
  sortOrder?: number | null;
}

export class UpdateSubscriptionPlanDto extends CreateSubscriptionPlanDto {}

export class SubscriptionPlanResponseDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  perUserYearlyPrice: number;
  currency: string | null;
  features: any | null;
  minUsers: number | null;
  maxUsers: number | null;
  billingCycle: BillingCycle | null;
  isActive: boolean;
  isPopular?: boolean;
  trialDays: number | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: SubscriptionPlan): SubscriptionPlanResponseDto {
    const dto = new SubscriptionPlanResponseDto();

    dto.id = entity.id;
    dto.name = entity.name;
    dto.slug = entity.slug;
    dto.description = entity.description ?? null;
    dto.monthlyPrice = entity.monthlyPrice;
    dto.yearlyPrice = entity.yearlyPrice;
    dto.perUserYearlyPrice = entity.perUserYearlyPrice;
    dto.currency = entity.currency ?? null;
    dto.features = entity.features ?? null;
    dto.minUsers = entity.minUsers ?? null;
    dto.maxUsers = entity.maxUsers ?? null;
    dto.billingCycle = entity.billingCycle ?? null;
    dto.isActive = entity.isActive;
    dto.isPopular = Boolean(entity.isPopular);
    dto.trialDays = entity.trialDays ?? null;
    dto.sortOrder = entity.sortOrder ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
