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
import { EmailTemplateService } from './email-template.service';
import { SaveEmailTemplateDto } from './dto/email-template.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Email Templates')
@Controller('api/v1/email-templates')
export class EmailTemplateController {
  constructor(private readonly service: EmailTemplateService) {}

  @Get('master')
  @Permissions('settings.master-email-templates')
  listMaster(@Query() query: Record<string, string>) {
    return this.service.listMaster(query);
  }

  @Post('master')
  @Permissions('settings.master-email-templates')
  createMaster(@Body() dto: SaveEmailTemplateDto) {
    return this.service.saveMaster(dto);
  }

  @Patch('master/:id')
  @Permissions('settings.master-email-templates')
  updateMaster(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveEmailTemplateDto,
  ) {
    return this.service.saveMaster(dto, id);
  }

  @Delete('master/:id')
  @Permissions('settings.master-email-templates')
  deleteMaster(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMaster(id);
  }

  @Get('importable')
  @Permissions('crm.email_templates')
  async listImportable() {
    const data = await this.service.listImportable();
    return { message: 'Importable templates retrieved successfully', data };
  }

  @Post('import/:id')
  @Permissions('crm.email_templates')
  importMaster(@Param('id', ParseIntPipe) id: number) {
    return this.service.importMaster(id);
  }

  @Get('company')
  @Permissions('crm.email_templates')
  listCompany(@Query() query: Record<string, string>) {
    return this.service.listCompany(query);
  }

  @Post('company')
  @Permissions('crm.email_templates')
  createCompany(@Body() dto: SaveEmailTemplateDto) {
    return this.service.saveCompany(dto);
  }

  @Patch('company/:id')
  @Permissions('crm.email_templates')
  updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveEmailTemplateDto,
  ) {
    return this.service.saveCompany(dto, id);
  }

  @Delete('company/:id')
  @Permissions('crm.email_templates')
  deleteCompany(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCompany(id);
  }
}
