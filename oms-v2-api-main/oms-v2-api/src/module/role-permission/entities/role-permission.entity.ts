// src/role-permissions/entities/role-permission.entity.ts
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'role_permissions', synchronize: false })
export class RolePermission {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'role_id', type: 'int', unsigned: true })
  roleId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'permission_id', type: 'int', unsigned: true })
  permissionId: number;

  @Column({
    name: 'access_panel',
    type: 'enum',
    enum: ['Admin', 'Company'],
    default: 'Company',
  })
  accessPanel: 'Admin' | 'Company';

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' }) // links permissionId column
  permission: Permission;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date | null;
}
