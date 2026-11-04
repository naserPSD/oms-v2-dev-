import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { CreateEmployeeDto } from './employees.dto';
import { Type } from 'class-transformer';
import { CreateUserDto } from '@module/users/dto/user.dto';

export class CreateEmployeeWithUserDto {
  @ApiProperty({ type: () => CreateEmployeeDto })
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  employee: CreateEmployeeDto;

  @ApiProperty({ type: () => CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
