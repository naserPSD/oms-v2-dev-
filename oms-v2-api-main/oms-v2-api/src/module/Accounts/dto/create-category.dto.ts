import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CategoryType } from '../entities/account-category.entity';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType = CategoryType.EXPENSE;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsString()
  source?: string;
}
