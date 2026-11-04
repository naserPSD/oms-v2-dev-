import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BatchEmail } from '../entities/batch-emails.entity';

export class CreateBatchEmailDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Monthly Newsletter',
  })
  @IsOptional()
  @IsString()
  campaignName?: string | null;

  @ApiProperty({ required: true, example: 'Important Updates' })
  @IsString()
  subject: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'noreply@example.com',
  })
  @IsOptional()
  @IsString()
  replyEmail?: string | null;

  @ApiProperty({ required: false, nullable: true, example: '{}' })
  @IsOptional()
  filterQuery?: any | null;

  @ApiProperty({ required: false, nullable: true, example: '{}' })
  @IsOptional()
  templateDesign?: any | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '<p>Hello {{name}}</p>',
  })
  @IsOptional()
  @IsString()
  templateHtml?: string | null;

  //@ApiProperty({ required: false, nullable: true, example: '2025-09-29T00:00:00Z' })
  @IsOptional()
  sentAt?: Date | null;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalRecipients?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  creatorId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  editorId?: number | null;
}

export class UpdateBatchEmailDto extends CreateBatchEmailDto {}

export class BatchEmailResponseDto {
  id: number;
  appId?: number | null;
  campaignName?: string | null;
  subject: string;
  replyEmail?: string | null;
  filterQuery?: any | null;
  templateDesign?: any | null;
  templateHtml?: string | null;
  sentAt?: Date | null;
  totalRecipients?: number;
  creatorId?: number | null;
  editorId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: BatchEmail): BatchEmailResponseDto {
    const dto = new BatchEmailResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.campaignName = entity.campaignName ?? null;
    dto.subject = entity.subject;
    dto.replyEmail = entity.replyEmail ?? null;
    dto.filterQuery = entity.filterQuery ?? null;
    dto.templateDesign = entity.templateDesign ?? null;
    dto.templateHtml = entity.templateHtml ?? null;
    dto.sentAt = entity.sentAt ?? null;
    dto.totalRecipients = entity.totalRecipients ?? 0;
    dto.creatorId = entity.creatorId ?? null;
    dto.editorId = entity.editorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
