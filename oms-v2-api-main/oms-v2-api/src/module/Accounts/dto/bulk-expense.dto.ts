import { ArrayMinSize, IsArray, IsEnum, IsInt } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class BulkDeleteExpensesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}

export class BulkStatusUpdateExpensesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;
}
