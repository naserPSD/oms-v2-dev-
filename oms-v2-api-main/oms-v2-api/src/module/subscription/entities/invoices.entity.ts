import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { User } from '@module/users/entities/user.entity';
import { Application } from '@module/application/entities/application.entity';
import { Coupon } from './coupons.entity';
import { PaymentTransaction } from '@module/payment/entities/payment-transaction.entity';
import { InvoiceItem } from '@module/Accounts/entities/invoice-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'invoices', synchronize: false })
export class Invoice {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'subscription_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  subscriptionId?: number | null;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @OneToMany(() => PaymentTransaction, (payment) => payment.invoice)
  paymentTransactions: PaymentTransaction[];

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
    name: 'invoice_number',
    type: 'varchar',
    length: 100,
  })
  invoiceNumber: string;

  @Column({
    name: 'base_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  baseAmount: number;

  @Column({
    name: 'per_user_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  perUserAmount: number;

  @Column({
    name: 'user_count',
    type: 'int',
    default: 1,
  })
  userCount: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  taxAmount?: number | null;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  discountAmount?: number | null;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount: number;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
    default: 'USD',
    nullable: true,
  })
  currency?: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: string;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  paymentStatus?: string | null;

  @Column({
    name: 'billing_period_start',
    type: 'datetime',
    nullable: true,
  })
  billingPeriodStart?: Date | null;

  @Column({
    name: 'billing_period_end',
    type: 'datetime',
    nullable: true,
  })
  billingPeriodEnd?: Date | null;

  @Column({
    name: 'coupon_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  couponId?: number | null;

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({
    name: 'due_date',
    type: 'datetime',
    nullable: true,
  })
  dueDate?: Date | null;

  @Column({
    name: 'paid_at',
    type: 'datetime',
    nullable: true,
  })
  paidAt?: Date | null;

  @Column({
    name: 'pdf_url',
    type: 'text',
    nullable: true,
  })
  pdfUrl?: string | null;

  @Column({
    name: 'invoice_items',
    type: 'longtext',
    nullable: true,
  })
  invoiceItems?: any | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column({
    name: 'stripe_invoice_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeInvoiceId?: string | null;

  @Column({
    name: 'stripe_payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentIntentId?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt?: Date | null;
}
