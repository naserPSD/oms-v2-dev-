import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserReference } from '../entities/user-reference.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserReferenceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  designation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  organization?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  relation?: string | null;

  @IsOptional()
  @IsInt()
  phoneCountryId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneIdentifier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateUserReferenceDto extends PartialType(
  CreateUserReferenceDto,
) {}

export class UserReferenceResponseDto {
  id: number;
  userId: number;
  name: string | null;
  designation: string | null;
  organization: string | null;
  email: string | null;
  relation: string | null;
  phoneCountryId: number | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(entity: UserReference): UserReferenceResponseDto {
    const response = new UserReferenceResponseDto();
    response.id = entity.id;
    response.userId = entity.userId;
    response.name = entity.name;
    response.designation = entity.designation;
    response.organization = entity.organization;
    response.email = entity.email;
    response.relation = entity.relation;
    response.phoneCountryId = entity.phoneCountryId;
    response.phone = entity.phone;
    response.address = entity.address;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
