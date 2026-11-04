import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { Office } from '../entities/office.entity';
import { CreateAddressDoc } from '@module/address/dto/create-address.dto';
import { CreateOfficeShiftDto } from './office-shift.dto';

export class CreateOfficeDto {
  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  id?: number;

  @ApiProperty({ required: true, example: 'Head Office' })
  @IsString()
  name: string;

  //@ApiProperty({ required: true, example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  appId?: number;

  //@ApiProperty({ required: true, example: 2 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  typeId?: number | null;

  // @ApiProperty({ required: false, example: 1, nullable: true })
  // @IsOptional()
  // @Transform(({ value }) =>
  //   isNaN(value) || value === 'null' ? null : Number(value),
  // )
  // @IsInt()

  @IsOptional()
  @IsInt()
  addressId?: number | null;

  @ApiProperty({ required: true, type: CreateAddressDoc })
  @ValidateNested()
  @Type(() => CreateAddressDoc)
  address: CreateAddressDoc;

  // @ApiProperty({ required: false, example: 5, nullable: true })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  managerId?: number | null;

  // @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
  @IsBoolean()
  hasShift?: boolean;

  @ApiProperty({ required: false, example: '11:00:00', nullable: true })
  @IsOptional()
  startTime?: string | null;

  @ApiProperty({ required: false, example: '11:10:00', nullable: true })
  @IsOptional()
  delayStartTime?: string | null;

  @ApiProperty({ required: false, example: '07:30:00', nullable: true })
  @IsOptional()
  endTime?: string | null;

  @ApiProperty({ required: false, example: '07:00:00', nullable: true })
  @IsOptional()
  earlyEndTime?: string | null;

  @ApiProperty({ required: false, example: 'Asia/Dhaka', nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string | null;

  @ApiProperty({
    required: false,
    type: [CreateOfficeShiftDto],
    description: 'List of office shifts for the office',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOfficeShiftDto)
  officeShifts?: CreateOfficeShiftDto[];

  // @ApiProperty({
  //   required: false,
  //   description: 'Is office active?',
  //   example: true,
  // })
  // @IsOptional()
  // @IsBoolean()
  // isActive?: boolean;

  //@ApiProperty({ required: true, example: 1 })
  // @IsInt()
  // @IsOptional()
  // @Transform(({ value }) =>
  //   isNaN(value) || value === 'null' ? null : Number(value),
  // )
  creatorId?: number;

  // @ApiProperty({ required: false, example: 2, nullable: true })
  // @IsOptional()
  // @Transform(({ value }) =>
  //   isNaN(value) || value === 'null' ? null : Number(value),
  // )
  // @IsInt()
  editorId?: number | null;
}

export class UpdateOfficeDto extends CreateOfficeDto {}

export class OfficeResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  id: number;

  @ApiProperty({ example: 0 })
  @Expose()
  name: string;

  @ApiProperty({ example: 0 })
  @Expose()
  appId: number;

  @ApiProperty({ example: 0 })
  @Expose()
  typeId: number;

  @ApiProperty({ example: 0 })
  @Expose()
  addressId?: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  managerId?: number | null;

  @ApiProperty({ example: false })
  @Expose()
  hasShift: boolean;

  @ApiProperty({ example: '11:00:00' })
  @Expose()
  startTime?: string | null;

  @ApiProperty({ example: '11:10:00' })
  @Expose()
  delayStartTime?: string | null;

  @ApiProperty({ example: '07:30:00' })
  @Expose()
  endTime?: string | null;

  @ApiProperty({ example: '07:00:00' })
  @Expose()
  earlyEndTime?: string | null;

  @ApiProperty({ example: 'Asia/Dhaka' })
  @Expose()
  timezone?: string | null;

  @ApiProperty({ example: false })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: 0 })
  @Expose()
  creatorId: number;

  @ApiProperty({ example: 0, nullable: true })
  @Expose()
  editorId?: number | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt?: Date | null;

  @ApiProperty()
  @Expose()
  deletedAt?: Date | null;

  static from(entity: any): OfficeResponseDto {
    return plainToInstance(OfficeResponseDto, entity, {
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

export class GetAllOfficesResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'All offices retrieved successfully' })
  message: string;

  @ApiProperty({ type: [OfficeResponseDto] })
  data: OfficeResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
