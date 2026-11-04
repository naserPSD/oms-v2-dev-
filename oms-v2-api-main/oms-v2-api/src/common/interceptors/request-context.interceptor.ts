import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '@common/request-context';
import { CacheService } from 'src/redis/cache.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable((subscriber) => {
      RequestContext.run(async () => {
        const req = context.switchToHttp().getRequest();

        RequestContext.set('ip', req.ip);
        RequestContext.set('url', req.originalUrl);
        RequestContext.set('method', req.method);

        if (req.user) {
          // Prefer JWT / header over cache so switching company is never stuck on a stale appId
          let activeAppId =
            req.user.activeAppId ||
            req.headers['x-app-id'] ||
            req.headers['x-active-app-id'] ||
            null;

          if (!activeAppId) {
            activeAppId = await this.cacheService.get(`appId:${req.user.id}`);
          }

          if (activeAppId) {
            await this.cacheService.set(`appId:${req.user.id}`, activeAppId);
          }

          RequestContext.set(
            'activeAppId',
            activeAppId ? Number(activeAppId) : null,
          );
          RequestContext.set('userId', req.user.id);
        } else {
          const headerAppId =
            req.headers['x-app-id'] || req.headers['x-active-app-id'] || null;
          RequestContext.set(
            'activeAppId',
            headerAppId ? Number(headerAppId) : null,
          );
        }

        // ⬅ only ONE next.handle() here
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
