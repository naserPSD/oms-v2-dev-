import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum InterviewStatus {
  PENDING = 'Pending',
  UNATTENDED = 'Unattended',
  COMPLETED = 'Completed',
}

export class CreateJobApplicantInterviewerDto {
  @ApiProperty({
    description: 'The ID of the Job Interview Schedule',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  jobInterviewScheduleId?: number;

  @ApiProperty({ description: 'The ID of the Job Applicant' })
  @IsNotEmpty()
  @IsNumber()
  jobApplicantId: number;

  @ApiProperty({ description: 'The ID of the Job Vacancy' })
  @IsNotEmpty()
  @IsNumber()
  jobVacancyId: number;

  @ApiProperty({ description: 'The ID of the Employee (Interviewer)' })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    description: 'The status of the interview',
    enum: InterviewStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InterviewStatus)
  interviewStatus?: 'Pending' | 'Unattended' | 'Completed';

  @ApiProperty({ description: 'URL for the interview panels', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  interviewPanelsUrl?: string;

  @ApiProperty({ description: 'Remarks from the interviewer', required: false })
  @IsOptional()
  @IsString()
  interviewRemarks?: string;
}

export class UpdateJobApplicantInterviewerDto extends PartialType(
  CreateJobApplicantInterviewerDto,
) {
  @ApiProperty({
    description: 'The ID of the applicant interviewer record',
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
