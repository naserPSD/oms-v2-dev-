import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserContextService } from '@module/auth/user-context.service';
import { Subscription } from './entities/subscription.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { SubscriptionInvoice } from './entities/subscription-invoices.entity';
import { Status } from '@module/status/entities/status.entity';
import { AuthModule } from '@module/auth/auth.module';
import { UsersModule } from '@module/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { Coupon } from './entities/coupons.entity';
import { Invoice } from './entities/invoices.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppUser,
      SubscriptionPlan,
      Subscription,
      SubscriptionInvoice,
      Status,
      Coupon,
      Invoice,
    ]),

    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MailModule),
    HttpModule,
  ],

  controllers: [SubscriptionController],
  providers: [SubscriptionService, UserContextService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
