import { Application } from '@module/application/entities/application.entity';
import { User } from '@module/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
}

@Entity({ name: 'account_categories', synchronize: false })
@Index('uq_account_category_app_name_type', ['appId', 'name', 'type'], { unique: true })
export class AccountCategory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true })
  appId!: number;

  @ManyToOne(() => Application, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application!: Application;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20, default: CategoryType.EXPENSE })
  type!: CategoryType;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  source!: string;

  @Column({ name: 'created_by', type: 'int', unsigned: true, nullable: true })
  createdBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User | null;

  @Column({ name: 'updated_by', type: 'int', unsigned: true, nullable: true })
  updatedBy?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser?: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
