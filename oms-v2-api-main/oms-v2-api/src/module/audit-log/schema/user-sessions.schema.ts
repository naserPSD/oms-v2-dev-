import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// @Entity({ name: 'user_sessions', synchronize: true })
@Schema({
  collection: 'user_sessions',
  timestamps: { createdAt: true, updatedAt: false },
})
export class UserSession {
  @Prop({ type: Number, index: true })
  userId: number | null;

  @Prop({ type: String })
  device: string | null;

  @Prop({ type: String })
  location: string | null;

  @Prop({ type: String })
  city: string | null;

  @Prop({ type: String })
  countryName: string | null;

  @Prop({ type: String })
  browser: string | null;

  @Prop({ type: String })
  ipAddress: string | null;

  @Prop({ type: Date })
  startDateTime: Date | null;

  @Prop({ type: Date })
  endDateTime: Date | null;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
