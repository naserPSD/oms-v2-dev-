import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class CreateJobInterviewersDto {
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
  jobInterviewId: number;

  @ApiProperty({ required: true, example: 'INTV123' })
  @IsString()
  code: string;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  userId?: number;

  @ApiProperty({ required: false, example: 'kabbo@email.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, default: 69 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  interviewerStatusId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString();
  })
  @IsDateString()
  invitationSentAt?: string = new Date().toISOString();

  //@ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Transform(({ value }) => {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString();
  })
  @IsDateString()
  invitationConfirmedAt?: string = new Date().toISOString();

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  creatorId?: number;
}

export class UpdateJobInterviewerDto extends CreateJobInterviewersDto {}

export class JobInterviewerResponseDto {
  id: number;
  jobInterviewId: number;
  code: string;
  userId?: number | null;
  email?: string | null;
  interviewerStatusId: number;
  invitationSentAt?: string | null;
  invitationConfirmedAt?: string | null;
  creatorId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: any): JobInterviewerResponseDto {
    const dto = new JobInterviewerResponseDto();
    dto.id = entity.id;
    dto.jobInterviewId = entity.jobInterviewId;
    dto.code = entity.code;
    dto.userId = entity.userId ?? null;
    dto.email = entity.email ?? null;
    dto.interviewerStatusId = entity.interviewerStatusId;
    dto.invitationSentAt = entity.invitationSentAt?.toISOString() ?? null;
    dto.invitationConfirmedAt =
      entity.invitationConfirmedAt?.toISOString() ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;

    return dto;
  }
}
