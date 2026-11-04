import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@module/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { HybridQueueModule } from 'src/queue/hybrid-queue.module';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailBroadcast } from './entities/email-broadcast.entity';
import { EmailTemplateService } from './email-template.service';
import { EmailBroadcastService } from './email-broadcast.service';
import { EmailTemplateController } from './email-template.controller';
import { EmailBroadcastController } from './email-broadcast.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate, EmailBroadcast]),
    AuthModule,
    MailModule,
    HybridQueueModule,
  ],
  controllers: [EmailTemplateController, EmailBroadcastController],
  providers: [EmailTemplateService, EmailBroadcastService],
  exports: [EmailTemplateService, EmailBroadcastService],
})
export class EmailTemplateModule {}
