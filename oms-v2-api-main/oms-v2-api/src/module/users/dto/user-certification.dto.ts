import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateUserCertificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: number | string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  issuingOrganization?: string | null;

  @IsDateString()
  @IsOptional()
  issueDate?: Date | null;

  @IsDateString()
  @IsOptional()
  expirationDate?: Date | null;

  @IsInt()
  @IsOptional()
  attachmentId?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  attachmentFile?: Express.Multer.File | null;
}

export class UpdateUserCertificationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  issuingOrganization?: string | null;

  @IsDateString()
  @IsOptional()
  issueDate?: Date | null;

  @IsDateString()
  @IsOptional()
  expirationDate?: Date | null;

  @IsInt()
  @IsOptional()
  attachmentId?: number | null;
}

export class UserCertificationResponseDto {
  id: number;
  userId: number;
  name: string;
  issuingOrganization?: string;
  issueDate?: Date;
  expirationDate?: Date;
  attachmentId?: number;
  createdAt: Date;
  updatedAt?: Date;
}
