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
import { Office } from './office.entity';
import { User } from '@module/users/entities/user.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { Status } from '@module/status/entities/status.entity';
import { Employee } from './employees.entity';
import { Application } from '@module/application/entities/application.entity';
import { Expose } from 'class-transformer';
import { OfficeShift } from './office-shift.entity';

@Entity({ name: 'emp_invitations', synchronize: false })
export class EmpInvitation {
  @PrimaryGeneratedColumn({
    name: 'id',
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

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'office_id',
    type: 'int',
    unsigned: true,
  })
  officeId: number;

  @ManyToOne(() => Office, { nullable: false })
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @Column({
    name: 'shift_id',
    type: 'int',
    unsigned: true,
  })
  shiftId?: number;

  @ManyToOne(() => OfficeShift, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift?: OfficeShift;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    name: 'designation_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  designationId?: number | null;

  @ManyToOne(() => Designation, { nullable: true })
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @Column({
    name: 'invitation_status_id',
    type: 'int',
    unsigned: true,
    default: 90,
  })
  invitationStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'invitation_status_id' })
  status: Status;

  @Index({ unique: true })
  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
  })
  code: string;

  @Column({
    name: 'sent_at',
    type: 'timestamp',
    nullable: true,
  })
  sentAt?: Date | null;

  @Column({
    name: 'confirmed_at',
    type: 'timestamp',
    nullable: true,
  })
  confirmedAt?: Date | null;

  @Column({
    name: 'emp_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
