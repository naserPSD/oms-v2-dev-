// src/permissions/dto/create-permission.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform, Type } from 'class-transformer';

export class CreatePermissionDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  parentId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  menuPositionId?: number;

  @ApiProperty({ enum: ['module', 'page', 'action', 'feature'] })
  @IsEnum(['module', 'page', 'action', 'feature'])
  type: string;

  @ApiProperty({
    enum: ['Admin', 'Company'],
    default: 'Company',
    required: false,
  })
  @IsOptional()
  @IsEnum(['Admin', 'Company'])
  accessPanel?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class PermissionResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ required: false })
  @Expose()
  parentId?: number;

  @ApiProperty({ required: false })
  @Expose()
  parentName?: string;

  @ApiProperty()
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  path?: string;

  @ApiProperty({ required: false })
  @Expose()
  icon?: string;

  @ApiProperty()
  @Expose()
  sortOrder: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  isSystem: boolean;

  @ApiProperty()
  @Expose()
  isRequired: boolean;

  @ApiProperty({
    enum: ['Admin', 'Company'],
    default: 'Company',
    required: false,
  })
  @Expose()
  accessPanel?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    type: () => PermissionResponseDto,
    isArray: true,
    required: false,
  })
  @Expose()
  @Type(() => PermissionResponseDto)
  children?: PermissionResponseDto[];

  static from(permission: any): PermissionResponseDto {
    const dto = plainToInstance(PermissionResponseDto, permission, {
      // excludeExtraneousValues: true,
    });
    dto.children = permission.children
      ? permission.children.map((child) => PermissionResponseDto.from(child))
      : undefined;
    return dto;
  }

  static mapped(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      parentId: permission?.parent?.id ?? null,
      parentName: permission?.parent?.name ?? null,
      type: permission.type,
      accessPanel: permission.accessPanel || 'Company',
      name: permission.name,
      code: permission.code,
      description: permission.description,
      path: permission.path,
      icon: permission.icon,
      sortOrder: permission.sortOrder,
      isActive: permission.isActive,
      isSystem: permission.isSystem,
      isRequired: permission.isRequired,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      children: permission.children
        ? permission.children.map((child) =>
            PermissionResponseDto.mapped(child),
          )
        : undefined,
    };
  }
}
