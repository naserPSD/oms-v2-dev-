import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeadStage } from '../entities/lead-stages.entity';

export class CreateLeadStageDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  //@ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  leadGroupId: number;

  @ApiProperty({ required: true, example: 'Initial Stage' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  serial: number;
}

export class UpdateLeadStageDto extends CreateLeadStageDto {}

export class LeadStageResponseDto {
  id: number;
  appId: number;
  leadGroupId: number;
  name: string;
  serial: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: LeadStage): LeadStageResponseDto {
    const dto = new LeadStageResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.leadGroupId = entity.leadGroupId;
    dto.name = entity.name;
    dto.serial = entity.serial;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
