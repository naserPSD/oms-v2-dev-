import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Application } from '@module/application/entities/application.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { User } from '@module/users/entities/user.entity';
import { JobInterviewSchedule } from './job-interview-schedules.entity';
import { JobVacancy } from '@module/recruitment/entitities/job-vacancies.entity';
import { JobRecruitmentStepName } from '@module/recruitment/entitities/job-recruitment-step-names.entity';
import { JobApplicantInterviewer } from '@module/recruitment/entitities/job-applicant-interviewers.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { Media } from '@module/media/entities/media.entity';
import { Country } from '@module/country/entities/country.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'job_applicants', synchronize: false })
export class JobApplicant {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

  @Column({ name: 'job_vacancy_id', type: 'int', unsigned: true })
  jobVacancyId: number;

  @ManyToOne(() => JobVacancy, (jobVacancy) => jobVacancy.jobApplicants, {
    eager: false,
  })
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy?: JobVacancy;

  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar' })
  lastName: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'phone', type: 'varchar' })
  phone?: string;

  @Column({
    name: 'phone_country_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  phoneCountryId?: number;

  @OneToOne(() => Country, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'phone_country_id', referencedColumnName: 'id' })
  @Exclude({ toPlainOnly: true })
  phoneCountry: Country | null;

  @Column({
    name: 'job_recruitment_step_name_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobRecruitmentStepNameId?: number;

  @ManyToOne(() => JobRecruitmentStepName, { eager: false })
  @JoinColumn({ name: 'job_recruitment_step_name_id' })
  jobRecruitmentStep?: JobRecruitmentStepName;

  @Column({ name: 'office_id', type: 'int', unsigned: true, nullable: true })
  officeId?: number;

  @ManyToOne(() => Office, { eager: false })
  @JoinColumn({ name: 'office_id' })
  office?: Office;

  @Column({ name: 'emp_id', type: 'int', unsigned: true, nullable: true })
  employeeId?: number;

  @ManyToOne(() => Employee, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emp_id' })
  employee?: Employee;

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

  @Column({ name: 'interview_rating', type: 'int', unsigned: true, default: 0 })
  interviewRating: number;

  @Column({ type: 'longtext', nullable: true })
  summary?: string;

  @Column({ name: 'cv_media_id', type: 'int', unsigned: true, nullable: true })
  cvMediaId?: number;

  @ManyToOne(() => Media, {
    createForeignKeyConstraints: false,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'cv_media_id' })
  cv?: Media | null;

  @Column({
    name: 'expected_salary',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  expectedSalary?: number;

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

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => JobInterviewSchedule, (schedule) => schedule.jobApplicant)
  jobInterviewSchedules?: JobInterviewSchedule[];

  @OneToMany(
    () => JobApplicantInterviewer,
    (interviewer) => interviewer.jobApplicant,
  )
  jobApplicantInterviewers?: JobApplicantInterviewer[];
}
