import { HelperService } from '@common/helpers/helper.service';
import googleOauthConfig from '@config/google-Oauth.config';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly commonDao: HelperService,
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
  ) {
    super({
      clientID: googleConfiguration.clientId,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackUrl,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { given_name, family_name, email } = profile._json;

      const user = await this.commonDao.validatedGoogleUser({
        firstName: given_name,
        lastName: family_name,
        email: email,
      });
      return done(null, user);
    } catch (err) {
      console.error('Google validation error:', err);
      return done(err, undefined);
    }
  }
}
