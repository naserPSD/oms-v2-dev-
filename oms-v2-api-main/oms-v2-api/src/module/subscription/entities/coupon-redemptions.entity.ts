import { Coupon } from '@module/subscription/entities/coupons.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { Invoice } from '@module/subscription/entities/invoices.entity';
import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'coupon_redemptions', synchronize: true })
export class CouponRedemption {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'subscription_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  subscriptionId?: number | null;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Subscription;

  @Index(
    'unique_company_coupon_subscription',
    ['appId', 'couponId', 'subscriptionId'],
    { unique: true },
  )
  @Column({ name: 'coupon_id', type: 'int', unsigned: true })
  couponId: number;

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({
    name: 'invoice_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  invoiceId?: number | null;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @Column({
    name: 'discount_applied',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  discountApplied: number;

  @Column({
    name: 'stripe_promotion_code_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePromotionCodeId?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
