import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@common/request-context';
import { CacheService } from 'src/redis/cache.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    RequestContext.run(async () => {
      RequestContext.set('ip', req.ip);
      RequestContext.set('url', req.originalUrl);
      RequestContext.set('method', req.method);

        if (req.user) {
          const userId = (req.user as any).id;
          RequestContext.set('userId', userId);

          // Prefer JWT / header over cache so switching company is never stuck on a stale appId
          let activeAppId =
            (req.user as any).activeAppId ||
            req.headers['x-app-id'] ||
            req.headers['x-active-app-id'] ||
            null;

          if (!activeAppId) {
            activeAppId = await this.cacheService.get(`appId:${userId}`);
          }

          if (activeAppId) {
            await this.cacheService.set(`appId:${userId}`, activeAppId);
          }

          RequestContext.set(
            'activeAppId',
            activeAppId ? Number(activeAppId) : null,
          );
        } else {
          const headerAppId =
            req.headers['x-app-id'] || req.headers['x-active-app-id'] || null;
          RequestContext.set(
            'activeAppId',
            headerAppId ? Number(headerAppId) : null,
          );
        }

      next();
    });
  }
}
