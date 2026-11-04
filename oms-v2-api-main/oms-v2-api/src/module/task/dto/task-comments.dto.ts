import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TaskComment } from '../entities/task-comments.entity';
import { Transform } from 'class-transformer';

export class CreateTaskCommentDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @Min(1, { message: 'Task ID must be a positive integer' })
  @IsInt({ message: 'Task ID must be an integer' })
  taskId: number;

  @ApiProperty({ required: true, example: 'This is a comment' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  //@ApiProperty({ required: false, readOnly: true })
  @IsOptional()
  creatorId?: number;
}

export class UpdateTaskCommentDto extends CreateTaskCommentDto {}

export class TaskCommentResponseDto {
  id: number;
  appId: number | null;
  taskId: number;
  comment: string;
  creatorId: number;
  createdAt: Date;
  updatedAt: Date | null;

  taskInfo?: {
    name: string | null;
    description: string | null;
  };

  static fromEntity(entity: TaskComment): TaskCommentResponseDto {
    const dto = new TaskCommentResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.taskId = entity.taskId;
    dto.comment = entity.comment;
    dto.creatorId = entity.creatorId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    if (entity.taskInfo) {
      dto.taskInfo = entity.taskInfo;
    }

    return dto;
  }
}
