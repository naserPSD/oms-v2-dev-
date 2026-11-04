import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { z } from 'zod';
import { IsString, IsOptional } from 'class-validator';

export class CreateDbConfigDto {
  @ApiProperty({
    description: 'The name of the database configuration. Key should be unique',
    example: 'MySQL Config',
    required: true,
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'The value of the database configuration',
    example: 'mysql://user:password@localhost:3306/mydb',
    required: true,
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'The description of the database configuration',
    example: 'mysql://user:password@localhost:3306/mydb',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  jsonData?: string | null;

  constructor(partial: Partial<CreateDbConfigDto>) {
    Object.assign(this, partial);
  }
}
