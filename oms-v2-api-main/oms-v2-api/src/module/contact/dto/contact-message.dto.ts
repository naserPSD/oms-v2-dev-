import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContactMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  mobile: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsString()
  @IsOptional()
  captchaToken?: string;
}
