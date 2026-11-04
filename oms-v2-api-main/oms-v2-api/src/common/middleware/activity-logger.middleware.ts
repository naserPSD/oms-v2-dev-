// src/common/middleware/activity-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '@module/audit-log/audit-log.service';
import { HttpRequestResponseUtils } from '@common/utils/http-request-response.utils';
import { UAParser } from 'ua-parser-js';
import { RequestContext } from '@common/request-context';

@Injectable()
export class ActivityLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly httpUtils: HttpRequestResponseUtils,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const parser = new UAParser(req.headers['user-agent'] || '');

    // Hook into response finish to log response code
    res.on('finish', async () => {
      const userId =
        (req.user as any)?.id ?? RequestContext.get<number>('userId') ?? null;

      await this.auditLogService.createUserActivity({
        userId: userId,
        sessionId: req.headers['x-session-id'] as string,
        ipAddress: this.httpUtils.getClientIpAddress(req),
        userAgent: req.headers['user-agent'],
        device: parser.getDevice().type || 'Desktop',
        os: parser.getOS().name,
        browser: parser.getBrowser().name,
        method: req.method,
        url: req.originalUrl,
        route: req.route?.path,
        refererPage: req.get('referer'),
        currentPage: req.url,
        requestHeaders: req.headers,
        requestData: req.body || {},
        responseCode: res.statusCode,
        status:
          res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'ERROR',
      });
    });

    next();
  }
}
