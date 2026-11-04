import { Application } from '@module/application/entities/application.entity';
import { EmpSalaryGrade } from './employee-salary-grades.entity';
import { EmpPayItem } from './employee-pay-items.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'emp_salary_grade_rules', synchronize: true })
export class EmpSalaryGradeRule {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'grade_id', type: 'int', unsigned: true })
  gradeId: number;

  @ManyToOne(() => EmpSalaryGrade, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grade_id' })
  grade: EmpSalaryGrade;

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

  @Column({ name: 'min_basic', type: 'decimal', precision: 10, scale: 2 })
  minBasic: number;

  @Column({ name: 'max_basic', type: 'decimal', precision: 10, scale: 2 })
  maxBasic: number;

  // --- New / Modified Fields Start ---

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

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true, // Changed to nullable to match SQL
    comment: 'Percentage of basic salary',
  })
  percentage?: number | null;

  @Column({
    name: 'fixed_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Fixed amount if not percentage-based',
  })
  fixedAmount?: number | null;

  @Column({
    name: 'formula',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Formula for calculation if method is FORMULA',
  })
  formula?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Any remarks about this rule',
  })
  remarks?: string | null;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({
    name: 'effective_to',
    type: 'date',
    nullable: true,
    comment: 'Rule validity end date',
  })
  effectiveTo?: Date | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive?: boolean | null;

  @Column({
    name: 'updated_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  updatedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'updated_by',
  })
  updater?: User;

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
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date | null;
}
