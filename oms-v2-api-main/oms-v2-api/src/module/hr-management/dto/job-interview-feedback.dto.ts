import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobInterviewFeedback } from '../entities/job-interview-feedback.entity';

export class CreateJobInterviewFeedbackDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  id: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  appId?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  jobInterviewId: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  applicantId: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  jobInterviewerId?: number;

  @ApiProperty({
    required: false,
    example: 8.5,
    description: 'Max rating 10.00',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === 'null' ? null : parseFloat(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  overallRating?: number | null;

  @ApiProperty({ required: false, example: 72 })
  @IsOptional()
  interviewerDecisionId?: number;

  @ApiProperty({ required: false, example: 'Strong communication' })
  @IsOptional()
  @IsString()
  strengths?: string | null;

  @ApiProperty({ required: false, example: 'Needs to improve technical depth' })
  @IsOptional()
  @IsString()
  improvementAreas?: string | null;

  @ApiProperty({ required: false, example: 'Candidate might not fit culture' })
  @IsOptional()
  @IsString()
  confidentialNotes?: string | null;

  @IsOptional()
  submittedAt?: Date | null;
}

export class UpdateJobInterviewFeedbackDto extends CreateJobInterviewFeedbackDto {}

export class JobInterviewFeedbackResponseDto {
  id: number;
  appId?: number | null;
  jobInterviewId: number;
  applicantId: number;
  jobInterviewerId?: number | null;
  overallRating?: number | null;
  interviewerDecisionId: number;
  strengths?: string | null;
  improvementAreas?: string | null;
  confidentialNotes?: string | null;
  submittedAt?: Date | null;
  creatorId: number;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(
    entity: JobInterviewFeedback,
  ): JobInterviewFeedbackResponseDto {
    const dto = new JobInterviewFeedbackResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobInterviewId = entity.jobInterviewId;
    dto.applicantId = entity.applicantId;
    dto.jobInterviewerId = entity.jobInterviewerId ?? null;
    dto.overallRating = entity.overallRating ?? null;
    dto.interviewerDecisionId = entity.interviewerDecisionId ?? 72;
    dto.strengths = entity.strengths ?? null;
    dto.improvementAreas = entity.improvementAreas ?? null;
    dto.confidentialNotes = entity.confidentialNotes ?? null;
    dto.submittedAt = entity.submittedAt ?? null;
    dto.createdAt = entity.createdAt ?? new Date();
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
