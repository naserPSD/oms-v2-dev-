import { Application } from '@module/application/entities/application.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmpPayItem } from './employee-pay-items.entity';
import { EmpPayrollMonthlyRecords } from './employee-payroll-monthly-records.entity';

@Entity({ name: 'emp_payroll_monthly_breakdowns', synchronize: true })
export class EmpPayrollMonthlyBreakdown {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application | null;

  @Column({
    name: 'monthly_record_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  monthlyRecordId?: number | null;

  @ManyToOne(() => EmpPayrollMonthlyRecords, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monthly_record_id' })
  monthlyRecord?: EmpPayrollMonthlyRecords | null;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: true })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee | null;

  @Column({ name: 'pay_item_id', type: 'bigint', unsigned: true })
  payItemId: number;

  @ManyToOne(() => EmpPayItem, { nullable: false })
  @JoinColumn({ name: 'pay_item_id' })
  payItem: EmpPayItem;

  @Column({ name: 'month', type: 'tinyint', unsigned: true })
  month: number;

  @Column({ name: 'year', type: 'smallint', unsigned: true })
  year: number;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom?: Date | null;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo?: Date | null;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  amount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt?: Date | null;
}
