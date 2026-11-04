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

export enum IncomeStatus { 
  PENDING = 'pending', 
  RECEIVED = 'received', 
  CANCELLED = 'cancelled',
  DUE = 'due',
  OVERDUE = 'overdue',
  PARTIAL_PAID = 'partial paid'
}

@Entity({ name: 'account_income', synchronize: false })
@Index('uq_account_income_app_number', ['appId', 'incomeNumber'], { unique: true })
@Index('idx_account_income_app_date', ['appId', 'incomeDate'])
@Index('idx_account_income_app_status', ['appId', 'status'])
export class Income {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true }) id!: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId!: number;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application!: Application;

  @Column({ name: 'income_number', type: 'varchar', length: 100 })
  incomeNumber!: string;
  @Column({ type: 'varchar', length: 150 }) source!: string;
  @Column({ type: 'varchar', length: 100 }) category!: string;
  @Column({ type: 'text', nullable: true }) description?: string | null;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) amount!: number;
  @Column({ type: 'varchar', length: 10, default: 'BDT' }) currency!: string;
  @Column({ name: 'income_date', type: 'datetime' }) incomeDate!: Date;
  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true }) paymentMethod?: string | null;
  @Column({ type: 'varchar', length: 150, nullable: true }) reference?: string | null;
  @Column({ name: 'customer_id', type: 'int', unsigned: true, nullable: true }) customerId?: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'customer_id' }) customer?: User | null;
  @Column({ name: 'account_invoice_id', type: 'int', unsigned: true, nullable: true })
  accountInvoiceId?: number | null;
  @Column({ type: 'varchar', length: 20, default: IncomeStatus.RECEIVED }) status!: IncomeStatus;
  @Column({ type: 'text', nullable: true }) notes?: string | null;
  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true }) createdBy?: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'created_by' }) createdByUser?: User | null;
  @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true }) updatedBy?: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'updated_by' }) updatedByUser?: User | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' }) updatedAt!: Date;
}