// src/auth/dto/forgot-password.dto.ts
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export class ForgotPasswordDoc implements ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}
