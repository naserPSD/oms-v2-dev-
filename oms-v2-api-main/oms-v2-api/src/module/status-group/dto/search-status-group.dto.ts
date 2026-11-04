import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SearchStatusGroupDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly code?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;
}
