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
import { JobApplicant } from '@module/hr-management/entities/job-applicant.entity';
import { JobApplicantScreening } from '../entities/job-applicant-screening.entity';
import { Expose } from 'class-transformer';
import { Status } from '@module/status/entities/status.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'job_interviews', synchronize: false })
export class JobInterview {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId: number;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;

  @Column({
    name: 'job_applicant_screening_id',
    type: 'int',
    unsigned: true,
  })
  jobApplicantScreeningId: number;

  @ManyToOne(() => JobApplicantScreening, { nullable: false })
  @JoinColumn({ name: 'job_applicant_screening_id' })
  jobApplicantScreening?: JobApplicantScreening;

  @Column({
    name: 'job_applicant_id',
    type: 'int',
    unsigned: true,
  })
  jobApplicantId: number;

  @ManyToOne(() => JobApplicant, { nullable: false })
  @JoinColumn({ name: 'job_applicant_id' })
  jobApplicant?: JobApplicant;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
  })
  startTime?: Date | null;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: true,
  })
  endTime?: Date | null;

  @Column({
    name: 'interview_status_id',
    type: 'int',
    unsigned: true,
  })
  interviewStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'interview_status_id' })
  interviewStatus: Status;

  @Column({
    name: 'meeting_link',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  meetingLink?: string | null;

  @Column({
    name: 'location',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location?: string | null;

  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

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

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number | null;

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
  jobApplicantInfo?: {
    coverLetter?: string | null;
    expectedSalary?: number | null;
    notes?: string | null;
  };
}
