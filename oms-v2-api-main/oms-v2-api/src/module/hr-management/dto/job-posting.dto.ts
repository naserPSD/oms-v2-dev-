import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobPosting } from '../entities/job-posting.entity';

export class CreateJobPostingDto {
  @ApiProperty({ required: true, example: 0 })
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

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobPositionId: number;

  @ApiProperty({ required: true })
  @IsString()
  code: string;

  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? 0 : Number(value),
  )
  @IsInt()
  @Min(0)
  jobVacancy: number;

  @ApiProperty({ required: false, default: 61 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  postingStatusId?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-09-17T06:46:13Z',
  })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-09-17T06:46:13Z',
  })
  @IsOptional()
  @IsDateString()
  closeDate?: string;

  @IsOptional()
  @IsInt()
  applicantsCount?: number;
}

export class UpdateJobPostingDto extends CreateJobPostingDto {}

export class JobPostingResponseDto {
  id: number;
  appId: number | null;
  jobPositionId: number;
  code: string;
  jobVacancy: number;
  postingStatusId: number;
  publishDate?: Date | null;
  closeDate?: Date | null;
  applicantsCount: number;
  viewsCount: number;
  publishedBy?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: JobPosting): JobPostingResponseDto {
    const dto = new JobPostingResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobPositionId = entity.jobPositionId;
    dto.code = entity.code;
    dto.jobVacancy = entity.jobVacancy;
    dto.postingStatusId = entity.postingStatusId;
    dto.publishDate = entity.publishDate ?? null;
    dto.closeDate = entity.closeDate ?? null;
    dto.applicantsCount = entity.applicantsCount;
    dto.viewsCount = entity.viewsCount;
    dto.publishedBy = entity.publishedBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
