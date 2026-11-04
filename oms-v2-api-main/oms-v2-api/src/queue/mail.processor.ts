// src/queue/mail.processor.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { EmailBroadcast } from 'src/module/email-template/entities/email-broadcast.entity';
import { HybridQueueService } from './hybrid-queue.service';

@Injectable()
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  private worker: Worker | null = null;

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(EmailBroadcast)
    private readonly broadcastRepo: Repository<EmailBroadcast>,
    private readonly hybridQueue: HybridQueueService,
  ) {
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
          'email-fallback-queue',
          async (job) => {
            this.logger.log(`📨 Processing BullMQ job: ${job.id}`);
            const payload = job.data;

            try {
              if (payload?.kind === 'broadcast') {
                await this.deliverBroadcast(payload);
              } else {
                await this.mailService.sendMail(
                  payload.to,
                  payload.subject,
                  payload.template,
                  payload.context,
                );
              }
              this.logger.log(`✅ Email sent via BullMQ to: ${payload.to}`);
            } catch (err) {
              const attempts = job.opts.attempts || 1;
              const isLastAttempt = job.attemptsMade + 1 >= attempts;
              if (payload?.kind === 'broadcast' && isLastAttempt) {
                await this.recordBroadcastResult(payload, 'bounced');
              }
              this.logger.error(
                `❌ Failed to send email via BullMQ: ${err.message}`,
              );
              throw err;
            }
          },
          { connection } as any,
        );

        this.worker.on('error', (err) => {
          this.logger.warn(`⚠️ MailProcessor Worker error: ${err.message}`);
        });
        this.worker.on('failed', (job, err) => {
          this.logger.warn(`⚠️ MailProcessor Job ${job?.id} failed: ${err.message}`);
        });
      })
      .catch(() => {
        this.logger.warn('⚠️ Redis offline or invalid auth. MailProcessor queue worker is safely idle.');
      });
  }

  async deliverBroadcast(payload: {
    broadcastId: number;
    to: string;
    subject: string;
    html: string;
    userId?: number;
    name?: string;
    runAt?: string;
    queueToken?: string;
  }) {
    const row = await this.broadcastRepo.findOne({
      where: { id: payload.broadcastId },
    });
    if (!row || row.status !== 'scheduled') return;
    if (payload.queueToken && row.queueToken !== payload.queueToken) return;

    const runAt = payload.runAt ? new Date(payload.runAt).getTime() : Date.now();
    if (!Number.isNaN(runAt) && runAt - Date.now() > 5000) {
      await this.hybridQueue.enqueueBroadcastOnBull(payload);
      return;
    }

    await this.mailService.sendHtml(payload.to, payload.subject, payload.html);
    await this.recordBroadcastResult(payload, 'delivered');
  }

  async markBroadcastBounced(payload: {
    broadcastId: number;
    to: string;
    userId?: number;
    name?: string;
  }) {
    await this.recordBroadcastResult(payload, 'bounced');
  }

  private async recordBroadcastResult(
    payload: { broadcastId: number; to: string; userId?: number; name?: string },
    status: 'delivered' | 'bounced',
  ) {
    await this.broadcastRepo.manager.transaction(async (manager) => {
      const row = await manager.findOne(EmailBroadcast, {
        where: { id: payload.broadcastId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!row) return;

      const details = Array.isArray(row.recipientDetails)
        ? [...row.recipientDetails]
        : [];
      const index = details.findIndex((person) => person.email === payload.to);
      const next: Record<string, string | number> = {
        name: payload.name || payload.to,
        email: payload.to,
        status,
      };
      if (payload.userId != null) next.userId = payload.userId;
      if (index >= 0) details[index] = { ...details[index], ...next };
      else details.push(next);

      const received = details.filter((person) => person.status === 'delivered').length;
      const bounced = details.filter((person) => person.status === 'bounced').length;
      row.recipientDetails = details;
      row.received = received;
      row.bounced = bounced;
      row.recipients = Math.max(row.recipients || 0, details.length);

      if (received + bounced >= row.recipients) {
        row.status = received === 0 ? 'failed' : 'sent';
        row.sentAt = new Date();
        row.isScheduled = false;
      }
      await manager.save(row);
    });
  }
}
