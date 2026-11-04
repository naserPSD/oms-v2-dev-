import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateUserLanguageProficiencyDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value)) // Handle undefined values
  @IsInt()
  languageId: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value)) // Handle undefined values
  @IsInt()
  speakingLevelId: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value)) // Handle undefined values
  @IsInt()
  readingLevelId: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value)) // Handle undefined values
  @IsInt()
  writingLevelId: number;
}
