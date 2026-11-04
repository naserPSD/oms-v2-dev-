import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Helpers } from '@core/utils/helpers';
import { JobInterviewScheduleService } from '@module/recruitment/job-interview-schedule.service';
import { CreateJobInterviewScheduleDto } from '@module/recruitment/dto/job-interview-schedule.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Recruitment')
@Controller('api/v1/job-interview-schedules')
export class JobInterviewScheduleController {
  constructor(
    private readonly jobInterviewScheduleService: JobInterviewScheduleService,
  ) {}

  @Post('/add-or-update')
  @ApiOperation({ summary: 'Create or update a Job Interview Schedule' })
  async createOrUpdateInterviewSchedule(
    @Body() dto: CreateJobInterviewScheduleDto,
  ) {
    const schedule =
      await this.jobInterviewScheduleService.createOrUpdateInterviewSchedule(
        dto,
      );

    return {
      status: 'success',
      message: dto.id
        ? 'Interview Schedule updated successfully'
        : 'Interview Schedule created successfully',
      data: schedule,
    };
  }

  @ApiExcludeEndpoint()
  @Get('/get-all')
  @ApiOperation({ summary: 'Get all Job Interview Schedules' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 1, "jobApplicantId": 2 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, scheduleDatetime:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
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
  async getAllJobInterviewSchedules(@Query() query: any) {
    const queryResult =
      await this.jobInterviewScheduleService.findAllJobInterviewSchedules(
        query,
      );

    return {
      status: 'success',
      message: 'Interview Schedules retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-by-id/:id')
  @ApiOperation({ summary: 'Get Job Interview Schedule by ID' })
  async getJobInterviewScheduleById(@Param('id') id: string) {
    console.log('ID:', id);
    const schedule =
      await this.jobInterviewScheduleService.findJobInterviewScheduleById(+id);

    return {
      status: 'success',
      message: 'Interview Schedule retrieved successfully',
      data: schedule,
    };
  }

  @Delete('/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete Job Interview Schedule by ID' })
  async deleteJobInterviewSchedule(@Param('id') id: string) {
    await this.jobInterviewScheduleService.deleteJobInterviewSchedule(+id);

    return {
      status: 'success',
      message: 'Interview Schedule deleted successfully',
    };
  }
}
