// src/auth/dto/login-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  lastTimezone: z.string().optional(),
});

// export type LoginRequestDto = z.infer<typeof LoginSchema>;

// export class UserLoginRequestSwagger {
export class LoginRequestDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  // @ApiProperty({ required: false })
  // @ApiProperty({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  lastTimezone?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  device?: string | null;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  countryName?: string | null;
}

export class UserLogoutDto {
  @ApiProperty({
    example: 'a1b2c3d4-session-id',
    description: 'Session ID of the logged-in device',
  })
  sessionId: string;
}
