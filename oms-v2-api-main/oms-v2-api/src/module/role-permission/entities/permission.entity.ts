// src/permissions/entities/permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { UserPermission } from './user-permission.entity';
import { Expose } from 'class-transformer';

@Entity({ name: 'permissions', synchronize: false })
export class Permission {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    type: 'enum',
    enum: ['module', 'page', 'action', 'feature'],
    default: 'action',
  })
  type: string;

  @Column({
    name: 'access_panel',
    type: 'enum',
    enum: ['Admin', 'Company'],
    default: 'Company',
  })
  accessPanel: string;

  @Index('idx_permissions_name')
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Index('idx_permissions_code_unique', { unique: true })
  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'path', length: 500, nullable: true })
  path: string;

  @Column({
    name: 'menu_position_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  menuPositionId: number;

  @Column({ name: 'icon', length: 100, nullable: true })
  icon: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isActive: boolean;

  @Column({
    name: 'is_system',
    type: 'tinyint',
    default: 0,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isSystem: boolean;

  @Column({
    name: 'is_required',
    type: 'tinyint',
    default: 1,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isRequired: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Self-referencing relationship for hierarchy
  @ManyToOne(() => Permission, (permission) => permission.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Permission | null;

  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];

  @OneToMany(
    () => UserPermission,
    (userPermission) => userPermission.permission,
  )
  userPermissions: UserPermission[];

  @Expose()
  childIds: number[];

  @Expose()
  pages: Permission[];

  @Expose()
  actions: Permission[];

  @Expose()
  features: Permission[];
}
