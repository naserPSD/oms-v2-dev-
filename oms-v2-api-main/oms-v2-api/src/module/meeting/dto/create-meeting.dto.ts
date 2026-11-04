import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MeetingInviteeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateMeetingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  hostId: number;

  @ApiProperty({ example: '2026-09-14' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:30' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: '2026-09-14T11:00:00.000Z' })
  @IsOptional()
  @IsString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-09-14T11:30:00.000Z' })
  @IsOptional()
  @IsString()
  endAt?: string;

  @ApiPropertyOptional({ example: 'Asia/Dhaka' })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiProperty({ default: 'Online Meeting' })
  @IsString()
  meetingType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ type: [MeetingInviteeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MeetingInviteeDto)
  invitees: MeetingInviteeDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  agenda?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  repeat?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  repeatDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createGoogleMeet?: boolean;
}

export class UpdateMeetingStatusDto {
  @ApiProperty({ enum: ['SCHEDULED', 'INVITED', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  listStatus: string;
}

export class SaveMeetingNoteDto {
  @ApiProperty()
  @IsString()
  content: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  attendeeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: ['present', 'late', 'absent'] })
  @IsOptional()
  @IsString()
  attendance?: 'present' | 'late' | 'absent';
}

export class AddAgendaItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class UpdateAgendaItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}

export class RespondInvitationDto {
  @ApiProperty({ enum: ['accepted', 'declined'] })
  @IsIn(['accepted', 'declined'])
  status: 'accepted' | 'declined';
}
