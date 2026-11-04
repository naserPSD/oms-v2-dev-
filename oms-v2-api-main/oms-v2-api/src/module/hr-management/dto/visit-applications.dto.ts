import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { VisitApplication } from '../entities/visit-applications.entity';

export class CreateVisitApplicationDto {
  @ApiProperty({ required: false, default: 0 })
  @Transform(({ value }) =>
    value === undefined || value === null || isNaN(value) || value === 'null'
      ? undefined
      : Number(value),
  )
  @IsOptional()
  @IsInt()
  id?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || isNaN(value) || value === 'null'
      ? undefined
      : Number(value),
  )
  appId?: number;

  @Transform(({ value }) =>
    value === undefined || value === null || isNaN(value) || value === 'null'
      ? undefined
      : Number(value),
  )
  @IsInt()
  visitorEmpId: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || isNaN(value) || value === 'null'
      ? undefined
      : Number(value),
  )
  @IsInt()
  hostEmpId?: number;

  @ApiProperty({ required: false, example: 'Meeting with HR' })
  @IsOptional()
  @IsString()
  purpose?: string | null;

  @ApiProperty({ required: false, example: '2025-10-22' })
  @IsOptional()
  @IsDateString()
  visitDate?: string | null;

  @ApiProperty({ required: false, example: '10:30:00' })
  @IsOptional()
  @IsString()
  visitTime?: string | null;

  @ApiProperty({ required: false, example: '10:30:00' })
  @IsOptional()
  @IsString()
  checkInTime?: string | null;

  @ApiProperty({ required: false, example: '11:30:00' })
  @IsOptional()
  @IsString()
  checkOutTime?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @IsInt()
  @IsOptional()
  visitStatusId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsInt()
  @IsOptional()
  applicationStatusId?: number | null;

  @ApiProperty({ required: false, example: 'Meeting with HR' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  @IsInt()
  createdBy?: number | null;
}

export class UpdateVisitStatusDto {
  @ApiProperty({
    required: true,
  })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 156 })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  visitStatusId: number;

  @ApiProperty({ required: true, example: 'Urgent requirement' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  @IsString()
  timezone?: string | null;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    required: true,
  })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 156 })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  applicationStatusId: number;

  @ApiProperty({ required: true, example: 'Urgent requirement' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}

export class CheckInOutVisitorDto {
  @ApiProperty({ required: true, example: 101 })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({
    required: false,
    example: '10:30:00',
    description: 'Check-in time (HH:mm:ss)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'checkInTime must be in HH:mm:ss format',
  })
  @IsOptional()
  checkInTime?: string;

  @ApiProperty({
    required: false,
    example: '18:00:00',
    description: 'Check-out time (HH:mm:ss)',
  })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  timezone: string | 'Asia/Dhaka';
}

export class UpdateVisitorCheckTimeDto {
  @ApiProperty({ required: true })
  @IsInt()
  id: number;

  @ApiProperty({ required: false, example: '10:30:00' })
  @IsOptional()
  checkInTime?: string;

  @ApiProperty({ required: false, example: '18:00:00' })
  @IsOptional()
  checkOutTime?: string;
}

export class UpdateVisitApplicationDto extends CreateVisitApplicationDto {}

export class VisitApplicationResponseDto {
  id: number;
  appId?: number | null;
  visitorEmpId: number;
  hostEmpId: number;
  purpose?: string | null;
  visitDate?: string | null;
  visitTime?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  visitStatusId?: number | null;
  remarks?: string | null;
  createdBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: VisitApplication): VisitApplicationResponseDto {
    const dto = new VisitApplicationResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.visitorEmpId = entity.visitorEmpId;
    dto.hostEmpId = entity.hostEmpId;
    dto.purpose = entity.purpose ?? null;
    dto.visitDate = entity.visitDate ?? null;
    dto.visitTime = entity.visitTime ?? null;
    dto.checkInTime = entity.checkInTime ?? null;
    dto.checkOutTime = entity.checkOutTime ?? null;
    dto.visitStatusId = entity.visitStatusId ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.createdBy = entity.createdBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
