// src/auth/dto/user-register-request.dto.ts
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Define the Zod schema
export const UserRegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First Name is required')
      .min(2, 'First Name must be at least 2 characters')
      .max(30, 'First Name must not exceed 30 characters')
      .regex(/^[A-Za-z\s]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last Name is required')
      .min(2, 'Last Name must be at least 2 characters')
      .max(30, 'Last Name must not exceed 30 characters')
      .regex(/^[A-Za-z\s]+$/, 'Last name can only contain letters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .refine(
        (val) => !/<\s*[^>]+>|<\s*\/\s*[^>]+>|script/i.test(val),
        'HTML tags and scripts are not allowed in password',
      ),
    confirmPassword: z.string(),
    invitationCode: z.string().optional(),
    lastTimezone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Infer the TypeScript type
export type UserRegisterRequestDto = z.infer<typeof UserRegisterSchema>;

// Swagger metadata class (optional but useful for API docs)
export class UserRegisterRequestSwagger {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'secret123' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @ApiProperty({ description: 'Invitation code', required: false })
  @IsString()
  invitationCode?: string; // Optional field for invitation code

  @IsOptional()
  @IsString()
  lastTimezone?: string;
}
