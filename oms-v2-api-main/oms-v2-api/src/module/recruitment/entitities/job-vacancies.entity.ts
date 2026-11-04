import { Application } from '@module/application/entities/application.entity';
import { OfficeShift } from '@module/hr-management/entities/office-shift.entity';
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
  DeleteDateColumn,
} from 'typeorm';
import { JobCategory } from './job-categories.entity';
import { Status } from '@module/status/entities/status.entity';
import { JobWeight } from './job-weights.entity';
import { JobApplicant } from './job-applicants.entity';
import { JobInterviewer } from './job-interviewers.entity';
import { JobInterviewSchedule } from './job-interview-schedules.entity';
import { JobApplicantInterviewer } from './job-applicant-interviewers.entity';
import { JobRecruitmentStep } from './job-recruitment-steps.entity';

@Entity({ name: 'job_vacancies', synchronize: false })
export class JobVacancy {
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
    name: 'office_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  officeId?: number | null;

  @ManyToOne(() => Office)
  @JoinColumn({ name: 'office_id' })
  office: Office | null;

  @Column({
    name: 'shift_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  shiftId?: number | null;

  @ManyToOne(() => OfficeShift)
  @JoinColumn({ name: 'shift_id' })
  shift?: OfficeShift | null;

  @Column({
    name: 'job_title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  jobTitle?: string | null;

  @Column({
    name: 'no_of_vacancies',
    type: 'tinyint',
    nullable: true,
    default: 1,
  })
  noOfVacancies?: number | null;

  @Column({
    name: 'job_category_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobCategoryId?: number | null;

  @ManyToOne(() => JobCategory)
  @JoinColumn({ name: 'job_category_id' })
  jobCategory?: JobCategory | null;

  @Column({
    name: 'employment_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  employmentStatusId?: number | null;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'employment_status_id' })
  employmentStatus?: Status | null;

  @Column({
    name: 'application_deadline',
    type: 'timestamp',
    nullable: true,
  })
  applicationDeadline?: Date | null;

  @Column({
    name: 'resume_receiving_option',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  resumeReceivingOption?: number | null;

  @Column({
    name: 'special_instruction',
    type: 'text',
    nullable: true,
  })
  specialInstruction?: string | null;

  @Column({
    name: 'required_photo',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  requiredPhoto?: boolean | null;

  @Column({
    name: 'prefer_video_resume',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  preferVideoResume?: boolean | null;

  @Column({
    name: 'job_level',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobLevel?: number | null;

  @Column({
    name: 'job_context',
    type: 'text',
    nullable: true,
  })
  jobContext?: string | null;

  @Column({
    name: 'job_responsibilities',
    type: 'text',
    nullable: true,
  })
  jobResponsibilities?: string | null;

  @Column({
    name: 'workplace',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  workplace?: string | null;

  @Column({
    name: 'min_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    default: 0.0,
  })
  minSalary: string;

  @Column({
    name: 'max_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    default: 0.0,
  })
  maxSalary: string;

  @Column({
    name: 'show_salary_range',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  showSalaryRange?: boolean | null;

  @Column({
    name: 'salary_negotiable',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  salaryNegotiable?: boolean | null;

  @Column({
    name: 'additional_salary_info',
    type: 'text',
    nullable: true,
  })
  additionalSalaryInfo?: string | null;

  @Column({
    name: 'preferred_edu_institute',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  preferredEduInstitute?: string | null;

  @Column({
    name: 'others_edu_qualification',
    type: 'varchar',
    length: 256,
    nullable: true,
  })
  othersEduQualification?: string | null;

  @Column({
    name: 'training_and_trade_course',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  trainingAndTradeCourse?: string | null;

  @Column({
    name: 'professional_certification',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  professionalCertification?: string | null;

  @Column({
    name: 'area_of_experience',
    type: 'text',
    nullable: true,
  })
  areaOfExperience?: string | null;

  @Column({
    name: 'additional_requirement',
    type: 'text',
    nullable: true,
  })
  additionalRequirement?: string | null;

  @Column({
    name: 'skills',
    type: 'text',
    nullable: true,
  })
  skills?: string | null;

  @Column({
    name: 'min_year_experience',
    type: 'tinyint',
    nullable: true,
  })
  minYearExperience?: number | null;

  @Column({
    name: 'max_year_experience',
    type: 'tinyint',
    nullable: true,
  })
  maxYearExperience?: number | null;

  @Column({
    name: 'is_apply_fresher',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  isApplyFresher?: string | null;

  @Column({
    name: 'experience_required',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  experienceRequired?: string | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: ['Male', 'Female', 'Female and Male'],
    nullable: true,
  })
  gender?: 'Male' | 'Female' | 'Female and Male' | null;

  @Column({
    name: 'min_age',
    type: 'tinyint',
    nullable: true,
  })
  minAge?: number | null;

  @Column({
    name: 'max_age',
    type: 'tinyint',
    nullable: true,
  })
  maxAge?: number | null;

  @Column({
    name: 'save_step',
    type: 'tinyint',
    nullable: true,
    default: 1,
  })
  saveStep?: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  createdAt?: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date | null;

  @OneToMany(() => JobWeight, (weight) => weight.jobVacancy)
  jobWeights?: JobWeight[];

  @OneToMany(() => JobApplicant, (applicant) => applicant.jobVacancy)
  jobApplicants?: JobApplicant[];

  @OneToMany(() => JobInterviewer, (interviewer) => interviewer.jobVacancy)
  jobInterviewers?: JobInterviewer[];

  @OneToMany(() => JobInterviewSchedule, (schedule) => schedule.jobVacancy)
  jobInterviewSchedules?: JobInterviewSchedule[];

  @OneToMany(
    () => JobApplicantInterviewer,
    (interviewer) => interviewer.jobVacancy,
  )
  jobApplicantInterviewers?: JobApplicantInterviewer[];

  @OneToMany(() => JobRecruitmentStep, (step) => step.jobVacancy)
  jobRecruitmentSteps: JobRecruitmentStep[];
}
