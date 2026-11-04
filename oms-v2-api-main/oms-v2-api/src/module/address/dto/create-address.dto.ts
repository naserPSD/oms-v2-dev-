import { z } from 'zod';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { AddressType } from '../entities/address.entity';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export const CreateAddressBaseSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  countryId: z.number().min(1, 'Country ID is required'),
  postalCode: z.string().min(1).optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  addressType: z.nativeEnum(AddressType).optional(),
  email: z.string().email().optional(),
  mapLink: z.string().optional(),
  gmapLatitude: z.string().optional(),
  gmapLongitude: z.string().optional(),
  timezone: z.string().optional(),
  // timezone: z.string().min(1, 'Timezone is required'),
});

// Discriminated union based on `name` type
export const CreateAddressWithNameSchema = z.discriminatedUnion('name', [
  z
    .object({
      name: z.literal('user'),
      userId: z
        .number({ required_error: 'User Id Is Required' })
        .min(1, 'user is required'),
    })
    .merge(CreateAddressBaseSchema),

  z
    .object({
      name: z.literal('office'),
      officeId: z.number().min(1, 'office id is required').optional(),
    })
    .merge(CreateAddressBaseSchema),

  // Add more cases like 'office', 'employee' here
]);

export type CreateAddressDto = z.infer<typeof CreateAddressBaseSchema>;
export type CreateAddressWithNameDto = z.infer<
  typeof CreateAddressWithNameSchema
>;

export class CreateAddressDoc implements CreateAddressDto {
  @ApiProperty({ example: '123 Main St, Apt 4B' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: '10001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: '+1-202-555-0173' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  addressTypeId?: number;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://www.google.com/maps', required: false })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiProperty({ example: '40.712776', required: false })
  @IsOptional()
  @IsString()
  gmapLatitude?: string;

  @ApiProperty({ example: '-74.005974', required: false })
  @IsOptional()
  @IsString()
  gmapLongitude?: string;

  @ApiProperty({ required: false, example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;
  // Add optional fields used conditionally
  // @ApiProperty({
  //   example: 5,
  //   required: false,
  //   description: 'If user Address Store',
  // })
  userId?: number;

  // @ApiProperty({
  //   example: 10,
  //   required: false,
  //   description: 'If shipping Address Store',
  // })
  officeId?: number;
}
