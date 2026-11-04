import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Designation } from '../entities/designations.entity';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ReorderDesignationItemDto {
  @ApiProperty({ example: 1, description: 'Designation ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ example: 1, description: 'New Level' })
  @IsNotEmpty()
  @IsInt()
  level: number;
}

export class ReorderDesignationsDto {
  @ApiProperty({
    type: [ReorderDesignationItemDto],
    description: 'List of designation items with updated levels',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderDesignationItemDto)
  items: ReorderDesignationItemDto[];
}

export class CreateDesignationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id?: number;

  //@ApiProperty({ required: false, description: 'App ID' })
  @IsOptional()
  //@IsInt()
  //@Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  appId?: number;

  @ApiProperty({
    required: true,
    description: 'Designation name',
    example: 'Software Engineer',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    required: false,
    description: 'Department ID this designation belongs to',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  departmentId?: number | null;

  @ApiProperty({
    required: false,
    description: 'Designation level (seniority, rank, etc.)',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  level?: number | null;

  @ApiProperty({
    required: false,
    description: 'Is designation active?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  //@ApiProperty({ required: false, description: 'Creator user ID' })
  @IsOptional()
  //@IsInt()
  //@Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  creatorId?: number;

  @IsOptional()
  updaterId?: number;
}

export class UpdateDesignationDto extends PartialType(CreateDesignationDto) {
  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  updaterId?: number;
}

export class DesignationResponseDto {
  id: number;
  appId: number | null;
  name: string | null;
  departmentId: number | null;
  level: number | null;
  isActive: boolean;
  creatorId: number | null;
  updaterId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;

  static fromEntity(entity: Designation): DesignationResponseDto {
    const response = new DesignationResponseDto();
    response.id = entity.id;
    response.appId = entity.appId ?? null;
    response.name = entity.name;
    response.departmentId = entity.departmentId;
    response.level = entity.level;
    response.isActive = Boolean(entity.isActive);
    response.creatorId = entity.creatorId;
    response.updaterId = entity.updaterId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
