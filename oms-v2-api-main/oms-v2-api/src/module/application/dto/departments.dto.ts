import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Department } from '../entities/departments.entity';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  updaterId?: number;

  // @ApiProperty({ required: false, description: 'App ID' })
  @IsOptional()
  // @IsInt()
  // @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  appId?: number;

  @ApiProperty({
    required: true,
    description: 'Department name',
    example: 'HR Department',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    required: false,
    description: 'Department description',
    example: 'Handles human resources',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Parent department ID',
    example: 1,
  })
  @IsOptional()
  // @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  parentId?: number | null;

  @ApiProperty({
    required: false,
    description: 'Is department active?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // @ApiProperty({ required: false, description: 'Creator user ID' })
  @IsOptional()
  // @IsInt()
  // @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  creatorId?: number;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  updaterId?: number;
}

export class DepartmentResponseDto {
  id: number;
  appId: number | null;
  name: string | null;
  description: string | null;
  parentId: number | null;
  isActive: boolean;
  creatorId: number | null;
  updaterId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;

  static fromEntity(entity: Department): DepartmentResponseDto {
    const response = new DepartmentResponseDto();
    response.id = entity.id;
    response.appId = entity.appId;
    response.name = entity.name;
    response.description = entity.description;
    response.parentId = entity.parentId;
    response.isActive = Boolean(entity.isActive);
    response.creatorId = entity.creatorId;
    response.updaterId = entity.updaterId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
