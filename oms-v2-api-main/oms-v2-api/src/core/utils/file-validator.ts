// src/common/utils/file-validator.ts
import { BadRequestException } from '@nestjs/common';

export function validateFile(
  file: Express.Multer.File,
  allowedMimeTypes: string[],
  maxSizeInBytes: number,
) {
  if (!file) {
    throw new BadRequestException('File is required');
  }

  // Check file type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`,
    );
  }

  // Check file size
  if (file.size > maxSizeInBytes) {
    throw new BadRequestException(
      `File size exceeds the limit of ${maxSizeInBytes / (1024 * 1024)} MB`,
    );
  }

  return true; // Return true if validation passes
}
