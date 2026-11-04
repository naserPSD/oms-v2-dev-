import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Requisition, RequisitionType } from '../entities/requisitions.entity';

export class CreateRequisitionDto {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || value === 'null'
      ? null
      : Number(value),
  )
  @IsInt()
  appId?: number | null;

  // @ApiProperty({ required: true, example: 'REQ-2025-001' })
  // @IsString()
  requisitionNo?: string;

  //@ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  departmentId?: number | null;

  // @ApiProperty({ required: true, example: '2025-09-10T10:00:00Z' })
  // @IsDateString()
  requisitionDate: Date;

  @ApiProperty({ required: true, example: 'Laptop for new hire' })
  @IsString()
  itemDescription: string;

  @ApiProperty({
    required: false,
    enum: RequisitionType,
    example: RequisitionType.NEW,
  })
  @IsOptional()
  @IsEnum(RequisitionType)
  requisitionType?: RequisitionType = RequisitionType.NEW;

  @ApiProperty({ required: true, example: 5 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (isNaN(value) ? 0 : Number(value)))
  quantity: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  unitTypeId?: number | undefined;

  @ApiProperty({ required: false, example: 5000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (isNaN(value) ? null : Number(value)))
  estimatedCost?: number | null;

  // @ApiProperty({ required: false, example: 138 })
  @IsOptional()
  @IsInt()
  statusId?: number = 138;
}

export class UpdateRequisitionStatusDto {
  @ApiProperty({
    required: false,
  })
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: false, example: 138 })
  @IsInt()
  statusId: number;

  @ApiProperty({ required: false, example: 'Urgent requirement' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}

export class UpdateRequisitionDto extends CreateRequisitionDto {}

export class RequisitionResponseDto {
  id: number;
  appId?: number | null;
  requisitionNo: string;
  employeeId: number;
  departmentId?: number | null;
  requisitionDate: string;
  itemDescription: string;
  requisitionType: string;
  quantity: number;
  unitTypeId?: number | null;
  estimatedCost?: number | null;
  statusId?: number | null;
  approvedBy?: number | null;
  approvedDate?: string | null;
  remarks?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: Requisition): RequisitionResponseDto {
    const dto = new RequisitionResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.requisitionNo = entity.requisitionNo;
    dto.employeeId = entity.employeeId;
    dto.departmentId = entity.departmentId ?? null;
    dto.requisitionDate = entity.requisitionDate.toISOString();
    dto.itemDescription = entity.itemDescription;
    dto.requisitionType = entity.requisitionType ?? 'new';
    dto.quantity = entity.quantity;
    dto.unitTypeId = entity.unitTypeId ?? null;
    dto.estimatedCost = Number(entity.estimatedCost) ?? null;
    dto.statusId = entity.statusId;
    dto.approvedBy = entity.approvedBy ?? null;
    dto.approvedDate = entity.approvedDate?.toISOString() ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
