import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendTestEmail() {
    return this.mailerService.sendMail({
      to: 'ruhul@revinr.com',
      subject: 'Test Email',
      template: 'commission', // views/emails/commission.hbs
      context: {
        name: 'John Doe',
        commissionId: 123,
      },
    });
  }

  async sendCommissionMerged(
    to: string,
    name: string,
    commissionId: number,
    pdfBuffer?: Buffer,
  ) {
    const attachments = pdfBuffer
      ? [
          {
            filename: `commission-${commissionId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : [];

    return this.mailerService.sendMail({
      to,
      subject: `Commission #${commissionId} Merged Successfully`,
      template: 'commission', // views/emails/commission.hbs
      context: {
        name,
        commissionId,
      },
      attachments,
    });
  }

  async sendEmailForAmendmentSent(
    to: string,
    name: string,
    subject: string,
    fileUrl?: string,
  ) {
    return this.mailerService.sendMail({
      to,
      subject,
      // template: './amendment-email',
      template: 'amended-contract', // views/emails/amended-contract.hbs
      // template: './emails/amended-contract', // views/emails/amended-contract.hbs
      context: {
        name,
        fileUrl,
        currentYear: new Date().getFullYear(),
        title: 'Amendment Sent', // Layout variables
        logoUrl: 'https://via.placeholder.com/150x50?text=Company+Logo',
        headerTitle: 'Amended Contract',
        companyName: 'Company Name',
        companyAddress: '123 Business Ave, Suite 100 • City, State 12345',
        supportEmail: 'support@example.com',
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    return this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
