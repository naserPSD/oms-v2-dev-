import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ description: 'Activity type (Call, Appointment, Task)' })
  @IsString()
  activityType: string;

  @ApiPropertyOptional({ description: 'Activity title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Activity date and time' })
  @IsDateString(
    {},
    { message: 'activityDate must be a valid ISO 8601 date string' },
  )
  activityDate: string;

  @ApiPropertyOptional({
    description: 'Activity status',
    enum: ['pending', 'in_process', 'done'],
    default: 'pending',
  })
  @IsEnum(['pending', 'in_process', 'done'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
