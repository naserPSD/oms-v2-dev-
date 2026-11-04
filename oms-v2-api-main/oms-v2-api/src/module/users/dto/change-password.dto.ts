import { Match } from '@common/utils/custom-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: '12345678',
    description: 'User password',
  })
  @ValidateIf((o) => !o.id || o.id === 0) // required only if new user
  @IsNotEmpty({ message: 'Password is required for new users' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long, contain one uppercase, one lowercase, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({ required: true })
  @ValidateIf((o) => !o.id || o.id === 0 || o.password) // required if new OR password is set
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', {
    message: 'New password and confirm password do not match',
  })
  confirmPassword?: string;
}
