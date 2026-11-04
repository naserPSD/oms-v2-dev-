import { EmailModule } from '@providers/email/email.module';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { Task } from '../entities/task.entity';

export class taskAssignees {
  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  taskRoleId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  assignedOnId: number;
}

export class CreateTaskDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  workspaceId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  boardId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  cardId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  parentTaskId?: number | null;

  @ApiProperty({ example: 'Design database schema for project' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string | null;

  @ApiProperty({ example: 'Implement OAuth2 login with Google' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  priorityId?: number | null;

  @ApiProperty({ example: '2025-08-25T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;

  @ApiProperty({ required: true, example: 223 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  taskStatusId?: number = 223;

  @ApiProperty({ example: '2025-08-26T15:30:00Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: Date | null;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  serial?: number | null;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  creatorId?: number | null;

  @ApiProperty({ required: false, type: [taskAssignees] })
  @IsOptional()
  @IsArray()
  @Type(() => taskAssignees)
  taskAssignees?: taskAssignees[];

  @ApiProperty({ example: ['web', 'application'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taskTags?: string[];
}

export class UpdateTaskStatusDto {
  @ApiProperty({ default: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, default: 223 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  taskStatusId: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class TaskResponseDto {
  id: number;
  appId?: number | null;
  workspaceId?: number | null;
  boardId?: number | null;
  cardId: number;
  parentTaskId: number | null;
  name: string | null;
  description: string | null;
  priorityId: number | null;
  taskStatusId: number | null;
  dueDate: Date | null;
  completedAt: Date | null;
  serial: number | null;
  creatorId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  taskAssignees?: taskAssignees[];
  taskTags?: string[];

  static fromEntity(entity: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.cardId = entity.cardId;
    dto.parentTaskId = entity.parentTaskId ?? null;
    dto.name = entity.name ?? null;
    dto.description = entity.description ?? null;
    dto.priorityId = entity.priorityId ?? null;
    dto.taskStatusId = entity.taskStatusId ?? null;
    dto.dueDate = entity.dueDate ?? null;
    dto.completedAt = entity.completedAt ?? null;
    dto.serial = entity.serial ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
