import { Application } from '@module/application/entities/application.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
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

@Entity({ name: 'job_positions', synchronize: false })
export class JobPosition {
  @PrimaryGeneratedColumn({
    name: 'id',
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
  @JoinColumn({
    name: 'app_id',
  })
  application?: Application;

  @Column({
    name: 'designation_id',
    type: 'int',
    unsigned: true,
  })
  designationId: number;

  @ManyToOne(() => Designation, { nullable: false })
  @JoinColumn({ name: 'designation_id' })
  designation: Designation;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'requirements',
    type: 'longtext',
    nullable: true,
  })
  requirements?: string | null;

  @Column({
    name: 'benefits',
    type: 'longtext',
    nullable: true,
  })
  benefits?: string | null;

  @Column({
    name: 'experience',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  experience?: string | null;

  @Column({
    name: 'employment_type_id',
    type: 'int',
    unsigned: true,
  })
  employmentTypeId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'employment_type_id' })
  employmentType: Status;

  @Column({
    name: 'work_model_id',
    type: 'int',
    unsigned: true,
    default: 58,
  })
  workModelId: number;

  @ManyToOne(() => Status, { nullable: false })
  @JoinColumn({ name: 'work_model_id' })
  workModel: Status;

  @Column({
    name: 'salary_range_min',
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    default: 0.0,
  })
  salaryRangeMin: number;

  @Column({
    name: 'salary_range_max',
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    default: 0.0,
  })
  salaryRangeMax: number;

  @Column({
    name: 'location',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  location?: string | null;

  @Column({
    name: 'active',
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  active: boolean;

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
  updatedAt: Date | null;
}
