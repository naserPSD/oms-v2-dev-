import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmployeeHierarchy } from '../entities/employee-hierarchy.entity';

export class CreateEmployeeHierarchyDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsOptional()
  @IsInt()
  appId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  empId: number;

  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  supervisorId: number;

  @ApiProperty({ required: true, example: '2025-01-01' })
  @IsDateString()
  // @Transform(({ value }) => (value === 'null' ? null : value?.toISOString()))
  startDate: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @Transform(({ value }) => (value === 'null' ? null : value))

  // @IsDateString()
  endDate?: string | null;
}

export class UpdateEmployeeHierarchyDto extends CreateEmployeeHierarchyDto {}

export class EmployeeHierarchyResponseDto {
  id: number;
  appId: number;
  empId: number;
  supervisorId: number;
  startDate: string;
  endDate?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmployeeHierarchy): EmployeeHierarchyResponseDto {
    const dto = new EmployeeHierarchyResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.empId = entity.empId;
    dto.supervisorId = entity.supervisorId;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
