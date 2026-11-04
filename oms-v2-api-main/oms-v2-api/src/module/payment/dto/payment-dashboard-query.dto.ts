import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BillingCycle } from '@module/subscription/entities/subscription-plan.entity';
import { PaymentTransactionStatus } from '../entities/payment-transaction.entity';

export enum DashboardPeriod {
  TODAY = 'today',
  THREE_DAYS = '3d',
  SEVEN_DAYS = '7d',
  FIFTEEN_DAYS = '15d',
  THIRTY_DAYS = '30d',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
}

export enum DashboardDateRange {
  LAST_3_DAYS = 'last3Days',
  LAST_30_DAYS = 'last30Days',
}

export enum DashboardGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class PaymentDashboardQueryDto {
  @IsOptional()
  @IsEnum(DashboardDateRange)
  dateRange?: DashboardDateRange;

  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod;

  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsDateString({ strict: true })
  fromDate?: string;

  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsDateString({ strict: true })
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subscriptionPlanId?: number;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    return value.toLowerCase() === 'monthly'
      ? BillingCycle.MONTHLY
      : value.toLowerCase() === 'yearly'
        ? BillingCycle.YEARLY
        : value;
  })
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsEnum(DashboardGroupBy)
  groupBy?: DashboardGroupBy;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? value.toUpperCase() : value))
  @IsEnum(PaymentTransactionStatus)
  status?: PaymentTransactionStatus;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsIn(['paymentDate', 'createdAt', 'amount', 'transactionId'])
  sortBy: 'paymentDate' | 'createdAt' | 'amount' | 'transactionId' = 'paymentDate';

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}