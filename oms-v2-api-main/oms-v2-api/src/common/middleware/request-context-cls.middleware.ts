import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContext } from '@common/request-context';

@Injectable()
export class RequestContextClsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    RequestContext.run(() => {
      next();
    });
  }
}
