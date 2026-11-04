import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJobWeightDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  jobVacancyId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  weightName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weightValue?: number;
}

export class UpdateJobWeightDto extends PartialType(CreateJobWeightDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}

export class WeightMarkingDto {
  @ApiProperty({
    description: 'The Primary ID of the job_interview_weights row',
  })
  @IsNotEmpty()
  @IsNumber()
  jobInterviewWeightId: number;

  @ApiProperty({
    description: 'The score given by the interviewer for this specific weight',
  })
  @IsNotEmpty()
  @IsNumber()
  weightMarking: number;
}

export class SubmitInterviewMarksDto {
  @ApiProperty({ description: 'The ID of the Job Interview Schedule' })
  @IsNotEmpty()
  @IsNumber()
  jobInterviewScheduleId: number;

  @ApiProperty({
    description: 'The ID of the Job Interviewer (from job_interviewers table)',
  })
  @IsNotEmpty()
  @IsNumber()
  jobInterviewerId: number;

  @ApiProperty({
    type: [WeightMarkingDto],
    description: 'Array of scores for each weight',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightMarkingDto)
  markings: WeightMarkingDto[];
}
