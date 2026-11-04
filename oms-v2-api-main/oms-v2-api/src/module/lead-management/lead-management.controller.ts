import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LeadManagementService } from './lead-management.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';

@ApiTags('Lead Management')
@Controller('api/v1/crm')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
export class LeadManagementController {
  constructor(private readonly leadManagementService: LeadManagementService) {}

  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiStandardResponses('Lead created successfully')
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadManagementService.create(createLeadDto);
    return {
      message: 'Lead created successfully',
      data: lead,
    };
  }

  @Get('get-all-leads')
  @ApiOperation({ summary: 'Get all leads with pagination and filters' })
  @ApiStandardResponses('Leads retrieved successfully')
  async findAll(@Query() queryDto: LeadQueryDto): Promise<any> {
    const result = await this.leadManagementService.findAll(queryDto);
    return {
      message: 'Leads retrieved successfully',
      data: result,
      pagination: result.pagination,
    };
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get a single lead by ID' })
  @ApiStandardResponses('Lead retrieved successfully')
  async findOne(@Param('id') id: string) {
    const lead = await this.leadManagementService.findOne(id);
    return {
      message: 'Lead retrieved successfully',
      data: lead,
    };
  }

  @Get('leads/:id/activities')
  @ApiOperation({ summary: 'Get lead activities' })
  @ApiStandardResponses('Lead activities retrieved successfully')
  async getActivities(@Param('id') id: string) {
    const activities = await this.leadManagementService.getLeadActivities(id);
    return {
      message: 'Lead activities retrieved successfully',
      data: activities,
    };
  }

  @Get('leads/:id/communications')
  @ApiOperation({ summary: 'Get all communications for a lead' })
  @ApiStandardResponses('Communications retrieved successfully')
  async getCommunications(@Param('id') id: string) {
    const communications =
      await this.leadManagementService.getCommunications(id);
    return {
      message: 'Communications retrieved successfully',
      data: communications,
    };
  }

  @Post('leads/:id/communications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a communication (Call, Appointment, Task)' })
  @ApiStandardResponses('Communication created successfully')
  async createCommunication(
    @Param('id') leadId: string,
    @Body() createDto: CreateCommunicationDto,
  ) {
    try {
      const communication =
        await this.leadManagementService.createCommunication(leadId, createDto);
      return {
        message: 'Communication created successfully',
        data: communication,
      };
    } catch (error) {
      console.error('Controller: Error creating communication:', error);
      throw error;
    }
  }

  @Patch('communications/:id')
  @ApiOperation({ summary: 'Update a communication' })
  @ApiStandardResponses('Communication updated successfully')
  async updateCommunication(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommunicationDto,
  ) {
    const communication = await this.leadManagementService.updateCommunication(
      id,
      updateDto,
    );
    return {
      message: 'Communication updated successfully',
      data: communication,
    };
  }

  @Delete('communications/:id')
  @ApiOperation({ summary: 'Delete a communication' })
  @ApiStandardResponses('Communication deleted successfully')
  async deleteCommunication(@Param('id') id: string) {
    await this.leadManagementService.deleteCommunication(id);
    return {
      message: 'Communication deleted successfully',
    };
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiStandardResponses('Lead updated successfully')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    const lead = await this.leadManagementService.update(id, updateLeadDto);
    return {
      message: 'Lead updated successfully',
      data: lead,
    };
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiStandardResponses('Lead deleted successfully')
  async remove(@Param('id') id: string) {
    await this.leadManagementService.remove(id);
    return {
      message: 'Lead deleted successfully',
    };
  }

  @Post('leads/bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete leads' })
  @ApiStandardResponses('Leads deleted successfully')
  async bulkDelete(@Body() body: { leadIds: string[] }) {
    await this.leadManagementService.bulkDelete(body.leadIds);
    return {
      message: 'Leads deleted successfully',
    };
  }

  @Post('leads/bulk-update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update lead status' })
  @ApiStandardResponses('Lead status updated successfully')
  async bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto) {
    await this.leadManagementService.bulkUpdateStatus(bulkUpdateDto);
    return {
      message: 'Lead status updated successfully',
    };
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get CRM dashboard statistics' })
  @ApiStandardResponses('CRM dashboard stats fetched successfully')
  async getDashboardStats() {
    const stats = await this.leadManagementService.getDashboardStats();
    return {
      status: 200,
      message: 'CRM dashboard stats fetched successfully',
      data: stats,
    };
  }

}
