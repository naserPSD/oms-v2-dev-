import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Index('IDX_USER_PROJECTS_USER_ID', ['userId'])
@Entity({ name: 'user_projects', synchronize: true })
export class UserProject {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
  })
  userId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'project_name',
    type: 'varchar',
    length: 100,
  })
  projectName: string;

  @Column({
    name: 'project_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  projectUrl: string | null;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: true,
  })
  startDate: Date | null;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate: Date | null;

  @Column({
    name: 'is_current',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isCurrent: boolean;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'used_technologies',
    type: 'text',
    nullable: true,
  })
  usedTechnologies: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
