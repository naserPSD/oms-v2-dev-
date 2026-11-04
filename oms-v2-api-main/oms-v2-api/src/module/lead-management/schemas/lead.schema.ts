import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true, collection: 'leads' })
export class Lead {
  // New form fields
  @Prop()
  leadType: string; // individual, company, organization

  @Prop()
  name: string; // Company/Lead name

  @Prop()
  companyType: string; // startup, small_business, medium_business, etc.

  @Prop()
  priorityStatus: string; // low, medium, high, urgent

  @Prop()
  clientStatus: string; // prospect, lead, customer, partner, vendor

  // Key Contact Info
  @Prop()
  contactName: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactDepartment: string;

  @Prop()
  contactDesignation: string;

  @Prop()
  contactPhone: string;

  @Prop()
  contactAlternativePhone: string;

  @Prop()
  leadSource: string; // LinkedIn, Facebook, Instagram, Website, Referral, etc.

  @Prop({ type: String, default: 'Active' })
  leadStatus: string; // Active, In Process, Converted, Lost, Follow Up

  @Prop({ type: Number, default: 0 })
  dealValue: number;

  @Prop({ type: Date })
  lastContact: Date;

  @Prop({ type: String })
  assignedTo: string; // MySQL user ID stored as string

  @Prop({ type: String })
  createdBy: string; // MySQL user ID stored as string

  @Prop()
  notes: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  website: string;

  @Prop({ type: Object })
  customFields: Record<string, any>;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // Multiple contacts and remarks
  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  contacts: Array<{
    name: string;
    email?: string;
    department?: string;
    designation?: string;
    phone?: string;
    alternativePhone?: string;
    createdAt?: Date;
  }>;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  remarks: Array<{
    remark: string;
    createdBy?: string;
    createdAt?: Date;
  }>;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Create indexes for better query performance
LeadSchema.index({ contactEmail: 1 });
LeadSchema.index({ contactPhone: 1 });
LeadSchema.index({ leadStatus: 1 });
LeadSchema.index({ leadSource: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });
