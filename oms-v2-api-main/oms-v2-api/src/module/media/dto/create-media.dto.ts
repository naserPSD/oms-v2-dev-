import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The region file to upload',
  })
  // @IsFile()
  // @MaxFileSize(5 * 1024 * 1024) // 5 MB
  // @HasMimeType(['image/jpeg', 'image/png']) // Allowed MIME types
  file: any; // This is the file field

  @IsOptional()
  file_url: string;
}
