import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'emp_income_tax_tiers', synchronize: true })
export class EmpIncomeTaxTier {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({
    name: 'financial_year',
    type: 'varchar',
    length: 10,
    comment: 'e.g., 2024-25',
  })
  financialYear: string;

  @Column({ name: 'tier_name', type: 'varchar', length: 100 })
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
    comment: 'NULL means no upper limit',
  })
  maxIncome?: number | null;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: 'Percentage rate',
  })
  taxRate: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
    comment: 'Fixed tax amount for this tier',
  })
  taxAmount: number;

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
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
