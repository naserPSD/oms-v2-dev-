import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobCategory } from '../entitities/job-categories.entity';

export class CreateJobCategoryDto {
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

  @ApiProperty({ required: true, example: 'Engineering' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  isActive: boolean;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  creatorId?: number | null;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  editorId?: number | null;
}

export class UpdateJobCategoryDto extends CreateJobCategoryDto {}

export class JobCategoryResponseDto {
  id: number;
  appId?: number | null;
  name: string;
  isActive: boolean;
  creatorId?: number | null;
  editorId?: number | null;
  createdAt: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;

  static fromEntity(entity: JobCategory): JobCategoryResponseDto {
    const dto = new JobCategoryResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.name = entity.name;
    dto.isActive = entity.isActive;
    dto.creatorId = entity.creatorId ?? null;
    dto.editorId = entity.editorId ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    dto.deletedAt = entity.deletedAt ?? null;
    return dto;
  }
}
