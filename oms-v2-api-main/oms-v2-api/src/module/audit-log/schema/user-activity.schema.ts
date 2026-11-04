// src/module/audit-log/entities/user-activity.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@module/users/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'user_activities',
  timestamps: { createdAt: true, updatedAt: false },
})
export class UserActivity {
  @Prop({ type: Number, index: true })
  userId?: number | null;

  @Prop({ type: String })
  sessionId?: string | null;

  @Prop({ type: String })
  ipAddress?: string | null;

  @Prop({ type: String })
  userAgent?: string | null;

  @Prop({ type: String })
  device?: string | null;

  @Prop({ type: String })
  os?: string | null;

  @Prop({ type: String })
  browser?: string | null;

  @Prop({ type: String })
  method?: string | null;

  @Prop({ type: String })
  url?: string | null;

  @Prop({ type: String })
  route?: string | null;

  @Prop({ type: String })
  refererPage?: string | null;

  @Prop({ type: String })
  currentPage?: string | null;

  @Prop({ type: Object })
  requestHeaders?: Record<string, any> | null;

  @Prop({ type: Object })
  requestData?: Record<string, any> | null;

  @Prop({ type: Number })
  responseCode?: number | null;

  @Prop({ type: String })
  status?: string | null;

  @Prop({ type: String })
  errorMessage?: string | null;

  createdAt?: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
