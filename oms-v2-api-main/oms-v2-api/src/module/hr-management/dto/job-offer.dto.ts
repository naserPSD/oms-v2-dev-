import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobOffer } from '../entities/job-offer.entity';

export class CreateJobOfferDto {
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
    isNaN(value) || value === 'null' || value === null ? 1 : Number(value),
  )
  @IsInt()
  jobPostingId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 1 : Number(value),
  )
  @IsInt()
  jobApplicantId: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 0 : Number(value),
  )
  @IsNumber()
  salaryOffered?: number;

  @ApiProperty({ required: false, example: 'Offer details here' })
  @IsString()
  offerDescriptions: string;

  @ApiProperty({ required: false, nullable: true, example: '12.12.2026' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  joiningDate?: string | null;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 1 : Number(value),
  )
  @IsInt()
  offerStatusId: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  offerSentAt?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  offerDeadline?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value || typeof value === 'object') return null;
    return new Date(value).toISOString();
  })
  @IsDateString()
  joinedAt?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? null : Number(value),
  )
  @IsInt()
  empId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? null : Number(value),
  )
  @IsInt()
  creatorId?: number | null;
}

export class UpdateJobOfferDto extends CreateJobOfferDto {}

// Response DTO
export class JobOfferResponseDto {
  id: number;
  appId?: number | null;
  jobPostingId: number;
  jobApplicantId: number;
  salaryOffered: number;
  offerDescriptions: string;
  joiningDate?: string | null;
  offerStatusId: number;
  offerSentAt?: string | null;
  offerDeadline?: string | null;
  joinedAt?: string | null;
  empId?: number | null;
  creatorId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: JobOffer): JobOfferResponseDto {
    const dto = new JobOfferResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobPostingId = entity.jobPostingId;
    dto.jobApplicantId = entity.jobApplicantId;
    dto.salaryOffered = Number(entity.salaryOffered);
    dto.offerDescriptions = entity.offerDescriptions;
    dto.joiningDate = entity.joiningDate?.toISOString() ?? null;
    dto.offerStatusId = entity.offerStatusId;
    dto.offerSentAt = entity.offerSentAt?.toISOString() ?? null;
    dto.offerDeadline = entity.offerDeadline?.toISOString() ?? null;
    dto.joinedAt = entity.joinedAt?.toISOString() ?? null;
    dto.empId = entity.empId ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
