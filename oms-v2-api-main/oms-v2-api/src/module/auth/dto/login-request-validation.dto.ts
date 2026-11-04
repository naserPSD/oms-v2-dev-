// src/auth/dto/login-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  last_timezone: z.string().optional(),
});

export type LoginRequestValidation = z.infer<typeof LoginSchema>;
