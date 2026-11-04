// ws-jwt.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      //   const payload = jwt.verify(token, 'SECRET_KEY'); // use process.env.JWT_SECRET
      const payload = jwt.verify(token, process.env.JWT_SECRET as string); // use process.env.JWT_SECRET
      client.user = payload; // attach user info to socket
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
