// src/pipes/parse-form-data.pipe.ts
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      return this.transformObject(value);
    }
    return value;
  }

  private transformObject(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (this.isNumericField(key)) {
          // Add your numeric field names here
          obj[key] = parseInt(obj[key], 10);
        }
      }
    }
    return obj;
  }

  private isNumericField(key: string): boolean {
    const numericFields = ['universityId', 'statusId', 'mediaId']; // Add all numeric fields
    return numericFields.includes(key);
  }
}
