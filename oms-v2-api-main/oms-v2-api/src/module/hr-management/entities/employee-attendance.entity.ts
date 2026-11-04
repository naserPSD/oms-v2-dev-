import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { Employee } from './employees.entity';
import { Office } from './office.entity';
import { OfficeShift } from './office-shift.entity';
import { Status } from '@module/status/entities/status.entity';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import { AttendanceReconciliation } from './Attendance-reconciliation.entity';

@Index(['appId', 'empId', 'attendanceDate'], { unique: true })
@Entity({ name: 'emp_attendances', synchronize: false })
export class EmpAttendance {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId: number;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: false })
  empId: number;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

  @Column({ name: 'office_id', type: 'int', unsigned: true, nullable: true })
  officeId?: number | null;

  @Column({ name: 'shift_id', type: 'int', unsigned: true, nullable: true })
  shiftId?: number | null;

  @ManyToOne(() => Office, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'office_id' })
  office?: Office;

  @ManyToOne(() => OfficeShift, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shift_id' })
  shift?: OfficeShift;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  @Column({
    name: 'attendance_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  attendanceStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'attendance_status_id',
  })
  attendanceStatus?: Status;

  @Column({
    name: 'check_in',
    type: 'datetime',
    nullable: true,
  })
  checkIn?: Date;

  @Column({
    name: 'check_in_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  checkInStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'check_in_status_id',
  })
  checkInStatus?: Status;

  @Column({
    name: 'check_in_method_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  checkInMethodId?: number | null;

  @Column({ name: 'check_in_lat_long', type: 'simple-json', nullable: true })
  checkInLatLong?: any;

  @Column({ name: 'check_out_lat_long', type: 'simple-json', nullable: true })
  checkOutLatLong?: any;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'check_in_method_id',
  })
  checkInMethod?: Status;

  @Column({
    name: 'check_out',
    type: 'datetime',
    nullable: true,
  })
  checkOut?: Date;

  @Column({
    name: 'check_out_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  checkOutStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'check_out_status_id',
  })
  checkOutStatus?: Status;

  @Column({
    name: 'check_out_method_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  checkOutMethodId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({
    name: 'check_out_method_id',
  })
  checkOutMethod?: Status;

  @Column({
    name: 'worked_hour',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  workedHour?: number;

  @Column({
    name: 'overtime_hours',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  overtimeHours?: number | null;

  @Column({ name: 'start_break', type: 'datetime', nullable: true })
  startBreak?: Date;

  @Column({ name: 'end_break', type: 'datetime', nullable: true })
  endBreak?: Date;

  @Column({ name: 'break_minutes', type: 'int', default: 0 })
  breakMinutes: number;

  @Column({
    name: 'late_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lateReason?: string | null;

  @Column({
    name: 'late_approval_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  lateApprovalStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'late_approval_status_id' })
  lateApprovalStatus?: Status;

  @Column({
    name: 'late_approval_user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  lateApprovalUserId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'late_approval_user_id' })
  lateApprovalUser?: User;

  @Column({
    name: 'early_leave_reason_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  earlyLeaveReasonId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'early_leave_reason_id' })
  earlyLeaveReason?: Status;

  // @Column({
  //   name: 'early_leave_reason',
  //   type: 'varchar',
  //   length: 255
  // })
  // earlyLeaveReasons?: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string;

  @Column({ name: 'json_data', type: 'simple-json', nullable: true })
  jsonData?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;

  @OneToOne(() => AttendanceReconciliation, (recon) => recon.attendance)
  attendanceRecon?: AttendanceReconciliation;
}
