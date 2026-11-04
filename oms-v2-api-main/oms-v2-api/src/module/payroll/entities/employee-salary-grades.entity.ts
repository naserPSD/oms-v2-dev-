import { Application } from '@module/application/entities/application.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'emp_salary_grades', synchronize: true })
export class EmpSalaryGrade {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'grade_code', type: 'varchar', length: 50 })
  gradeCode: string;

  @Column({ name: 'grade_name', type: 'varchar', length: 50 })
  gradeName: string;

  // --- New Field Start ---
  @Column({
    name: 'level',
    type: 'int',
    default: 0,
    comment: 'numeric aceding order. Exp: 1,2,3',
  })
  level: number;
  // --- New Field End ---

  @Column({ name: 'min_salary', type: 'decimal', precision: 10, scale: 2 })
  minSalary: number;

  @Column({ name: 'max_salary', type: 'decimal', precision: 10, scale: 2 })
  maxSalary: number;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'is_active',
    type: 'tinyint', // Changed from boolean to tinyint to match SQL
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime', // Changed to datetime to match SQL
    precision: 0, // Default precision
    comment: 'Record creation timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime', // Changed to datetime to match SQL
    precision: 6, // Precision 6 per SQL
    nullable: true,
    comment: 'Record last update timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date | null;
}
