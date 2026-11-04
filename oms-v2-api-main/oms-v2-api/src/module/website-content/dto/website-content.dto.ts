import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateWebsiteContentDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sectionKey: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @IsOptional()
  @IsIn(['meta', 'item'])
  contentType?: 'meta' | 'item';

  @IsOptional()
  @IsString()
  @MaxLength(150)
  eyebrow?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  previewUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  previewBg?: string;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaHref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  accentColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  iconBg?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
