// dto/notification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  @IsInt()
  userId: number; // ✅ integer

  @ApiProperty({ required: true, example: 'Hello, world!' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}

export class NotificationResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: number;

  @Expose()
  message: string;

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;

  static from(entity: any): NotificationResponseDto {
    const dto = plainToInstance(NotificationResponseDto, entity, {
      excludeExtraneousValues: true,
    });

    if (entity) {
      dto.id = entity._id ? entity._id.toString() : entity.id?.toString();
    }

    return dto;
  }
}
