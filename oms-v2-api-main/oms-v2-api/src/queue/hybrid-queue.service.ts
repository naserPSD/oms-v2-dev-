// src/queue/hybrid-queue.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class HybridQueueService implements OnModuleInit {
  private readonly logger = new Logger(HybridQueueService.name);
  private kafkaProducer: Producer | null = null;
  private bullEmailQueue: Queue;
  private bullAttendanceQueue: Queue;
  private kafkaHealthy = false;

  constructor() {
    // BullMQ (always available fallback)
    const connection = new IORedis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        maxRetriesPerRequest: null, // ⬅️ required for BullMQ
        lazyConnect: true,
        retryStrategy: () => null,
      },
    );
    connection.on('error', () => {});
    this.bullEmailQueue = new Queue('email-fallback-queue', { connection: connection as any });
    this.bullAttendanceQueue = new Queue('attendance-queue', { connection: connection as any });

    // Kafka only when explicitly configured (do NOT default to localhost)
    const kafkaBrokers = (process.env.KAFKA_BROKER || '')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    if (kafkaBrokers.length > 0) {
      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'oms-service',
        brokers: kafkaBrokers,
        retry: {
          retries: 1,
          initialRetryTime: 300,
          maxRetryTime: 1000,
        },
        connectionTimeout: 3000,
        requestTimeout: 5000,
      });
      this.kafkaProducer = kafka.producer({
        allowAutoTopicCreation: false,
        retry: { retries: 0 },
      });
    } else {
      this.logger.warn(
        '⚠️ Kafka disabled (KAFKA_BROKER not set). Using BullMQ only.',
      );
    }
  }

  async onModuleInit() {
    if (this.kafkaProducer) {
      await this.tryConnectKafka();
    }
    this.logger.log('HybridQueueService initialized');
  }

  async publishEmailJob(payload: any): Promise<void> {
    if (this.kafkaHealthy && this.kafkaProducer) {
      try {
        await this.kafkaProducer.send({
          topic: process.env.KAFKA_EMAIL_TOPIC || 'email-topic',
          messages: [{ value: JSON.stringify(payload) }],
        });
        this.logger.log(`✅ Sent email job to Kafka: ${payload.template}`);
        return;
      } catch (err: any) {
        this.kafkaHealthy = false;
        this.logger.error(
          `❌ Kafka send failed → fallback to BullMQ: ${err.message}`,
        );
      }
    }

    await this.bullEmailQueue.add('email-job', payload, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.log(`📩 Email job queued in BullMQ: ${payload.template}`);
  }

  async publishBroadcastEmailJob(payload: any, runAt?: Date): Promise<void> {
    const message = {
      ...payload,
      runAt: (runAt || new Date()).toISOString(),
    };

    if (this.kafkaHealthy && this.kafkaProducer) {
      try {
        await this.kafkaProducer.send({
          topic: process.env.KAFKA_EMAIL_TOPIC || 'email-topic',
          messages: [{ value: JSON.stringify(message) }],
        });
        this.logger.log(`✅ Sent broadcast email job to Kafka: ${message.to}`);
        return;
      } catch (err: any) {
        this.kafkaHealthy = false;
        this.logger.error(
          `❌ Kafka send failed → fallback to BullMQ: ${err.message}`,
        );
      }
    }

    await this.enqueueBroadcastOnBull(message);
  }

  async enqueueBroadcastOnBull(payload: any): Promise<void> {
    const runAt = payload?.runAt ? new Date(payload.runAt) : null;
    const delay =
      runAt && !Number.isNaN(runAt.getTime())
        ? Math.max(0, runAt.getTime() - Date.now())
        : 0;
    await this.bullEmailQueue.add('email-job', payload, {
      delay,
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
    this.logger.log(
      `📩 Broadcast email queued in BullMQ for ${payload.to} in ${delay}ms`,
    );
  }

  async cancelBroadcastJobs(broadcastId: number): Promise<void> {
    const jobs = await this.bullEmailQueue.getJobs([
      'delayed',
      'waiting',
      'paused',
    ]);
    await Promise.all(
      jobs
        .filter((job) => job?.data?.broadcastId === broadcastId)
        .map((job) => job.remove()),
    );
  }

  async publishAttendanceJob(payload: any): Promise<void> {
    if (this.kafkaHealthy && this.kafkaProducer) {
      try {
        await this.kafkaProducer.send({
          topic: process.env.KAFKA_ATTENDANCE_TOPIC || 'attendance-topic',
          messages: [{ value: JSON.stringify(payload) }],
        });
        this.logger.log(
          `✅ Sent attendance job to Kafka: appId=${payload.appId}`,
        );
        return;
      } catch (err: any) {
        this.kafkaHealthy = false;
        this.logger.error(
          `❌ Kafka send failed → fallback to BullMQ: ${err.message}`,
        );
      }
    }

    await this.bullAttendanceQueue.add('attendance-job', payload, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.log(
      `📝 Attendance job queued in BullMQ: appId=${payload.appId}`,
    );
  }

  private async tryConnectKafka() {
    if (!this.kafkaProducer) return;
    try {
      await this.kafkaProducer.connect();
      this.kafkaHealthy = true;
      this.logger.log('✅ Kafka connected');
    } catch {
      this.kafkaHealthy = false;
      try {
        await this.kafkaProducer.disconnect();
      } catch {
        /* ignore */
      }
      this.kafkaProducer = null;
      this.logger.error('❌ Kafka connection failed, using BullMQ only');
    }
  }
}
