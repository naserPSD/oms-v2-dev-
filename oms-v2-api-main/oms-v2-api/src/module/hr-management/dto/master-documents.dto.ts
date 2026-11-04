import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MasterDocument } from '../entities/master-documents.entity';

export class CreateMasterDocumentDto {
  @ApiProperty({ required: true, default: 0 })
  @IsInt()
  id: number;

  @ApiProperty({ required: false, example: 'Trade License' })
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiProperty({ required: false, example: 231 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  documentTypeId?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  deletedAt?: Date;
}

export class ImportMasterDocumentsDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Master document IDs to import',
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map((v: any) => Number(v)))
  @IsInt({ each: true })
  ids: number[];
}

export class UpdateMasterDocumentDto extends PartialType(
  CreateMasterDocumentDto,
) {}

export class MasterDocumentResponseDto {
  id: number;
  documentName?: string | null;
  documentTypeId?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  static fromEntity(entity: MasterDocument): MasterDocumentResponseDto {
    const dto = new MasterDocumentResponseDto();
    dto.id = entity.id;
    dto.documentName = entity.documentName ?? null;
    dto.documentTypeId = entity.documentTypeId ?? null;
    dto.isActive = entity.isActive ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.deletedAt = entity.deletedAt ?? null;
    return dto;
  }
}
