import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  MaxLength,
  IsBoolean,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PersonalNote } from '../entities/personal-notes.entity';

export class CreatePersonalNoteDto {
  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id?: number;

  // @ApiProperty({ required: true })
  // @Transform(({ value }) =>
  //   isNaN(value) || value === 'null' ? null : Number(value),
  // )
  // @IsInt()
  userId?: number;

  @ApiProperty({ required: true })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: true })
  @IsString()
  content: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Comma-separated tags',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined ? '' : String(value),
  )
  @IsString()
  @MaxLength(255)
  tags?: string;

  @ApiProperty({
    required: false,
    description: 'Is pinned?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({
    required: false,
    description: 'Is archived?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Reminder date in ISO 8601 format',
    example: '2025-09-01T13:00:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === 'null') return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  })
  @ValidateIf((obj, val) => val !== null && val !== undefined)
  @IsDate()
  reminderAt?: Date | null;
}

export class UpdatePersonalNoteDto extends CreatePersonalNoteDto {}

export class PersonalNoteResponseDto {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  reminderAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: PersonalNote): PersonalNoteResponseDto {
    const dto = new PersonalNoteResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.title = entity.title;
    dto.content = entity.content;
    dto.tags = entity.tags ?? null;
    dto.isPinned = entity.isPinned;
    dto.isArchived = entity.isArchived;
    dto.reminderAt = entity.reminderAt ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
