import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDbConfigDto } from './create-db-config.dto';

export class UpdateDbConfigDto extends PartialType(CreateDbConfigDto) {
  @ApiProperty({
    description: 'The unique identifier for the database configuration',
    required: false,
    example: 123,
  })
  id: number;
}
