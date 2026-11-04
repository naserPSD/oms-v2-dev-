import { IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';
import { SubscriptionInvoice } from '../entities/subscription-invoices.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionInvoiceDto {
  @ApiProperty({ required: true })
  @IsNumber()
  id: number;

  @ApiProperty({ required: true, example: 1 })
  @IsNumber()
  @IsOptional()
  subscriptionId: number;

  @ApiProperty({ required: true, example: 700 })
  @IsNumber()
  @IsOptional()
  amount: number;

  @ApiProperty({ required: true, example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  issueDate: string;

  @ApiProperty({ required: true, example: '2025-04-04' })
  @IsDateString()
  @IsOptional()
  dueDate: string;

  @ApiProperty({ required: true, example: 35 })
  @IsNumber()
  @IsOptional()
  statusId: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  transactionId: string;
}

export class SubscriptionInvoiceResponseDto {
  id: number;
  subscriptionId: number;
  amount: number;
  issueDate: string;
  dueDate: string;
  statusId: number;
  paidAt?: string;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(
    entity: SubscriptionInvoice,
  ): SubscriptionInvoiceResponseDto {
    const dto = new SubscriptionInvoiceResponseDto();
    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId;
    dto.amount = Number(entity.amount);
    dto.issueDate = entity.issueDate?.toISOString();
    dto.dueDate = entity.dueDate?.toISOString();
    dto.statusId = entity.statusId;
    dto.paidAt = entity.paidAt?.toISOString();
    dto.transactionId = entity.transactionId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
