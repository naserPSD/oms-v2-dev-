import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDate,
  IsUrl,
  MaxLength,
  IsPhoneNumber,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserLanguageProficiencyDto } from './create-user-language-proficiency.dto';

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Other = 'Other',
}

export class UpdateUserPersonalInfoDto {
  @ApiPropertyOptional({
    description: 'User first name',
    type: String,
    example: 'John',
    maxLength: 255,
  })
  @IsOptional()
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    type: String,
    example: 'Doe',
    maxLength: 255,
  })
  @IsOptional()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'fathersName of the user',
    type: String,
    example: 'Doe',
    maxLength: 255,
  })
  @IsOptional()
  @MaxLength(255)
  fathersName?: string;

  @ApiPropertyOptional({
    description: 'mothersName  of the user',
    type: String,
    example: 'Doe',
    maxLength: 255,
  })
  @IsOptional()
  @MaxLength(255)
  mothersName?: string;

  @ApiPropertyOptional({
    description: 'dateOfBirth of the user',
    type: String,
    example: '1990-01-01',
    maxLength: 255,
  })
  @IsOptional()
  @MaxLength(255)
  dateOfBirth?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined || value === 'null'
      ? null
      : Number(value),
  )
  @IsInt()
  maritalStatusId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined || value === 'null'
      ? null
      : Number(value),
  )
  @IsInt()
  religionId?: number;

  @ApiPropertyOptional({
    description: 'ID of the profile picture',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  profilePictureId?: number;

  @ApiPropertyOptional({
    description: 'Country ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined || value === 'null'
      ? null
      : Number(value),
  )
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({
    description: 'Country ID for phone number',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  phoneCountryId?: number;

  @ApiPropertyOptional({
    description: 'Phone number',
    type: String,
    example: '+1234567890',
    maxLength: 16,
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Present address ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  presentAddressId?: number;

  @ApiPropertyOptional({
    description: 'Permanent address ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  permanentAddressId?: number;

  @ApiPropertyOptional({
    description: 'Religion',
    type: String,
    example: 'Christianity',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  religion?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.Male,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Marital status',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isMarried?: boolean;

  @ApiPropertyOptional({
    description: 'Passport number',
    type: String,
    example: 'A12345678',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  passportNumber?: string;

  @ApiPropertyOptional({
    description: 'National ID number',
    type: String,
    example: '1990123456789',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  nidNumber?: string;

  @ApiPropertyOptional({
    description: 'Blood group ID',
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined || value === 'null'
      ? null
      : Number(value),
  )
  @IsInt()
  bloodGroupId?: number;

  @ApiPropertyOptional({
    description: 'Date of birth',
    type: Date,
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    type: String,
    example: 'https://linkedin.com/in/username',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Portfolio URL',
    type: String,
    example: 'https://portfolio.example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  portfolioUrl?: string;

  @ApiPropertyOptional({
    description: 'GitHub profile URL',
    type: String,
    example: 'https://github.com/username',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  githubUrl?: string;

  @ApiPropertyOptional({
    description: 'Willingness to relocate',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  willingToRelocate?: boolean;

  @ApiPropertyOptional({
    description: 'Remote work preference',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  remoteOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Profile visibility status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'List of language proficiencies',
    type: [CreateUserLanguageProficiencyDto],
    example: [
      {
        languageId: 1,
        speakingLevelId: 1,
        readingLevelId: 1,
        writingLevelId: 1,
      },
      {
        languageId: 2,
        speakingLevelId: 1,
        readingLevelId: 1,
        writingLevelId: 1,
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateUserLanguageProficiencyDto)
  userLanguageProficiencies?: CreateUserLanguageProficiencyDto[];
}

export class UpdateEmployeeBasicInfoDto {
  @ApiPropertyOptional({
    description: 'First name of the employee',
    example: 'Adam',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the employee',
    example: 'Robertson',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({
    description: "Father's name",
    example: 'Mr. Robertson',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fathersName?: string;

  @ApiPropertyOptional({
    description: "Mother's name",
    example: 'Mrs. Robertson',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mothersName?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (YYYY-MM-DD)',
    example: '1995-02-10',
  })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: '1234567890',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nidNumber?: string;

  @ApiPropertyOptional({
    description: 'Passport number',
    example: 'A12345678',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  passportNumber?: string;

  @ApiPropertyOptional({
    description: 'Nationality (Country ID)',
    example: 18,
  })
  @IsOptional()
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['Female', 'Male', 'Other'],
    example: 'Male',
  })
  @IsOptional()
  @IsEnum(['Female', 'Male', 'Other'])
  gender?: 'Female' | 'Male' | 'Other';

  @ApiPropertyOptional({
    description: 'Religion ID',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  religionId?: number;

  @ApiPropertyOptional({
    description: 'Blood group ID',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  bloodGroupId?: number;

  @ApiPropertyOptional({
    description: 'Marital status ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  maritalStatusId?: number;
}
