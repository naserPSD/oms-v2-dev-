import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BatchEmailSection } from '../entities/batch-email-sections.entity';

export class CreateBatchEmailSectionDto {
  @ApiProperty({ required: true, example: 0 })
  @Type(() => Number)
  @IsInt()
  id: number;

  //@ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  batchEmailId?: number;

  @ApiProperty({ required: false, example: 'Welcome Section' })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiProperty({ required: false, example: 101 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  imgId?: number | null;

  @ApiProperty({ required: false, example: 'Click Here' })
  @IsOptional()
  @IsString()
  btnText?: string | null;

  @ApiProperty({ required: false, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  btnUrl?: string | null;

  @ApiProperty({
    required: false,
    example: 'This is the body text of the section.',
  })
  @IsOptional()
  @IsString()
  bodyText?: string | null;
}

export class UpdateBatchEmailSectionDto extends CreateBatchEmailSectionDto {}

export class BatchEmailSectionResponseDto {
  id: number;
  batchEmailId: number;
  title?: string | null;
  imgId?: number | null;
  btnText?: string | null;
  btnUrl?: string | null;
  bodyText?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: BatchEmailSection): BatchEmailSectionResponseDto {
    const dto = new BatchEmailSectionResponseDto();
    dto.id = entity.id;
    dto.batchEmailId = entity.batchEmailId;
    dto.title = entity.title ?? null;
    dto.imgId = entity.imgId ?? null;
    dto.btnText = entity.btnText ?? null;
    dto.btnUrl = entity.btnUrl ?? null;
    dto.bodyText = entity.bodyText ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
