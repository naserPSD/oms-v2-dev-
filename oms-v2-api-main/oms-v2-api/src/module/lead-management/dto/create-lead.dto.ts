import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  // New form fields
  @ApiPropertyOptional({
    description: 'Lead type (individual, company, organization)',
  })
  @IsString()
  @IsOptional()
  leadType?: string;

  @ApiPropertyOptional({ description: 'Company/Lead name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Company type (startup, small_business, etc.)',
  })
  @IsString()
  @IsOptional()
  companyType?: string;

  @ApiPropertyOptional({
    description: 'Priority status (low, medium, high, urgent)',
  })
  @IsString()
  @IsOptional()
  priorityStatus?: string;

  @ApiPropertyOptional({
    description: 'Client status (prospect, lead, customer, etc.)',
  })
  @IsString()
  @IsOptional()
  clientStatus?: string;

  // Key Contact Info
  @ApiPropertyOptional({ description: 'Contact name' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact department' })
  @IsString()
  @IsOptional()
  contactDepartment?: string;

  @ApiPropertyOptional({ description: 'Contact designation' })
  @IsString()
  @IsOptional()
  contactDesignation?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Contact alternative phone' })
  @IsString()
  @IsOptional()
  contactAlternativePhone?: string;

  @ApiPropertyOptional({
    description: 'Lead source (LinkedIn, Facebook, Instagram, etc.)',
  })
  @IsString()
  @IsOptional()
  leadSource?: string;

  @ApiPropertyOptional({
    description: 'Lead status (Active, In Process, Converted, etc.)',
  })
  @IsString()
  @IsOptional()
  leadStatus?: string;

  @ApiPropertyOptional({ description: 'Deal value' })
  @IsNumber()
  @IsOptional()
  dealValue?: number;

  @ApiPropertyOptional({ description: 'Last contact date' })
  @IsDateString()
  @IsOptional()
  lastContact?: Date;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Notes about the lead' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  // Multiple contacts and remarks
  @ApiPropertyOptional({
    description: 'Multiple contacts array',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  contacts?: Array<{
    name?: string;
    email?: string;
    department?: string;
    designation?: string;
    phone?: string;
    alternativePhone?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Multiple remarks array',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  remarks?: Array<{
    remark?: string;
    createdBy?: string;
  }>;
}
