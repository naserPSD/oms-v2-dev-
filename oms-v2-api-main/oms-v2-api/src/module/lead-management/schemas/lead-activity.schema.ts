import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadActivityDocument = LeadActivity & Document;

@Schema({ timestamps: true, collection: 'lead_activities' })
export class LeadActivity {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true })
  leadId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string; // MySQL user ID stored as string

  @Prop({ required: true })
  activityType: string; // Call, Email, Meeting, Note, Status Change, etc.

  @Prop()
  title: string;

  @Prop()
  appId: string;

  @Prop()
  description: string;

  @Prop({ type: Date, default: Date.now })
  activityDate: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Store additional data like email subject, call duration, etc.

  @Prop({
    type: String,
    enum: ['pending', 'in_process', 'done'],
    default: 'pending',
  })
  status: string; // Status for communications: pending, in_process, done

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const LeadActivitySchema = SchemaFactory.createForClass(LeadActivity);

// Create indexes
LeadActivitySchema.index({ leadId: 1, createdAt: -1 });
LeadActivitySchema.index({ userId: 1 });
LeadActivitySchema.index({ activityType: 1 });
