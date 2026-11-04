import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Service } from '../entities/service.entity';

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number;

  // @ApiProperty({ required: false, description: 'App ID' })
  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({
    required: false,
    description: 'Service name',
    example: 'My Service',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, description: 'Type ID' })
  @IsInt()
  @Transform(({ value }) => value && Number(value))
  typeId: number;

  @ApiProperty({
    required: false,
    description: 'Is service active?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // @ApiProperty({ required: false, description: 'Creator user ID' })
  @IsOptional()
  @IsInt()
  creatorId?: number;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  updaterId?: number;
}

export class ServiceResponseDto {
  id: number;
  appId: number | null;
  name: string | null;
  typeId: number | null;
  isActive: boolean;
  creatorId: number | null;
  updaterId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;

  static fromEntity(entity: Service): ServiceResponseDto {
    const response = new ServiceResponseDto();
    response.id = entity.id;
    response.appId = entity.appId;
    response.name = entity.name;
    response.typeId = entity.typeId;
    response.isActive = Boolean(entity.isActive);
    response.creatorId = entity.creatorId;
    response.updaterId = entity.updaterId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
