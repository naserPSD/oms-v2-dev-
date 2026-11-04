import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateJobApplicantDto {
  @ApiProperty({
    description:
      'The ID of the job applicant (Provide for update, omit for create)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'The ID of the job vacancy' })
  @IsNotEmpty()
  @IsNumber()
  jobVacancyId: number;

  @ApiProperty({ description: 'First name of the applicant' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the applicant' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the applicant' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the applicant',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Phone country ID', required: false })
  @IsOptional()
  @IsNumber()
  phoneCountryId?: number;

  @ApiProperty({
    description: 'The ID of the recruitment step',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  jobRecruitmentStepNameId?: number;

  @ApiProperty({ description: 'The ID of the office', required: false })
  @IsOptional()
  @IsNumber()
  officeId?: number;

  @ApiProperty({
    description: 'The ID of the employee (if internal)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiProperty({
    description: 'The ID of the interview schedule',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  jobInterviewScheduleId?: number;

  @ApiProperty({
    description: 'Overall interview rating',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  interviewRating?: number;

  @ApiProperty({
    description: 'Summary/Notes about the applicant',
    required: false,
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'The ID of the CV media file', required: false })
  @IsOptional()
  @IsNumber()
  cvMediaId?: number;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  cvFile?: Express.Multer.File;

  @ApiProperty({
    description: 'Expected salary of the applicant',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;
}

export class ChangeJobRecruitmentStepStatusDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  jobRecruitmentStepNameId: number;
}

export class UpdateJobApplicantDto extends PartialType(CreateJobApplicantDto) {}

export class ConfirmRecruitmentDto {
  @ApiProperty({ description: 'The ID of the job applicant to be hired' })
  @IsNotEmpty()
  @IsNumber()
  applicantId: number;

  @ApiProperty({ description: 'Employee Monthly Salary' })
  @IsNotEmpty()
  @IsNumber()
  currentBasicSalary: number;

  @ApiProperty({ description: 'Employee Code from the confirmation modal' })
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @ApiProperty({ description: 'Selected Designation ID' })
  @IsNotEmpty()
  @IsNumber()
  designationId: number;

  @ApiProperty({ description: 'Selected Office ID' })
  @IsNotEmpty()
  @IsNumber()
  officeId: number;

  @ApiProperty({ description: 'Joining Date' })
  @IsNotEmpty()
  @IsDateString()
  joiningDate: string;
}
