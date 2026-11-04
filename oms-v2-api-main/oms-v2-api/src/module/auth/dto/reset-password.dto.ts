// src/auth/dto/reset-password.dto.ts
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export const ResetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const VerifyOTPSchema = z.object({
  sessionId: z.string(),
  otp: z.string().min(6, 'Password must be at least 6 characters'),
});

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
  .regex(/[a-z]/, 'Password must contain at least one lowercase character')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character',
  );

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOTPSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export class ResetPasswordDoc implements ResetPasswordDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  confirmPassword: string;
}

export class ResetFirstPassword {
  @ApiProperty({ required: true, example: '12345678' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({ required: true, example: '12345678' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ required: true, example: '12345678' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class ChangePasswordDoc implements ChangePasswordDto {
  @ApiProperty({ required: true, description: 'Current password of the user' })
  currentPassword: string;

  @ApiProperty({
    required: true,
    description:
      'New password for the user (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)',
  })
  newPassword: string;

  @ApiProperty({
    required: true,
    description: 'Confirmation of the new password',
  })
  confirmPassword: string;
}

export class verifyOTPDoc implements VerifyOtpDto {
  @ApiProperty()
  sessionId: string;
  @ApiProperty()
  otp: string;
}
