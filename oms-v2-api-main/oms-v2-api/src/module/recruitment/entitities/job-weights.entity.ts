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
import { JobVacancy } from '@module/recruitment/entitities/job-vacancies.entity';

@Entity({ name: 'job_weights' })
export class JobWeight {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId: number;

  @ManyToOne(() => Application, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app?: Application;

  @Column({ name: 'job_vacancy_id', type: 'int', unsigned: true })
  jobVacancyId: number;

  @ManyToOne(() => JobVacancy, (jobVacancy) => jobVacancy.jobWeights, {
    eager: false,
  })
  @JoinColumn({ name: 'job_vacancy_id' })
  jobVacancy?: JobVacancy;

  @Column({ name: 'weight_name', type: 'varchar', length: 100 })
  weightName: string;

  @Column({
    name: 'weight_value',
    type: 'double',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  weightValue?: number;

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
