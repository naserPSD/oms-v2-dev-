import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'hr_meeting_notes' })
@Unique('UQ_hr_meeting_notes_meeting_user', ['meetingId', 'userId'])
export class MeetingNote {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'meeting_id', type: 'int', unsigned: true })
  meetingId: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @Column({ name: 'content', type: 'text', nullable: true })
  content: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
