import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { EventAttendee } from '../entities/event-attendees.entity';

export class CreateEventAttendeeDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? 0 : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  eventId: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  employeeId: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' || value === null ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  attendanceStatusId: number;
}

// Update DTO inherits from Create DTO
export class UpdateEventAttendeeDto extends CreateEventAttendeeDto {}

// Response DTO
export class EventAttendeeResponseDto {
  id: number;
  eventId: number;
  employeeId: number;
  attendanceStatusId: number;

  static fromEntity(entity: EventAttendee): EventAttendeeResponseDto {
    const dto = new EventAttendeeResponseDto();
    dto.id = entity.id;
    dto.eventId = entity.eventId;
    dto.employeeId = entity.employeeId;
    dto.attendanceStatusId = entity.attendanceStatusId;
    return dto;
  }
}
