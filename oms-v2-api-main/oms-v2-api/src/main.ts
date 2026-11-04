// src/main.ts
import { configSwagger } from '@config/swagger.config';
import {
  ValidationPipe,
  BadRequestException,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
// import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
// import { join } from 'path';
import { AppModule } from './app.module';
import {
  AppClassSerializerInterceptor,
  TransformInterceptor,
} from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
// Bull Board
import IORedis from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { MailService } from './mail/mail.service';

import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const streamPipeline = promisify(pipeline);

dotenv.config(); // Load environment variables from .env

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalGuards(await app.resolve(JwtAuthGuard));

  const staticRoot = join(__dirname, '..', 'static');

  // Middleware: On-demand sync from AWS S3 for missing static assets
  app.use(
    ['/static', '/api/static', '/api/v1/static'],
    async (req, res, next) => {
      try {
        const requestedPath = req.path.replace(/^\//, '');
        if (
          !requestedPath ||
          requestedPath.includes('..') ||
          !requestedPath.includes('.')
        ) {
          return next();
        }

        const localFilePath = join(staticRoot, requestedPath);
        if (fs.existsSync(localFilePath)) {
          return next();
        }

        const bucket = process.env.AWS_BUCKET;
        if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
          return next();
        }

        const s3Client = new S3Client({
          region: process.env.AWS_DEFAULT_REGION || 'ap-south-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const s3Response = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: requestedPath,
          }),
        );

        if (s3Response.Body) {
          const dir = path.dirname(localFilePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          await streamPipeline(
            s3Response.Body as any,
            fs.createWriteStream(localFilePath),
          );
        }
      } catch (err) {
        // If file not in S3, pass through
      }
      next();
    },
  );

  app.useStaticAssets(staticRoot, {
    prefix: '/static/',
  });

  app.useStaticAssets(staticRoot, {
    prefix: '/api/static/',
  });

  app.useStaticAssets(staticRoot, {
    prefix: '/api/v1/static/',
  });

  // Register the global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new AppClassSerializerInterceptor(app.get(Reflector)));

  // Register the global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());
  // app.setViewEngine('hbs');
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // Enable class-transformer globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties not defined in the DTO
      forbidNonWhitelisted: false, // Throw an error if extra properties are provided
      transformOptions: {
        enableImplicitConversion: true, // auto convert primitives (string -> number, etc.)
      },
      exceptionFactory: (errors) => {
        const formattedErrors = {};
        errors.forEach((err) => {
          if (err.constraints) {
            formattedErrors[err.property] = Object.values(err.constraints)[0];
          } else {
            formattedErrors[err.property] = 'Unknown error';
          }
        });
        return new BadRequestException({
          message: formattedErrors,
        });
      },
    }),
  );

  const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const isLocalDevelopmentOrigin =
        !!requestOrigin &&
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin);
      const isNgrokOrigin =
        !!requestOrigin && /^https:\/\/[^/]+\.ngrok-free\.app$/.test(requestOrigin);

      if (
        !requestOrigin ||
        configuredFrontendOrigins.includes(requestOrigin) ||
        isLocalDevelopmentOrigin ||
        isNgrokOrigin
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    // methods: ['GET', 'POST'], // allowed HTTP methods
    // origin: '*', // Allow all origins (use specific origins in production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // allowed HTTP methods
    credentials: true, // Allow cookies to be sent
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'accessMenuName',
      'x-session-id',
    ], // allowed headers
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  });

  configSwagger(app);

  // ✅ Global prefix for all routes
  // app.setGlobalPrefix('api');

  // ✅ Enable versioning globally for all routes
  // app.enableVersioning({
  //   type: VersioningType.URI, // URL based versioning
  //   defaultVersion: '1',
  // });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const redisConn = new IORedis(
    process.env.REDIS_URL || 'redis://localhost:6379',
    {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: () => null,
    },
  );
  redisConn.on('error', () => {});

  redisConn
    .connect()
    .then(() => redisConn.ping())
    .then(() => {
      const emailQueue = new Queue('email-fallback-queue', {
        connection: redisConn as any,
      });
      createBullBoard({
        queues: [new BullMQAdapter(emailQueue)],
        serverAdapter,
      });
      app.use('/admin/queues', serverAdapter.getRouter());
    })
    .catch(() => {
      console.log('⚠️ BullBoard disabled: Redis is offline or credentials failed.');
    });

  const PORT = process.env.PORT ?? 4000;
  await app.listen(PORT);

  console.log(`✅ Application running on http://localhost:${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
}

process.on('unhandledRejection', (reason: any) => {
  console.error('⚠️ Unhandled Rejection (process preserved):', reason?.message || reason);
});

process.on('uncaughtException', (err: any) => {
  console.error('⚠️ Uncaught Exception (process preserved):', err?.message || err);
});

bootstrap();
