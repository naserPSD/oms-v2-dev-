import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Employee } from './employees.entity';
import { Status } from '@module/status/entities/status.entity';
import { Application } from '@module/application/entities/application.entity';
import { EmpAttendance } from './employee-attendance.entity';

@Entity({ name: 'attendance_reconciliations', synchronize: true })
export class AttendanceReconciliation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true })
  empId: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({
    name: 'attendance_id',
    type: 'int',
    nullable: true,
    unsigned: true,
  })
  attendanceId?: number | null;

  @OneToOne(() => EmpAttendance, (attendance) => attendance.attendanceRecon, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attendance_id' })
  attendance?: EmpAttendance;

  @Column({ name: 'attendance_date', type: 'date', nullable: true })
  attendanceDate?: string | null;

  @Column({ name: 'in_time', type: 'time', nullable: true })
  inTime?: string | null;

  @Column({ name: 'out_time', type: 'time', nullable: true })
  outTime?: string | null;

  @Column({
    name: 'in_time_remarks',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  inTimeRemarks?: string | null;

  @Column({
    name: 'out_time_remarks',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  outTimeRemarks?: string | null;

  @Column({
    name: 'in_time_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  inTimeStatusId: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'in_time_status_id' })
  inTimeStatus?: Status;

  @Column({ name: 'in_time_approve_date', type: 'datetime', nullable: true })
  inTimeApproveDate?: Date | null;

  @Column({
    name: 'in_time_supervisor_remarks',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  inTimeSupervisorRemarks?: string | null;

  @Column({
    name: 'out_time_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  outTimeStatusId: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'out_time_status_id' })
  outTimeStatus?: Status;

  @Column({ name: 'out_time_approve_date', type: 'datetime', nullable: true })
  outTimeApproveDate?: Date | null;

  @Column({
    name: 'out_time_supervisor_remarks',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  outTimeSupervisorRemarks?: string | null;

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
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
