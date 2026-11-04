import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'job_categories', synchronize: false })
export class JobCategory {
  @PrimaryGeneratedColumn({
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
  appId: number | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    unsigned: true,
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

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
    name: 'editor_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  editorId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'editor_id' })
  editor: User | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'datetime',
    nullable: true,
  })
  deletedAt: Date | null;
}
