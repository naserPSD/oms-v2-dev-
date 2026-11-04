import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpSalaryGrade } from '../entities/employee-salary-grades.entity';

export class CreateEmpSalaryGradeDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number | null;

  @ApiProperty({ required: true, example: 'AAAAA' })
  @IsString()
  gradeCode: string;

  @ApiProperty({ required: true, example: 'Grade A' })
  @IsString()
  gradeName: string;

  @ApiProperty({ required: true, example: 15000.0 })
  @IsNumber()
  @Min(0)
  minSalary: number;

  @ApiProperty({ required: true, example: 150000.0 })
  @IsNumber()
  @Min(0)
  maxSalary: number;

  @ApiProperty({ required: false, example: 'Description about the grade' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ required: true, example: 1 })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bonusPercent?: number | null;
}

export class UpdateEmpSalaryGradeDto extends CreateEmpSalaryGradeDto {}

export class EmpSalaryGradeResponseDto {
  id: number;
  appId?: number | null;
  gradeCode: string;
  gradeName: string;
  minSalary: number;
  maxSalary: number;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpSalaryGrade): EmpSalaryGradeResponseDto {
    const dto = new EmpSalaryGradeResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.gradeCode = entity.gradeCode;
    dto.gradeName = entity.gradeName;
    dto.minSalary = entity.minSalary;
    dto.maxSalary = entity.maxSalary;
    dto.description = entity.description ?? null;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
