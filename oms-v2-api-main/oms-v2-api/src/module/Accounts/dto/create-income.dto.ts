import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { IncomeStatus } from '../entities/income.entity';

export enum IncomePaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  MOBILE_PAYMENT = 'mobile_payment',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

export class CreateIncomeDto {
  @IsString()
  @Length(1, 150)
  source: string;

  @IsString()
  @Length(1, 100)
  category: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsDateString()
  incomeDate: string;

  @IsOptional()
  @IsEnum(IncomePaymentMethod)
  paymentMethod?: IncomePaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  reference?: string;

  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  accountInvoiceId?: number;
}