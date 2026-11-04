// src/roles/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { Expose } from 'class-transformer';
import { Application } from '@module/application/entities/application.entity';

@Entity({ name: 'roles', synchronize: false })
@Index('UQ_ROLES_APP_ACTIVE_NAME', ['appId', 'activeName'], {
  unique: true,
})
export class Role {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'app_id', type: 'int', unsigned: true, nullable: true })
  appId?: number | null;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  code: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'is_system',
    type: 'tinyint',
    default: false,
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => !!value,
    },
  })
  isSystem: boolean;

  @Index('idx_roles_is_active')
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({
    name: 'active_name',
    type: 'varchar',
    length: 100,
    nullable: true,
    asExpression:
      'CASE WHEN `deleted_at` IS NULL THEN `name` ELSE NULL END',
    generatedType: 'VIRTUAL',
    select: false,
    insert: false,
    update: false,
  })
  activeName: string | null;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @Expose()
  get permissions(): string[] {
    return (
      this.rolePermissions
        ?.map((rolePermission) => rolePermission.permission?.name)
        .filter((name): name is string => Boolean(name)) ?? []
    );
  }

  @Expose()
  get permissionCodes(): string[] {
    return (
      this.rolePermissions
        ?.map((rolePermission) => rolePermission.permission?.code)
        .filter((code): code is string => Boolean(code)) ?? []
    );
  }

  @Expose()
  get permissionIds(): number[] {
    return (
      this.rolePermissions
        ?.map((rolePermission) => rolePermission.permissionId)
        .filter((id): id is number => id !== null && id !== undefined) ?? []
    );
  }
}
