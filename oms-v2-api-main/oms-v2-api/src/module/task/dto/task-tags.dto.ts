import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TaskTag } from '../entities/task-tags.entity';
import { Transform } from 'class-transformer';

export class CreateTaskTagDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number | null;

  @Transform(({ value }) => Number(value))
  @Min(1, { message: 'Task ID must be a positive integer' })
  @IsInt({ message: 'Task ID must be an integer' })
  @IsOptional()
  taskId: number;

  @ApiProperty({
    required: true,
    example: 'Urgent',
    description: 'Name of the tag',
  })
  @IsNotEmpty({ message: 'Tag name is required' })
  @IsString()
  name: string;

  //@ApiProperty({ required: false, readOnly: true })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  creatorId?: number;
}

export class UpdateTaskTagDto extends CreateTaskTagDto {}

export class TaskTagResponseDto {
  id: number;
  appId: number | null;
  taskId: number;
  name: string;
  creatorId?: number;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: TaskTag): TaskTagResponseDto {
    const dto = new TaskTagResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.taskId = entity.taskId;
    dto.name = entity.name;
    dto.creatorId = entity.creatorId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
