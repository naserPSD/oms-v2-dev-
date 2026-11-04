import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SubscriptionSeat } from '../entities/subscription-seats.entity';

export class CreateSubscriptionSeatDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  subscriptionId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @Type(() => Number)
  appId: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  totalSeats?: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  usedSeats?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  availableSeats?: number;

  @ApiProperty({ required: false, example: '[]' })
  @IsOptional()
  @IsString()
  seatHistory?: any | null;

  @ApiProperty({ required: false, example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  lastUpdated?: Date | null;
}

export class UpdateSubscriptionSeatDto extends CreateSubscriptionSeatDto {}

export class SubscriptionSeatResponseDto {
  id: number;
  subscriptionId: number;
  appId: number;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  seatHistory?: any | null;
  lastUpdated?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: SubscriptionSeat): SubscriptionSeatResponseDto {
    const dto = new SubscriptionSeatResponseDto();
    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId;
    dto.appId = entity.appId;
    dto.totalSeats = entity.totalSeats;
    dto.usedSeats = entity.usedSeats;
    dto.availableSeats = entity.availableSeats;
    dto.seatHistory = entity.seatHistory ?? null;
    dto.lastUpdated = entity.lastUpdated ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
