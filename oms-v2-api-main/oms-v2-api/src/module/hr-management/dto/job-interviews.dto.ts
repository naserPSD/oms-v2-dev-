import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobInterview } from '../entities/job-interviews.entity';
import { Optional } from '@nestjs/common';
import { number } from 'zod';

export class CreateJobInterviewDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 0 : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobApplicantScreeningId: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobApplicantId: number;

  @ApiProperty({
    required: false,
    nullable: true,
    default: new Date().toISOString(),
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString() : new Date().toISOString(),
  )
  @IsDateString()
  startTime?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    default: new Date().toISOString(),
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString() : new Date().toISOString(),
  )
  @IsDateString()
  endTime?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  interviewStatusId: number;

  @ApiProperty({ required: false, nullable: true, default: 'No meeting link' })
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === 'string' ? value : 'No meeting link',
  )
  @IsString()
  meetingLink?: string | null;

  @ApiProperty({ required: false, nullable: true, default: 'Not specified' })
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === 'string' ? value : 'Not specified',
  )
  @IsString()
  location?: string | null;

  @ApiProperty({ required: false, nullable: true, default: 'No notes' })
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === 'string' ? value : 'No notes',
  )
  @IsString()
  notes?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    default: new Date().toISOString(),
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString() : new Date().toISOString(),
  )
  @IsDateString()
  invitationSentAt?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    default: new Date().toISOString(),
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString() : new Date().toISOString(),
  )
  @IsDateString()
  invitationConfirmedAt?: string | null;

  @IsOptional()
  @IsInt()
  creatorId?: number;
}

export class UpdateJobInterviewDto extends CreateJobInterviewDto {}

// Response DTO
export class JobInterviewResponseDto {
  id: number;
  appId: number | null;
  jobApplicantScreeningId: number;
  jobApplicantId: number;
  startTime?: string | null;
  endTime?: string | null;
  interviewStatusId: number;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
  invitationSentAt?: string | null;
  invitationConfirmedAt?: string | null;
  creatorId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: JobInterview): JobInterviewResponseDto {
    const dto = new JobInterviewResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobApplicantScreeningId = entity.jobApplicantScreeningId;
    dto.jobApplicantId = entity.jobApplicantId;
    dto.startTime = entity.startTime?.toISOString() ?? null;
    dto.endTime = entity.endTime?.toISOString() ?? null;
    dto.interviewStatusId = entity.interviewStatusId;
    dto.meetingLink = entity.meetingLink ?? null;
    dto.location = entity.location ?? null;
    dto.notes = entity.notes ?? null;
    dto.invitationSentAt = entity.invitationSentAt?.toISOString() ?? null;
    dto.invitationConfirmedAt =
      entity.invitationConfirmedAt?.toISOString() ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
