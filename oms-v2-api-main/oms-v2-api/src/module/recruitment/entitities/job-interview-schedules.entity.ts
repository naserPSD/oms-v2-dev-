import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import { JobVacancy } from './job-vacancies.entity';
import { JobApplicant } from './job-applicants.entity';
import { Office } from '@module/hr-management/entities/office.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { JobApplicantInterviewer } from '@module/recruitment/entitities/job-applicant-interviewers.entity';
import { JobInterviewWeight } from '@module/recruitment/entitities/job-interview-weights.entity';

@Entity({ name: 'job_interview_schedules', synchronize: false })
export class JobInterviewSchedule {
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

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'job_vacancy_id',
    type: 'int',
    unsigned: true,
  })
  jobVacancyId: number;

  @ManyToOne(() => JobVacancy)
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy: JobVacancy;

  @Column({
    name: 'job_applicant_id',
    type: 'int',
    unsigned: true,
  })
  jobApplicantId: number;

  @ManyToOne(() => JobApplicant)
  @JoinColumn({ name: 'job_applicant_id' })
  jobApplicant: JobApplicant;

  @Column({
    name: 'schedule_datetime',
    type: 'datetime',
    nullable: true,
  })
  scheduleDatetime: Date | null;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: ['Office', 'Online'],
    nullable: true,
  })
  locationType: 'Office' | 'Online' | null;

  @Column({
    name: 'office_id',
    type: 'int',
    nullable: true,
  })
  officeId: number | null;

  @ManyToOne(() => Office, { nullable: true })
  @JoinColumn({ name: 'office_id' })
  office: Office | null;

  @Column({
    name: 'url',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  url: string | null;

  @Column({
    name: 'interview_completed',
    type: 'tinyint',
    unsigned: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  interviewCompleted: boolean;

  @Column({
    name: 'weight_subjects',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  weightSubjects: number;

  @Column({
    name: 'total_weight',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  totalWeight: number;

  @Column({
    name: 'total_interviewer',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  totalInterviewer: number;

  @Column({
    name: 'total_weight_mark',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  totalWeightMark: number;

  @Column({
    name: 'creator_id',
    type: 'int',
    nullable: true,
  })
  creatorId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User | null;

  @OneToMany(
    () => JobApplicantInterviewer,
    (applicantInterviewer) => applicantInterviewer.jobInterviewSchedule,
  )
  jobApplicantInterviewers: JobApplicantInterviewer[];

  @OneToMany(() => JobInterviewWeight, (weight) => weight.jobInterviewSchedule)
  jobInterviewWeights: JobInterviewWeight[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date | null;
}
