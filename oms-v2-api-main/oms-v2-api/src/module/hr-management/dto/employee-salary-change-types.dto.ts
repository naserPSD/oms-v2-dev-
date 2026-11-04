import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  EmpSalaryChangeType,
  ApprovalLevel,
} from '../entities/employee-salary-change-types.entity';

export class CreateEmpSalaryChangeTypeDto {
  @ApiProperty({ required: true, example: 0 })
  @IsInt()
  id: number;

  @IsInt()
  @IsOptional()
  appId?: number | null;

  @ApiProperty({ required: true, example: 'SALARY_INCREASE' })
  @IsString()
  changeCode: string;

  @ApiProperty({ required: true, example: 'Annual Salary Increase' })
  @IsString()
  changeName: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Increase due to performance',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean | null;

  @ApiProperty({
    required: false,
    enum: ApprovalLevel,
    example: ApprovalLevel.MANAGER,
  })
  @IsOptional()
  @IsEnum(ApprovalLevel)
  approvalLevel?: ApprovalLevel | null;

  @ApiProperty({ required: false, nullable: true, example: 10.5 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  maxPercentage?: number | null;

  @ApiProperty({ required: false, nullable: true, example: 50000 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsNumber()
  maxAmount?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null;

  @ApiProperty({ required: false, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number | null;
}

export class UpdateEmpSalaryChangeTypeDto extends CreateEmpSalaryChangeTypeDto {}

export class EmpSalaryChangeTypeResponseDto {
  id: number;
  appId: number | null;
  changeCode: string;
  changeName: string;
  description?: string | null;
  requiresApproval?: boolean | null;
  approvalLevel?: ApprovalLevel | null;
  maxPercentage?: number | null;
  maxAmount?: number | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(
    entity: EmpSalaryChangeType,
  ): EmpSalaryChangeTypeResponseDto {
    const dto = new EmpSalaryChangeTypeResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.changeCode = entity.changeCode;
    dto.changeName = entity.changeName;
    dto.description = entity.description ?? null;
    dto.requiresApproval = !!entity.requiresApproval;
    dto.approvalLevel = entity.approvalLevel ?? null;
    dto.maxPercentage = entity.maxPercentage ?? null;
    dto.maxAmount = entity.maxAmount ?? null;
    dto.isActive = !!entity.isActive;
    dto.sortOrder = entity.sortOrder ?? null;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
