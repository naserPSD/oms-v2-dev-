import { Expose, Transform, TransformFnParams } from 'class-transformer';
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
import { Application } from '@module/application/entities/application.entity';

//export type NoticePriority = 'Low' | 'Normal' | 'High';

export enum NoticePriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
}

@Entity({ name: 'notices', synchronize: false })
export class Notice {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  @Transform((params: TransformFnParams) => Number(params.value))
  id: number;

  @Index('idx_notices_app_id')
  @Column({
    name: 'app_id',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  appId: number;
  @ManyToOne(() => Application, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application?: Application;


  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'content',
    type: 'text',
  })
  content: string;

  @Column({
    name: 'attachment',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  attachment?: string;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: NoticePriority,
    default: NoticePriority.NORMAL,
    nullable: true,
  })
  priority?: NoticePriority;

  @Column({
    name: 'page_route',
    type: 'varchar',
    length: 255,
    default: '/main-dashboard',
    nullable: true,
  })
  pageRoute?: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

  @Column({
    name: 'start_date',
    type: 'datetime',
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'datetime',
    nullable: true,
  })
  endDate?: Date | null;

  @Column({
    name: 'created_by',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  createdBy: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
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
}
