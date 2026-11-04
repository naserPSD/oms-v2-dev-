import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { LeadEmail } from '../entities/lead-email.entity';

export class CreateLeadEmailDto {
  @ApiProperty({ required: true, example: 0 })
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leadId?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  invoicing?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  administrative?: boolean;

  @ApiProperty({ required: false, example: 'lead@example.com' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  creatorId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  editorId?: number | null;
}

export class UpdateLeadEmailDto extends CreateLeadEmailDto {}

export class LeadEmailResponseDto {
  id: number;
  appId?: number | null;
  leadId?: number | null;
  invoicing: boolean;
  administrative: boolean;
  email?: string | null;
  creatorId?: number | null;
  editorId?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: LeadEmail): LeadEmailResponseDto {
    const dto = new LeadEmailResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.leadId = entity.leadId ?? null;
    dto.invoicing = !!entity.invoicing;
    dto.administrative = !!entity.administrative;
    dto.email = entity.email ?? null;
    dto.creatorId = entity.creatorId ?? null;
    dto.editorId = entity.editorId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
