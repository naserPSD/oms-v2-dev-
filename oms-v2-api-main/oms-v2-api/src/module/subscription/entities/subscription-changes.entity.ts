import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'subscription_changes', synchronize: true })
export class SubscriptionChange {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'subscription_id',
    type: 'int',
    unsigned: true,
  })
  subscriptionId: number;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'old_user_count',
    type: 'int',
  })
  oldUserCount: number;

  @Column({
    name: 'new_user_count',
    type: 'int',
  })
  newUserCount: number;

  @Column({
    name: 'change_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  changeAmount: number;

  @Column({
    name: 'prorated_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  proratedAmount?: number | null;

  @Column({
    name: 'effective_date',
    type: 'datetime',
  })
  effectiveDate: Date;

  @Column({
    name: 'processed_at',
    type: 'datetime',
    nullable: true,
  })
  processedAt?: Date | null;

  @Column({
    name: 'stripe_invoice_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeInvoiceId?: string | null;

  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @Column({
    name: 'created_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  createdBy?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
