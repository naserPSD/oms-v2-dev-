import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateUserContactInfoDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  mobilePersonal?: string;

  @IsOptional()
  @IsString()
  mobileWork?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  emailPersonal?: string;

  @IsOptional()
  @IsString()
  emailOfficial?: string;

  @IsOptional()
  @IsString()
  emergencyContactPerson?: string;

  @IsOptional()
  @IsString()
  emergencyContactNumber?: string;

  @IsOptional()
  @IsString()
  presentAddress?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}
