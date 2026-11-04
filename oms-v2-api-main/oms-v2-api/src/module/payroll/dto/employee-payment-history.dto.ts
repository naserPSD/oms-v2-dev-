import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpPaymentHistory } from '../entities/employee-payment-history.entity';

export class CreateOrUpdateEmpPaymentHistoryDto {
  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  payrollEmployeeId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  empId: number;

  @ApiProperty({ required: false, example: 178 })
  @IsOptional()
  @IsInt()
  paymentMethodId?: number | null;

  @ApiProperty({ required: false, example: 'Brac Bank' })
  @IsOptional()
  @IsString()
  bankName?: string | null;

  @ApiProperty({ required: false, example: '017XXXXXXXX' })
  @IsOptional()
  @IsString()
  accountNumber?: string | null;

  @ApiProperty({ required: false, example: 'TXN-2025-98564' })
  @IsOptional()
  @IsString()
  transactionRef?: string | null;

  @ApiProperty({ example: 15000.0 })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({ example: '2025-11-21' })
  @IsString()
  paymentDate: string;

  @ApiProperty({ required: false, example: 182 })
  @IsOptional()
  @IsInt()
  paymentStatusId?: number | null;

  @ApiProperty({ required: false, example: 'Paid via online banking' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  paidBy?: number | null;
}

export class EmpPaymentHistoryResponseDto {
  id: number;
  appId: number | null;
  payrollEmployeeId: number;
  empId: number;
  paymentMethodId?: number | null;
  bankName?: string | null;
  accountNumber?: string | null;
  transactionRef?: string | null;
  amountPaid: number;
  paymentDate: string | null;
  paymentStatusId?: number | null;
  remarks?: string | null;
  paidBy?: number | null;
  createdAt: Date;

  static fromEntity(entity: EmpPaymentHistory): EmpPaymentHistoryResponseDto {
    const dto = new EmpPaymentHistoryResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.payrollEmployeeId = entity.payrollEmployeeId;
    dto.empId = entity.empId;
    dto.paymentMethodId = entity.paymentMethodId ?? null;
    dto.bankName = entity.bankName ?? null;
    dto.accountNumber = entity.accountNumber ?? null;
    dto.transactionRef = entity.transactionRef ?? null;
    dto.amountPaid = Number(entity.amountPaid ?? 0);
    dto.paymentDate = entity.paymentDate
      ? entity.paymentDate.toISOString().split('T')[0]
      : null;
    dto.paymentStatusId = entity.paymentStatusId ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.paidBy = entity.paidBy ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
