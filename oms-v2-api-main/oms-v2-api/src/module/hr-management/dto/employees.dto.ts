import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Employee } from '../entities/employees.entity';

export class CreateEmployeeDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  userId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  appId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  designationId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  officeId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  officeShiftId?: number | null;

  @ApiProperty({ required: false, example: 92 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  employmentStatusId?: number | null;

  @ApiProperty({ required: false, example: 132 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  employeeStatusId?: number | null;

  @IsOptional()
  @IsInt()
  currentGradeId?: number | null;

  @ApiProperty({ required: false, example: '25500' })
  @IsOptional()
  @IsInt()
  currentBasicSalary?: number | null;

  @ApiProperty({ required: false, example: '2022-04-03' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string | null;

  @ApiProperty({ required: false, example: 'Late payment adjustment' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ required: false, example: '2027-07-03' })
  @IsOptional()
  @IsDateString()
  resignationDate?: string | null;
}

export class UpdateEmployeeOfficeInfoDto {
  @ApiProperty({ required: false, example: 1, description: 'Office ID' })
  @IsOptional()
  @IsInt()
  officeId?: number;

  @ApiProperty({ required: false, example: 1, description: 'Office Shift ID' })
  @IsOptional()
  @IsInt()
  officeShiftId?: number;
}

export class UpdateEmployeeStatusDto {
  @ApiProperty({ default: 1 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  id: number;

  @ApiProperty({ required: true, default: 0 })
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  employeeStatusId: number;

  @ApiProperty({ required: false, example: 'Late payment adjustment' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ required: false, example: '2027-07-03' })
  @IsOptional()
  @IsDateString()
  resignationDate?: string | null;
}

class EmployeeSummaryDto {
  @ApiPropertyOptional({ example: 1, description: 'officeId (branchId)' })
  @IsOptional()
  branchId?: number;

  @ApiPropertyOptional({ example: 10, description: 'designationId' })
  @IsOptional()
  designationId?: number;

  @ApiPropertyOptional({ example: '2022-04-03', description: 'YYYY-MM-DD' })
  @IsOptional()
  joiningDate?: string;
}

class PersonalInformationDto {
  @ApiPropertyOptional({ example: 'Adam' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Gilchrist' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Rap' })
  @IsOptional()
  fathersName?: string;

  @ApiPropertyOptional({ example: 'Ven' })
  @IsOptional()
  mothersName?: string;

  @ApiPropertyOptional({ example: '1995-01-01', description: 'YYYY-MM-DD' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  nidNumber?: string;

  @ApiPropertyOptional({ example: 'AB123456' })
  @IsOptional()
  passportNumber?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 24, description: 'bloodGroupId' })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  bloodGroupId?: number;

  @ApiPropertyOptional({ example: 96, description: 'maritalStatusId' })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  maritalStatusId?: number;

  @ApiPropertyOptional({ example: 100, description: 'religionId' })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  religionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'countryId' })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'phoneCountryId' })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  phoneCountryId?: number;

  @ApiPropertyOptional({ example: '01638584711' })
  @IsOptional()
  phone?: string;
}

class ContactInformationDto {
  @ApiPropertyOptional({ example: '0163xxxxxxx' })
  @IsOptional()
  mobileNumberPersonal?: string;

  @ApiPropertyOptional({ example: '0163xxxxxxx' })
  @IsOptional()
  mobileWork?: string;

  @ApiPropertyOptional({ example: '02-xxxxxxx' })
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ example: 'personal@mail.com' })
  @IsOptional()
  emailPersonal?: string;

  @ApiPropertyOptional({ example: 'official@mail.com' })
  @IsOptional()
  emailOfficial?: string;

  @ApiPropertyOptional({ example: 'Emergency Person' })
  @IsOptional()
  emergencyContactPerson?: string;

  @ApiPropertyOptional({ example: '017xxxxxxxx' })
  @IsOptional()
  emergencyContactNumber?: string;

  @ApiPropertyOptional({ example: 'Present address text' })
  @IsOptional()
  presentAddress?: string;

  @ApiPropertyOptional({ example: 'Permanent address text' })
  @IsOptional()
  permanentAddress?: string;
}

class LanguageProficiencyDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  languageId?: number;

  @ApiPropertyOptional({ example: 201 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  speakingLevelId?: number;

  @ApiPropertyOptional({ example: 202 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  readingLevelId?: number;

  @ApiPropertyOptional({ example: 203 })
  @IsOptional()
  @Transform(({ value }) =>
    isNaN(value) || value === 'null' ? null : Number(value),
  )
  @IsInt()
  writingLevelId?: number;
}

export class UpdateEmployeeDetailsDto {
  @ApiPropertyOptional({ type: () => EmployeeSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmployeeSummaryDto)
  employeeSummary?: EmployeeSummaryDto;

  @ApiPropertyOptional({ type: () => PersonalInformationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalInformationDto)
  personalInformation?: PersonalInformationDto;

  @ApiPropertyOptional({ type: () => ContactInformationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInformationDto)
  contactInformation?: ContactInformationDto;

  @ApiPropertyOptional({ type: () => [LanguageProficiencyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiencyDto)
  languageTable?: LanguageProficiencyDto[];
}

export class UpdateEmployeeDto extends CreateEmployeeDto {}

export class EmployeeResponseDto {
  id: number;
  userId?: number | null;
  appId?: number | null;
  designationId?: number | null;
  officeId?: number | null;
  officeShiftId?: number | null;
  employmentStatusId?: number | null;
  employeeStatusId?: number | null;
  joiningDate?: Date | null;
  remarks?: string | null;
  resignationDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: Employee): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId ?? null;
    dto.appId = entity.appId ?? null;
    dto.designationId = entity.designationId ?? null;
    dto.officeId = entity.officeId ?? null;
    dto.officeShiftId = entity.officeShiftId ?? null;
    dto.employmentStatusId = entity.employmentStatusId ?? null;
    dto.employeeStatusId = entity.employeeStatusId ?? null;
    dto.joiningDate = entity.joiningDate ?? null;
    dto.remarks = entity.remarks ?? null;
    dto.resignationDate = entity.resignationDate ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
