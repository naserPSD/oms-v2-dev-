import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';

export type EmailBroadcastStatus =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'sent'
  | 'failed';
export type EmailBroadcastRecipientType = 'all' | 'selected' | 'custom';

@Entity({ name: 'email_broadcasts', synchronize: false })
export class EmailBroadcast {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'longtext' })
  message: string;

  @Column({
    name: 'recipient_type',
    type: 'enum',
    enum: ['all', 'selected', 'custom'],
    default: 'all',
  })
  recipientType: EmailBroadcastRecipientType;

  @Column({ name: 'custom_emails', type: 'text', nullable: true })
  customEmails: string | null;

  @Column({
    type: 'enum',
    enum: ['draft', 'scheduled', 'queued', 'sent', 'failed'],
    default: 'sent',
  })
  status: EmailBroadcastStatus;

  @Column({ name: 'is_scheduled', type: 'tinyint', width: 1, default: 0 })
  isScheduled: boolean;

  @Column({ name: 'schedule_time', type: 'datetime', nullable: true })
  scheduleTime: Date | null;

  @Column({ name: 'queue_token', type: 'varchar', length: 64, nullable: true })
  queueToken: string | null;

  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'int', default: 0 })
  recipients: number;

  @Column({ type: 'int', default: 0 })
  bounced: number;

  @Column({ type: 'int', default: 0 })
  received: number;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ name: 'recipient_details', type: 'json', nullable: true })
  recipientDetails: Array<Record<string, string | number>> | null;

  @Column({ name: 'attachment_details', type: 'json', nullable: true })
  attachmentDetails: Array<Record<string, string>> | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
