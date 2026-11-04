import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BatchEmail } from './batch-emails.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'batch_email_recipients', synchronize: true })
export class BatchEmailRecipient {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'batch_email_id',
    type: 'int',
    unsigned: true,
  })
  batchEmailId: number;

  @ManyToOne(() => BatchEmail, { eager: false })
  @JoinColumn({ name: 'batch_email_id' })
  batchEmail: BatchEmail;

  @Column({
    name: 'model',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  model?: string | null;

  @Column({
    name: 'model_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  modelId?: number | null;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: [
      'pending',
      'sent',
      'opened',
      'link_visited',
      'bounced',
      'spam_complaint',
    ],
    default: 'pending',
  })
  status: string;

  @Column({
    name: 'sent_at',
    type: 'datetime',
    nullable: true,
  })
  sentAt?: Date | null;

  @Column({
    name: 'bounced_at',
    type: 'datetime',
    nullable: true,
  })
  bouncedAt?: Date | null;

  @Column({
    name: 'opened_at',
    type: 'datetime',
    nullable: true,
  })
  openedAt?: Date | null;

  @Column({
    name: 'link_visited_at',
    type: 'datetime',
    nullable: true,
  })
  linkVisitedAt?: Date | null;

  @Column({
    name: 'message_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  messageId?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
