import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpSalaryStructureDetails } from '../entities/employee-salary-structure-details.entity';

export class CreateEmpSalaryStructureDetailsDto {
  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  salaryStructureId: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  payItemId: number;

  @ApiProperty({ required: true, example: 5000.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false, example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number | null;

  @ApiProperty({ required: false, example: 1500.0 })
  @IsOptional()
  @IsNumber()
  calculatedAmount: number = 0;
}

export class UpdateEmpSalaryStructureDetailsDto extends CreateEmpSalaryStructureDetailsDto {}

export class EmpSalaryStructureDetailsResponseDto {
  id: number;
  appId?: number | null;
  salaryStructureId: number;
  payItemId: number;
  amount: number;
  percentage?: number | null;
  calculatedAmount?: number | null;
  createdAt: Date;

  static fromEntity(
    entity: EmpSalaryStructureDetails,
  ): EmpSalaryStructureDetailsResponseDto {
    const dto = new EmpSalaryStructureDetailsResponseDto();
    dto.id = entity.id;
    dto.appId = entity.appId ?? null;
    dto.salaryStructureId = entity.salaryStructureId;
    dto.payItemId = entity.payItemId;
    dto.amount = Number(entity.amount ?? 0);
    dto.percentage = entity.percentage ?? null;
    dto.calculatedAmount = entity.calculatedAmount ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
