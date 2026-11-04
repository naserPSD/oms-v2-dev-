import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobVacancy } from '@module/recruitment/entitities/job-vacancies.entity';
import { JobRecruitmentStepName } from '@module/recruitment/entitities/job-recruitment-step-names.entity';

@Entity({ name: 'job_recruitment_steps', synchronize: true })
export class JobRecruitmentStep {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'job_vacancy_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  jobVacancyId?: number | null;

  @ManyToOne(() => JobVacancy, { eager: false })
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy?: JobVacancy | null;

  @Column({
    name: 'step_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  stepId?: number | null;

  @ManyToOne(() => JobRecruitmentStepName, { eager: false })
  @JoinColumn({ name: 'step_id' })
  step?: JobRecruitmentStepName | null;
}
