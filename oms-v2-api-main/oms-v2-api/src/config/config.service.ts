import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  // App Configurations
  get environment(): string {
    return this.configService.get<string>('environment', 'development');
  }

  get port(): number {
    return this.configService.get<number>('port', 3000);
  }

  get jwtSecret(): string {
    return (
      this.configService.get<string>('jwt.secret') ??
      this.throwError('JWT_SECRET')
    );
  }

  // Database Configuration: MySQL
  get mysqlHost(): string {
    return this.configService.get<string>('mysql.host', 'localhost');
  }

  get mysqlPort(): number {
    return this.configService.get<number>('mysql.port', 3306);
  }

  get mysqlUsername(): string {
    return this.configService.get<string>('mysql.username', 'root');
  }

  get mysqlPassword(): string {
    return this.configService.get<string>('mysql.password', '');
  }

  get mysqlDatabase(): string {
    return (
      this.configService.get<string>('mysql.database') ??
      this.throwError('MYSQL_DATABASE')
    );
  }

  // Database Configuration: MongoDB
  get mongodbUri(): string {
    return this.configService.get<string>(
      'mongodb.uri',
      'mongodb://localhost:27017/test',
    );
  }

  // Mail Configuration
  get mailHost(): string {
    return this.configService.get<string>('mail.host', '');
  }

  get mailPort(): number {
    return this.configService.get<number>('mail.port', 587);
  }

  get mailUsername(): string {
    return this.configService.get<string>('mail.username', '');
  }

  get mailPassword(): string {
    return this.configService.get<string>('mail.password', '');
  }

  // Google Maps Configuration
  get googleMapsApiKey(): string {
    return this.configService.get<string>('google.mapsApiKey', '');
  }

  // Cloudflare Configuration
  get cloudflareAccountId(): string {
    return this.configService.get<string>('cloudflare.accountId', '');
  }

  get cloudflareApiToken(): string {
    return this.configService.get<string>('cloudflare.apiToken', '');
  }

  get cloudflareAccountHash(): string {
    return this.configService.get<string>('cloudflare.accountHash', '');
  }

  // Firebase Configuration
  get firebaseProjectId(): string {
    return this.configService.get<string>('firebase.projectId', '');
  }

  get firebaseClientEmail(): string {
    return this.configService.get<string>('firebase.clientEmail', '');
  }

  get firebasePrivateKey(): string {
    return this.configService.get<string>('firebase.privateKey', '');
  }

  // Stripe Configuration
  get stripePublishableKey(): string {
    return this.configService.get<string>('stripe.publishableKey', '');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('stripe.secretKey', '');
  }

  get stripeWebhookUniqueId(): string {
    return this.configService.get<string>('stripe.webhookUniqueId', '');
  }

  get stripeWebhookSigningSecret(): string {
    const env = this.environment;
    if (env === 'development') {
      return this.configService.get<string>(
        'stripe.webhookSigningSecretLocal',
        '',
      );
    } else if (env === 'staging') {
      return this.configService.get<string>(
        'stripe.webhookSigningSecretStaging',
        '',
      );
    }
    return '';
  }

  // Logger Configuration
  get loggerLevel(): string {
    return this.configService.get<string>('logger.level', 'info');
  }

  get loggerDebug(): string {
    return this.configService.get<string>('logger.debug', 'info');
  }

  get loggerUseJson(): boolean {
    return this.configService.get<boolean>('logger.json', false);
  }

  get sentryDns(): string {
    return this.configService.get<string>('logger.sentryDns', '');
  }

  get awsAccessKeyID(): string {
    return this.configService.get<string>('aws.AWS_ACCESS_KEY_ID', '');
  }

  get awsSecretAccessKey(): string {
    return this.configService.get<string>('aws.AWS_SECRET_ACCESS_KEY', '');
  }

  get awsRegion(): string {
    return this.configService.get<string>('aws.AWS_REGION', '');
  }

  get awsBucketName(): string {
    return this.configService.get<string>('aws.AWS_BUCKET_NAME', '');
  }

  get awsUsePathStyleEndPoint(): boolean {
    return this.configService.get<boolean>(
      'aws.AWS_USE_PATH_STYLE_ENDPOINT',
      false,
    );
  }

  get awsLocation(): string {
    return this.configService.get<string>('aws.AWS_LOCATION', '');
  }

  get imageUrl(): string {
    return this.configService.get<string>('aws.IMAGE_URL', '');
  }

  // Utility function for required environment variables
  private throwError(variable: string): never {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}
