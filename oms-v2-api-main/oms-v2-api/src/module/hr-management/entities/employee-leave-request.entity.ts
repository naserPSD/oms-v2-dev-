import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employees.entity';
import { EmpLeaveType } from './employee-leaves-type.entity';
import { approvalStatus } from '@core/utils/enum-fields';
import { Status } from '@module/status/entities/status.entity';
import { Media } from '@module/media/entities/media.entity';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'emp_leave_requests', synchronize: true })
export class EmpLeaveRequest {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
  })
  appId: number;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'emp_id',
    type: 'int',
    unsigned: true,
  })
  empId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({
    name: 'leave_type_id',
    type: 'int',
    unsigned: true,
  })
  leaveTypeId: number;

  @ManyToOne(() => EmpLeaveType, { nullable: false })
  @JoinColumn({ name: 'leave_type_id' })
  empLeaveType: EmpLeaveType;

  @Column({
    name: 'start_date',
    type: 'datetime',
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'datetime',
  })
  endDate: Date;

  @Column({
    name: 'reason',
    type: 'text',
  })
  reason?: string | null;

  @Column({
    name: 'decision_reason',
    type: 'text',
    nullable: true,
  })
  decisionReason?: string | null;

  @Column({
    name: 'attachment_media_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  attachmentMediaId?: number | null;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: 'attachment_media_id' })
  attachment: Media;

  @Column({
    name: 'approval_status_id',
    type: 'int',
    unsigned: true,
  })
  approvalStatusId: number = 51;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'approval_status_id' })
  approvalStatus: Status;

  @Column({
    name: 'approved_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedBy?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @Column({
    name: 'approval_date',
    type: 'datetime',
    nullable: true,
  })
  approvalDate?: Date | null;

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
