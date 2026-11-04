import { Module } from '@nestjs/common';
import { DbConfigsService } from './db-configs.service';
import { DbConfigsController } from './db-configs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig } from './entities/db-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DbConfig])],
  controllers: [DbConfigsController],
  providers: [DbConfigsService],
  exports: [DbConfigsService],
})
export class DbConfigsModule {}
