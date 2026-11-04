import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';

@Entity({ name: 'hr_meeting_attendees' })
export class MeetingAttendee {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Index()
  @Column({ name: 'meeting_id', type: 'int', unsigned: true })
  meetingId: number;

  @ManyToOne(() => Meeting, (m) => m.attendees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @Column({ name: 'employee_id', type: 'int', unsigned: true, nullable: true })
  employeeId: number | null;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
  userId: number | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'role', type: 'varchar', length: 128, nullable: true })
  role: string | null;

  @Column({
    name: 'attendance',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  attendance: 'present' | 'late' | 'absent' | null;

  @Column({
    name: 'invite_status',
    type: 'varchar',
    length: 32,
    default: 'pending',
  })
  inviteStatus: 'pending' | 'accepted' | 'declined';

  @Column({
    name: 'joined_at',
    type: 'datetime',
    nullable: true,
  })
  joinedAt: Date | null;
}
