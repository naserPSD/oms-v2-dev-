import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SaveEmailBroadcastDto {
  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  message: string;

  @IsIn(['all', 'selected', 'custom'])
  recipientType: 'all' | 'selected' | 'custom';

  @IsOptional()
  @IsString()
  customEmails?: string;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  scheduleTime?: string;

  @IsOptional()
  @IsArray()
  attachmentDetails?: Array<{ name: string; size?: string; type?: string }>;

  @IsOptional()
  @IsArray()
  recipientUserIds?: number[];
}
