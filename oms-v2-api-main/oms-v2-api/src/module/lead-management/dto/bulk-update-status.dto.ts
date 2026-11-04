import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateStatusDto {
  @ApiProperty({ description: 'Array of lead IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  leadIds: string[];

  @ApiProperty({ description: 'New status to assign' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
