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
import { JobInterviewSchedule } from './job-interview-schedules.entity';
import { User } from '@module/users/entities/user.entity';
import { JobApplicant } from './job-applicants.entity';
import { JobVacancy } from '@module/recruitment/entitities/job-vacancies.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';

@Entity({ name: 'job_applicant_interviewers', synchronize: false })
export class JobApplicantInterviewer {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

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

  @Column({ name: 'job_applicant_id', type: 'int', unsigned: true })
  jobApplicantId: number;

  @ManyToOne(() => JobApplicant, { eager: false })
  @JoinColumn({ name: 'job_applicant_id' })
  jobApplicant?: JobApplicant;

  @Column({ name: 'job_vacancy_id', type: 'int', unsigned: true })
  jobVacancyId: number;

  @ManyToOne(() => JobVacancy, { eager: false })
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy?: JobVacancy;

  @Column({ name: 'employee_id', type: 'int', unsigned: true })
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false,onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  @Column({
    name: 'interview_status',
    type: 'enum',
    enum: ['Pending', 'Unattended', 'Completed'],
    default: 'Pending',
  })
  interviewStatus: 'Pending' | 'Unattended' | 'Completed';

  @Column({
    name: 'interview_panels_url',
    type: 'varchar',
    length: 512,
    default: '',
  })
  interviewPanelsUrl: string;

  @Column({ name: 'interview_remarks', type: 'text', nullable: true })
  interviewRemarks?: string;

  @Column({ name: 'creator_id', type: 'int', unsigned: true })
  creatorId: number;

  @ManyToOne(() => User, {
    eager: false,
  })
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
