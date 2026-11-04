import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SenderEmail } from '../entities/sender-email.entity';

export class CreateSenderEmailDto {
  @ApiProperty({ required: true, example: 0 })
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ required: false, example: 'john@example.com' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  verifiedBy?: number | null;

  @IsOptional()
  @IsDateString()
  verifiedAt?: Date | null;

  @ApiProperty({ required: false, example: 'SIGN12345' })
  @IsOptional()
  @IsString()
  signatureId?: string | null;

  @ApiProperty({ required: false, example: 'Marketing' })
  @IsOptional()
  @IsString()
  purpose?: string | null;
}

export class UpdateSenderEmailDto extends CreateSenderEmailDto {}

export class SenderEmailResponseDto {
  id: number;
  appId?: number | null;
  name?: string | null;
  email?: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedBy?: number | null;
  verifiedAt?: Date | null;
  signatureId?: string | null;
  purpose?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: SenderEmail): SenderEmailResponseDto {
    const dto = new SenderEmailResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.name = entity.name ?? null;
    dto.email = entity.email ?? null;
    dto.isPrimary = !!entity.isPrimary;
    dto.isVerified = !!entity.isVerified;
    dto.verifiedBy = entity.verifiedBy ?? null;
    dto.verifiedAt = entity.verifiedAt ?? null;
    dto.signatureId = entity.signatureId ?? null;
    dto.purpose = entity.purpose ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
