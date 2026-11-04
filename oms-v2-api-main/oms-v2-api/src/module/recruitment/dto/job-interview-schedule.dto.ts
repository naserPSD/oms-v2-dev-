import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateJobInterviewScheduleDto {
  @ApiProperty({
    description:
      'The ID of the Job Interview Schedule (Provide for update, omit for create)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'The ID of the Job Vacancy' })
  @IsNotEmpty()
  @IsNumber()
  jobVacancyId: number;

  @ApiProperty({ description: 'The ID of the Job Applicant' })
  @IsNotEmpty()
  @IsNumber()
  jobApplicantId: number;

  @ApiProperty({
    description: 'Array of Job Interviewer IDs acting as Interviewers',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  interviewerIds: number[];

  @ApiProperty({ description: 'Scheduled Date and Time', required: false })
  @IsOptional()
  @IsString()
  scheduleDatetime?: string;

  @ApiProperty({
    description: 'Location Type',
    enum: ['Office', 'Online'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Office', 'Online'])
  locationType?: 'Office' | 'Online';

  @ApiProperty({
    description: 'Office ID if location is Office',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  officeId?: number;

  @ApiProperty({
    description: 'Meeting URL if location is Online',
    required: false,
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({
    description: 'Indicates if the interview has been completed',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  interviewCompleted?: boolean;
}

export class UpdateJobInterviewScheduleDto extends PartialType(
  CreateJobInterviewScheduleDto,
) {}
