// src/roles/dto/role.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PermissionResponseDto } from './permission.dto';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  appId?: number | null;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  // @Transform(({ value }) => value.split(',').map(Number))
  // @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  permissionIds?: number[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

// src/roles/dto/role-response.dto.ts
export class RoleResponseDto {
  @ApiProperty()
  id: number;

  @IsOptional()
  @IsNumber()
  appId?: number | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => PermissionResponseDto, isArray: true })
  permissions: PermissionResponseDto[];
}
