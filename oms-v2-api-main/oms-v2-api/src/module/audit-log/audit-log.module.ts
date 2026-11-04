//src/module/audit-log/audit-log.module.ts
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContext } from '@common/request-context';
import { HttpRequestResponseUtils } from '@common/utils/http-request-response.utils';
import { AuditEntityListener } from '@common/listeners/audit-entity.listener';
import { UserContextService } from '@module/auth/user-context.service';
import { User } from '@module/users/entities/user.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
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
import { AuditSubscriber } from '@common/subscribers/audit.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Employee]),
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    RequestContext,
    HttpRequestResponseUtils,
    // AuditEntityListener,
    UserContextService,
    AuditSubscriber,
  ],
  exports: [
    AuditLogService,
    // AuditEntityListener,
    RequestContext,
    HttpRequestResponseUtils,
  ],
})
export class AuditLogModule {}
