import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateUserEducationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  instituteName: string | null;

  @ApiProperty({ default: false })
  @IsBoolean()
  isForeignInstitute: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  instituteCountryId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  educationLevelId?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  groupId?: number | null;

  @ApiProperty({ required: false, description: 'Duration in years' })
  @IsOptional()
  @IsInt()
  duration?: number | null;

  @ApiProperty({ default: false })
  @IsBoolean()
  isCurrent: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  yearOfPassing?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  resultTypeId?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  serial?: number | null;
}
