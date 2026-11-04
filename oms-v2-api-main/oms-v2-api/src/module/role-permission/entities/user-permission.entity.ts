// src/user-permissions/entities/user-permission.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'user_permissions', synchronize: true })
export class UserPermission {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'permission_id', type: 'int', unsigned: true })
  permissionId: number;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({
    name: 'is_granted',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isGranted: boolean;

  @CreateDateColumn()
  created_at: Date;
}
