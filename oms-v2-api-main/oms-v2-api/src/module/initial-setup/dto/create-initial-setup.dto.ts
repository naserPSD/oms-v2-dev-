import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsDate,
  Max,
  MaxLength,
  IsPhoneNumber,
  IsInt,
} from 'class-validator';

export class InitialSetupDto {
  @ApiProperty({ enum: ['personal', 'company'] })
  @IsNotEmpty()
  @IsIn(['personal', 'company'])
  setupType: 'personal' | 'company';
}

export class PersonalSetupDto extends InitialSetupDto {
  @ApiPropertyOptional()
  @IsOptional()
  // @IsString()
  profilePic?: any;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  // @IsNumber()
  countryId: number;

  @ApiPropertyOptional({ example: '+8801638584711' })
  @IsOptional()
  @IsString()
  // @MaxLength(5)
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  phoneCountryId?: number;

  @ApiPropertyOptional({ example: '1638584711' })
  @IsOptional()
  @IsString()
  phoneIdentifier?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // @IsIn(['male', 'female', 'custom'])
  // gender?: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsDateString()
  // dateOfBirth: string;
}

export class CompanySetupDto extends InitialSetupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  typeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  sizeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : value))
  countryId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timezone?: string;

  //   @ApiPropertyOptional()
  //   @IsOptional()
  //   logo?: any;
}

export class CreateInitialSetupDoc {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(PersonalSetupDto) },
      { $ref: getSchemaPath(CompanySetupDto) },
    ],
  })
  body: PersonalSetupDto | CompanySetupDto;
}
