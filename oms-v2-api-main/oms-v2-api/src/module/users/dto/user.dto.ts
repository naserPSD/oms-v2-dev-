import { Match } from '@common/utils/custom-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserPermission } from '@module/role-permission/entities/user-permission.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { UserCertification } from '@module/users/entities/user-certification.entity';
import { UserEducation } from '@module/users/entities/user-education.entity';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { UserProject } from '@module/users/entities/user-project.entity';
import { UserReference } from '@module/users/entities/user-reference.entity';
import { UserSkill } from '@module/users/entities/user-skill.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UserWorkExperience } from '@module/users/entities/user-work-experience.entity';

export enum UseCase {
  PERSONAL = 'Personal',
  COMPANY = 'Company',
}

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  id?: number;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    uniqueItems: true,
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    uniqueItems: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase()) // Normalize email
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'User password',
  })
  @ValidateIf((o) => !o.id || o.id === 0) // required only if new user
  @IsNotEmpty({ message: 'Password is required for new users' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long, contain one uppercase, one lowercase, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsBoolean()
  resetFirstPassword: boolean = false;

  @ApiPropertyOptional({ example: '12345678' })
  @ValidateIf((o) => !o.id || o.id === 0 || o.password) // required if new OR password is set
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword?: string;

  // @ApiProperty({
  //   example: '+1234567890',
  //   description: 'User phone number',
  //   required: false,
  // })
  // @IsOptional()
  // phone?: string; // Optional field, can be omitted or set as null

  // @ApiProperty()
  // @IsNotEmpty()
  // @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  // countryId: number;

  @ApiProperty({
    example: '+8801638584711',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  phoneCountryId?: number;

  @ApiPropertyOptional({ example: '1638584711' })
  @IsOptional()
  @IsString()
  phoneIdentifier?: string;

  @ApiProperty({
    example: 'Personal',
    description:
      'User application use case (Personal or Company). This field is only used in Admin Panel',
    required: false,
    enum: UseCase,
  })
  @IsOptional()
  appUseCase?: UseCase;

  //profile_completed dto
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsBoolean()
  profileCompleted?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  activeAppId?: number;

  @ApiProperty({
    description: 'List of role IDs assigned to the user',
    example: [1, 2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => (value !== undefined ? value.map(Number) : value))
  roleIds?: number[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  emailVerifiedAt: Date | null;

  @ApiPropertyOptional()
  rememberToken: string | null;

  @ApiPropertyOptional()
  lastTimezone: string | null;

  @ApiPropertyOptional({ enum: ['Personal', 'Company'] })
  appUseCase: string;

  @ApiPropertyOptional()
  activeAppId: number | null;

  @ApiProperty()
  isActive: boolean | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  createdAt: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  updatedAt: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  deletedAt: Date | null;

  @ApiPropertyOptional({ type: () => UserProfile })
  profile: UserProfile | null;

  @ApiPropertyOptional({ type: () => [UserRole] })
  userRoles?: UserRole[] | null;

  @ApiPropertyOptional({ type: () => [UserPermission] })
  userPermissions?: UserPermission[];

  @ApiProperty()
  fullName: string | null;

  @ApiPropertyOptional()
  languageProficiencies?: any;

  @ApiPropertyOptional()
  userContactInfo?: any | null;

  @ApiPropertyOptional({ type: () => [UserWorkExperience] })
  userWorkExperiences?: UserWorkExperience[] | null;

  @ApiPropertyOptional({ type: () => [UserEducation] })
  educations?: UserEducation[] | null;

  @ApiPropertyOptional({ type: () => [UserSkill] })
  skills?: UserSkill[] | null;

  @ApiPropertyOptional({ type: () => [UserCertification] })
  certifications?: UserCertification[] | null;

  @ApiPropertyOptional({ type: () => [UserProject] })
  projects?: UserProject[] | null;

  @ApiPropertyOptional({ type: () => [UserTraining] })
  trainings?: UserTraining[] | null;

  @ApiPropertyOptional({ type: () => [UserReference] })
  references?: UserReference[] | null;
}
