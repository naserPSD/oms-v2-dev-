import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SaveEmailTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsIn(['active', 'inactive', 'draft'])
  status: 'active' | 'inactive' | 'draft';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsBoolean()
  availableForSubscriber?: boolean;
}
