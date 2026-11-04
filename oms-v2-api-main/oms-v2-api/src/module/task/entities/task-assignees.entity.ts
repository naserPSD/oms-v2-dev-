import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';
import { Expose } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Unique,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskWorkspace } from './task-workspace.entity';
import { TaskBoard } from './task-boards.entity';
import { TaskCard } from './task-cards.entity';
import { Task } from './task.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';

@Entity({ name: 'task_assignees', synchronize: false })
export class TaskAssignee {
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

  @Unique(['code'])
  @Index('idx_task_assignees_code', ['code'])
  @Column({
    type: 'varchar',
    name: 'code',
    length: 50,
    nullable: true,
    unique: true,
  })
  code: string;

  @Column({
    name: 'assigner_id',
    type: 'int',
    unsigned: true,
  })
  assignerId: number;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigner_id' })
  assigner: Employee;

  @Column({
    name: 'workspace_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  workspaceId?: number | null;

  @ManyToOne(() => TaskWorkspace, { nullable: true })
  @JoinColumn({ name: 'workspace_id' })
  workspace: TaskWorkspace;

  @Column({
    name: 'board_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  boardId?: number | null;

  @ManyToOne(() => TaskBoard, { nullable: true })
  @JoinColumn({ name: 'board_id' })
  board: TaskBoard;

  @Column({
    name: 'card_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  cardId?: number | null;

  @ManyToOne(() => TaskCard, { nullable: true })
  @JoinColumn({ name: 'card_id' })
  card: TaskCard;

  @Column({
    name: 'task_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  taskId?: number | null;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({
    name: 'task_role_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  taskRoleId?: number | null;

  @ManyToOne(() => Status, { nullable: true })
  @JoinColumn({ name: 'task_role_id' })
  taskRole: Status;

  @Column({
    name: 'assigned_on_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  assignedOnId?: number | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_on_id' })
  assignedOn: Employee | null;

  @Column({
    name: 'assigned_at',
    type: 'timestamp',
    nullable: true,
  })
  assignedAt?: Date | null;

  @Column({
    name: 'confirmed_at',
    type: 'timestamp',
    nullable: true,
  })
  confirmedAt?: Date | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

  @Expose()
  workspaceInfo?: {
    name: string | null;
    description: string | null;
  };

  @Expose()
  boardName?: string | null;

  @Expose()
  taskInfo?: {
    name: string | null;
    description: string | null;
  };
}
