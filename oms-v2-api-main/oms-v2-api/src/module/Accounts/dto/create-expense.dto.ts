import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';
import { IncomePaymentMethod } from './create-income.dto';

export class CreateExpenseDto {
  @IsString()
  @Length(1, 100)
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'BDT';

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsEnum(IncomePaymentMethod)
  paymentMethod?: IncomePaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  vendor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  reference?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus = ExpenseStatus.PAID;

  @IsOptional()
  @IsString()
  notes?: string;
}
