import { Application } from '@module/application/entities/application.entity';
import { Status } from '@module/status/entities/status.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'app_users', synchronize: true })
export class AppUser {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({
    name: 'app_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  appId: number | null;

  @ManyToOne(() => Application, {
    nullable: true,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_id' })
  application?: Application | null;

  @Column({
    name: 'user_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userId: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column({
    name: 'user_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  userTypeId: number | null;

  @ManyToOne(() => Status, {
    nullable: true,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_type_id' })
  userType?: Status | null;

  @Column({
    name: 'joining_date',
    nullable: true,
    type: 'date',
  })
  joiningDate: Date;

  @Column({
    name: 'leaving_date',
    type: 'date',
    nullable: true,
  })
  leavingDate: Date;

  @Index('idx_app_user_active')
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: 1,
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
