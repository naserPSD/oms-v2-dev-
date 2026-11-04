import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { TaskWorkspace } from '../entities/task-workspace.entity';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskWorkspaceDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @ApiProperty({
    required: true,
    description: 'Workspace name',
    example: 'Development Workspace',
    maxLength: 128,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    required: false,
    description: 'Workspace description',
    example: 'Workspace for managing development-related tasks',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Is workspace active?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  creatorId?: number;
}

export class TaskWorkspaceResponseDto {
  id: number;
  appId: number | null;
  name: string;
  description: string | null;
  isActive: boolean;
  creatorId: number | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: TaskWorkspace): TaskWorkspaceResponseDto {
    const response = new TaskWorkspaceResponseDto();
    response.id = entity.id;
    response.appId = entity.appId ?? null;
    response.name = entity.name;
    response.description = entity.description;
    response.isActive = Boolean(entity.isActive);
    response.creatorId = entity.creatorId ?? null;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
