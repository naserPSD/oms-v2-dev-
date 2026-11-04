import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'emp_income_tax_tiers', synchronize: false })
export class EmpIncomeTaxTier {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application | null;

  @Column({
    name: 'financial_year',
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  financialYear: string;

  @Column({
    name: 'tier_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  tierName: string;

  @Column({
    name: 'min_income',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  minIncome: number;

  @Column({
    name: 'max_income',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxIncome?: number | null;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
  })
  taxRate: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  taxAmount: number;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6,
    nullable: true,
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date | null;
}
