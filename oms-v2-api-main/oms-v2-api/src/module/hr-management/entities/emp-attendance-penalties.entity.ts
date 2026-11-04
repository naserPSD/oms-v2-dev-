import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { Employee } from './employees.entity';

@Entity({ name: 'emp_attendance_penalties', synchronize: true })
export class EmpAttendancePenalty {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: true })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

  @Column({ name: 'month', type: 'tinyint', nullable: true })
  month?: number | null;

  @Column({ name: 'year', type: 'smallint', nullable: true })
  year?: number | null;

  @Column({ name: 'entry_time', type: 'datetime', nullable: true })
  entryTime?: Date | null;

  @Column({
    name: 'entry_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  entryStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'entry_status_id' })
  entryStatus?: Status;

  @Column({ name: 'amount', type: 'int', nullable: true })
  amount?: number | null;

  @Column({
    name: 'application_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  applicationStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'application_status_id' })
  applicationStatus?: Status;

  @Column({
    name: 'approved_user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  approvedUserId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_user_id' })
  approvedUser?: User;

  @Column({ name: 'details', type: 'text', nullable: true })
  details?: string | null;

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
