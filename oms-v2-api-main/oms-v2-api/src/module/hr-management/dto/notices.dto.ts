import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Notice, NoticePriority } from '../entities/notices.entity';

export class CreateNoticeDto {
  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id?: number;

  //@ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @IsNumber()
  appId?: number;

  @ApiProperty({ required: true, example: 'Important Notice' })
  @IsString()
  title: string;

  @ApiProperty({ required: true, example: 'Notice content here' })
  @IsString()
  content: string;

  @ApiProperty({ required: false, example: 'attachment.pdf' })
  @IsOptional()
  @IsString()
  attachment?: string;

  @ApiProperty({
    required: false,
    enum: NoticePriority,
    example: NoticePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(NoticePriority)
  priority?: NoticePriority;

  @ApiProperty({ required: false, example: '/main-dashboard' })
  @IsOptional()
  @IsString()
  pageRoute?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: true, example: '2025-09-01T09:00:00' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({ required: false, example: '2025-09-05T18:00:00' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  endDate?: Date | null;

  //@ApiProperty({ required: true, example: 1 })
  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateNoticeDto extends CreateNoticeDto {}

export class NoticeResponseDto {
  id: number;
  appId: number;
  title: string;
  content: string;
  attachment?: string;
  priority?: NoticePriority;
  pageRoute?: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date | null;
  createdBy: number;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: Notice): NoticeResponseDto {
    const dto = new NoticeResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.title = entity.title;
    dto.content = entity.content;
    dto.attachment = entity.attachment;
    dto.priority = entity.priority ?? NoticePriority.NORMAL;
    dto.pageRoute = entity.pageRoute ?? '/main-dashboard';
    dto.isActive = entity.isActive;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate ?? null;
    dto.createdBy = entity.createdBy;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
