import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunicationDocument = Communication & Document;

@Schema({
  timestamps: true,
  collection: 'communications',
  toJSON: {
    transform: function (doc: any, ret: any) {
      // Convert _id to string (plain ObjectId string)
      if (ret._id) {
        ret._id = ret._id.toString();
      }
      // Convert leadId to string if it's an ObjectId
      if (
        ret.leadId &&
        ret.leadId.toString &&
        typeof ret.leadId.toString === 'function'
      ) {
        ret.leadId = ret.leadId.toString();
      }
      return ret;
    },
  },
  toObject: {
    transform: function (doc: any, ret: any) {
      // Convert _id to string (plain ObjectId string)
      if (ret._id) {
        ret._id = ret._id.toString();
      }
      // Convert leadId to string if it's an ObjectId
      if (
        ret.leadId &&
        ret.leadId.toString &&
        typeof ret.leadId.toString === 'function'
      ) {
        ret.leadId = ret.leadId.toString();
      }
      return ret;
    },
  },
})
export class Communication {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true })
  leadId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string; // MySQL user ID stored as string

  @Prop({ type: String, required: true, enum: ['Call', 'Appointment', 'Task'] })
  type: string; // Call, Appointment, Task

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true })
  activityDate: Date;

  @Prop({
    type: String,
    enum: ['pending', 'in_process', 'done'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CommunicationSchema = SchemaFactory.createForClass(Communication);

// Create indexes
CommunicationSchema.index({ leadId: 1, createdAt: -1 });
CommunicationSchema.index({ userId: 1 });
CommunicationSchema.index({ type: 1 });
