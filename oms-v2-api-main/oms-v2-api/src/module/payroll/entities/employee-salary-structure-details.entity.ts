import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, // Must be imported for 'updated_at'
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { EmpSalaryStructure } from './employee-salary-structure.entity';
import { EmpPayItem } from './employee-pay-items.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'emp_salary_structure_details', synchronize: true })
export class EmpSalaryStructureDetails {
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
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'salary_structure_id', type: 'int', unsigned: true })
  salaryStructureId: number;

  @ManyToOne(() => EmpSalaryStructure, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure: EmpSalaryStructure;

  @Column({
    name: 'pay_item_id',
    type: 'bigint',
    unsigned: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  payItemId: number;

  @ManyToOne(() => EmpPayItem, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pay_item_id' })
  payItem: EmpPayItem;

  // --- New Field Start ---

  @Column({
    name: 'calculation_method_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  calculationMethodId?: number | null;

  @ManyToOne(() => Status, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'calculation_method_id' })
  calculationMethod?: Status;

  // --- New Field End ---

  @Column({
    name: 'percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  percentage?: number | null;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  amount: number;

  @Column({
    name: 'calculated_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  calculatedAmount: number;

  // --- New Flag & Date Fields Start ---

  @Column({
    name: 'is_variable',
    type: 'tinyint',
    default: 0,
    comment: 'Whether this amount varies each month',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isVariable: boolean;

  @Column({
    name: 'is_recurring',
    type: 'tinyint',
    default: 1,
    comment: 'Whether this is a recurring component',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isRecurring: boolean;

  @Column({
    name: 'effective_from',
    type: 'date',
    nullable: true,
    comment: 'Component effective start date',
  })
  effectiveFrom?: string | null;

  @Column({
    name: 'effective_to',
    type: 'date',
    nullable: true,
    comment: 'Component effective end date',
  })
  effectiveTo?: string | null;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string | null;

  // --- New Flag & Date Fields End ---

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6, // Updated to match TIMESTAMP(6)
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6, // Added to match TIMESTAMP(6)
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
