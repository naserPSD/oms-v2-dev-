import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { ContactService } from './contact.service';
import { ContactMessageDto } from './dto/contact-message.dto';

@Controller('api/v1/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post('send-message')
  async sendContactMessage(@Body() dto: ContactMessageDto) {
    return this.contactService.sendContactMessage(dto);
  }
}
