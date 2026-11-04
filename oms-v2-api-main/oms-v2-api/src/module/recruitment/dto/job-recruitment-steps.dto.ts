import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobRecruitmentStep } from '../entitities/job-recruitment-steps.entity';

export class CreateJobRecruitmentStepDto {
  @ApiProperty({ required: true })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  jobVacancyId?: number | null;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  stepId?: number | null;
}

export class SaveJobRecruitmentStepsDto {
  @ApiProperty({ example: 33 })
  @IsInt()
  @Type(() => Number)
  jobVacancyId: number;

  @ApiProperty({ example: [1, 2, 3, 4], required: false })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  jobRecruitmentStepIds?: number[];
}

export class UpdateJobRecruitmentStepDto extends CreateJobRecruitmentStepDto {}

export class JobRecruitmentStepResponseDto {
  id: number;
  jobVacancyId?: number | null;
  stepId?: number | null;

  static fromEntity(entity: JobRecruitmentStep): JobRecruitmentStepResponseDto {
    const dto = new JobRecruitmentStepResponseDto();

    dto.id = entity.id;
    dto.jobVacancyId = entity.jobVacancyId ?? null;
    dto.stepId = entity.stepId ?? null;

    return dto;
  }
}
