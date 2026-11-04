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
import { JobPosting } from './job-posting.entity';
import { JobApplicant } from './job-applicant.entity';
import { JobScreening } from './job-screenings.entity';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'job_applicant_screenings', synchronize: false })
export class JobApplicantScreening {
  @PrimaryGeneratedColumn({
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
    name: 'job_posting_id',
    type: 'int',
    unsigned: true,
  })
  jobPostingId: number;

  @ManyToOne(() => JobPosting, { nullable: false })
  @JoinColumn({ name: 'job_posting_id' })
  jobPosting: JobPosting;

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
    name: 'job_screening_id',
    type: 'int',
    unsigned: true,
  })
  jobScreeningId: number;

  @ManyToOne(() => JobScreening, { nullable: false })
  @JoinColumn({ name: 'job_screening_id' })
  jobScreening?: JobScreening;

  @Column({
    name: 'has_interview',
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 0,
  })
  hasInterview: boolean;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
  })
  creatorId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

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
  jobPostingInfo?: { code: string };

  @Expose()
  jobApplicantInfo?: {
    coverLetter?: string | null;
    notes?: string | null;
    expectedSalary?: number | null;
  };

  @Expose()
  jobScreeningInfo?: { name?: string };
}
