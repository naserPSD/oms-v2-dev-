import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'emp_payroll_runs', synchronize: true })
export class EmpPayrollRun {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', nullable: true, unsigned: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'payroll_code', type: 'varchar', length: 50 })
  payrollCode: string;

  @Column({ name: 'pay_period_month', type: 'tinyint', unsigned: true })
  payPeriodMonth: number;

  @Column({ name: 'pay_period_year', type: 'smallint', unsigned: true })
  payPeriodYear: number;

  @Column({ name: 'pay_period_start', type: 'date', nullable: true })
  payPeriodStart?: string;

  @Column({ name: 'pay_period_end', type: 'date', nullable: true })
  payPeriodEnd?: string;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate?: string | null;

  @Column({
    name: 'payment_status_id',
    type: 'int',
    nullable: true,
    unsigned: true,
    default: 182,
  })
  paymentStatusId?: number | null;

  @ManyToOne(() => Status, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_status_id' })
  paymentStatus: Status;

  @Column({ type: 'int', name: 'total_employees', nullable: true, default: 0 })
  totalEmployees?: number | null;

  @Column({
    type: 'decimal',
    name: 'payable',
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  payable: number;

  @Column({
    type: 'decimal',
    name: 'paid',
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  paid: number;

  @Column({
    type: 'decimal',
    name: 'due',
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  due: number;

  @Column({ type: 'varchar', name: 'remarks', length: 500, nullable: true })
  remarks?: string | null;

  @Column({ type: 'int', name: 'processed_by', unsigned: true, nullable: true })
  processedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processed_by' })
  processor?: User;

  @Column({ type: 'timestamp', name: 'processed_at', nullable: true })
  processedAt?: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
