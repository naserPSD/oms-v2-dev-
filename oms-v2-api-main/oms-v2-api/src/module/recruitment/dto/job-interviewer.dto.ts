import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateJobInterviewerDto {
  @ApiProperty({ description: 'The ID of the job vacancy' })
  @IsNotEmpty()
  @IsNumber()
  jobVacancyId: number;

  @ApiProperty({
    description: 'The ID of the employee acting as the interviewer',
  })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;
}

export class UpdateJobInterviewerDto extends PartialType(
  CreateJobInterviewerDto,
) {
  @ApiProperty({ description: 'The ID of the job interviewer record' })
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}

export class SyncJobInterviewersDto {
  @ApiProperty({ description: 'The ID of the job vacancy', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  jobVacancyId: number;

  @ApiProperty({
    description:
      'The final array of Employee IDs to be assigned as interviewers',
    type: [Number],
    example: [10, 12, 15],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  employeeIds: number[];
}
