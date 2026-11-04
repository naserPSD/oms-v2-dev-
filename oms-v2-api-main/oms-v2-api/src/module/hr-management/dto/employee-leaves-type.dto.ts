import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpLeaveType } from '../entities/employee-leaves-type.entity';

export class CreateEmpLeaveTypeDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id?: number | null;

  //@ApiProperty({ required: true, example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 'Annual Leave' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({ required: true, example: 20 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  maxDaysPerYear: number;

  @ApiProperty({ required: true, example: 2026 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  year: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1')
      return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  requiresApproval?: boolean;
}

export class UpdateEmpLeaveTypeDto extends CreateEmpLeaveTypeDto {}

export class EmpLeaveTypeResponseDto {
  id: number;
  appId: number;
  name: string;
  isPaid: boolean;
  maxDaysPerYear: number;
  year: number;
  requiresApproval: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpLeaveType): EmpLeaveTypeResponseDto {
    const dto = new EmpLeaveTypeResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId;
    dto.name = entity.name;
    dto.isPaid = !!entity.isPaid;
    dto.maxDaysPerYear = entity.maxDaysPerYear;
    dto.year = entity.year;
    dto.requiresApproval = !!entity.requiresApproval;
    dto.createdAt = entity.createdAt ?? null;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
