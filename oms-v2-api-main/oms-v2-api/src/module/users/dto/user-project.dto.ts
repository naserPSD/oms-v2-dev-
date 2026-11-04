import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUrl,
  IsInt,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserProject } from '../entities/user-project.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    description: 'Project name',
    example: 'Project A',
    maxLength: 128,
    minLength: 1,
    type: 'string',
  })
  @MinLength(5)
  projectName: string;

  @IsOptional()
  @IsUrl()
  projectUrl?: string | null;

  @IsOptional()
  // @IsDateString()
  startDate?: Date | null;

  @IsOptional()
  // @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  usedTechnologies?: string | null;
}

export class UpdateUserProjectDto extends PartialType(CreateUserProjectDto) {}

export class UserProjectResponseDto {
  id: number;
  userId: number;
  projectName: string;
  projectUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
  usedTechnologies: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: UserProject): UserProjectResponseDto {
    const response = new UserProjectResponseDto();
    response.id = entity.id;
    response.userId = entity.userId;
    response.projectName = entity.projectName;
    response.projectUrl = entity.projectUrl;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.isCurrent = Boolean(entity.isCurrent);
    response.description = entity.description;
    response.usedTechnologies = entity.usedTechnologies;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
