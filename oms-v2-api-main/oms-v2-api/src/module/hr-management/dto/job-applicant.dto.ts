import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobApplicant } from '../entities/job-applicant.entity';

export class CreateJobApplicantDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 25 })
  @IsOptional()
  @IsInt()
  jobPostingId: number;

  @IsOptional()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  applicantStatusId?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-08-26T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  appliedAt?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Offer details here',
  })
  @IsOptional()
  @IsString()
  coverLetter?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 60000 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  expectedSalary?: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Initial interview completed',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value : null))
  @IsString()
  notes?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 3 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  candidateRanking?: number | null;
}

export class UpdateJobApplicantDto extends CreateJobApplicantDto {}

export class JobApplicantResponseDto {
  id: number;
  appId?: number | null;
  jobPostingId: number;
  userId: number;
  applicantStatusId: number;
  appliedAt?: string | null;
  coverLetter?: string | null;
  expectedSalary?: number;
  notes?: string | null;
  candidateRanking?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: JobApplicant): JobApplicantResponseDto {
    const dto = new JobApplicantResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobPostingId = entity.jobPostingId;
    dto.userId = entity.userId;
    dto.applicantStatusId = entity.applicantStatusId;
    dto.appliedAt = entity.appliedAt ? entity.appliedAt.toISOString() : null;
    dto.coverLetter = entity.coverLetter ?? null;
    dto.expectedSalary = Number(entity.expectedSalary) ?? null;
    dto.notes = entity.notes ?? null;
    dto.candidateRanking = entity.candidateRanking ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
