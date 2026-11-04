import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobScreening } from '../entities/job-screenings.entity';

export class CreateJobScreeningDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 'Initial Screening' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateJobScreeningDto extends CreateJobScreeningDto {}

export class JobScreeningResponseDto {
  id: number;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: JobScreening): JobScreeningResponseDto {
    const dto = new JobScreeningResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.active = entity.active;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
