import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { AuthModule } from '@module/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeShift } from '../hr-management/entities/office-shift.entity';
import { Office } from '@module/hr-management/entities/office.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Office]), AuthModule],
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
})
export class OfficeModule {}
