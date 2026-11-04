import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
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

export enum ExpenseStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'account_expenses', synchronize: false })
@Index('uq_account_expense_app_number', ['appId', 'expenseNumber'], { unique: true })
@Index('idx_account_expense_app_date', ['appId', 'expenseDate'])
@Index('idx_account_expense_app_status', ['appId', 'status'])
@Index('idx_account_expense_app_category', ['appId', 'category'])
export class Expense {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId!: number;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application!: Application;

  @Column({ name: 'expense_number', type: 'varchar', length: 100 })
  expenseNumber!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency!: string;

  @Column({ name: 'expense_date', type: 'datetime' })
  expenseDate!: Date;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  vendor?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  reference?: string | null;

  @Column({ type: 'varchar', length: 20, default: ExpenseStatus.PAID })
  status!: ExpenseStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User | null;

  @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
  updatedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser?: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}