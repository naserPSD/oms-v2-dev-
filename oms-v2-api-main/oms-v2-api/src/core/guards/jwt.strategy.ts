// src/core/guards/jwt.strategy.tss
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // don't ignore exp
      secretOrKey: process.env.JWT_SECRET as string, // Use a secure env variable in production
    });
  }

  async validate(payload: any) {
    if (!payload?.id) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.id,
      email: payload.email,
      activeAppId: payload.activeAppId,
    };
  }
}
