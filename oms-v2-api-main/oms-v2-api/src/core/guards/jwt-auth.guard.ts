// src/core/guards/jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserContextService } from '@module/auth/user-context.service';
import { HelperService } from '@common/helpers/helper.service';
import { RequestContext } from '@common/request-context';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { HttpRequestResponseUtils } from '@common/utils/http-request-response.utils';

@Injectable({ scope: Scope.REQUEST })
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly userContextService: UserContextService,
    private readonly commonDaoRepo: HelperService,
    private readonly requestContext: RequestContext,
    private readonly httpUtils: HttpRequestResponseUtils,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ✅ 1. Skip JWT auth for public endpoints like /metrics, /admin/queues, and public meeting join links
    const rawUrl = request.originalUrl || request.url || '';
    const excludedPaths = [
      '/metrics',
      '/admin/queues',
      '/api/v1/meetings/join',
      '/meetings/join',
      '/api/v1/meetings/google/callback',
      '/meetings/google/callback',
    ];
    if (
      excludedPaths.some(
        (path) =>
          rawUrl.startsWith(path) ||
          (request.url && request.url.startsWith(path)),
      ) ||
      rawUrl.includes('/meetings/join') ||
      request.url?.includes('/meetings/join') ||
      (request.path && request.path.includes('/meetings/join'))
    ) {
      return true; // allow public access
    }

    // ✅ 2. Skip if @Public() decorator is used
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ✅ 3. Otherwise, run normal JWT validation
    const result = (await super.canActivate(context)) as boolean;

    const user = request.user;

    this.requestContext.setRequest(request);

    const ipAddress = this.httpUtils.getClientIpAddress(request);
    RequestContext.set('ipAddress', ipAddress);

    const userId = user?.id || null;
    this.requestContext.setUserId(userId);
    if (user?.id) {
      RequestContext.set('userId', user.id);
      RequestContext.set('activeAppId', user.activeAppId);
    }

    if (!userId) {
      throw new UnauthorizedException();
    }

    this.userContextService.setUser(user);
    return result;
  }
}
