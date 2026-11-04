import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeadGroups } from '../entities/lead-groups.entity';

export class CreateLeadGroupDto {
  @ApiProperty({ required: true, default: 0 })
  @IsInt()
  id: number;

  //@ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 'Marketing Leads' })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Group for all marketing-related leads',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class UpdateLeadGroupDto extends PartialType(CreateLeadGroupDto) {}

export class LeadGroupResponseDto {
  id: number;
  appId: number;
  name: string;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: LeadGroups): LeadGroupResponseDto {
    const dto = new LeadGroupResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
