// config/googleOauth.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('facebookOauth', () => ({
  clientId: process.env.FACEBOOK_APP_ID ?? '',
  clientSecret: process.env.FACEBOOK_APP_SECRET ?? '',
  callbackUrl: process.env.FACEBOOK_CALLBACK_URL ?? '',
}));
