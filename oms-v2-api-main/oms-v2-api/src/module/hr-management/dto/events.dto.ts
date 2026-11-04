import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Event } from '../entities/events.entity';

export class CreateEventDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 0 : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 1 : Number(value),
  )
  @IsInt()
  @IsOptional()
  appId: number;

  //@ApiProperty({ required: false, nullable: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  departmentId?: number;

  @ApiProperty({ required: true, example: 'Annual Company Meeting' })
  @IsString()
  title: string;

  @ApiProperty({ required: false, example: 'Quarterly strategy review' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 172 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  eventTypeId?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Main Conference Room',
  })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiProperty({ required: true, example: '2025-12-01T09:00:00Z' })
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ required: true, example: '2025-12-01T17:00:00Z' })
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  endDatetime: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === '1' || value === 1 || value === true || value === 'true'
      ? true
      : false,
  )
  @IsBoolean()
  isAllDay?: boolean = false;

  //@ApiProperty({ required: false, nullable: true, example: 101 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  creatorId?: number | null;

  //@ApiProperty({ required: false, nullable: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  statusId?: number;
}

// Update DTO inherits from Create DTO
export class UpdateEventDto extends CreateEventDto {}

// Response DTO
export class EventResponseDto {
  id: number;
  appId: number;
  departmentId?: number | null;
  title: string;
  description?: string | null;
  eventTypeId?: number | null;
  location?: string | null;
  startDatetime: string;
  endDatetime: string;
  isAllDay: boolean;
  creatorId?: number | null;
  statusId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: Event): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.departmentId = entity.departmentId ?? null;
    dto.title = entity.title;
    dto.description = entity.description ?? null;
    dto.eventTypeId = entity.eventTypeId ?? null;
    dto.location = entity.location ?? null;
    dto.startDatetime = entity.startDatetime?.toISOString() ?? null;
    dto.endDatetime = entity.endDatetime?.toISOString() ?? null;
    dto.isAllDay = entity.isAllDay ?? false;
    dto.creatorId = entity.creatorId ?? null;
    dto.statusId = entity.statusId ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
