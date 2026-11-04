import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SubscriptionModule } from '@module/subscription/subscription.module';
import { AuthModule } from '@module/auth/auth.module';
import { UsersModule } from '@module/users/users.module';
import { User } from '@module/users/entities/user.entity';
import { SubscriptionPlan } from '@module/subscription/entities/subscription-plan.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Status } from '@module/status/entities/status.entity';
import { Invoice } from '@module/subscription/entities/invoices.entity';
import { PaymentDashboardController } from './payment-dashboard.controller';
import { PaymentDashboardService } from './payment-dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction,
      User,
      SubscriptionPlan,
      Subscription,
      Status,
      Invoice,
    ]),
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [PaymentController, PaymentDashboardController],
  providers: [PaymentService, PaymentDashboardService],
  exports: [PaymentService],
})
export class PaymentModule {}
