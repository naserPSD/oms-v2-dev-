import { Expose, Transform, TransformFnParams } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'personal_notes', synchronize: false })
export class PersonalNote {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
    unsigned: true,
  })
  @Transform((params: TransformFnParams) => Number(params.value))
  id: number;

  @Index('idx_personal_notes_user_id')
  @Column({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  userId: number;

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
    name: 'tags',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  tags?: string | null;

  @Column({
    name: 'is_pinned',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isPinned: boolean;

  @Column({
    name: 'is_archived',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isArchived: boolean;

  @Column({
    name: 'reminder_at',
    type: 'datetime',
    nullable: true,
  })
  reminderAt?: Date | null;

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
}
