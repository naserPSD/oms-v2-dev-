import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BillingCycle {
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

const decimalTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null | undefined) =>
    value === null || value === undefined ? 0 : Number(value),
};

@Entity({ name: 'subscription_plans', synchronize: false })
@Index('uq_subscription_plan_slug', ['slug'], { unique: true })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 100 })
  slug: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'monthly_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0.0,
    transformer: decimalTransformer,
  })
  monthlyPrice: number;

  @Column({
    name: 'yearly_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0.0,
    transformer: decimalTransformer,
  })
  yearlyPrice: number;

  @Column({
    name: 'per_user_yearly_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0.0,
    transformer: decimalTransformer,
  })
  perUserYearlyPrice: number;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
    nullable: true,
    default: 'USD',
  })
  currency?: string | null;

  @Column({
    name: 'features',
    type: 'longtext',
    nullable: true,
    transformer: {
      to: (value: any) =>
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : value,
      from: (value: string | any) => {
        if (!value) return null;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      },
    },
  })
  features?: any | null;

  @Column({
    name: 'min_users',
    type: 'int',
    nullable: true,
    default: 1,
  })
  minUsers?: number | null;

  @Column({
    name: 'max_users',
    type: 'int',
    nullable: true,
    default: null,
  })
  maxUsers?: number | null;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
    nullable: true,
    default: BillingCycle.MONTHLY,
  })
  billingCycle?: BillingCycle | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive: boolean;

  @Column({
    name: 'is_popular',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isPopular?: boolean;

  @Column({
    name: 'trial_days',
    type: 'int',
    nullable: true,
    default: 14,
  })
  trialDays?: number | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    nullable: true,
    default: 0,
  })
  sortOrder?: number | null;

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
  updatedAt?: Date | null;
}
