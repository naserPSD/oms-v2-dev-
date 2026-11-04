import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmployeeAsset } from '../entities/employee-assets.entity';

export class CreateEmployeeAssetDto {
  @ApiProperty({ required: true, example: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  employeeId: number;

  @ApiProperty({ required: true, example: 2 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  assetTypeId: number;

  @ApiProperty({ required: false, example: 143 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  assetStatusId?: number = 143;

  @ApiProperty({ required: false, example: 'Dell Laptop' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'Inspiron 15' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false, example: '123-ABC-456' })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiProperty({ required: false, example: 1500.0 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true' || value === 1 || value === '1',
  )
  isRefundable?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === true || value === 'true' || value === 1 || value === '1',
  )
  refundable?: boolean;

  @ApiProperty({ required: false, example: '2025-09-18T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  allocationDate?: Date;

  @ApiProperty({ required: false, example: '2025-09-18T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  withdrawalDate?: Date;

  @ApiProperty({ required: false, example: 'Approved' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @IsOptional()
  @IsInt()
  allocatedBy?: number;
}

export class UpdateEmployeeAssetStatusDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  id: number;

  @ApiProperty({ required: true, example: 144 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  assetStatusId: number;

  @ApiProperty({ required: false, example: 'Approved' })
  @IsOptional()
  @IsString()
  remarks?: string;

  //@ApiProperty({ required: false, example: '2025-09-18T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  withdrawalDate?: Date;
}

export class EmployeeAssetResponseDto {
  id: number;
  appId: number;
  employeeId: number;
  assetTypeId: number;
  assetStatusId: number;
  description?: string | null;
  model?: string | null;
  serial?: string | null;
  amount?: number | null;
  isRefundable?: boolean;
  refundable?: boolean;
  allocationDate?: Date | null;
  withdrawalDate?: Date | null;
  remarks?: string | null;
  allocatedBy?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmployeeAsset): EmployeeAssetResponseDto {
    const dto = new EmployeeAssetResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.employeeId = entity.employeeId;
    dto.assetTypeId = entity.assetTypeId;
    dto.assetStatusId = entity.assetStatusId;
    dto.description = entity.description ?? null;
    dto.model = entity.model ?? null;
    dto.serial = entity.serial ?? null;
    dto.amount = entity.amount ?? null;
    dto.isRefundable = Boolean(entity.isRefundable);
    dto.refundable = Boolean(entity.isRefundable);
    dto.allocationDate = entity.allocationDate ?? null;
    dto.withdrawalDate = entity.withdrawalDate ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.allocatedBy = entity.allocatedBy ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
