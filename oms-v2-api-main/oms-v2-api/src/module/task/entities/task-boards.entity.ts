import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TaskWorkspace } from './task-workspace.entity';
import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { TaskCard } from './task-cards.entity';

@Entity({ name: 'task_boards', synchronize: false })
export class TaskBoard {
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
  @JoinColumn({ name: 'app_id' })
  app: Application;

  @Column({
    name: 'workspace_id',
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  workspaceId: number;

  @ManyToOne(() => TaskWorkspace, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: TaskWorkspace;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  name: string;

  @Column({
    name: 'view_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
    default: 78,
  })
  viewTypeId: number | null;

  @ManyToOne(() => Status, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'view_type_id' })
  viewType: Status | null;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @Column({
    name: 'active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  active: boolean;

  @OneToMany(() => TaskCard, (card) => card.board)
  cards: TaskCard[];
}
