import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { Helpers } from '@core/utils/helpers';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateTrainingRequestDto,
  UpdateTrainingRequestStatusDto,
} from './dto/training-request.dto';
import { TrainingService } from './training.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Training')
@Controller('api/v1/hr-management')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('/add-or-update-training-request')
  @ApiOperation({ summary: 'Create or update a training request' })
  async createOrUpdateTrainingRequest(@Body() dto: CreateTrainingRequestDto) {
    const data = await this.trainingService.createOrUpdateTrainingRequest(dto);
    return {
      status: 'success',
      message: 'Training request saved successfully',
      data,
    };
  }

  @Get('/get-all-training-requests')
  @ApiOperation({ summary: 'Get training requests' })
  async getAllTrainingRequests(@Query() query: any) {
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-all-total-training-requests')
  @ApiOperation({ summary: 'Get all total training requests' })
  async getAllTotalTrainingRequests(@Query() query: any) {
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Total training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-all-pending-training-requests')
  @ApiOperation({ summary: 'Get all pending training requests' })
  async getAllPendingTrainingRequests(@Query() query: any) {
    const params = query.params ? JSON.parse(query.params) : {};
    params.statusCode = 'requisition_status_pending';
    query.params = JSON.stringify(params);
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Pending training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-all-approved-training-requests')
  @ApiOperation({ summary: 'Get all approved training requests' })
  async getAllApprovedTrainingRequests(@Query() query: any) {
    const params = query.params ? JSON.parse(query.params) : {};
    params.statusCode = 'requisition_status_approved';
    query.params = JSON.stringify(params);
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Approved training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-all-rejected-training-requests')
  @ApiOperation({ summary: 'Get all rejected training requests' })
  async getAllRejectedTrainingRequests(@Query() query: any) {
    const params = query.params ? JSON.parse(query.params) : {};
    params.statusCode = 'requisition_status_rejected';
    query.params = JSON.stringify(params);
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Rejected training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-my-training-requests')
  @ApiOperation({ summary: 'Get the authenticated user’s training requests' })
  async getMyTrainingRequests(@Req() req, @Query() query: any) {
    const requests = await this.trainingService.findMyTrainingRequests(
      req.user?.id,
      query,
    );
    return {
      status: 'success',
      message: 'Your training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-training-requests-by-employee/:employeeId')
  @ApiOperation({ summary: 'Get all training requests by employee ID' })
  async getTrainingRequestsByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() query: any,
  ) {
    const params = query.params ? JSON.parse(query.params) : {};
    params.employeeId = employeeId;
    query.params = JSON.stringify(params);
    const requests = await this.trainingService.findAllTrainingRequests(query);
    return {
      status: 'success',
      message: 'Employee training requests retrieved successfully',
      data: requests.data,
      pagination: Helpers.makePaginationData(query, {
        total: requests.total,
        data: requests.data.list,
      }),
    };
  }

  @Get('/get-training-request-by-id/:id')
  @ApiOperation({ summary: 'Get training request by ID' })
  async getTrainingRequestById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.trainingService.findTrainingRequestById(id);
    return {
      status: 'success',
      message: 'Training request retrieved successfully',
      data,
    };
  }

  @Post('/update-training-request-status')
  @ApiOperation({ summary: 'Update training request status' })
  async updateTrainingRequestStatus(
    @Body() dto: UpdateTrainingRequestStatusDto,
  ) {
    const data = await this.trainingService.updateTrainingRequestStatus(dto);
    return {
      status: 'success',
      message: 'Training request status updated successfully',
      data,
    };
  }

  @Delete('/delete-training-request/:id')
  @ApiOperation({ summary: 'Delete a pending training request' })
  async deleteTrainingRequest(@Param('id', ParseIntPipe) id: number) {
    await this.trainingService.deleteTrainingRequest(id);
    return {
      status: 'success',
      message: 'Training request deleted successfully',
    };
  }
}
