import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserWorkExperienceDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  responsibility?: string;

  @IsOptional()
  @IsInt()
  addressId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  // @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
