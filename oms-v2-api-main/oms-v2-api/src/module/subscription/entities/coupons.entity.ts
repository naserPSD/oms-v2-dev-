import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'coupons', synchronize: true })
export class Coupon {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({ name: 'discount_type', type: 'varchar', length: 20 })
  discountType: string;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  discountValue: number;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
    nullable: true,
    default: 'USD',
  })
  currency?: string | null;

  @Column({
    name: 'valid_from',
    type: 'datetime',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  validFrom?: Date | null;

  @Column({
    name: 'valid_until',
    type: 'datetime',
    nullable: true,
  })
  validUntil?: Date | null;

  @Column({
    name: 'max_redemptions',
    type: 'int',
    nullable: true,
  })
  maxRedemptions?: number | null;

  @Column({
    name: 'redemption_count',
    type: 'int',
    nullable: true,
    default: 0,
  })
  redemptionCount?: number | null;

  @Column({
    name: 'applies_to',
    type: 'varchar',
    length: 20,
    nullable: true,
    default: 'all',
  })
  appliesTo?: string | null;

  @Column({
    name: 'applicable_plans',
    type: 'longtext',
    nullable: true,
    transformer: {
      to: (value: number[] | null) => (value ? JSON.stringify(value) : null),
      from: (value: string | null) => (value ? JSON.parse(value) : null),
    },
  })
  applicablePlans?: number[] | null;

  @Column({
    name: 'minimum_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minimumAmount?: number | null;

  @Column({
    name: 'max_uses_per_company',
    type: 'int',
    nullable: true,
    default: 1,
  })
  maxUsesPerCompany?: number | null;

  @Column({
    name: 'first_time_only',
    type: 'tinyint',
    nullable: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  firstTimeOnly: boolean;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive: boolean;

  @Column({
    name: 'is_redeemable',
    type: 'tinyint',
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isRedeemable: boolean;

  @Column({
    name: 'created_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  createdBy?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User | null;

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
