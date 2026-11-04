import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { EmpPayrollMonthlyRecords } from './employee-payroll-monthly-records.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'emp_payment_history', synchronize: true })
export class EmpPaymentHistory {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', nullable: true, unsigned: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'payroll_employee_id', type: 'int', unsigned: true })
  payrollEmployeeId: number;

  // @ManyToOne(() => EmpPayrollEmployee, { nullable: false })
  // @JoinColumn({ name: 'payroll_employee_id' })
  // payrollEmployee: EmpPayrollEmployee;

  @Column({ name: 'emp_id', type: 'int', unsigned: true })
  empId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({
    name: 'payment_method_id',
    type: 'int',
    nullable: true,
    unsigned: true,
  })
  paymentMethodId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod?: Status;

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName?: string | null;

  @Column({
    name: 'account_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  accountNumber?: string | null;

  @Column({
    name: 'transaction_ref',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  transactionRef?: string | null;

  @Column({
    name: 'amount_paid',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  amountPaid: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({
    name: 'payment_status_id',
    type: 'int',
    nullable: true,
    unsigned: true,
  })
  paymentStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'payment_status_id' })
  paymentStatus?: Status;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ name: 'paid_by', type: 'int', nullable: true, unsigned: true })
  paidBy?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
