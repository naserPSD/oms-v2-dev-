//src/module/audit-log/entities/audit-log.entity.ts
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: true, updatedAt: false },
})
export class AuditLog {
  @Prop({ type: Number, index: true })
  userId?: number | null;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String })
  entity?: string;

  @Prop({ type: Number, index: true })
  entityId?: number;

  @Prop({ type: SchemaTypes.Mixed })
  details?: Record<string, any> | any;

  @Prop({ type: String })
  ipAddress?: string | null;

  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
