import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateApplicantRemarkDto {
  @ApiProperty({ description: 'Remark ID (for update)', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'The ID of the Job Applicant (entity_id)' })
  @IsNotEmpty()
  @IsNumber()
  applicantId: number;

  @ApiProperty({ description: 'The text content of the remark' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
