// src/common/helpers/helpers.module.ts
import { Global, Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { User } from '@module/users/entities/user.entity';
import { Status } from '@module/status/entities/status.entity';
import { StatusGroup } from '@module/status-group/entities/status-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from '@module/country/entities/country.entity';
import { HelperController } from './helper.controller';
import { CacheService } from 'src/redis/cache.service';
import { UserContextService } from '@module/auth/user-context.service';

@Global()
@Module({
  controllers: [HelperController],
  imports: [TypeOrmModule.forFeature([User, Status, StatusGroup, Country])],
  providers: [HelperService, CacheService, UserContextService],
  exports: [HelperService],
})
export class HelperModule {}
