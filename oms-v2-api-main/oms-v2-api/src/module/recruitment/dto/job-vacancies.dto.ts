import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobVacancy } from '../entitities/job-vacancies.entity';

export class CreateJobVacancyDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  officeId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  shiftId?: number | null;

  @ApiProperty({ required: false, example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  jobTitle?: string | null;

  @ApiProperty({ required: false, example: 3 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  noOfVacancies?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  jobCategoryId?: number | null;

  @ApiProperty({ required: false, example: 54 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  employmentStatusId?: number | null;

  @ApiProperty({ required: false, example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  resumeReceivingOption?: number | null;

  @ApiProperty({ required: false, example: 'Please submit updated resume' })
  @IsOptional()
  @IsString()
  specialInstruction?: string | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  requiredPhoto?: boolean | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  preferVideoResume?: boolean | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  jobLevel?: number | null;

  @ApiProperty({ required: false, example: 'Job context details' })
  @IsOptional()
  @IsString()
  jobContext?: string | null;

  @ApiProperty({ required: false, example: 'Job responsibilities details' })
  @IsOptional()
  @IsString()
  jobResponsibilities?: string | null;

  @ApiProperty({ required: false, example: 'Work from home' })
  @IsOptional()
  @IsString()
  workplace?: string | null;

  @ApiProperty({ required: false, example: '10000.00' })
  @IsOptional()
  @IsNumberString()
  minSalary?: string;

  @ApiProperty({ required: false, example: '20000.00' })
  @IsOptional()
  @IsNumberString()
  maxSalary?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  showSalaryRange?: boolean | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  salaryNegotiable?: boolean | null;

  @ApiProperty({ required: false, example: 'Festival bonus included' })
  @IsOptional()
  @IsString()
  additionalSalaryInfo?: string | null;

  @ApiProperty({ required: false, example: 'BUET, DU' })
  @IsOptional()
  @IsString()
  preferredEduInstitute?: string | null;

  @ApiProperty({ required: false, example: 'BSc in CSE' })
  @IsOptional()
  @IsString()
  othersEduQualification?: string | null;

  @ApiProperty({ required: false, example: 'Project Management' })
  @IsOptional()
  @IsString()
  trainingAndTradeCourse?: string | null;

  @ApiProperty({ required: false, example: 'PMP' })
  @IsOptional()
  @IsString()
  professionalCertification?: string | null;

  @ApiProperty({ required: false, example: 'Software industry' })
  @IsOptional()
  @IsString()
  areaOfExperience?: string | null;

  @ApiProperty({ required: false, example: 'Strong communication skill' })
  @IsOptional()
  @IsString()
  additionalRequirement?: string | null;

  @ApiProperty({ required: false, example: 'Node.js, NestJS, MySQL' })
  @IsOptional()
  @IsString()
  skills?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  minYearExperience?: number | null;

  @ApiProperty({ required: false, example: 5 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  maxYearExperience?: number | null;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @IsString()
  isApplyFresher?: string | null;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Transform(({ value }) => value?.toString())
  @IsString()
  experienceRequired?: string | null;

  @ApiProperty({ required: false, example: 'Male' })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Female and Male'])
  gender?: 'Male' | 'Female' | 'Female and Male' | null;

  @ApiProperty({ required: false, example: 22 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  minAge?: number | null;

  @ApiProperty({ required: false, example: 35 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  maxAge?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  saveStep?: number | null;
}

export class JobVacancyListResponseDto {
  @ApiProperty({ type: [JobVacancy] })
  data: JobVacancy[];

  @ApiProperty()
  totalApplicants: number;

  @ApiProperty({ type: Object })
  pagination: any;
}

export class UpdateJobVacancyDto extends CreateJobVacancyDto {}

export class JobVacancyResponseDto {
  id: number;
  appId?: number | null;
  officeId?: number | null;
  shiftId?: number | null;
  jobTitle?: string | null;
  noOfVacancies?: number | null;
  jobCategoryId?: number | null;
  employmentStatusId?: number | null;
  applicationDeadline?: Date | null;
  resumeReceivingOption?: number | null;
  specialInstruction?: string | null;
  requiredPhoto?: boolean | null;
  preferVideoResume?: boolean | null;
  jobLevel?: number | null;
  jobContext?: string | null;
  jobResponsibilities?: string | null;
  workplace?: string | null;
  minSalary: string;
  maxSalary: string;
  showSalaryRange?: boolean | null;
  salaryNegotiable?: boolean | null;
  additionalSalaryInfo?: string | null;
  preferredEduInstitute?: string | null;
  othersEduQualification?: string | null;
  trainingAndTradeCourse?: string | null;
  professionalCertification?: string | null;
  areaOfExperience?: string | null;
  additionalRequirement?: string | null;
  skills?: string | null;
  minYearExperience?: number | null;
  maxYearExperience?: number | null;
  isApplyFresher?: string | null;
  experienceRequired?: string | null;
  gender?: 'Male' | 'Female' | 'Female and Male' | null;
  minAge?: number | null;
  maxAge?: number | null;
  saveStep?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  static fromEntity(entity: JobVacancy): JobVacancyResponseDto {
    const dto = new JobVacancyResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.officeId = entity.officeId ?? null;
    dto.shiftId = entity.shiftId ?? null;
    dto.jobTitle = entity.jobTitle ?? null;
    dto.noOfVacancies = entity.noOfVacancies ?? null;
    dto.jobCategoryId = entity.jobCategoryId ?? null;
    dto.employmentStatusId = entity.employmentStatusId ?? null;
    dto.applicationDeadline = entity.applicationDeadline ?? null;
    dto.resumeReceivingOption = entity.resumeReceivingOption ?? null;
    dto.specialInstruction = entity.specialInstruction ?? null;
    dto.requiredPhoto = entity.requiredPhoto ?? null;
    dto.preferVideoResume = entity.preferVideoResume ?? null;
    dto.jobLevel = entity.jobLevel ?? null;
    dto.jobContext = entity.jobContext ?? null;
    dto.jobResponsibilities = entity.jobResponsibilities ?? null;
    dto.workplace = entity.workplace ?? null;
    dto.minSalary = entity.minSalary;
    dto.maxSalary = entity.maxSalary;
    dto.showSalaryRange = entity.showSalaryRange ?? null;
    dto.salaryNegotiable = entity.salaryNegotiable ?? null;
    dto.additionalSalaryInfo = entity.additionalSalaryInfo ?? null;
    dto.preferredEduInstitute = entity.preferredEduInstitute ?? null;
    dto.othersEduQualification = entity.othersEduQualification ?? null;
    dto.trainingAndTradeCourse = entity.trainingAndTradeCourse ?? null;
    dto.professionalCertification = entity.professionalCertification ?? null;
    dto.areaOfExperience = entity.areaOfExperience ?? null;
    dto.additionalRequirement = entity.additionalRequirement ?? null;
    dto.skills = entity.skills ?? null;
    dto.minYearExperience = entity.minYearExperience ?? null;
    dto.maxYearExperience = entity.maxYearExperience ?? null;
    dto.isApplyFresher = entity.isApplyFresher ?? null;
    dto.experienceRequired = entity.experienceRequired ?? null;
    dto.gender = entity.gender ?? null;
    dto.minAge = entity.minAge ?? null;
    dto.maxAge = entity.maxAge ?? null;
    dto.saveStep = entity.saveStep ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.deletedAt = entity.deletedAt ?? null;
    return dto;
  }
}
