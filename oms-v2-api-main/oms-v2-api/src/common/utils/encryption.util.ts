// src/common/utils/encryption.util.ts
import * as crypto from 'crypto';

// Use environment variables for these keys
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'ruhul-32-character-encryptionKey'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

export class EncryptionUtil {
  static encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Store IV with encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(text: string): string {
    if (!text) return text;

    try {
      const textParts = text.split(':');
      if (textParts.length !== 2) return text; // Not encrypted or invalid format

      const iv = Buffer.from(textParts[0], 'hex');
      const encryptedText = textParts[1];

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv,
      );

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return text; // Return original text if decryption fails
    }
  }
}
