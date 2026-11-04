// src/user-roles/entities/user-role.entity.ts
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from '@module/users/entities/user.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'user_roles', synchronize: true })
export class UserRole {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'role_id', type: 'int', unsigned: true })
  roleId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;
}
