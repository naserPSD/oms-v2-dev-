import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AssetType } from '../entities/asset-types.entity';

export class CreateAssetTypeDto {
  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 'Mobile' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  createdBy?: number;
}

export class CreateCompanyAssetTypeDto extends CreateAssetTypeDto {
  @IsOptional()
  @IsInt()
  appId?: number;
}

export class ImportAssetTypesDto {
  @ApiProperty({ required: true, type: [Number], example: [1, 2, 3] })
  @IsNotEmpty()
  assetTypeIds: number[];
}

export class AssetTypeResponseDto {
  id: number;
  name: string;
  appId: number;
  employeeId: number;
  assetTypeId: number;
  assetStatusId: number;
  description?: string | null;
  model?: string | null;
  serial?: string | null;
  amount?: number | null;
  allocationDate?: Date | null;
  allocatedBy?: number | null;
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: AssetType): AssetTypeResponseDto {
    const dto = new AssetTypeResponseDto();
    dto.id = entity.id;
    dto.createdBy = entity.createdBy;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
