import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';

@Entity({ name: 'hr_meeting_agenda_items' })
export class MeetingAgendaItem {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Index()
  @Column({ name: 'meeting_id', type: 'int', unsigned: true })
  meetingId: number;

  @ManyToOne(() => Meeting, (m) => m.agendaItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: Meeting;

  @Column({ name: 'text', type: 'varchar', length: 512 })
  text: string;

  @Column({ name: 'is_done', type: 'tinyint', default: 0 })
  isDone: boolean;
}
