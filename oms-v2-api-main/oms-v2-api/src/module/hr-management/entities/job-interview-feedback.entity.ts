import { Expose } from 'class-transformer';
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
import { JobApplicant } from './job-applicant.entity';
import { JobInterviewer } from './job-interviewers.entity';
import { Status } from '@module/status/entities/status.entity';

@Entity({ name: 'job_interview_feedback', synchronize: false })
export class JobInterviewFeedback {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
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
    name: 'applicant_id',
    type: 'int',
    unsigned: true,
  })
  applicantId: number;

  @ManyToOne(() => JobApplicant, { nullable: false })
  @JoinColumn({ name: 'applicant_id' })
  jobApplicant: JobApplicant;

  @Column({
    name: 'job_interviewer_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobInterviewerId?: number | null;

  @ManyToOne(() => JobInterviewer, { nullable: true })
  @JoinColumn({ name: 'job_interviewer_id' })
  interviewer?: JobInterviewer;

  @Column({
    name: 'overall_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  overallRating?: number | null;

  @Column({
    name: 'interviewer_decision_id',
    type: 'int',
    unsigned: true,
    default: 72,
  })
  interviewerDecisionId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'interviewer_decision_id' })
  interviewerDecision: Status;

  @Column({
    type: 'text',
    nullable: true,
  })
  strengths?: string | null;

  @Column({
    name: 'improvement_areas',
    type: 'text',
    nullable: true,
  })
  improvementAreas?: string | null;

  @Column({
    name: 'confidential_notes',
    type: 'text',
    nullable: true,
  })
  confidentialNotes?: string | null;

  @Column({
    name: 'submitted_at',
    type: 'timestamp',
    nullable: true,
  })
  submittedAt?: Date | null;

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
    meetingLink?: string | null;
    location?: string | null;
    notes?: string | null;
  };

  @Expose()
  jobApplicantInfo?: {
    coverLetter?: string | null;
    expectedSalary?: number | null;
    notes?: string | null;
  };

  @Expose()
  jobInterviewerInfo?: {
    code?: string | null;
    email?: string | null;
  };
}
