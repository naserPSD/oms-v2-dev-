// src/queue/hybrid-queue.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { HybridQueueService } from './hybrid-queue.service';
import { MailProcessor } from './mail.processor';
import { MailKafkaConsumer } from './mail-kafka-consumer';
import { AttendanceProcessor } from './attendance.processor';
import { AttendanceKafkaConsumer } from './attendance-kafka-consumer';
import { MailModule } from 'src/mail/mail.module'; // ⬅️ to inject MailService
import { HrManagementModule } from 'src/module/hr-management/hr-management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailBroadcast } from 'src/module/email-template/entities/email-broadcast.entity';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([EmailBroadcast]),
    forwardRef(() => HrManagementModule),
  ],
  providers: [
    HybridQueueService,
    MailProcessor,
    MailKafkaConsumer,
    AttendanceProcessor,
    AttendanceKafkaConsumer,
  ],
  exports: [HybridQueueService],
})
export class HybridQueueModule {}
