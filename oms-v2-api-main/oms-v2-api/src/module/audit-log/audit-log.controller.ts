import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import * as request from 'supertest';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserSessionDto } from './dto/user-sessions.dto';
import { Helpers } from '@core/utils/helpers';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@Controller('api/v1/audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post('/log')
  async createLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Req() request,
  ) {
    const oldData = {};
    const newData = {};
    // Extract IP
    const ip =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    // Get user ID (assuming JWT or session)
    const userId = request.user?.id;
    // return this.auditLogService.create(createAuditLogDto);
    return await this.auditLogService.log(
      userId,
      'UPDATE_PROFILE',
      { before: oldData, after: newData },
      ip,
      'User',
    );
  }

  @Get('/get-recent-audit-logs')
  @ApiOperation({ summary: 'Get recent audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Recent audit logs retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "User name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response, separated by comma',
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
  async getRecentAuditLogs(@Query() query: any) {
    const queryResult = await this.auditLogService.getRecentLogs(query);

    return {
      status: 'success',
      message: 'Recent audit logs retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-recent-audit-logs-by-employee/:employeeId')
  @ApiOperation({ summary: 'Get recent audit logs by employeeId' })
  @ApiResponse({
    status: 200,
    description: 'Recent audit logs retrieved successfully',
  })
  @ApiParam({
    name: 'employeeId',
    required: true,
    description: 'Employee ID',
    example: 1,
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "User name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response, separated by comma',
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
  async getRecentAuditLogsByEmployeeId(
    @Param('employeeId') employeeId: number,
    @Query() query: any,
  ) {
    const queryResult = await this.auditLogService.getRecentLogsByEmployeeId(
      Number(employeeId),
      query,
    );

    return {
      status: 'success',
      message: 'Recent audit logs retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }
}
