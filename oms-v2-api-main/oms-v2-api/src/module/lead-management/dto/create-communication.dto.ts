import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunicationDto {
  @ApiProperty({
    description: 'Communication type (Call, Appointment, Task)',
    enum: ['Call', 'Appointment', 'Task'],
  })
  @IsString()
  @IsEnum(['Call', 'Appointment', 'Task'])
  type: string;

  @ApiProperty({ description: 'Communication description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Activity date and time' })
  @IsDateString(
    {},
    { message: 'activityDate must be a valid ISO 8601 date string' },
  )
  activityDate: string;

  @ApiPropertyOptional({
    description: 'Communication status',
    enum: ['pending', 'in_process', 'done'],
    default: 'pending',
  })
  @IsEnum(['pending', 'in_process', 'done'])
  @IsOptional()
  status?: string;
}
