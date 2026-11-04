import { forwardRef, Module } from '@nestjs/common';
import { InitialSetupService } from './initial-setup.service';
import { InitialSetupController } from './initial-setup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import { AuthModule } from '@module/auth/auth.module';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { AddressService } from '@module/address/address.service';
import { Address } from '@module/address/entities/address.entity';
import { MediaModule } from '@module/media/media.module';
import { Role } from '@module/role-permission/entities/role.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { MasterDocument } from '@module/hr-management/entities/master-documents.entity';
import { CompanyDocument } from '@module/hr-management/entities/company-documents.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { SubscriptionPlan } from '@module/subscription/entities/subscription-plan.entity';
import { Status } from '@module/status/entities/status.entity';
import { UsersModule } from '@module/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      User,
      AppUser,
      UserProfile,
      Office,
      Address,
      Role,
      UserRole,
      MasterDocument,
      CompanyDocument,
      Subscription,
      SubscriptionPlan,
      Status,
    ]),
    AuthModule,
    MediaModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [InitialSetupController],
  providers: [InitialSetupService],
})
export class InitialSetupModule {}
