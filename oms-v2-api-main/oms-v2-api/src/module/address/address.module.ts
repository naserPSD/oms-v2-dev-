import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';

import { User } from '@module/users/entities/user.entity';
import { AuthModule } from '@module/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User]), AuthModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
