//src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from './mail/mail.module';
import { AddressModule } from './module/address/address.module';
import { ApplicationModule } from './module/application/application.module';
import { StatusModule } from './module/status/status.module';
import { StatusGroupModule } from './module/status-group/status-group.module';
import { UsersModule } from './module/users/users.module';
import mailConfig from './config/mail.config';
import sslcommerzConfig from './config/sslcommerz.config';
import { MysqlModule } from '@database/mysql.module';
import { MongoModule } from '@database/mongo.module';
import { EmailModule } from '@providers/email/email.module';
import { UserContextService } from '@module/auth/user-context.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AuthModule } from './module/auth/auth.module';
import { Status } from '@module/status/entities/status.entity';
import { StatusGroup } from '@module/status-group/entities/status-group.entity';
import { HelperModule } from '@common/helpers/helper.module';
import { GoogleStrategy } from '@core/strategy/google.strategy';
import googleOauthConfig from '@config/google-Oauth.config';
import { User } from '@module/users/entities/user.entity';
import { FacebookStrategy } from '@core/strategy/facebook.strategy';
import { InitialSetupModule } from './module/initial-setup/initial-setup.module';
import { OfficeModule } from './module/office/office.module';
import { DbConfigsModule } from './module/db-configs/db-configs.module';
import facebookOatuthConfig from '@config/facebook-oatuth.config';
import { MediaModule } from '@module/media/media.module';
import { AuditLogModule } from './module/audit-log/audit-log.module';
import { AuditEntityListener } from '@common/listeners/audit-entity.listener';
import { RequestContextMiddleware } from '@common/middleware/request-context.middleware';
import { RequestContextModule } from '@common/request-context.module';
import { Injector } from '@nestjs/core/injector/injector';
import { RequestContext } from '@common/request-context';
import { TaskModule } from './module/task/task.module';
import { RolePermissionModule } from './module/role-permission/role-permission.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PermissionGuard } from '@core/guards/permission.guard';
import { HrManagementModule } from './module/hr-management/hr-management.module';
import { SubscriptionModule } from './module/subscription/subscription.module';
import { AppRedisModule } from './redis/redis.module';
import { AuditLogService } from '@module/audit-log/audit-log.service';
import { ActivityLoggerMiddleware } from '@common/middleware/activity-logger.middleware';
import { HybridQueueModule } from './queue/hybrid-queue.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsModule } from './metrics/metrics.module';
// import { join } from 'path';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { PayrollModule } from './module/payroll/payroll.module';
import { LeadManagementModule } from './module/lead-management/lead-management.module';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { RequestContextInterceptor } from '@common/interceptors/request-context.interceptor';
import { RequestContextClsMiddleware } from '@common/middleware/request-context-cls.middleware';
import { SchedulerService } from './scheduler/scheduler.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserActivity,
  UserActivitySchema,
} from '@module/audit-log/schema/user-activity.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '@module/audit-log/schema/audit-log.schema';
import {
  UserSession,
  UserSessionSchema,
} from '@module/audit-log/schema/user-sessions.schema';
import { RecruitmentModule } from '@module/recruitment/recruitment.module';
import { ContactModule } from './module/contact/contact.module';
import { BlogModule } from './module/blog/blog.module';
import { WebsiteContentModule } from './module/website-content/website-content.module';
import { MeetingModule } from './module/meeting/meeting.module';
import { AccountsModule } from './module/Accounts/accounts.module';
import { EmailTemplateModule } from './module/email-template/email-template.module';
import { PaymentModule } from './module/payment/payment.module';
import { TrainingModule } from './module/training/training.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig, sslcommerzConfig],
    }),
    TypeOrmModule.forFeature([Status, StatusGroup, User]),
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
    MetricsModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'static'),
    //   serveRoot: '/static', // public prefix
    // }),
    MysqlModule,
    MongoModule,
    // EmailModule,
    MailModule,
    AppRedisModule,
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(facebookOatuthConfig),
    AuthModule,
    NestjsFormDataModule,
    UsersModule,
    StatusModule,
    StatusGroupModule,
    AddressModule,
    ApplicationModule,
    HelperModule,
    InitialSetupModule,
    OfficeModule,
    DbConfigsModule,
    MediaModule,
    AuditLogModule,
    RequestContextModule,
    TaskModule,
    RolePermissionModule,
    HrManagementModule,
    SubscriptionModule,
    HybridQueueModule,
    PayrollModule,
    LeadManagementModule,
    RecruitmentModule,
    ContactModule,
    BlogModule,
    WebsiteContentModule,
    MeetingModule,
    AccountsModule,
    EmailTemplateModule,
    PaymentModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditLogService,
    UserContextService,
    GoogleStrategy,
    FacebookStrategy,
    // AuditEntityListener,
    SchedulerService,
    // AuditSubscriber,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextClsMiddleware).forRoutes('*');
    consumer.apply(ActivityLoggerMiddleware).forRoutes('*'); // Apply to all routes
    // consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
