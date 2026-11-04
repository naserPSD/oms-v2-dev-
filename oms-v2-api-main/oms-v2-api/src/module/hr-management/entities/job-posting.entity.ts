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
import { JobPosition } from './job-position.entity';
import { Status } from '@module/status/entities/status.entity';
import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';

@Entity({ name: 'job_postings', synchronize: false })
export class JobPosting {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId?: number | null;

  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'app_id',
  })
  application?: Application;

  @Column({
    name: 'job_position_id',
    type: 'int',
    unsigned: true,
  })
  jobPositionId: number;

  @ManyToOne(() => JobPosition, { nullable: false })
  @JoinColumn({ name: 'job_position_id' })
  jobPosition: JobPosition;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    default: '',
  })
  code: string;

  @Column({
    name: 'job_vacancy',
    type: 'tinyint',
    width: 4,
    default: 0,
  })
  jobVacancy: number;

  @Column({
    name: 'posting_status_id',
    type: 'int',
    unsigned: true,
    default: 61,
  })
  postingStatusId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'posting_status_id' })
  postingStatus: Status;

  @Column({
    name: 'publish_date',
    type: 'datetime',
    nullable: true,
  })
  publishDate?: Date | null;

  @Column({
    name: 'close_date',
    type: 'datetime',
    nullable: true,
  })
  closeDate?: Date | null;

  @Column({
    name: 'applicants_count',
    type: 'int',
    default: 0,
    unsigned: true,
  })
  applicantsCount: number;

  @Column({
    name: 'views_count',
    type: 'int',
    default: 0,
    unsigned: true,
  })
  viewsCount: number;

  @Column({
    name: 'published_by',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  publishedBy?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'published_by' })
  publisher?: User | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Expose()
  postingStatusInfo?: {
    name?: string | null;
    code?: string | null;
  };

  @Expose()
  jobPositionInfo?: {
    name?: string | null;
    description?: string | null;
    requirements?: string | null;
    benefits?: string | null;
  };
}
