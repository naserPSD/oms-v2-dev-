import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
} from 'class-validator';

export enum SkillLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

export class CreateUserSkillDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  skillName: string;

  @IsEnum(SkillLevel)
  @IsOptional()
  skillLevel?: SkillLevel;

  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @IsBoolean()
  @IsOptional()
  isTechnical?: boolean;
}

export class UpdateUserSkillDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  skillName?: string;

  @IsEnum(SkillLevel)
  @IsOptional()
  skillLevel?: SkillLevel;

  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @IsBoolean()
  @IsOptional()
  isTechnical?: boolean;
}

export class UserSkillResponseDto {
  id: number;
  userId: number;
  skillName: string;
  skillLevel?: SkillLevel;
  yearsOfExperience?: number;
  isTechnical: boolean;
}
