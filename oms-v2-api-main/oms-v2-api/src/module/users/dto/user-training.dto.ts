import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserTraining } from '../entities/user-training.entity';

export class CreateUserTrainingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  trainingYear?: number | null;

  @IsOptional()
  @IsString()
  description?: string | null;

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
  address?: string | null;
}

export class UpdateUserTrainingDto extends PartialType(CreateUserTrainingDto) {}

export class UserTrainingResponseDto {
  id: number;
  userId: number;
  name: string;
  trainingYear: number | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  address: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: UserTraining): UserTrainingResponseDto {
    const response = new UserTrainingResponseDto();
    response.id = entity.id;
    response.userId = entity.userId;
    response.name = entity.name;
    response.trainingYear = entity.trainingYear;
    response.description = entity.description;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.isCurrent = Boolean(entity.isCurrent);
    response.address = entity.address;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
