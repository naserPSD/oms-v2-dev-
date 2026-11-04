import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusGroup } from './entities/status-group.entity';
import { StatusGroupController } from './status-group.controller';
import { StatusGroupService } from './status-group.service';
import { AuthModule } from '@module/auth/auth.module';

@Module({
  controllers: [StatusGroupController],
  providers: [StatusGroupService],
  exports: [StatusGroupService],
  imports: [TypeOrmModule.forFeature([StatusGroup]), AuthModule],
})
export class StatusGroupModule {}
