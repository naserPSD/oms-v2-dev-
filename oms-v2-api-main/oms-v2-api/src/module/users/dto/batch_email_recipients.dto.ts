import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BatchEmailRecipient } from '../entities/batch-email-recipients.entity';

export class CreateBatchEmailRecipientDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  batchEmailId: number;

  @ApiProperty({ required: false, example: 'User' })
  @IsOptional()
  @IsString()
  model?: string | null;

  @ApiProperty({ required: false, example: 101 })
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsOptional()
  @IsInt()
  modelId?: number | null;

  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ required: false, example: 'john@example.com' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiProperty({
    required: false,
    enum: [
      'pending',
      'sent',
      'opened',
      'link_visited',
      'bounced',
      'spam_complaint',
    ],
    example: 'pending',
  })
  @IsOptional()
  @IsEnum([
    'pending',
    'sent',
    'opened',
    'link_visited',
    'bounced',
    'spam_complaint',
  ])
  status?: string;

  @ApiProperty({ required: false, example: '2025-09-29T12:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  sentAt?: Date | null;

  @ApiProperty({ required: false, example: '2025-09-29T13:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  bouncedAt?: Date | null;

  @ApiProperty({ required: false, example: '2025-09-29T14:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openedAt?: Date | null;

  @ApiProperty({ required: false, example: '2025-09-29T15:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  linkVisitedAt?: Date | null;

  @ApiProperty({ required: false, example: 'MSG123456' })
  @IsOptional()
  @IsString()
  messageId?: string | null;
}

export class UpdateBatchEmailRecipientDto extends CreateBatchEmailRecipientDto {}

export class BatchEmailRecipientResponseDto {
  id: number;
  batchEmailId: number;
  model?: string | null;
  modelId?: number | null;
  name?: string | null;
  email?: string | null;
  status: string;
  sentAt?: Date | null;
  bouncedAt?: Date | null;
  openedAt?: Date | null;
  linkVisitedAt?: Date | null;
  messageId?: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(
    entity: BatchEmailRecipient,
  ): BatchEmailRecipientResponseDto {
    const dto = new BatchEmailRecipientResponseDto();
    dto.id = entity.id;
    dto.batchEmailId = entity.batchEmailId;
    dto.model = entity.model ?? null;
    dto.modelId = entity.modelId ?? null;
    dto.name = entity.name ?? null;
    dto.email = entity.email ?? null;
    dto.status = entity.status;
    dto.sentAt = entity.sentAt ?? null;
    dto.bouncedAt = entity.bouncedAt ?? null;
    dto.openedAt = entity.openedAt ?? null;
    dto.linkVisitedAt = entity.linkVisitedAt ?? null;
    dto.messageId = entity.messageId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
