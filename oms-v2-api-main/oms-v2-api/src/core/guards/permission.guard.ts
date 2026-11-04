// src/auth/guards/permission.guard.ts
import { RequestContext } from '@common/request-context';
import { RolePermissionService } from '@module/role-permission/role-permission.service';
import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const activeAppId =
      user.activeAppId ??
      request.activeAppId ??
      RequestContext.get('activeAppId') ??
      null;

    return this.rolePermissionService.userHasAllPermissions(
      user.id,
      requiredPermissions,
      activeAppId,
    );
  }
}
