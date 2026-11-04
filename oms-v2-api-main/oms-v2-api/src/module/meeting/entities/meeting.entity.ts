import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { MeetingAttendee } from './meeting-attendee.entity';
import { MeetingAgendaItem } from './meeting-agenda-item.entity';

export type MeetingListStatus =
  | 'SCHEDULED'
  | 'INVITED'
  | 'COMPLETED'
  | 'CANCELLED';

@Entity({ name: 'hr_meetings' })
export class Meeting {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Index()
  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'host_user_id', type: 'int', unsigned: true, nullable: true })
  hostUserId: number | null;

  @Column({ name: 'host_employee_id', type: 'int', unsigned: true, nullable: true })
  hostEmployeeId: number | null;

  @Column({ name: 'host_name', type: 'varchar', length: 255, nullable: true })
  hostName: string | null;

  @Column({
    name: 'meeting_type',
    type: 'varchar',
    length: 64,
    default: 'Online Meeting',
  })
  meetingType: string;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt: Date;

  @Column({ name: 'meet_url', type: 'varchar', length: 512, nullable: true })
  meetUrl: string | null;

  @Column({ name: 'google_event_id', type: 'varchar', length: 255, nullable: true })
  googleEventId: string | null;

  @Column({ name: 'room_name', type: 'varchar', length: 255, nullable: true })
  roomName: string | null;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName: string | null;

  @Column({ name: 'client_name', type: 'varchar', length: 255, nullable: true })
  clientName: string | null;

  @Column({ name: 'address', type: 'varchar', length: 512, nullable: true })
  address: string | null;

  @Column({
    name: 'list_status',
    type: 'varchar',
    length: 32,
    default: 'SCHEDULED',
  })
  listStatus: MeetingListStatus;

  @Column({ name: 'is_repeat', type: 'tinyint', default: 0 })
  isRepeat: boolean;

  @Column({ name: 'repeat_days', type: 'int', nullable: true })
  repeatDays: number | null;

  @Column({ name: 'creator_id', type: 'int', unsigned: true, nullable: true })
  creatorId: number | null;

  @OneToMany(() => MeetingAttendee, (a) => a.meeting, { cascade: true })
  attendees: MeetingAttendee[];

  @OneToMany(() => MeetingAgendaItem, (a) => a.meeting, { cascade: true })
  agendaItems: MeetingAgendaItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
