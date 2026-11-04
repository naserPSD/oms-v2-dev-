import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import { AppHoliday } from '../entities/app-holidays.entity';
import { ManyToOne } from 'typeorm';

export class CreateAppHolidayDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  appId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  holidayId?: number;

  @ApiProperty({ required: false, example: 146 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  holidayTypeId?: number | null;

  @ApiProperty({ required: false, example: 'Eid Vacation' })
  @IsOptional()
  @IsString()
  holidayName?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : Number(value),
  )
  @IsInt()
  dayCount?: number | null;

  @ApiProperty({ example: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? 1 : 0))
  isRecurring: boolean = false;

  @ApiProperty({ example: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? 1 : 0))
  isOfficial: boolean = false;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiProperty({ required: false, example: '2025-01-02' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiProperty({ required: false, example: ['2025-01-01', '2025-01-02'] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsDateString({}, { each: true })
  holidayDates?: string[] | null;
}

export class UpdateAppHolidayDto extends CreateAppHolidayDto {}

export class AppHolidayResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  id: number;

  @ApiProperty({ example: 0 })
  @Expose()
  appId?: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  holidayId?: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  holidayTypeId?: number | null;

  @ApiProperty()
  @Expose()
  holidayName?: string | null;

  @ApiProperty()
  @Expose()
  dayCount?: number | null;

  @ApiProperty()
  @Expose()
  isRecurring: number;

  @ApiProperty()
  @Expose()
  isOfficial: number;

  @ApiProperty()
  @Expose()
  startDate?: string | null;

  @ApiProperty()
  @Expose()
  endDate?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date | null;

  static from(entity: any): AppHolidayResponseDto {
    return plainToInstance(AppHolidayResponseDto, entity, {
      // excludeExtraneousValues: true,
    });
  }
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class GetAllAppHolidaysResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'App holidays retrieved successfully' })
  message: string;

  @ApiProperty({ type: [AppHolidayResponseDto] })
  data: AppHolidayResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
