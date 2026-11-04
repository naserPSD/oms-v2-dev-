import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Application } from '@module/application/entities/application.entity';
import { TaskBoard } from './task-boards.entity';
import { User } from '@module/users/entities/user.entity';
import { Task } from './task.entity';
import { TaskWorkspace } from './task-workspace.entity';

@Entity({ name: 'task_cards', synchronize: false })
export class TaskCard {
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
    nullable: true,
  })
  workspaceId?: number | null;

  @ManyToOne(() => TaskWorkspace, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: TaskWorkspace;

  @Column({
    name: 'board_id',
    type: 'int',
    unsigned: true,
  })
  boardId: number;

  @ManyToOne(() => TaskBoard, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: TaskBoard;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 128,
    default: 'Task Card',
  })
  name: string;

  @Column({
    name: 'color',
    type: 'varchar',
    length: 7,
    default: '#ffffff',
    comment: '7 length hex code',
  })
  color: string;

  @Column({
    name: 'serial',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  serial: number | null;

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
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

  @OneToMany(() => Task, (task) => task.card)
  tasks: Task[];

  @Expose()
  boardName: string | null = null;
}
