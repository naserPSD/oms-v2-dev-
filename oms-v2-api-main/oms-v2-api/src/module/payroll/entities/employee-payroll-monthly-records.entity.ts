import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { EmpSalaryStructure } from './employee-salary-structure.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { EmpPayrollRun } from './employee-payroll-runs.entity';
import { Status } from '@module/status/entities/status.entity';
import { EmpPayrollMonthlyBreakdown } from './emp-payroll-monthly-breakdowns.entity';

@Entity({ name: 'emp_payroll_monthly_records', synchronize: true })
export class EmpPayrollMonthlyRecords {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({
    name: 'payroll_run_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  payrollRunId?: number | null;

  @ManyToOne(() => EmpPayrollRun, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payroll_run_id' })
  payrollRun?: EmpPayrollRun | null;

  @Column({ name: 'emp_id', type: 'int', unsigned: true })
  empId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({ name: 'month', type: 'tinyint', unsigned: true })
  month: number;

  @Column({ name: 'year', type: 'smallint', unsigned: true })
  year: number;

  @Column({ name: 'salary_structure_id', type: 'int', unsigned: true })
  salaryStructureId: number;

  @ManyToOne(() => EmpSalaryStructure, { nullable: false })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure: EmpSalaryStructure;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 12, scale: 2 })
  basicSalary: number;

  @Column({
    name: 'total_earnings',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  totalEarnings?: number | null;

  @Column({
    name: 'total_deductions',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  totalDeductions?: number | null;

  @Column({
    name: 'net_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  netSalary?: number | null;

  @Column({ name: 'working_days', type: 'int', nullable: true, default: 0 })
  workingDays?: number | null;

  @Column({ name: 'present_days', type: 'int', nullable: true, default: 0 })
  presentDays?: number | null;

  @Column({ name: 'absent_days', type: 'int', nullable: true, default: 0 })
  absentDays?: number | null;

  @Column({
    name: 'paid_days',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  paidDays?: number | null;

  @Column({
    name: 'extra_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  extraAmount?: number | null;

  @Column({
    name: 'penalties_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0,
  })
  penaltiesAmount?: number | null;

  @Column({
    name: 'penalty_apply',
    type: 'tinyint',
    nullable: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  penaltyApply: boolean;

  @Column({ name: 'payable', type: 'decimal', precision: 12, scale: 2 })
  payable: number;

  @Column({
    name: 'paid',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  paid?: number | null;

  @Column({
    name: 'due',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  due: number;

  @Column({
    name: 'payment_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: 182,
  })
  paymentStatusId?: number | null;

  @ManyToOne(() => Status, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_status_id' })
  paymentStatus?: Status;

  @Column({ name: 'remarks', type: 'varchar', length: 255, nullable: true })
  remarks?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(
    () => EmpPayrollMonthlyBreakdown,
    (breakdown) => breakdown.monthlyRecord,
  )
  breakdowns: EmpPayrollMonthlyBreakdown[];
}
