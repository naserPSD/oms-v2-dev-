import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ExpenseSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
