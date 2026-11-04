import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { Helpers } from '@core/utils/helpers';
import { CreateOrUpdateWebsiteContentDto } from './dto/website-content.dto';
import { WebsiteContentService } from './website-content.service';

@ApiTags('Website Contents')
@Controller('api/v1/website-contents')
export class WebsiteContentController {
  constructor(private readonly websiteContentService: WebsiteContentService) {}

  @Public()
  @Get('by-section/:sectionKey')
  @ApiOperation({ summary: 'Get active website section + items (public)' })
  async getBySection(@Param('sectionKey') sectionKey: string) {
    const data = await this.websiteContentService.findBySection(sectionKey);
    return {
      status: 'success',
      message: 'Website section retrieved successfully',
      data,
    };
  }

  @Get('admin/get-all')
  @ApiOperation({ summary: 'List website contents (admin)' })
  @ApiQuery({ name: 'params', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllAdmin(@Query() query: any) {
    const queryResult = await this.websiteContentService.findAllAdmin(query);
    return {
      message: 'Website contents retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('admin/get-by-id/:id')
  @ApiOperation({ summary: 'Get website content by ID (admin)' })
  async getById(@Param('id') id: string) {
    const data = await this.websiteContentService.findById(+id);
    return {
      status: 'success',
      message: 'Website content retrieved successfully',
      data,
    };
  }

  @Post('admin/add-or-update')
  @ApiOperation({ summary: 'Create or update website content (admin)' })
  async createOrUpdate(@Body() dto: CreateOrUpdateWebsiteContentDto) {
    const data = await this.websiteContentService.createOrUpdate(dto);
    return {
      status: 'success',
      message: dto.id
        ? 'Website content updated successfully'
        : 'Website content created successfully',
      data,
    };
  }

  @Delete('admin/delete/:id')
  @ApiOperation({ summary: 'Delete website content (admin)' })
  async delete(@Param('id') id: string) {
    await this.websiteContentService.delete(+id);
    return {
      status: 'success',
      message: 'Website content deleted successfully',
    };
  }
}
