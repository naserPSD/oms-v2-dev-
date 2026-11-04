import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import { Holiday } from '../entities/holiday.entity';

export class CreateHolidayDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  @ApiProperty({ required: false, example: 146 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  holidayTypeId?: number | null = 146;

  @ApiProperty({ required: true, example: 'New Year' })
  @IsString()
  holidayName: string;

  @ApiProperty({ required: false, example: 24 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  totalHolidays?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHolidayDto extends CreateHolidayDto {}

export class HolidayResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  id: number;

  @ApiProperty({ example: 0 })
  @Expose()
  holidayTypeId?: number | null;

  @ApiProperty({ example: 'Eid vacation' })
  @Expose()
  holidayName?: string | null;

  @ApiProperty({ example: 24 })
  @Expose()
  totalHolidays?: number | null;

  @ApiProperty({ example: false })
  @Expose()
  isActive?: boolean | null;

  @ApiProperty({ example: 0 })
  @Expose()
  creatorId?: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  editorId?: number | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date | null;

  static fromEntity(entity: any): HolidayResponseDto {
    return plainToInstance(HolidayResponseDto, entity, {
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

export class GetAllHolidaysResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'App holidays retrieved successfully' })
  message: string;

  @ApiProperty({ type: [HolidayResponseDto] })
  data: HolidayResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
