import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { Expose, plainToInstance, Transform } from 'class-transformer';

export class CreateAppHolidayDateDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  //@ApiProperty({ example: 1 })
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsOptional()
  @IsInt()
  appHolidayId?: number;

  @ApiProperty({ example: '2025-12-25' })
  @IsDateString()
  holidayDate: string;
}

export class UpdateAppHolidayDateDto extends CreateAppHolidayDateDto {}

export class AppHolidayDateResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  appHolidayId: number;

  @ApiProperty({ example: '2025-12-25' })
  @Expose()
  holidayDate: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ required: false })
  @Expose()
  updatedAt?: Date | null;

  static from(entity: any): AppHolidayDateResponseDto {
    return plainToInstance(AppHolidayDateResponseDto, entity, {
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

export class GetAllAppHolidayDatesResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'App holiday dates retrieved successfully' })
  message: string;

  @ApiProperty({ type: [AppHolidayDateResponseDto] })
  data: AppHolidayDateResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
