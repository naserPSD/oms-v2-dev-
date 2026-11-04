import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import { JobVacancy } from '@module/recruitment/entitities/job-vacancies.entity';
import { JobApplicant } from '@module/recruitment/entitities/job-applicants.entity';
import { JobInterviewer } from '@module/recruitment/entitities/job-interviewers.entity';
import { JobInterviewSchedule } from '@module/recruitment/entitities/job-interview-schedules.entity';
import { JobWeight } from '@module/recruitment/entitities/job-weights.entity';

@Entity({ name: 'job_interview_weights' })
export class JobInterviewWeight {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number;

  @ManyToOne(() => Application, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

  @Column({
    name: 'job_vacancy_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobVacancyId?: number;

  @ManyToOne(() => JobVacancy, { eager: false })
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy?: JobVacancy;

  @Column({
    name: 'job_applicant_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobApplicantId?: number;

  @ManyToOne(() => JobApplicant, { eager: false })
  @JoinColumn({ name: 'job_applicant_id' })
  jobApplicant?: JobApplicant;

  @Column({
    name: 'job_interviewer_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobInterviewerId?: number;

  @ManyToOne(() => JobInterviewer, { eager: false })
  @JoinColumn({ name: 'job_interviewer_id' })
  jobInterviewer?: JobInterviewer;

  @Column({
    name: 'job_interview_schedule_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobInterviewScheduleId?: number;

  @ManyToOne(() => JobInterviewSchedule, { eager: false })
  @JoinColumn({ name: 'job_interview_schedule_id' })
  jobInterviewSchedule?: JobInterviewSchedule;

  @Column({
    name: 'job_weight_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobWeightId?: number;

  @ManyToOne(() => JobWeight, { eager: false })
  @JoinColumn({ name: 'job_weight_id' })
  jobWeight?: JobWeight;

  @Column({ name: 'weight_marking', type: 'int', unsigned: true, default: 0 })
  weightMarking: number;

  @Column({ name: 'creator_id', type: 'int', unsigned: true, nullable: true })
  creatorId?: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 6,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
