import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  In,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'subscription_invoices', synchronize: true })
export class SubscriptionInvoice {
  @PrimaryGeneratedColumn({
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

  @ManyToOne(() => Subscription, { nullable: false })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    name: 'issue_date',
    type: 'datetime',
  })
  issueDate: Date;

  @Column({
    name: 'due_date',
    type: 'datetime',
  })
  dueDate: Date;

  @Column({
    name: 'status_id',
    type: 'int',
    unsigned: true,
  })
  statusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({
    name: 'paid_at',
    type: 'datetime',
    nullable: true,
  })
  paidAt: Date | null;

  @Index('idx_subscription_invoices_transaction_id')
  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  transactionId: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;
}
