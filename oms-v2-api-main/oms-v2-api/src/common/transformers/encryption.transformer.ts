// src/common/transformers/encryption.transformer.ts
import { EncryptionUtil } from '../utils/encryption.util';
import { ValueTransformer } from 'typeorm';

export class EncryptionTransformer implements ValueTransformer {
  to(value: string | undefined | null): string | undefined | null {
    if (value === null || value === undefined) return value;
    return EncryptionUtil.encrypt(value);
  }

  from(value: string | undefined | null): string | undefined | null {
    if (value === null || value === undefined) return value;
    return EncryptionUtil.decrypt(value);
  }
}
