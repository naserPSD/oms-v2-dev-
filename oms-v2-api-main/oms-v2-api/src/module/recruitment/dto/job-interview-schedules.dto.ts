import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobInterviewSchedule } from '../entitities/job-interview-schedules.entity';

export class CreateJobInterviewScheduleDto {
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

  @ApiProperty({ example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobVacancyId: number;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobApplicantId: number;

  @ApiProperty({ example: '2026-03-20T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  scheduleDatetime?: string | null;

  @ApiProperty({ example: 'Office' })
  @IsOptional()
  @IsEnum(['Office', 'Online'])
  locationType?: 'Office' | 'Online' | null;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  officeId?: number | null;

  @ApiProperty({ example: 'https://meet.google.com/abc' })
  @IsOptional()
  @IsString()
  url?: string | null;

  @ApiProperty({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  interviewCompleted?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  weightSubjects?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  totalWeight?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  totalInterviewer?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  totalWeightMark?: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  creatorId?: number | null;
}

export class UpdateJobInterviewScheduleDto extends CreateJobInterviewScheduleDto {}

export class JobInterviewScheduleResponseDto {
  id: number;
  appId?: number | null;
  jobVacancyId: number;
  jobApplicantId: number;
  scheduleDatetime?: Date | null;
  locationType?: 'Office' | 'Online' | null;
  officeId?: number | null;
  url?: string | null;
  interviewCompleted: boolean;
  weightSubjects: number;
  totalWeight: number;
  totalInterviewer: number;
  totalWeightMark: number;
  creatorId?: number | null;
  createdAt: Date | null;
  updatedAt?: Date | null;

  static fromEntity(
    entity: JobInterviewSchedule,
  ): JobInterviewScheduleResponseDto {
    const dto = new JobInterviewScheduleResponseDto();

    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobVacancyId = entity.jobVacancyId;
    dto.jobApplicantId = entity.jobApplicantId;
    dto.scheduleDatetime = entity.scheduleDatetime ?? null;
    dto.locationType = entity.locationType ?? null;
    dto.officeId = entity.officeId ?? null;
    dto.url = entity.url ?? null;
    dto.interviewCompleted = entity.interviewCompleted;
    dto.weightSubjects = entity.weightSubjects;
    dto.totalWeight = entity.totalWeight;
    dto.totalInterviewer = entity.totalInterviewer;
    dto.totalWeightMark = entity.totalWeightMark;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
