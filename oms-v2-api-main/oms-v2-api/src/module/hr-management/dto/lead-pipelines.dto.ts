import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeadPipeline } from '../entities/lead-pipelines.entity';

export class CreateLeadPipelineDto {
  @ApiProperty({ required: true, default: 0 })
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  leadGroupId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  prevStageId: number;

  @ApiProperty({ required: true, example: 3 })
  @IsInt()
  currentStageId: number;

  @ApiProperty({ required: true, example: 5 })
  @IsInt()
  daysInStage: number;
}

export class UpdateLeadPipelineDto extends PartialType(CreateLeadPipelineDto) {}

export class LeadPipelineResponseDto {
  id: number;
  appId: number;
  leadGroupId: number;
  prevStageId: number;
  currentStageId: number;
  daysInStage: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: LeadPipeline): LeadPipelineResponseDto {
    const dto = new LeadPipelineResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.leadGroupId = entity.leadGroupId;
    dto.prevStageId = entity.prevStageId;
    dto.currentStageId = entity.currentStageId;
    dto.daysInStage = entity.daysInStage;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
