import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';

import { User } from '@module/users/entities/user.entity';
import { AuthModule } from '@module/auth/auth.module';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Service } from './entities/service.entity';
import { Department } from './entities/departments.entity';
import { Designation } from './entities/designations.entity';
import { CacheService } from 'src/redis/cache.service';
import { MediaModule } from '@module/media/media.module';
import { Office } from '@module/hr-management/entities/office.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      User,
      AppUser,
      Service,
      Department,
      Designation,
      Office,
    ]),
    AuthModule,
    MediaModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, CacheService],
})
export class ApplicationModule {}
