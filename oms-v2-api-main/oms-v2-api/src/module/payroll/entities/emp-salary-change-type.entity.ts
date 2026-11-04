import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

// Define the ENUM for approval levels
export enum ApprovalLevel {
  HR = 'HR',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  CEO = 'CEO',
}

@Entity({ name: 'emp_salary_change_types', synchronize: true })
@Unique(['changeCode']) // Added unique constraint for 'change_code'
export class EmpSalaryChangeType {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'change_code', type: 'varchar', length: 50 })
  changeCode: string;

  @Column({ name: 'change_name', type: 'varchar', length: 100 })
  changeName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({
    name: 'requires_approval',
    type: 'tinyint', // TINYINT(1) maps best to a number/boolean TypeORM column
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  requiresApproval?: boolean | null;

  @Column({
    name: 'approval_level',
    type: 'enum',
    enum: ApprovalLevel,
    nullable: true,
    default: ApprovalLevel.MANAGER,
  })
  approvalLevel?: ApprovalLevel | null;

  @Column({
    name: 'max_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Maximum allowed percentage change',
  })
  maxPercentage?: number | null;

  @Column({
    name: 'max_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    comment: 'Maximum allowed amount change',
  })
  maxAmount?: number | null;

  @Column({
    name: 'is_active',
    type: 'tinyint', // TINYINT(1)
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive?: boolean | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    nullable: true,
    default: 0,
  })
  sortOrder?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
