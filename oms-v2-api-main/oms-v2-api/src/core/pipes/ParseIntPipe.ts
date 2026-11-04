import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (isNaN(value)) {
      throw new Error(`${metadata.data} must be a valid number`);
    }
    return parseInt(value, 10);
  }
}
