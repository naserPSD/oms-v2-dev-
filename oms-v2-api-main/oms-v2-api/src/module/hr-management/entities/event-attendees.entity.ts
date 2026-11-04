import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './events.entity';
import { Employee } from './employees.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'event_attendees', synchronize: true })
export class EventAttendee {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'event_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  eventId: number;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({
    name: 'employee_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  employeeId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'attendance_status_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  attendanceStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'attendance_status_id' })
  attendanceStatus: Status;
}
