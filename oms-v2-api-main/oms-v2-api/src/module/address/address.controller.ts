import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDoc, CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';

import { Address } from './entities/address.entity';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@Controller('api/v1/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post(':name')
  @ApiBody({ type: CreateAddressDoc })
  @ApiOkResponse({ type: [Address], description: 'Store user addresses' })
  @ApiParam({
    name: 'name',
    required: true,
    type: String,
    description: 'user/shipping/office/employee',
  })
  create(@Param('name') name: string, @Body() body: any) {
    return this.addressService.store_address(name, body);
  }

  @Get()
  findAll() {
    return this.addressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(+id);
  }
}
