import { PartialType } from '@nestjs/swagger';
import { CreateAddressDoc } from './create-address.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDoc) {}
