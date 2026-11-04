import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { LifeEvent } from '../entities/life-events.entity';

export class CreateLifeEventDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  empId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  eventTypeId?: number | null;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  eventDate?: string | null;

  @ApiProperty({ required: false, example: 'Promotion' })
  @IsOptional()
  @IsString()
  eventDetails?: string | null;

  @ApiProperty({
    required: false,
    example: '{favourite Hobby: "Playing Cricket"}',
  })
  @IsOptional()
  @IsString()
  jsonData?: string | null;
}

export class UpdateLifeEventDto extends CreateLifeEventDto {}

export class LifeEventResponseDto {
  id: number;
  appId?: number | null;
  empId?: number | null;
  eventTypeId?: number | null;
  eventDate?: string | null;
  eventDetails?: string | null;
  jsonData?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: LifeEvent): LifeEventResponseDto {
    const dto = new LifeEventResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId ?? null;
    dto.eventTypeId = entity.eventTypeId ?? null;
    dto.eventDate = entity.eventDate ?? null;
    dto.eventDetails = entity.eventDetails ?? null;
    dto.jsonData = entity.jsonData ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
