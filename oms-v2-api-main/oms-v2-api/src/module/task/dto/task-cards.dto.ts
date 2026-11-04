import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsNotEmpty,
  IsHexColor,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskCard } from '../entities/task-cards.entity';

export class CreateTaskCardDto {
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
  @IsInt()
  @Transform(({ value }) => Number(value))
  workspaceId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  boardId: number;

  @ApiProperty({
    required: true,
    description: 'Name of the task card',
    example: 'Sprint Backlog Card',
    maxLength: 128,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    required: true,
    description: 'Hex color code of the card',
    example: '#ffffff',
  })
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  @ApiProperty({
    required: false,
    description: 'Serial/order of the card',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === null || value === undefined ? null : Number(value),
  )
  serial?: number | null;

  //@ApiProperty({ required: false, description: 'Creator user ID', example: 12 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === null || value === undefined ? null : Number(value),
  )
  creatorId?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
export class UpdateTaskCardSerialDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({
    required: false,
    description: 'Serial/order of the card',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === null || value === undefined ? null : Number(value),
  )
  serial?: number | null;
}

export class TaskCardResponseDto {
  id: number;
  appId: number | null;
  workspaceId: number | null;
  boardId: number;
  name: string;

  color: string;
  serial: number | null;
  creatorId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  isActive: boolean;

  static fromEntity(entity: TaskCard): TaskCardResponseDto {
    const dto = new TaskCardResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.workspaceId = entity.workspaceId ?? null;
    dto.boardId = entity.boardId;
    dto.name = entity.name;
    dto.color = entity.color;
    dto.serial = entity.serial ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.isActive = entity.isActive;
    return dto;
  }
}
