import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { HrManagementService } from 'src/module/hr-management/hr-management.service';

@Injectable()
export class AttendanceProcessor {
  private readonly logger = new Logger(AttendanceProcessor.name);
  private worker: Worker | null = null;

  constructor(private readonly hrService: HrManagementService) {
    const connection = new IORedis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: () => null,
      },
    );

    connection.on('error', () => {});

    connection
      .connect()
      .then(() => connection.ping())
      .then(() => {
        this.worker = new Worker(
          'attendance-queue',
          async (job) => {
            this.logger.log(
              `📝 Processing BullMQ attendance job: ${job.id} for appId=${job.data.appId}`,
            );
            const payload = job.data;

            try {
              await this.hrService.setEmployeeAttendanceStatusAbsent(payload.appId);
              this.logger.log(
                `✅ Attendance processed via BullMQ for appId: ${payload.appId}`,
              );
            } catch (err) {
              this.logger.error(
                `❌ Failed to process attendance via BullMQ: ${err.message}`,
              );
              throw err;
            }
          },
          { connection } as any,
        );

        this.worker.on('error', (err) => {
          this.logger.warn(`⚠️ AttendanceProcessor Worker error: ${err.message}`);
        });
        this.worker.on('failed', (job, err) => {
          this.logger.warn(`⚠️ AttendanceProcessor Job ${job?.id} failed: ${err.message}`);
        });
      })
      .catch(() => {
        this.logger.warn('⚠️ Redis offline or invalid auth. AttendanceProcessor queue worker is safely idle.');
      });
  }
}
