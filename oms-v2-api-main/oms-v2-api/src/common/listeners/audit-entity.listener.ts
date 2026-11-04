// src/common/listeners/audit-entity.listener.ts
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
  Connection,
} from 'typeorm';
import { AuditLogService } from '../../module/audit-log/audit-log.service';
import { RequestContext } from '../request-context';
import { AuditableEntity } from './auditable-entity';

@EventSubscriber()
export class AuditEntityListener implements EntitySubscriberInterface {
  constructor(
    private readonly connection: Connection,
    private readonly auditLogService: AuditLogService,
    private readonly requestContext: RequestContext,
  ) {
    connection.subscribers.push(this);
  }

  afterLoad(entity: any, event?: LoadEvent<any>): void {
    if (entity instanceof AuditableEntity) {
      try {
        // Deep clone the entity state
        const originalState = JSON.parse(JSON.stringify(entity));
        entity.setOriginalState(originalState);
      } catch (error) {
        console.error('Failed to clone entity in afterLoad', error);
      }
    }
  }

  afterInsert(event: InsertEvent<any>): void {
    if (event.entity instanceof AuditableEntity) {
      const originalState = event.entity.getOriginalState();

      this.saveAuditLog('CREATE', event.entity, null);
    }
  }

  afterUpdate(event: UpdateEvent<any>): void {
    if (event.entity instanceof AuditableEntity) {
      const originalState = event.entity.getOriginalState();
      this.saveAuditLog('UPDATE', event.entity, originalState);
    }
  }

  beforeRemove(event: RemoveEvent<any>): void {
    if (event.entity instanceof AuditableEntity) {
      this.saveAuditLog('DELETE', null, event.entity);
    }
  }

  private async saveAuditLog(
    action: string,
    newData: any,
    oldData: any,
  ): Promise<void> {
    try {
      const entityId = newData ? newData.id : oldData ? oldData.id : null;

      const newJson = newData ? JSON.stringify(newData) : null;
      const oldJson = oldData ? JSON.stringify(oldData) : null;
      const entityName = newData
        ? newData.constructor.name
        : oldData
          ? oldData.constructor.name
          : 'Unknown';

      await this.auditLogService.saveLog(
        action,
        entityName,
        entityId,
        oldJson ?? '',
        newJson ?? '',
      );
    } catch (error) {
      console.error('Failed to save audit log', error);
    }
  }
}
