import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import { OfficeShift } from '../entities/office-shift.entity';

export class OfficeWeekendDto {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  saturday?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  sunday?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  monday?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  tuesday?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  wednesday?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  thursday?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  friday?: boolean;
}
export class CreateOfficeShiftDto {
  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === 'null' || value === ''
      ? undefined
      : Number(value),
  )
  id?: number;

  //@ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  officeId?: number | null;

  @ApiProperty({ required: false, example: 'Morning Shift' })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ required: false, example: '11:00:00', nullable: true })
  @IsOptional()
  startTime?: string | null;

  @ApiProperty({ required: false, example: '11:15:00', nullable: true })
  @IsOptional()
  delayStartTime?: string | null;

  @ApiProperty({ required: false, example: '19:30:00', nullable: true })
  @IsOptional()
  endTime?: string | null;

  @ApiProperty({ required: false, example: '19:00:00', nullable: true })
  @IsOptional()
  earlyEndTime?: string | null;

  @ApiProperty({ required: false, type: OfficeWeekendDto })
  @IsOptional()
  weekend?: OfficeWeekendDto;
}

export class UpdateOfficeShiftDto extends CreateOfficeShiftDto {}

export class OfficeShiftResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  id: number;

  @ApiProperty({ example: 0 })
  @Expose()
  appId?: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  officeId?: number | null;
  //officeInfo?: { name: string | null };

  @ApiProperty({ example: 'Morning Shift' })
  @Expose()
  name?: string | null;

  @ApiProperty({ example: '11:00:00' })
  @Expose()
  startTime?: string | null;

  @ApiProperty({ example: '11:15:00' })
  @Expose()
  delayStartTime?: string | null;

  @ApiProperty({ example: '19:30:00' })
  @Expose()
  endTime?: string | null;

  @ApiProperty({ example: '19:00:00' })
  @Expose()
  earlyEndTime?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date | null;

  @ApiProperty({
    required: true,
    example: {
      saturday: true,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: true,
    },
  })
  @Expose()
  weekend?: OfficeWeekendDto;

  static fromEntity(fromEntity: any): OfficeShiftResponseDto {
    return plainToInstance(OfficeShiftResponseDto, fromEntity, {
      //excludeExtraneousValues: true,
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

export class GetAllOfficeShiftResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'App holidays retrieved successfully' })
  message: string;

  @ApiProperty({ type: [OfficeShiftResponseDto] })
  data: OfficeShiftResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
