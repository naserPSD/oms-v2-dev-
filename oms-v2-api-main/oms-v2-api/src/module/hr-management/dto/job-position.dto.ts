import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { JobPosition } from '../entities/job-position.entity';

export class CreateJobPositionDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  designationId: number;

  @ApiProperty({ required: true, example: 'Backend Developer' })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Develop and maintain server-side applications.',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'NestJS, TypeORM, PostgreSQL, REST APIs',
  })
  @IsOptional()
  @IsString()
  requirements?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Flexible hours, Remote work, Health insurance',
  })
  @IsOptional()
  @IsString()
  benefits?: string | null;

  @ApiProperty({ required: false, example: '3+ years' })
  @IsString()
  @IsOptional()
  experience?: string | null;

  @ApiProperty({ required: true, example: 54 })
  @Type(() => Number)
  @IsInt()
  employmentTypeId: number;

  @ApiProperty({ required: false, example: 58 })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? undefined : Number(value),
  )
  @IsInt()
  workModelId?: number;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === 'null' ? 0 : Number(value),
  )
  @IsNumber()
  salaryRangeMin?: number;

  @ApiProperty({ required: false, example: 80000 })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null ? 0 : Number(value),
  )
  @IsNumber()
  salaryRangeMax?: number;

  @ApiProperty({
    required: false,
    example: 'Melbourne, Australia',
  })
  @IsString()
  @IsOptional()
  location?: string | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'null' || value === null || value === '' ? null : Number(value),
  )
  @IsInt()
  creatorId?: number | null;
}

export class UpdateJobPositionDto extends CreateJobPositionDto {}

export class JobPositionResponseDto {
  id: number;
  appId?: number | null;
  designationId: number;
  name: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  experience?: string | null;
  employmentTypeId: number;
  workModelId: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  location?: string | null;
  active: boolean;
  creatorId?: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: JobPosition): JobPositionResponseDto {
    const dto = new JobPositionResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.designationId = entity.designationId;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.requirements = entity.requirements ?? null;
    dto.benefits = entity.benefits ?? null;
    dto.experience = entity.experience ?? null;
    dto.employmentTypeId = entity.employmentTypeId;
    dto.workModelId = entity.workModelId;
    dto.salaryRangeMin = Number(entity.salaryRangeMin);
    dto.salaryRangeMax = Number(entity.salaryRangeMax);
    dto.location = entity.location ?? null;
    dto.active = entity.active;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
