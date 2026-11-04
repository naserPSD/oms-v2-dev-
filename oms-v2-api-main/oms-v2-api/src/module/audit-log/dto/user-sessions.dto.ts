import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserSession } from '@module/audit-log/schema/user-sessions.schema';

export class CreateUserSessionDto {
  @ApiProperty({ required: true })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  userId?: number | null;

  @ApiProperty({
    required: false,
    description: 'Device information',
    example: 'Windows Laptop',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  device?: string | null;

  @ApiProperty({
    required: false,
    description: 'Location description',
    example: 'Office Network',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  location?: string | null;

  @ApiProperty({
    required: false,
    description: 'City name',
    example: 'Dhaka',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string | null;

  @ApiProperty({
    required: false,
    description: 'Country name',
    example: 'Bangladesh',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  countryName?: string | null;

  @ApiProperty({
    required: false,
    description: 'Browser information',
    example: 'Chrome 121',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  browser?: string | null;

  @ApiProperty({
    required: false,
    description: 'IP Address',
    example: '192.168.1.1',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ipAddress?: string | null;

  @ApiProperty({
    required: false,
    description: 'Session start date time',
    example: '2026-02-05T10:30:00',
  })
  @IsOptional()
  @IsDateString()
  startDateTime?: Date | null;

  @ApiProperty({
    required: false,
    description: 'Session end date time',
    example: '2026-02-05T12:00:00',
  })
  @IsOptional()
  @IsDateString()
  endDateTime?: Date | null;
}

export class UpdateUserSessionDto extends PartialType(CreateUserSessionDto) {}

export class UserSessionResponseDto {
  id: number;
  userId: number | null;
  device: string | null;
  location: string | null;
  city: string | null;
  countryName: string | null;
  browser: string | null;
  ipAddress: string | null;
  startDateTime: Date | null;
  endDateTime: Date | null;

  static fromEntity(entity: any): UserSessionResponseDto {
    const response = new UserSessionResponseDto();
    response.id = entity._id ? entity._id.toString() : null;
    response.userId = entity.userId ?? null;
    response.device = entity.device;
    response.location = entity.location;
    response.city = entity.city;
    response.countryName = entity.countryName;
    response.browser = entity.browser;
    response.ipAddress = entity.ipAddress;
    response.startDateTime = entity.startDateTime;
    response.endDateTime = entity.endDateTime;
    return response;
  }
}
