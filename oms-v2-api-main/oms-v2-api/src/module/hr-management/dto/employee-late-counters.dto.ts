import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpLateCounter } from '../entities/employee-late-counters.entity';

export class CreateEmpLateCounterDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  empId?: number | null;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  lateAttendanceRuleId?: number | null;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsInt()
  lateCounter?: number | null;
}

export class UpdateEmpLateCounterDto extends CreateEmpLateCounterDto {}

export class EmpLateCounterResponseDto {
  id: number;
  appId?: number | null;
  empId?: number | null;
  lateAttendanceRuleId?: number | null;
  lateCounter?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpLateCounter): EmpLateCounterResponseDto {
    const dto = new EmpLateCounterResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.empId = entity.empId ?? null;
    dto.lateAttendanceRuleId = entity.lateAttendanceRuleId ?? null;
    dto.lateCounter = entity.lateCounter ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
