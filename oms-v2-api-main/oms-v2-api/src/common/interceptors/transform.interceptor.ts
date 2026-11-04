import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function isBinaryResponse(data: unknown): boolean {
  return (
    data instanceof StreamableFile ||
    Buffer.isBuffer(data) ||
    data instanceof Uint8Array
  );
}

@Injectable()
export class AppClassSerializerInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextOptions = this.getContextOptions(context);
    const options = {
      ...this.defaultOptions,
      ...contextOptions,
    };

    return next.handle().pipe(
      map((data) => {
        if (isBinaryResponse(data)) {
          return data;
        }
        try {
          return this.serialize(data, options);
        } catch (error) {
          // If class-transformer fails (e.g. RangeError: Maximum call stack size exceeded
          // from circular references or Mongoose documents), fall back safely to raw data.
          return data;
        }
      }),
    );
  }
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.originalUrl || '';

    // Skip transformation for metrics and binary file downloads
    if (
      path === '/metrics' ||
      path.includes('/download') ||
      path.includes('/export') ||
      path.includes('/voucher-pdf') ||
      path.includes('/attachments')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (isBinaryResponse(data)) {
          return data;
        }

        let message = '';
        let pagination = null;

        // If controller returns structured response
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          pagination = data.pagination ?? null;

          const { message: _, pagination: __, ...rest } = data;

          return {
            success: context.switchToHttp().getResponse().statusCode >= 200 && context.switchToHttp().getResponse().statusCode < 300,
            statusCode: context.switchToHttp().getResponse().statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            ...rest, // 👈 THIS keeps totalApplicants, extra fields, etc.
            pagination,
          };
        }

        // If controller returns raw data (array/object)
        return {
          success: context.switchToHttp().getResponse().statusCode >= 200 && context.switchToHttp().getResponse().statusCode < 300,
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          message,
          data,
          pagination,
        };
      }),
    );
  }
}
