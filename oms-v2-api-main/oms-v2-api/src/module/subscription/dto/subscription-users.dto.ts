import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubscriptionUser } from '../entities/subscription-users.entity';

export class CreateSubscriptionUserDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  subscriptionId: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  userId: number;

  @ApiProperty({ required: false, default: true })
  @Transform(({ value }) => value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  addedBy?: number | null;

  @IsOptional()
  @IsDateString()
  addedAt?: string | null;

  @IsOptional()
  @IsDateString()
  removedAt?: string | null;
}

export class UpdateSubscriptionUserDto extends CreateSubscriptionUserDto {}

export class SubscriptionUserResponseDto {
  id: number;
  subscriptionId: number;
  appId: number;
  userId: number;
  isActive: boolean;
  addedBy?: number | null;
  addedAt?: string | null;
  removedAt?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: SubscriptionUser): SubscriptionUserResponseDto {
    const dto = new SubscriptionUserResponseDto();
    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId;
    dto.appId = entity.appId;
    dto.userId = entity.userId;
    dto.isActive = entity.isActive;
    dto.addedBy = entity.addedBy ?? null;
    dto.addedAt = entity.addedAt ? entity.addedAt.toISOString() : null;
    dto.removedAt = entity.removedAt ? entity.removedAt.toISOString() : null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
