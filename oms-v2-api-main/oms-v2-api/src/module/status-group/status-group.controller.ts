import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Meta } from '@interfaces/meta.interface';
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
  ApiTags,
} from '@nestjs/swagger';
import { CreateStatusGroupDto } from './dto/create-status-group.dto';
import { UpdateStatusGroupDto } from './dto/update-status-group.dto';
import { StatusGroup } from './entities/status-group.entity';
import { StatusGroupService } from './status-group.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token') // Optional: If using JWT authentication
@ApiTags('Status Group') // Groups this controller under "Status Group"
@Controller('status-group')
export class StatusGroupController {
  constructor(private readonly statusGroupService: StatusGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Status group' })
  @ApiResponse({
    status: 201,
    description: 'Status group created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createStatusGroupDto: CreateStatusGroupDto) {
    return this.statusGroupService.create(createStatusGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all list of Status groups' })
  @ApiResponse({
    status: 200,
    description: 'Status groups retrieved successfully',
    type: [StatusGroup], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "name": "Approval Status", "is_active": "false" }',
    example: '{ "name": "Approval Status" }',
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
  async findAll(@Query() query: any): Promise<{
    data: StatusGroup[];
    meta: Meta;
    status: string;
    message: string;
  }> {
    const queryResult = await this.statusGroupService.findAll(query);

    return {
      status: 'success',
      message: 'Status groups retrieved successfully',
      meta: {
        page: query?.page ? parseInt(query?.page) : 1,
        resultRows: queryResult.data?.length,
        total: queryResult.total,
      },
      data: queryResult.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Status group by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Status group ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Status group retrieved successfully',
    type: StatusGroup,
  })
  @ApiResponse({
    status: 404,
    description: 'Status group not found',
  })
  async findOne(
    @Param('id') idOrCode: any,
  ): Promise<{ data: object; status: string; message: string }> {
    const queryResult = await this.statusGroupService.findOne(+idOrCode);

    return {
      status: 'success',
      message: 'Status group retrieved successfully',
      data: queryResult as object, // Return the resolved contract data
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Status group' })
  async update(
    @Param('id') id: string,
    @Body() updateStatusGroupDto: UpdateStatusGroupDto,
  ): Promise<{ data: object; status: string; message: string }> {
    const queryResult = await this.statusGroupService.update(
      +id,
      updateStatusGroupDto,
    );
    return {
      status: 'success',
      message: 'Status group updated successfully',
      data: queryResult,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Status group' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Status group ID',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Status group deleted successfully',
    type: StatusGroup,
  })
  async remove(
    @Param('id') id: string,
  ): Promise<{ data: any; status: string; message: string }> {
    const queryResult = await this.statusGroupService.remove(+id);
    return {
      status: 'success',
      message: 'Status group deleted successfully',
      data: queryResult,
    };
  }
}
