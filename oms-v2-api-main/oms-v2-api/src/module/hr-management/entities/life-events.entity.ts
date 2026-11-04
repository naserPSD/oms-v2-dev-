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
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'life_events', synchronize: true })
export class LifeEvent {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: true })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

  @Column({
    name: 'event_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  eventTypeId?: number | null;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'event_type_id' })
  eventType?: Status;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate?: string | null;

  @Column({
    name: 'event_details',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  eventDetails?: string | null;

  @Column({
    name: 'json_data',
    type: 'longtext',
    nullable: true,
    collation: 'utf8mb4_bin',
  })
  jsonData?: string | null;

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
