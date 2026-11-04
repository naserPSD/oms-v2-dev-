import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Application } from '../entities/application.entity';

export class CreateApplicationDto {
  @ApiProperty({ required: true })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id: number;

  @IsOptional()
  appId?: number;

  @ApiProperty({
    required: true,
    description: 'Company full name',
    example: 'Tesla Inc.',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    required: true,
    description: 'Company type ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  typeId: number;

  @ApiProperty({
    required: true,
    description: 'Company size ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  sizeId: number;

  @ApiProperty({
    required: false,
    description: 'Company business email address',
    example: 'info@tesla.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Phone country code ID',
    example: 880,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  phoneCountryId?: number | null;

  @ApiProperty({
    required: false,
    description: 'Company phone number',
    example: '+8801712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    description: 'Facebook profile URL',
    example: 'https://facebook.com/tesla',
  })
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiProperty({
    required: false,
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/company/tesla',
  })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiProperty({
    required: false,
    description: 'YouTube profile URL',
    example: 'https://youtube.com/tesla',
  })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Instagram profile URL',
    example: 'https://instagram.com/tesla',
  })
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Website URL',
    example: 'https://tesla.com',
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Company full address',
    example: 'House 37, Road 3, Sector 9, Uttara, Dhaka-1230, Bangladesh',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    required: false,
    description: 'Logo media ID',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  logoMediaId?: number | null;

  @IsOptional()
  creatorId?: number;
}

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiProperty({ required: false, description: 'Updater user ID' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  updaterId?: number;
}

export class UpdateCompanyLogoDto {
  @ApiProperty({
    required: true,
    description: 'Application ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({
    required: true,
    description: 'Profile picture',
  })
  // @IsString()
  profilePic?: any;
}

export class ApplicationResponseDto {
  id: number;
  name: string;
  typeId: number;
  sizeId: number;
  email: string | null;
  phoneCountryId: number | null;
  phone: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  address: string | null;
  logoMediaId: number | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;

  static fromEntity(entity: Application): ApplicationResponseDto {
    const response = new ApplicationResponseDto();
    response.id = entity.id;
    response.name = entity.name;
    response.typeId = entity.typeId;
    response.sizeId = entity.sizeId;
    response.email = entity.email ?? null;
    response.phoneCountryId = entity.phoneCountryId ?? null;
    response.phone = entity.phone ?? null;
    response.facebookUrl = entity.facebookUrl ?? null;
    response.linkedinUrl = entity.linkedinUrl ?? null;
    response.youtubeUrl = entity.youtubeUrl ?? null;
    response.instagramUrl = entity.instagramUrl ?? null;
    response.websiteUrl = entity.websiteUrl ?? null;
    response.address = entity.address ?? null;
    response.logoMediaId = entity.logoMediaId ?? null;
    response.createdBy = entity.createdBy ?? null;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}

