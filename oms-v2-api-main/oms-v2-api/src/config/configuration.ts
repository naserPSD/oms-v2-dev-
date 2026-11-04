import { AuditEntityListener } from '@common/listeners/audit-entity.listener';

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
  },

  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE || 'test',
    // subscribers: [AuditEntityListener],
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
  },

  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    username: process.env.SMTP_USERNAME ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
  },

  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN ?? '',
    accountHash: process.env.CLOUDFLARE_ACCOUNT_HASH ?? '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
  },

  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookUniqueId: process.env.STRIPE_WEBHOOK_UNIQUE_ID ?? '',
    webhookSigningSecretLocal:
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET_LOCAL ?? '',
    webhookSigningSecretStaging:
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET_STAGING ?? '',
  },

  logger: {
    level: process.env.LOGGER_LEVEL || 'info',
    debug: process.env.DEBUG || 'info',
    json: process.env.USE_JSON_LOGGER ?? 'false',
    sentryDns: process.env.SENTRY_DNS ?? '',
  },

  aws: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || '',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || '',
    AWS_USE_PATH_STYLE_ENDPOINT:
      process.env.AWS_USE_PATH_STYLE_ENDPOINT || false,
    AWS_LOCATION: process.env.AWS_LOCATION || '',
    IMAGE_URL: process.env.IMAGE_URL || '',
  },
});
