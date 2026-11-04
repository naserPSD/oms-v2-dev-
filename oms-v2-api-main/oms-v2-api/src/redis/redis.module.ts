import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheService } from './cache.service';
import { RedisController } from './redis.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single', // force standalone mode
        url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        options: {
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) return null; // stop hammering on invalid credentials
            return 3000;
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RedisController],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppRedisModule {}
