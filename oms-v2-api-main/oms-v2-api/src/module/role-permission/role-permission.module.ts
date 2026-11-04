import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '@module/users/entities/user.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserContextService } from '@module/auth/user-context.service';

@Module({
  exports: [RolePermissionService],
  controllers: [RolePermissionController],
  providers: [RolePermissionService, UserContextService],
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
      Role,
      UserPermission,
      UserRole,
      User,
    ]),
  ],
})
export class RolePermissionModule {}
