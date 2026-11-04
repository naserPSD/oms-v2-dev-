import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@common/constants/file-constants';
import { Public } from '@common/decorators/public.decorator';
import { Helpers } from '@core/utils/helpers';
import { BlogService } from './blog.service';
import { CreateOrUpdateBlogDto } from './dto/blog.dto';

@ApiTags('Blogs')
@Controller('api/v1/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get('get-all')
  @ApiOperation({ summary: 'Get published blogs (public)' })
  @ApiQuery({ name: 'params', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllPublished(@Query() query: any) {
    const queryWithDefaultSort = {
      ...query,
      sort: query?.sort && query.sort !== 'undefined' ? query.sort : 'publishedAt:desc',
    };
    const queryResult =
      await this.blogService.findAllPublished(queryWithDefaultSort);

    return {
      message: 'Blogs retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(queryWithDefaultSort, queryResult),
    };
  }

  @Public()
  @Get('get-by-slug/:slug')
  @ApiOperation({ summary: 'Get published blog by slug (public)' })
  async getBySlug(@Param('slug') slug: string) {
    const blog = await this.blogService.findBySlug(slug);
    return {
      status: 'success',
      message: 'Blog retrieved successfully',
      data: blog,
    };
  }

  @Get('admin/get-all')
  @ApiOperation({ summary: 'Get all blogs including drafts (admin)' })
  @ApiQuery({ name: 'params', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllAdmin(@Query() query: any) {
    const queryResult = await this.blogService.findAllAdmin(query);
    return {
      message: 'Blogs retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('admin/get-by-id/:id')
  @ApiOperation({ summary: 'Get blog by ID (admin)' })
  async getById(@Param('id') id: string) {
    const blog = await this.blogService.findById(+id);
    return {
      status: 'success',
      message: 'Blog retrieved successfully',
      data: blog,
    };
  }

  @Post('admin/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload blog image (cover, OG, or body)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    Helpers.validateFile(image, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);

    const url = await this.blogService.uploadImage(image);
    return {
      status: 'success',
      message: 'Image uploaded successfully',
      data: { url },
    };
  }

  @Post('admin/add-or-update')
  @ApiOperation({ summary: 'Create or update blog (admin)' })
  async createOrUpdate(@Body() dto: CreateOrUpdateBlogDto) {
    const blog = await this.blogService.createOrUpdate(dto);
    return {
      status: 'success',
      message: dto.id ? 'Blog updated successfully' : 'Blog created successfully',
      data: blog,
    };
  }

  @Delete('admin/delete/:id')
  @ApiOperation({ summary: 'Delete blog (admin)' })
  async delete(@Param('id') id: string) {
    await this.blogService.delete(+id);
    return {
      status: 'success',
      message: 'Blog deleted successfully',
    };
  }
}
