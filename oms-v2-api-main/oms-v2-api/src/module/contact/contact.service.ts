import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { ContactMessageDto } from './dto/contact-message.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly mailService: MailService) {}

  async sendContactMessage(dto: ContactMessageDto) {
    const recipient = 'info@domplio.com';
    const subject = `New Contact Form Message from ${dto.name}`;

    try {
      await this.mailService.sendMail(recipient, subject, 'contact-message', {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        company: dto.company || 'N/A',
        message: dto.message,
      });
      this.logger.log(`Contact form message sent to ${recipient}`);
      return {
        success: true,
        message: `Your message has been sent successfully to ${recipient}`,
      };
    } catch (error) {
      this.logger.error(
        `Error sending contact email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
