import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobApplicantScreening } from '../entities/job-applicant-screening.entity';

export class CreateJobApplicantScreeningDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsInt()
  id: number;

  //@ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 25 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobPostingId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobApplicantId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobScreeningId: number;

  @ApiProperty({ required: false, example: false, default: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === 1 ? true : false))
  @IsBoolean()
  hasInterview?: boolean;

  @IsInt()
  @IsOptional()
  creatorId: number;
}

export class UpdateJobApplicantScreeningDto extends CreateJobApplicantScreeningDto {}

export class JobApplicantScreeningResponseDto {
  id: number;
  appId: number | null;
  jobPostingId: number;
  jobApplicantId: number;
  jobScreeningId: number;
  hasInterview: boolean;
  creatorId: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(
    entity: JobApplicantScreening,
  ): JobApplicantScreeningResponseDto {
    const dto = new JobApplicantScreeningResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobPostingId = entity.jobPostingId;
    dto.jobApplicantId = entity.jobApplicantId;
    dto.jobScreeningId = entity.jobScreeningId;
    dto.hasInterview = !!entity.hasInterview;
    dto.creatorId = entity.creatorId;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
