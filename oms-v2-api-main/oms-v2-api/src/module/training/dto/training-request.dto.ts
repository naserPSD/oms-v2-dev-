import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTrainingRequestDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id?: number;

  @IsString()
  @IsNotEmpty()
  itemDescription!: string;

  @Transform(({ value }) => {
    if (value === 267 || value === '267') return 'Internal';
    if (value === 268 || value === '268') return 'External';
    return value;
  })
  @IsString()
  @IsIn(['Internal', 'External'])
  trainingType!: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  quantity!: number;

  @IsOptional()
  @IsDateString()
  preferredTrainingDate?: string | null;

  @IsOptional()
  @IsString()
  trainingProvider?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  estimatedCost?: number | null;

  @IsOptional()
  @IsString()
  reason?: string | null;

  @IsOptional()
  @IsString()
  locationName?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  courseDuration?: string | null;

  @IsOptional()
  @IsString()
  additionalNotes?: string | null;
}

export class UpdateTrainingRequestStatusDto {
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  id!: number;

  @Transform(({ value }) =>
    value === undefined || value === null || value === '' || isNaN(value)
      ? undefined
      : Number(value),
  )
  @IsInt()
  statusId!: number;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}
