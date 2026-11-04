import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { AuditSubscriber } from '@common/subscribers/audit.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        // host: configService.get('MYSQL_HOST'),
        host: configService.mysqlHost,
        port: configService.mysqlPort,
        username: configService.mysqlUsername,
        password: configService.mysqlPassword,
        database: configService.mysqlDatabase,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        // Never auto-alter shared remote MySQL — entity-level synchronize flags are ignored when this is false.
        synchronize: false,
        subscribers: [],
        ssl: false,
        // ssl: {
        //   rejectUnauthorized: true,
        // },
        extra: {
          connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 20),
          maxIdle: Number(process.env.MYSQL_POOL_SIZE || 20),
          idleTimeout: Number(process.env.MYSQL_IDLE_TIMEOUT_MS || 60000),
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000, // Adjust the initial delay
          connectTimeout: Number(process.env.MYSQL_CONNECT_TIMEOUT_MS || 5000),
        },
        logging: [
          // 'query',
          'error',
          // 'schema',
          'warn',
          // 'info',
          'log',
          // 'migration',
        ],
      }),
    }),
  ],
})
export class MysqlModule {}
