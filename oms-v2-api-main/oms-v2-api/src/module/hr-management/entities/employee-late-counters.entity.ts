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
import { Employee } from './employees.entity';
import { LateAttendanceRule } from './late-attendance-rules.entity';
import { Office } from './office.entity';

@Entity({ name: 'emp_attendance_late_counters', synchronize: true })
export class EmpLateCounter {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'office_id', type: 'int', unsigned: true, nullable: true })
  officeId?: number | null;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office?: Office;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: true })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

  @Column({
    name: 'late_attendance_rule_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  lateAttendanceRuleId?: number | null;

  @ManyToOne(() => LateAttendanceRule, { nullable: true })
  @JoinColumn({ name: 'late_attendance_rule_id' })
  lateAttendanceRule?: LateAttendanceRule;

  @Column({
    name: 'late_counter',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  lateCounter?: number | null;

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
