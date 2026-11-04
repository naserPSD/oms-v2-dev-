import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  In,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobPosting } from './job-posting.entity';
import { JobApplicant } from './job-applicant.entity';
import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { Employee } from './employees.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'job_offers', synchronize: false })
export class JobOffer {
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
    name: 'job_applicant_id',
    type: 'int',
    unsigned: true,
  })
  jobApplicantId: number;

  @ManyToOne(() => JobApplicant, { nullable: false })
  @JoinColumn({ name: 'job_applicant_id' })
  jobApplicant: JobApplicant;

  @Column({
    name: 'salary_offered',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  salaryOffered: number;

  @Column({
    name: 'offer_descriptions',
    type: 'text',
  })
  offerDescriptions: string;

  @Column({
    name: 'joining_date',
    type: 'datetime',
    nullable: true,
  })
  joiningDate?: Date | null;

  @Column({
    name: 'offer_status_id',
    type: 'int',
    unsigned: true,
  })
  offerStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'offer_status_id' })
  offerStatus: Status;

  @Column({
    name: 'offer_sent_at',
    type: 'datetime',
    nullable: true,
  })
  offerSentAt?: Date | null;

  @Column({
    name: 'offer_deadline',
    type: 'date',
    nullable: true,
  })
  offerDeadline?: Date | null;

  @Column({
    name: 'joined_at',
    type: 'datetime',
    nullable: true,
  })
  joinedAt?: Date | null;

  @Column({
    name: 'emp_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  empId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

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
  jobPostingInfo?: {
    code?: string | null;
  };

  @Expose()
  jobApplicantInfo?: {
    coverLetter?: string | null;
    expectedSalary?: number | null;
    notes?: string | null;
  };
}
