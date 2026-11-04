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
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { TaskCard } from './task-cards.entity';
import { Status } from '@module/status/entities/status.entity';
import { User } from '@module/users/entities/user.entity';
import { Application } from '@module/application/entities/application.entity';
import { TaskAssignee } from './task-assignees.entity';
import { TaskTag } from './task-tags.entity';
import { TaskComment } from './task-comments.entity';
import { TaskWorkspace } from './task-workspace.entity';
import { TaskBoard } from './task-boards.entity';

@Entity({ name: 'tasks', synchronize: false })
export class Task {
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
  app?: Application;

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
    nullable: true,
  })
  boardId?: number | null;

  @ManyToOne(() => TaskBoard, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: TaskBoard;

  @Column({
    name: 'card_id',
    type: 'int',
    unsigned: true,
  })
  cardId: number;

  @ManyToOne(() => TaskCard, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: TaskCard;

  @Column({
    name: 'parent_task_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  parentTaskId?: number | null;

  @ManyToOne(() => Task, (task) => task.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask: Task | null;

  @OneToMany(() => Task, (task) => task.parentTask)
  children: Task[];

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'priority_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  priorityId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'priority_id' })
  priority: Status | null;

  @Column({
    name: 'task_status_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  taskStatusId?: number = 223;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'task_status_id' })
  taskStatus?: Status;

  @Column({
    name: 'due_date',
    type: 'datetime',
    nullable: true,
  })
  dueDate?: Date | null;

  @Column({
    name: 'completed_at',
    type: 'datetime',
    nullable: true,
  })
  completedAt?: Date | null;

  @Column({
    name: 'serial',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  serial?: number | null;

  @Column({
    name: 'creator_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number | null;

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
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date | null;

  @Expose()
  cardInfo?: {
    name: string;
    color: string;
    serial: number | null;
  };

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task, { cascade: true })
  assignees: TaskAssignee[];

  @OneToMany(() => TaskTag, (tag) => tag.task, { cascade: true })
  tags: TaskTag[];

  @OneToMany(() => TaskComment, (comment) => comment.task, { cascade: true })
  comments: TaskComment[];
}
