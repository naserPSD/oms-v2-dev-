import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { JobInterview } from './job-interviews.entity';
import { Expose } from 'class-transformer';
import { User } from '@module/users/entities/user.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'job_interviewers', synchronize: false })
export class JobInterviewer {
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
    nullable: true,
  })
  appId?: number | null;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'job_interview_id',
    type: 'int',
    unsigned: true,
  })
  jobInterviewId: number;

  @ManyToOne(() => JobInterview, { nullable: false })
  @JoinColumn({ name: 'job_interview_id' })
  jobInterview: JobInterview;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 128,
    unique: true,
  })
  code: string;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'interviewer_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: 69,
  })
  interviewerStatusId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'interviewer_status_id' })
  interviewerStatus?: Status;

  @Column({
    name: 'invitation_sent_at',
    type: 'timestamp',
    nullable: true,
  })
  invitationSentAt?: Date | null;

  @Column({
    name: 'invitation_confirmed_at',
    type: 'timestamp',
    nullable: true,
  })
  invitationConfirmedAt?: Date | null;

  @Index('idx_job_interviewers_creator_id')
  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

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

  @Expose()
  jobInterviewInfo?: {
    location?: string | null;
    notes?: string | null;
  };
}
