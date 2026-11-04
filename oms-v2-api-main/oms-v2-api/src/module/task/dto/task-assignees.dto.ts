import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskAssignee } from '../entities/task-assignees.entity';

export class CreateTaskAssigneeDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @ApiProperty({
    required: false,
    example: 'ASSIGNEE_CODE',
    description: 'Unique code for the task assignee',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    required: false,
    example: 'ASSIGNEE_NAME',
    description: 'Name of the task assignee',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  assignerId: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  workspaceId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  boardId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  cardId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  taskId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  taskRoleId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  assignedOnId?: number | null;

  //   @ApiProperty({ required: false })
  @IsOptional()
  assignedAt?: Date | null;

  @IsOptional()
  confirmedAt?: Date | null;
}

export class UpdateTaskAssigneeDto extends CreateTaskAssigneeDto {}

export class TaskAssigneeResponseDto {
  id: number;
  appId: number | null;
  code: string;
  assignerId: number;
  workspaceId?: number | null;
  boardId?: number | null;
  cardId?: number | null;
  taskId?: number | null;
  taskRoleId?: number | null;
  assignedOnId?: number | null;
  assignedAt?: Date | null;
  confirmedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: TaskAssignee): TaskAssigneeResponseDto {
    const dto = new TaskAssigneeResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.code = entity.code ?? null;
    dto.assignerId = entity.assignerId;
    dto.workspaceId = entity.workspaceId ?? null;
    dto.boardId = entity.boardId ?? null;
    dto.cardId = entity.cardId ?? null;
    dto.taskId = entity.taskId ?? null;
    dto.taskRoleId = entity.taskRoleId ?? null;
    dto.assignedOnId = entity.assignedOnId ?? null;
    dto.assignedAt = entity.assignedAt ?? null;
    dto.confirmedAt = entity.confirmedAt ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
