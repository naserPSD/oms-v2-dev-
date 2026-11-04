import { Application } from '@module/application/entities/application.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, // Must be imported for 'updated_at'
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EmpSalaryGrade } from './employee-salary-grades.entity';
import { User } from '@module/users/entities/user.entity';
import { EmpSalaryStructureDetails } from './employee-salary-structure-details.entity';

@Entity({ name: 'emp_salary_structures', synchronize: true })
export class EmpSalaryStructure {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'app_id',
  })
  application?: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true })
  empId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'emp_id',
  })
  employee: Employee;

  @Column({ name: 'grade_id', type: 'int', unsigned: true })
  gradeId: number;

  @ManyToOne(() => EmpSalaryGrade, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'grade_id',
  })
  grade: EmpSalaryGrade;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 12, scale: 2 })
  basicSalary: number;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo?: Date | null;

  // --- New Calculated & Payment Fields Start ---

  @Column({
    name: 'gross_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,

    default: 0.0,
    comment: 'Calculated gross salary',
  })
  grossSalary: number = 0.0;

  @Column({
    name: 'total_deductions',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
    comment: 'Calculated total deductions',
  })
  totalDeductions: number = 0.0;

  @Column({
    name: 'net_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
    comment: 'Calculated net salary',
  })
  netSalary?: number | null;

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
    nullable: true,
    comment: 'Currency code',
  })
  currency?: string | null;

  @Column({
    name: 'payment_mode',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Bank Transfer, Cash, Cheque, etc.',
  })
  paymentMode?: string | null;

  // --- Approval Fields Start ---

  @Column({
    name: 'approved_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'approved_by',
  })
  approver?: User; // Assuming 'approved_by' links to the User entity

  @Column({
    name: 'approved_at',
    type: 'timestamp',
    precision: 6,
    nullable: true,
  })
  approvedAt?: Date | null;

  @Column({
    name: 'is_approved',
    type: 'tinyint',
    default: 0,
    comment: 'Whether salary structure is approved',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isApproved: boolean;

  // --- Approval Fields End ---

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

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by',
  })
  creator?: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6, // Updated to match TIMESTAMP(6)
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
  updatedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'updated_by',
  })
  updater?: User;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6, // Added/Updated to match TIMESTAMP(6)
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(
    () => EmpSalaryStructureDetails,
    (details) => details.salaryStructure,
  )
  salaryStructureDetails: EmpSalaryStructureDetails[];
}
