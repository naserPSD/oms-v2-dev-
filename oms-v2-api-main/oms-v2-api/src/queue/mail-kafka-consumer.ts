// src/queue/mail-kafka-consumer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { MailService } from 'src/mail/mail.service';
import { MailProcessor } from './mail.processor';

@Injectable()
export class MailKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(MailKafkaConsumer.name);

  constructor(
    private readonly mailService: MailService,
    private readonly mailProcessor: MailProcessor,
  ) {}

  async onModuleInit() {
    const kafkaBrokers = process.env.KAFKA_BROKER
      ? process.env.KAFKA_BROKER.split(',').map((b) => b.trim())
      : [];

    if (kafkaBrokers.length === 0) {
      this.logger.warn('⚠️ Kafka not configured. Skipping consumer.');
      return;
    }

    try {
      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'oms-service',
        brokers: kafkaBrokers,
        retry: { retries: 1, initialRetryTime: 300, maxRetryTime: 1000 },
        connectionTimeout: 3000,
      });
      const consumer = kafka.consumer({
        groupId: 'email-group',
        retry: { retries: 0 },
      });

      await consumer.connect();
      await consumer.subscribe({
        topic: process.env.KAFKA_EMAIL_TOPIC || 'email-topic',
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async ({ message }) => {
          let payload: any = null;
          try {
            payload = message.value
              ? JSON.parse(message.value.toString())
              : null;
            if (payload?.kind === 'broadcast') {
              this.logger.log(
                `📧 Broadcast email from Kafka for ${payload?.to}`,
              );
              await this.mailProcessor.deliverBroadcast(payload);
              return;
            }
            this.logger.log(
              `📧 Sending email via MailService: ${payload?.subject}`,
            );
            await this.mailService.sendMail(
              payload?.to,
              payload?.subject,
              payload?.template,
              payload?.context,
            );
          } catch (err) {
            this.logger.error(`Email sending failed: ${err.message}`);
            if (payload?.kind !== 'broadcast') return;
            const runAt = payload.runAt ? new Date(payload.runAt).getTime() : 0;
            const stillWaiting = !Number.isNaN(runAt) && runAt - Date.now() > 5000;
            if (stillWaiting) {
              this.logger.error(
                `Broadcast ${payload.broadcastId} is still waiting and was not held for its send time`,
              );
              return;
            }
            await this.mailProcessor
              .markBroadcastBounced(payload)
              .catch(() => undefined);
          }
        },
      });

      this.logger.log('✅ Kafka consumer initialized');
    } catch (err: any) {
      this.logger.error(
        `❌ Kafka consumer failed to connect → fallback only (BullMQ will handle jobs): ${err.message}`,
      );
    }
  }
}
