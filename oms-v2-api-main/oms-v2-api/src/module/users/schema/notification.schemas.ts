import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({
  collection: 'notifications',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Notification {
  @Prop({ type: Number, required: true, index: true })
  userId: number;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  createdAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
