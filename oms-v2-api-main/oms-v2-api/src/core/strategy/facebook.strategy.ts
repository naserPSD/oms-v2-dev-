import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Inject, Injectable } from '@nestjs/common';
import facebookOatuthConfig from '@config/facebook-oatuth.config';
import { ConfigType } from '@nestjs/config';
import { HelperService } from '@common/helpers/helper.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly commonDao: HelperService,
    @Inject(facebookOatuthConfig.KEY)
    private facebookConfiguration: ConfigType<typeof facebookOatuthConfig>,
  ) {
    super({
      clientID: facebookConfiguration.clientId,
      clientSecret: facebookConfiguration.clientSecret,
      callbackURL: facebookConfiguration.callbackUrl,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      const { email, last_name, first_name } = profile._json;

      const user = await this.commonDao.validatedGoogleUser({
        firstName: first_name,
        lastName: last_name,
        email: email,
      });
      return user;
    } catch (err) {
      console.error('Facebook validation error:', err);
      return undefined;
    }
  }
}
