import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@module/users/entities/user.entity';
import { SubscriptionPlan } from '@module/subscription/entities/subscription-plan.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Invoice } from '@module/subscription/entities/invoices.entity';

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  VALIDATED = 'VALIDATED',
}

@Entity({ name: 'payment_transactions', synchronize: false })
export class PaymentTransaction {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'subscription_plan_id', type: 'int', unsigned: true })
  subscriptionPlanId: number;

  @ManyToOne(() => SubscriptionPlan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan;

  @Column({ name: 'subscription_id', type: 'int', unsigned: true, nullable: true })
  subscriptionId?: number | null;

  @ManyToOne(() => Subscription, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Subscription | null;

  @Column({ name: 'invoice_id', type: 'int', unsigned: true, nullable: true })
  invoiceId?: number | null;

  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice | null;

  @Index('UQ_payment_transactions_tran_id', { unique: true })
  @Column({ name: 'tran_id', type: 'varchar', length: 100, unique: true })
  tranId: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, nullable: false, default: 'BDT' })
  currency: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentTransactionStatus,
    default: PaymentTransactionStatus.PENDING,
  })
  status: PaymentTransactionStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true, default: 'sslcommerz' })
  paymentMethod?: string | null;

  @Column({ name: 'gateway', type: 'varchar', length: 50, nullable: true, default: 'sslcommerz' })
  gateway?: string | null;

  @Column({ name: 'gateway_response', type: 'json', nullable: true })
  gatewayResponse?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6, nullable: true, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt?: Date | null;
}
