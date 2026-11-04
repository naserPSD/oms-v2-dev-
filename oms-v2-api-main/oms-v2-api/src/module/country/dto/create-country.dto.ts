import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ example: 'USA', description: 'Name of the country' })
  name: string;

  @ApiProperty({
    example: 'United States of America',
    description: 'Full name of the country',
    nullable: true,
  })
  fullName?: string;

  @ApiProperty({ example: 'US', description: 'ISO 3166-2 code' })
  iso31662: string;

  @ApiProperty({ example: 'USA', description: 'ISO 3166-3 code' })
  iso31663: string;

  @ApiProperty({ example: 'USD', description: 'Currency code', nullable: true })
  currencyCode?: string;

  @ApiProperty({
    example: 'Dollar',
    description: 'Currency name',
    nullable: true,
  })
  currency?: string;

  @ApiProperty({ example: '$', description: 'Currency symbol', nullable: true })
  currencySymbol?: string;

  @ApiProperty({ example: 2, description: 'Currency decimals', nullable: true })
  currencyDecimals?: number;

  @ApiProperty({
    example: 'Washington, D.C.',
    description: 'Capital of the country',
    nullable: true,
  })
  capital?: string;

  @ApiProperty({
    example: 'American',
    description: 'Citizenship of the country',
    nullable: true,
  })
  citizenship?: string;

  @ApiProperty({ example: '1', description: 'Calling code', nullable: true })
  callingCode?: string;

  @ApiProperty({
    example: 'us',
    description: 'Flag identifier',
    nullable: true,
  })
  flag?: string;

  @ApiProperty({ example: 'NAM', description: 'Region code' })
  regionCode: string;

  @ApiProperty({ example: 'NAM', description: 'Sub-region code' })
  subRegionCode: string;

  @ApiProperty({ example: true, description: 'EEA member status' })
  eea: boolean;

  @ApiProperty({ example: 1, description: 'Status of the country' })
  status: number;
}
