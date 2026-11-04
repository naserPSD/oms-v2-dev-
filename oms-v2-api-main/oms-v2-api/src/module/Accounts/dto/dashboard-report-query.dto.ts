import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DashboardReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
