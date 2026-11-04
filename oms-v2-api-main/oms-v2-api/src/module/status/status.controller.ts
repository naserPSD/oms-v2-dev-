import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Helpers } from '@core/utils/helpers';
import { ResponseInterface } from '@interfaces/api-response.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { StatusService } from './status.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Status' })
  @ApiResponse({
    status: 201,
    description: 'Status created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all list of Statuss' })
  @ApiResponse({
    status: 200,
    description: 'Statuss retrieved successfully',
    type: [Status], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "name": "Standard", "is_active": "false" }',
    example: '{ "name": "Standard" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response & fields seperate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async findAll(@Query() query: any): Promise<ResponseInterface<Status>> {
    const queryResult = await this.statusService.findAll(query);

    return {
      status: 'success',
      message: 'Statuss retrieved successfully',
      data: queryResult.data,
      meta: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-app-services')
  @ApiOperation({ summary: 'Get App Services' })
  @ApiResponse({
    status: 200,
    description: 'App Services retrieved successfully',
    // type: [Status], // Indicate this will return an array of Contract objects
  })
  async getAppServices(@Query() query: any) {
    // const queryResult = await this.statusService.findAll(query);

    return {
      status: 'success',
      message: 'Statuss retrieved successfully',
      // data: queryResult.data,
      // meta: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Status by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Status ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
    type: Status,
  })
  @ApiResponse({
    status: 404,
    description: 'Status not found',
  })
  async findOne(@Param('id') id: string): Promise<ResponseInterface<Status>> {
    const queryResult = await this.statusService.findOne(+id);

    return {
      status: 'success',
      message: 'Status retrieved successfully',
      data: queryResult, // Return the resolved contract data
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Status' })
  async update(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<ResponseInterface<Status>> {
    const queryResult = await this.statusService.update(+id, updateStatusDto);
    return {
      status: 'success',
      message: 'Status updated successfully',
      data: queryResult,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Status' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Status ID',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Status deleted successfully',
    type: Status,
  })
  async remove(@Param('id') id: string): Promise<ResponseInterface<Status>> {
    const queryResult = await this.statusService.remove(+id);
    return {
      status: 'success',
      message: 'Status deleted successfully',
      data: queryResult,
    };
  }
}
