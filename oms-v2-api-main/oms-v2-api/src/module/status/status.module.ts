import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { AuthModule } from '@module/auth/auth.module';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
  imports: [TypeOrmModule.forFeature([Status]), AuthModule],
})
export class StatusModule {}
