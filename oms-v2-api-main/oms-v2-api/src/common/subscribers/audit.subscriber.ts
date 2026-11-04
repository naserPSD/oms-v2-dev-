import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { RequestContext } from '@common/request-context';
import { AuditLogService } from '@module/audit-log/audit-log.service';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private skipTables = [
    'audit_logs',
    'user_activities',
    'user_sessions',
    'payment_transactions',
    'subscriptions',
  ];

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
  }

  private shouldLog(tableName: string): boolean {
    if (!tableName) return false;
    return !this.skipTables.includes(tableName);
  }

  private safeParse(data: any) {
    if (!data) return null;
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      return { error: 'Unserializable entity state' };
    }
  }

  private extractChanges(before: any, after: any) {
    if (!before || !after) return null;

    const changes: any = {};
    for (const key in after) {
      if (['id', 'createdAt', 'updatedAt'].includes(key)) continue;

      const beforeVal = before[key];
      const afterVal = after[key];

      const beforeString =
        beforeVal instanceof Date
          ? beforeVal.toISOString()
          : JSON.stringify(beforeVal);
      const afterString =
        afterVal instanceof Date
          ? afterVal.toISOString()
          : JSON.stringify(afterVal);

      if (beforeString !== afterString) {
        changes[key] = { before: beforeVal, after: afterVal };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * AFTER INSERT
   */
  async afterInsert(event: InsertEvent<any>) {
    if (!this.shouldLog(event.metadata.tableName)) return;

    try {
      await this.auditLogService.createLog({
        userId: RequestContext.get<number>('userId'),
        action: 'INSERT',
        entity: event.metadata.tableName,
        entityId: event.entity?.id,
        details: { after: this.safeParse(event.entity) },
        ipAddress: RequestContext.getClientIpAddress(),
      });
    } catch (error) {
      console.log('[AuditSubscriber] afterInsert ERROR', error);
    }
  }

  /**
   * AFTER UPDATE
   */
  async afterUpdate(event: UpdateEvent<any>) {
    if (!this.shouldLog(event.metadata.tableName)) return;

    try {
      const before = event.databaseEntity
        ? this.safeParse(event.databaseEntity)
        : null;

      const after = event.entity ? this.safeParse(event.entity) : null;

      // If before is null, log whatever we have
      const changes =
        before && after ? this.extractChanges(before, after) : after;

      await this.auditLogService.createLog({
        userId: RequestContext.get<number>('userId'),
        action: 'UPDATE',
        entity: event.metadata.tableName,
        entityId: event.entity?.id ?? event.databaseEntity?.id,
        details: { before, after, changes },
        ipAddress: RequestContext.getClientIpAddress(),
      });
    } catch (error) {
      console.error('[AuditSubscriber] afterUpdate ERROR', error);
    }
  }

  /**
   * AFTER REMOVE
   */
  async afterRemove(event: RemoveEvent<any>) {
    if (!this.shouldLog(event.metadata.tableName)) return;

    try {
      await this.auditLogService.createLog({
        userId: RequestContext.get<number>('userId'),
        action: 'DELETE',
        entity: event.metadata.tableName,
        entityId: event.entity?.id || event.databaseEntity?.id,
        details: { before: this.safeParse(event.databaseEntity) },
        ipAddress: RequestContext.getClientIpAddress(),
      });
    } catch (error) {
      console.log('[AuditSubscriber] afterRemove ERROR', error);
    }
  }
}
