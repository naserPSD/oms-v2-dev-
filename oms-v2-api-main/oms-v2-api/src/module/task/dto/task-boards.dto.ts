import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskBoard } from '../entities/task-boards.entity';

export class CreateTaskBoardDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @IsOptional()
  @IsInt()
  workspaceId: number;

  @ApiProperty({
    required: true,
    description: 'Name of the task board',
    example: 'Sprint Backlog',
    maxLength: 128,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({ default: 78 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  viewTypeId: number;

  @IsOptional()
  @IsInt()
  creatorId?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTaskBoardDto extends PartialType(CreateTaskBoardDto) {
  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  updaterId?: number;
}

export class TaskBoardResponseDto {
  id: number;
  name: string;
  workspaceId: number;
  viewTypeId: number | null;
  creatorId: number | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: TaskBoard): TaskBoardResponseDto {
    const dto = new TaskBoardResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.workspaceId = entity.workspaceId;
    dto.viewTypeId = entity.viewTypeId;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
