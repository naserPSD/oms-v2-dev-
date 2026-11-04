import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDocRecordDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 231 })
  @IsOptional()
  @IsInt()
  companyDocumentId: number;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsInt()
  entityId?: number;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  documentFile?: Express.Multer.File;
}

export class CreateCompanyDocRecordMultipleFilesDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 231 })
  @IsInt()
  companyDocumentId: number;

  @IsOptional()
  @IsInt()
  documentTypeId?: number;

  @ApiProperty({
    required: false,
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsString()
  issueDate?: string | null;

  @ApiProperty({
    required: false,
    example: '2024-01-01',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsString()
  expiredDate?: string | null;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsInt()
  entityId?: number;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  documentFiles?: Express.Multer.File[];
}

export class FindCompanyDocRecordDto {
  @IsOptional()
  @IsInt()
  appId?: number;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsInt()
  entityId?: number;
}
