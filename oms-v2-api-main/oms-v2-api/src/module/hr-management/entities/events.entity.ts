import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { Department } from '@module/application/entities/departments.entity';

@Entity({ name: 'events', synchronize: false })
export class Event {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  appId: number;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'department_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  departmentId?: number | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  title: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'event_type_id',
    type: 'int',
    nullable: true,
  })
  eventTypeId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'event_type_id' })
  eventType?: Status;

  @Column({
    name: 'location',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location?: string | null;

  @Column({
    name: 'start_datetime',
    type: 'datetime',
    nullable: false,
  })
  startDatetime: Date;

  @Column({
    name: 'end_datetime',
    type: 'datetime',
    nullable: false,
  })
  endDatetime: Date;

  @Column({
    name: 'is_all_day',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => value === 1,
    },
  })
  isAllDay: boolean;

  @Column({
    name: 'creator_id',
    type: 'int',
    nullable: true,
  })
  creatorId?: number | null;

  @Column({
    name: 'status_id',
    type: 'int',
    nullable: true,
  })
  statusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status?: Status;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;
}
