import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Permissions } from '@core/guards/permissions.decorator';
import { EmailBroadcastService } from './email-broadcast.service';
import { SaveEmailBroadcastDto } from './dto/email-broadcast.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Email Broadcasts')
@Controller('api/v1/email-broadcasts')
export class EmailBroadcastController {
  constructor(private readonly service: EmailBroadcastService) {}

  @Get('recipients')
  @Permissions('crm.email_broadcast')
  recipients() {
    return this.service.listRecipients();
  }

  @Get()
  @Permissions('crm.email_broadcast')
  list(@Query() query: Record<string, string>) {
    return this.service.list(query);
  }

  @Post()
  @Permissions('crm.email_broadcast')
  create(@Body() dto: SaveEmailBroadcastDto) {
    return this.service.save(dto);
  }

  @Patch(':id')
  @Permissions('crm.email_broadcast')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveEmailBroadcastDto,
  ) {
    return this.service.save(dto, id);
  }

  @Post(':id/send')
  @Permissions('crm.email_broadcast')
  send(@Param('id', ParseIntPipe) id: number) {
    return this.service.markSent(id);
  }

  @Delete(':id')
  @Permissions('crm.email_broadcast')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
