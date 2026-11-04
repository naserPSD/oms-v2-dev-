import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CompanyDocument } from '../entities/company-documents.entity';

export class CreateCompanyDocumentDto {
  @ApiProperty({ required: true, default: 0 })
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  appId?: number;

  @ApiProperty({ required: false, example: 'Trade License' })
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  issueDate?: Date;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  expiredDate?: Date;

  @ApiProperty({ required: false, example: 231 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  documentTypeId?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  isActive?: boolean;
}

export class UpdateCompanyDocumentDto extends PartialType(
  CreateCompanyDocumentDto,
) {}

export class CompanyDocumentResponseDto {
  id: number;
  appId?: number | null;
  documentName?: string | null;
  documentTypeId?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  static fromEntity(entity: CompanyDocument): CompanyDocumentResponseDto {
    const dto = new CompanyDocumentResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.documentName = entity.documentName ?? null;
    dto.documentTypeId = entity.documentTypeId ?? null;
    dto.isActive = entity.isActive ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.deletedAt = entity.deletedAt ?? null;
    return dto;
  }
}
