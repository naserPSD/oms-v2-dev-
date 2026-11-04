import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { HrManagementService } from 'src/module/hr-management/hr-management.service';

@Injectable()
export class AttendanceKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(AttendanceKafkaConsumer.name);

  constructor(private readonly hrService: HrManagementService) {}

  async onModuleInit() {
    const kafkaBrokers = process.env.KAFKA_BROKER
      ? process.env.KAFKA_BROKER.split(',').map((b) => b.trim())
      : [];

    if (kafkaBrokers.length === 0) {
      this.logger.warn(
        '⚠️ Kafka not configured. Skipping attendance consumer.',
      );
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
        groupId: 'attendance-group',
        retry: { retries: 0 },
      });

      await consumer.connect();
      await consumer.subscribe({
        topic: process.env.KAFKA_ATTENDANCE_TOPIC || 'attendance-topic',
        fromBeginning: false,
      });

      await consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const payload = message.value
              ? JSON.parse(message.value.toString())
              : null;
            this.logger.log(
              `📧 Processing attendance via Kafka for appId: ${payload?.appId}`,
            );
            await this.hrService.setEmployeeAttendanceStatusAbsent(
              payload?.appId,
            );
          } catch (err) {
            this.logger.error(`Attendance processing failed: ${err.message}`);
          }
        },
      });

      this.logger.log('✅ Attendance Kafka consumer initialized');
    } catch (err: any) {
      this.logger.error(
        `❌ Attendance Kafka consumer failed to connect → fallback only (BullMQ will handle jobs): ${err.message}`,
      );
    }
  }
}
