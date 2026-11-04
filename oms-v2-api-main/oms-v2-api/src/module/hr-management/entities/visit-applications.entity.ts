import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employees.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'visit_applications', synchronize: true })
export class VisitApplication {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({ name: 'visitor_emp_id', type: 'int', unsigned: true })
  visitorEmpId: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_emp_id' })
  visitor: Employee;

  @Column({ name: 'host_emp_id', type: 'int', unsigned: true })
  hostEmpId: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_emp_id' })
  host: Employee;

  @Column({ name: 'purpose', type: 'varchar', length: 255, nullable: true })
  purpose?: string | null;

  @Column({ name: 'visit_date', type: 'date', nullable: true })
  visitDate?: string | null;

  @Column({ name: 'visit_time', type: 'time', nullable: true })
  visitTime?: string | null;

  @Column({ name: 'check_in_time', type: 'time', nullable: true })
  checkInTime?: string | null;

  @Column({ name: 'check_out_time', type: 'time', nullable: true })
  checkOutTime?: string | null;

  @Column({
    name: 'visit_status_id',
    unsigned: true,
    type: 'int',
    nullable: true,
  })
  visitStatusId?: number | null;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'visit_status_id' })
  visitStatus?: Status;

  @Column({
    name: 'application_status_id',
    unsigned: true,
    type: 'int',
    nullable: true,
  })
  applicationStatusId?: number | null;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'application_status_id' })
  applicationStatus?: Status;

  @Column({ name: 'remarks', type: 'varchar', length: 255, nullable: true })
  remarks?: string | null;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;

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
