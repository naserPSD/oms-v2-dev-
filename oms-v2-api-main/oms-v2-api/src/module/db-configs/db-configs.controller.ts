import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DbConfigsService } from './db-configs.service';
import { CreateDbConfigDto } from './dto/create-db-config.dto';
import { UpdateDbConfigDto } from './dto/update-db-config.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';

@Controller('db-configs')
export class DbConfigsController {
  constructor(private readonly dbConfigsService: DbConfigsService) {}

  @Post()
  create(@Body() createDbConfigDto: CreateDbConfigDto) {
    return this.dbConfigsService.create(createDbConfigDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all list of db configs' })
  @ApiStandardResponses(
    'DB Config retrieved successfully',
    200,
    UpdateDbConfigDto,
    true, // <--- isArray
  )
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "key": "oms_name" }',
    example: '{ "key": "oms_name" }',
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
  async findAll(@Query() query: any) {
    return this.dbConfigsService.findAll(query);
  }

  @Get(':idOrKey')
  @ApiOperation({ summary: 'Get a DB Config by ID' })
  @ApiParam({
    name: 'idOrKey',
    required: true,
    description: 'DB Config ID or Key',
    example: '1 or "oms_name"',
  })
  // @ApiStandardResponses('DbConfigsController.findAll')
  @ApiStandardResponses(
    'DB Config retrieved successfully',
    200,
    UpdateDbConfigDto,
  )
  // @ApiResponse({
  //   status: 200,
  //   description: 'DB Config retrieved successfully',
  //   type: CreateDbConfigDto, // Assuming CreateDbConfigDto is the response type
  // })
  findOne(@Param('idOrKey') idOrKey: string) {
    return this.dbConfigsService.findOne(idOrKey);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDbConfigDto: UpdateDbConfigDto,
  ) {
    return this.dbConfigsService.update(+id, updateDbConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dbConfigsService.remove(+id);
  }
}
