import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import { OfficeWeekend } from '../entities/office-weekends.entity';
import { Office } from '../entities/office.entity';

export class CreateOfficeWeekendDto {
  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  id: number;

  // @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return null;
    return Number(value);
  })
  @IsInt()
  officeId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return null;
    return Number(value);
  })
  @IsInt()
  shiftId?: number;

  @ApiProperty({ required: false, example: 'true' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  saturday?: number = 0;

  @ApiProperty({ required: false, example: 'false' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  sunday?: number = 0;

  @ApiProperty({ required: false, example: 'false' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  monday?: number = 0;

  @ApiProperty({ required: false, example: 'false' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  tuesday?: number = 0;

  @ApiProperty({ required: false, example: 'false' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  wednesday?: number = 0;

  @ApiProperty({ required: false, example: 'false' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  thursday?: number = 0;

  @ApiProperty({ required: false, example: 'true' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  friday?: number = 0;
}

export class UpdateOfficeWeekendDto extends CreateOfficeWeekendDto {}

export class OfficeWeekendResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  id: number;

  @ApiProperty({ example: 0 })
  @Expose()
  appId: number;

  @ApiProperty({ example: 0 })
  @Expose()
  officeId: number;

  @ApiProperty({ example: 0 })
  @Expose()
  shiftId: number;

  @ApiProperty()
  @Expose()
  office?: Office;
  //officeInfo?: { name: string | null };

  @ApiProperty({ example: false })
  @Expose()
  saturday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  sunday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  monday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  tuesday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  wednesday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  thursday: boolean;

  @ApiProperty({ example: false })
  @Expose()
  friday: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: false })
  @Expose()
  updatedAt?: Date | null;

  static fromEntity(entity: any): OfficeWeekendResponseDto {
    return plainToInstance(OfficeWeekendResponseDto, entity, {
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

export class GetAllOfficeWeekendsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'All office weekends retrieved successfully' })
  message: string;

  @ApiProperty({ type: [OfficeWeekendResponseDto] })
  data: OfficeWeekendResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
