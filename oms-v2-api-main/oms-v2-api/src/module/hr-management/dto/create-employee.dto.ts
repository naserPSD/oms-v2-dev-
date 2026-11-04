import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Other = 'Other',
}

export enum UseCase {
  PERSONAL = 'Personal',
  COMPANY = 'Company',
}

export class CreateNewEmployeeDto {
  //  --Employee--
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  designationId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  officeId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  officeShiftId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  employmentStatusId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  employeeStatusId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  currentGradeId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  currentBasicSalary?: number;

  @ApiProperty({ required: false, example: '2022-01-01' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiProperty({ required: false, example: '2022-01-01' })
  @IsOptional()
  @IsDateString()
  resignationDate?: string;

  @ApiProperty({ required: false, example: 'remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  //  --User--
  @ApiProperty({ required: true, example: 'John' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ required: true, example: 'Doe' })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ required: true, example: 'johndoe@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'password' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsInt()
  activeAppId?: number;

  @IsOptional()
  emailVerifiedAt?: Date;

  @IsOptional()
  @IsString()
  lastTimezone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  //  --User Profile--
  @IsOptional()
  @IsInt()
  profilePictureId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  countryId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  phoneCountryId?: number;

  @ApiProperty({ required: false, example: '0171111111' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsInt()
  presentAddressId?: number;

  @IsOptional()
  @IsInt()
  permanentAddressId?: number;

  @ApiProperty({ required: false, example: Gender.Female })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  bloodGroupId?: number;

  @ApiProperty({ required: false, example: 'https://linkedin.com' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiProperty({ required: false, example: 'https://linkedin.com' })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @ApiProperty({ required: false, example: 'https://linkedin.com' })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  remoteOnly?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false, example: '1234' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty({ required: false, example: '1234' })
  @IsOptional()
  @IsString()
  nidNumber?: string;

  @ApiProperty({ required: false, example: 'Anderson' })
  @IsOptional()
  @IsString()
  fathersName?: string;

  @ApiProperty({ required: false, example: 'Sufia' })
  @IsOptional()
  @IsString()
  mothersName?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  maritalStatusId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  religionId?: number;

  @ApiProperty({ required: false, example: '2021-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  resetFirstPassword: boolean = false;

  @ApiProperty({ description: 'Employee Code from the confirmation modal' })
  @IsNotEmpty()
  @IsString()
  employeeCode: string;
}
