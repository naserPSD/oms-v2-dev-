import { Application } from '@module/application/entities/application.entity';
import { Employee } from '../../hr-management/entities/employees.entity';
import { EmpSalaryGrade } from './employee-salary-grades.entity';
import { Designation } from '../../application/entities/designations.entity';
import { User } from '@module/users/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'emp_promotions', synchronize: true })
export class EmpPromotion {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({
    name: 'employee_id',
    type: 'int',
    unsigned: true,
  })
  employeeId: number;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'action_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  actionStatusId?: number | null;

  @ManyToOne(() => Status, {
    nullable: true,
  })
  @JoinColumn({ name: 'action_status_id' })
  actionStatus: Status;

  @Column({
    name: 'old_designation_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  oldDesignationId?: number | null;

  @ManyToOne(() => Designation, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'old_designation_id' })
  oldDesignation?: Designation;

  @Column({
    name: 'new_designation_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  newDesignationId?: number | null;

  @ManyToOne(() => Designation, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'new_designation_id' })
  newDesignation?: Designation;

  @Column({
    name: 'old_grade_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  oldGradeId?: number | null;

  @ManyToOne(() => EmpSalaryGrade, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'old_grade_id' })
  oldGrade?: EmpSalaryGrade;

  @Column({
    name: 'new_grade_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  newGradeId?: number | null;

  @ManyToOne(() => EmpSalaryGrade, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'new_grade_id' })
  newGrade?: EmpSalaryGrade;

  @Column({
    name: 'old_basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  oldBasicSalary?: number | null;

  @Column({
    name: 'new_basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  newBasicSalary: number | null;

  @Column({
    name: 'promotion_date',
    type: 'date',
  })
  promotionDate: string;

  @Column({
    name: 'effective_date',
    type: 'date',
  })
  effectiveDate: string;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  reason?: string | null;

  @Column({
    name: 'approved_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedBy?: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @CreateDateColumn({
    name: 'created_at',
    precision: 0,
    comment: 'Record creation timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
