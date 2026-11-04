import { registerAs } from '@nestjs/config';

export default registerAs('googleMeet', () => ({
  clientId:
    process.env.GOOGLE_MEET_CLIENT_ID ??
    process.env.GOOGLE_CLIENT_ID ??
    '',
  clientSecret:
    process.env.GOOGLE_MEET_CLIENT_SECRET ??
    process.env.GOOGLE_CLIENT_SECRET ??
    '',
  callbackUrl:
    process.env.GOOGLE_MEET_CALLBACK_URL ??
    'http://localhost:4000/api/v1/meetings/google/callback',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4000',
}));
