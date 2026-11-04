import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobRecruitmentStepName } from '../entitities/job-recruitment-step-names.entity';

export class CreateJobRecruitmentStepNameDto {
  @ApiProperty({ required: false, default: 0 })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value) || value === 'null'
      ? null
      : Number(value),
  )
  @IsOptional()
  @IsInt()
  id?: number | null;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  @IsOptional()
  appId?: number | null;

  @ApiProperty({ required: false, example: 'Interview Round' })
  @IsOptional()
  @IsString()
  name?: string | null;
}

export class UpdateJobRecruitmentStepNameDto extends CreateJobRecruitmentStepNameDto {}

export class JobRecruitmentStepNameResponseDto {
  id: number;
  appId?: number | null;
  name?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  static fromEntity(
    entity: JobRecruitmentStepName,
  ): JobRecruitmentStepNameResponseDto {
    const dto = new JobRecruitmentStepNameResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.name = entity.name ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.deletedAt = entity.deletedAt ?? null;
    return dto;
  }
}
