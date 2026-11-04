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
import { JobPosting } from './job-posting.entity';
import { Expose } from 'class-transformer';
import { User } from '@module/users/entities/user.entity';
import { Status } from '@module/status/entities/status.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'job_applicants', synchronize: false })
export class JobApplicant {
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
    name: 'job_posting_id',
    type: 'int',
    unsigned: true,
  })
  jobPostingId: number;

  @ManyToOne(() => JobPosting, { nullable: false })
  @JoinColumn({ name: 'job_posting_id' })
  jobPosting: JobPosting;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'applicant_status_id',
    type: 'int',
    unsigned: true,
  })
  applicantStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'applicant_status_id' })
  applicantStatus: Status;

  @Column({
    name: 'applied_at',
    type: 'timestamp',
    nullable: true,
  })
  appliedAt?: Date | null;

  @Column({
    name: 'cover_letter',
    type: 'text',
    nullable: true,
  })
  coverLetter?: string | null;

  @Column({
    name: 'expected_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  expectedSalary?: number | null;

  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @Column({
    name: 'candidate_ranking',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  candidateRanking?: number | null;

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
}
