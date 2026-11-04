import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { TemplateRendererService } from './template-renderer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DbConfig } from '@module/db-configs/entities/db-config.entity';
import { Repository } from 'typeorm';

interface DbConfigs {
  oms_name: string;
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly templateRenderer: TemplateRendererService,

    @InjectRepository(DbConfig)
    private readonly dbConfigRepo: Repository<DbConfig>,
  ) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    const dbConfigsArray = await this.dbConfigRepo.find({});

    if (!dbConfigsArray) {
      throw new BadRequestException('Database configuration not found');
    }

    const dbConfigs = {};

    if (dbConfigsArray && dbConfigsArray.length > 0) {
      dbConfigsArray.forEach((config) => {
        dbConfigs[config.key] = config.value;
      });
    }
    // console.log('dbConfigs', dbConfigs);

    const defaultContext = {
      title: subject,
      headerTitle: subject,
      appName: dbConfigs['app_name'] || '',
      currentYear: new Date().getFullYear(),
      companyName: dbConfigs['oms_name'] || '',
      companyAddress: dbConfigs['oms_address'] || '',
      companyPhone: dbConfigs['oms_name'] || '',
      companyEmail: dbConfigs['oms_support_email'] || '',
      supportEmail: dbConfigs['oms_support_email'] || '',
      emailClosingNote: dbConfigs['oms_email_closing_note'] || '',
      supportTeamName: dbConfigs['oms_email_support_team_name'] || '',
      companyLogoUrl: '',
      contactUrl: 'https://example.com/contact',
      privacyUrl: 'https://example.com/privacy',
      unsubscribeUrl: 'https://example.com/unsubscribe',
    };

    try {
      const html = await this.templateRenderer.renderTemplate(
        template, // views/emails/reset-password.hbs
        { ...defaultContext, ...context }, // merge, context overrides defaults
      );

      await this.mailerService.sendMail({
        to,
        subject,
        html: html, // Use the rendered HTML directly
      });

      console.log('Email sent successfully', { to, subject });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendHtml(to: string, subject: string, html: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      html: html || '<p></p>',
    });
  }

  async sendTestEmail(to: string) {
    try {
      await this.mailerService.sendMail({
        to, // only argument
        subject: 'Test Birthday Email ✔',
        template: 'birthday', // your template name
        context: {
          name: 'Test User',
          companyName: 'My Company',
          emailClosingNote: 'Warm regards,',
          supportTeamName: 'HR Team',
        },
      });
    } catch (err) {
      console.error('Failed to send test email ❌', err);
    }
  }

  // // Temporary test function
  // async testSend() {
  //   await this.sendTestEmail('ahmedashik034@gmail.com');
  // }
}
