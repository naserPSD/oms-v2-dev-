import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { ResponseInterface } from '@interfaces/api-response.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Media') // Groups this controller under "Regions"
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // @Get(':id')
  // @ApiOperation({ summary: 'Get media by ID' })
  // @ApiParam({
  //   name: 'id',
  //   required: true,
  //   description: 'The ID of the media to retrieve',
  //   type: Number,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The media has been successfully retrieved.',
  //   type: Media,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Media not found',
  // })
  // async findOne(@Param('id') id: string): Promise<ResponseInterface<Media>> {
  //   // return this.mediaService.findOne(+id);
  //   const queryResult = await this.mediaService.findOne(+id);

  //   return {
  //     status: 'success',
  //     message: 'Region retrieved successfully',
  //     data: queryResult, // Return the resolved contract data
  //   };
  // }

  // @Post('upload')
  // @ApiOperation({ summary: 'Upload media' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: CreateMediaDto })
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiResponse({
  //   status: 201,
  //   description: 'The media has been successfully uploaded.',
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // async uploadMedia(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() args: Partial<Media>,
  // ): Promise<Media> {
  //   return this.mediaService.uploadMedia(file, args);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete media' })
  // @ApiParam({
  //   name: 'id',
  //   required: true,
  //   description: 'The ID of the media to delete.',
  //   type: Number,
  // })
  // @ApiResponse({
  //   status: 204,
  //   description: 'The media has been successfully deleted.',
  //   type: Media,
  // })
  // async deleteMedia(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
  //   return this.mediaService.deleteMedia(id);
  // }

  // @Delete('file/:file')
  // @ApiOperation({ summary: 'Delete media' })
  // @ApiParam({
  //   name: 'file',
  //   required: true,
  //   description: 'The file of the media to delete.',
  //   type: Number,
  // })
  // @ApiResponse({
  //   status: 204,
  //   description: 'The media has been successfully deleted.',
  //   type: Media,
  // })
  // async deleteMediaByFile(@Param('file') file: string): Promise<boolean> {
  //   return this.mediaService.deleteMedia(file);
  // }

  // @Post()
  // create(@Body() createMediaDto: CreateMediaDto) {
  //   return this.mediaService.create(createMediaDto);
  // }

  // @Get()
  // findAll() {
  //   return this.mediaService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
  //   return this.mediaService.update(+id, updateMediaDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.mediaService.remove(+id);
  // }
}
