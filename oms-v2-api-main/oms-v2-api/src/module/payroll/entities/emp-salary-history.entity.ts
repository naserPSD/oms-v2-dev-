import { Application } from '@module/application/entities/application.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { EmpSalaryStructure } from './employee-salary-structure.entity';
import { EmpSalaryGrade } from './employee-salary-grades.entity';
import { User } from '@module/users/entities/user.entity';
import { Status } from '@module/status/entities/status.entity'; // Assuming Status entity for lookups
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Define the ENUM for approval status
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Define interface for structured data (Component Changes and Additional Data)
// This helps TypeScript understand the JSON structure stored in the database's LONGTEXT field.
interface ComponentChange {
  payItemId: number;
  oldValue: number;
  newValue: number;
  // Add other relevant change details here
}

@Entity({ name: 'emp_salary_history', synchronize: true })
export class EmpSalaryHistory {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true })
  empId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({
    name: 'salary_structure_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  salaryStructureId?: number | null;

  @ManyToOne(() => EmpSalaryStructure, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure?: EmpSalaryStructure;

  @Column({
    name: 'salary_event_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  salaryEventTypeId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'salary_event_type_id' })
  salaryEventType?: Status;

  @Column({
    name: 'change_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Reason for change: Performance, Annual, Market Adjustment, etc.',
  })
  changeReason?: string | null;

  // --- OLD SALARY DETAILS ---

  @Column({ name: 'old_grade_id', type: 'int', unsigned: true, nullable: true })
  oldGradeId?: number | null;

  @ManyToOne(() => EmpSalaryGrade, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'old_grade_id' })
  oldGrade?: EmpSalaryGrade;

  @Column({
    name: 'old_basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  oldBasicSalary?: number | null;

  @Column({
    name: 'old_gross_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  oldGrossSalary?: number | null;

  @Column({
    name: 'old_net_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  oldNetSalary?: number | null;

  @Column({
    name: 'old_currency',
    type: 'varchar',
    length: 3,
    nullable: true,
    default: 'INR',
  })
  oldCurrency?: string | null;

  // --- NEW SALARY DETAILS ---

  @Column({ name: 'new_grade_id', type: 'int', unsigned: true, nullable: true })
  newGradeId?: number | null;

  @ManyToOne(() => EmpSalaryGrade, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'new_grade_id' })
  newGrade?: EmpSalaryGrade;

  @Column({
    name: 'new_basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  newBasicSalary?: number | null;

  @Column({
    name: 'new_gross_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  newGrossSalary?: number | null;

  @Column({
    name: 'new_net_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  newNetSalary?: number | null;

  @Column({
    name: 'new_currency',
    type: 'varchar',
    length: 3,
    nullable: true,
    default: 'INR',
  })
  newCurrency?: string | null;

  // --- INCREMENT DETAILS ---

  @Column({
    name: 'basic_increment_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Percentage increase in basic',
  })
  basicIncrementPercentage?: number | null;

  @Column({
    name: 'basic_increment_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    comment: 'Absolute increase in basic',
  })
  basicIncrementAmount?: number | null;

  @Column({
    name: 'gross_increment_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  grossIncrementPercentage?: number | null;

  @Column({
    name: 'gross_increment_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  grossIncrementAmount?: number | null;

  // --- DATE & JSON FIELDS ---

  @Column({
    name: 'component_changes',
    type: 'longtext', // Using longtext to match SQL definition
    nullable: true,
    comment: 'JSON array of component changes',
  })
  componentChanges?: ComponentChange[] | null;

  @Column({
    name: 'effective_from',
    type: 'date',
    comment: 'When change takes effect',
  })
  effectiveFrom: Date;

  @Column({
    name: 'effective_to',
    type: 'date',
    nullable: true,
    comment: 'If temporary change, when it ends',
  })
  effectiveTo?: Date | null;

  // --- APPROVAL & REFERENCE ---

  @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
  approvedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @Column({
    name: 'approved_at',
    type: 'timestamp',
    nullable: true,
  })
  approvedAt?: Date | null;

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({ name: 'approval_remarks', type: 'text', nullable: true })
  approvalRemarks?: string | null;

  @Column({
    name: 'reference_number',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Order/Reference number',
  })
  referenceNumber?: string | null;

  @Column({
    name: 'reference_document',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Document file path/URL',
  })
  referenceDocument?: string | null;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string | null;

  @Column({
    name: 'additional_data',
    type: 'longtext', // Using longtext to match SQL definition
    nullable: true,
    comment: 'Any additional structured data',
  })
  additionalData?: Record<string, any> | null;

  // --- AUDIT FIELDS ---

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ name: 'changed_by', type: 'int', unsigned: true, nullable: true })
  changedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  changer?: User;

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
