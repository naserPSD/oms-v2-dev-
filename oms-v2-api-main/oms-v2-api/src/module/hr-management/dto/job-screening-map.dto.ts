import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobScreeningMap } from '../entities/job-screenings-map.entity';

export class CreateJobScreeningMapDto {
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

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobPostingId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobScreeningId: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  creatorId?: number;
}

// Update DTO inherits everything
export class UpdateJobScreeningMapDto extends CreateJobScreeningMapDto {}

// Response DTO
export class JobScreeningMapResponseDto {
  id: number;
  appId: number | null;
  jobPostingId: number;
  jobScreeningId: number;
  creatorId: number;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: JobScreeningMap): JobScreeningMapResponseDto {
    const dto = new JobScreeningMapResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.jobPostingId = entity.jobPostingId;
    dto.jobScreeningId = entity.jobScreeningId;
    dto.creatorId = entity.creatorId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
