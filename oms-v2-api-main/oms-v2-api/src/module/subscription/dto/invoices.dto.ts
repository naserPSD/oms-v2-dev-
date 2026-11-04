import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Invoice } from '../entities/invoices.entity';

const ToNumberOrUndefined = () =>
  Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  );

const ToNullableNumber = () =>
  Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  });

const ToBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return value;
  });

export class CreateInvoiceDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @ToNullableNumber()
  @IsInt()
  id?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @ToNullableNumber()
  @IsInt()
  subscriptionId?: number | null;

  @IsOptional()
  @ToNullableNumber()
  @IsInt()
  userId?: number | null;

  @IsOptional()
  @ToNumberOrUndefined()
  @IsInt()
  appId?: number;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @ToNumberOrUndefined()
  @IsNumber()
  baseAmount?: number;

  @IsOptional()
  @ToNumberOrUndefined()
  @IsNumber()
  perUserAmount?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @ToNumberOrUndefined()
  @IsInt()
  userCount?: number;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @ToNumberOrUndefined()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @ToNumberOrUndefined()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @ToNumberOrUndefined()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ required: true, example: 1000 })
  @ToNumberOrUndefined()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  currency?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsString()
  paymentStatus?: string | null;

  @IsOptional()
  @IsString()
  billingPeriodStart?: Date | null;

  @IsOptional()
  @IsString()
  billingPeriodEnd?: Date | null;

  @IsOptional()
  @ToNullableNumber()
  @IsInt()
  couponId?: number | null;

  @IsOptional()
  @IsString()
  dueDate?: Date | null;

  @IsOptional()
  @IsString()
  paidAt?: Date | null;

  @IsOptional()
  @IsString()
  pdfUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsString()
  invoiceItems?: string | null;

  @IsOptional()
  @IsString()
  stripeInvoiceId?: string | null;

  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string | null;
}

export class UpdateInvoiceDto extends CreateInvoiceDto {}

export class InvoiceResponseDto {
  id: number;
  subscriptionId: number | null;
  userId: number | null;
  appId: number;
  invoiceNumber: string;
  baseAmount: number;
  perUserAmount: number;
  userCount: number;
  subtotal: number;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number;
  currency: string | null;
  status: string | null;
  paymentStatus: string | null;
  billingPeriodStart: Date | null;
  billingPeriodEnd: Date | null;
  couponId: number | null;
  dueDate: Date | null;
  paidAt: Date | null;
  pdfUrl: string | null;
  invoiceItems: any | null;
  stripeInvoiceId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: Invoice): InvoiceResponseDto {
    const dto = new InvoiceResponseDto();

    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId ?? null;
    dto.userId = entity.userId ?? null;
    dto.appId = entity.appId;
    dto.invoiceNumber = entity.invoiceNumber;
    dto.baseAmount = entity.baseAmount;
    dto.perUserAmount = entity.perUserAmount;
    dto.userCount = entity.userCount;
    dto.subtotal = entity.subtotal;
    dto.taxAmount = entity.taxAmount ?? null;
    dto.discountAmount = entity.discountAmount ?? null;
    dto.totalAmount = entity.totalAmount;
    dto.currency = entity.currency ?? null;
    dto.status = entity.status ?? null;
    dto.paymentStatus = entity.paymentStatus ?? null;
    dto.billingPeriodStart = entity.billingPeriodStart ?? null;
    dto.billingPeriodEnd = entity.billingPeriodEnd ?? null;
    dto.couponId = entity.couponId ?? null;
    dto.dueDate = entity.dueDate ?? null;
    dto.paidAt = entity.paidAt ?? null;
    dto.pdfUrl = entity.pdfUrl ?? null;
    if (typeof entity.invoiceItems === 'string') {
      try {
        dto.invoiceItems = JSON.parse(entity.invoiceItems);
      } catch {
        dto.invoiceItems = entity.invoiceItems;
      }
    } else {
      dto.invoiceItems = entity.invoiceItems ?? null;
    }
    dto.stripeInvoiceId = entity.stripeInvoiceId ?? null;
    dto.stripePaymentIntentId = entity.stripePaymentIntentId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
