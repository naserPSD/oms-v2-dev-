import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Helpers } from '@core/utils/helpers';
import { JobApplicantInterviewerService } from '@module/recruitment/job-applicant-interviewer.service';
import {
  CreateJobApplicantInterviewerDto,
  UpdateJobApplicantInterviewerDto,
} from '@module/recruitment/dto/job-applicant-interviewer.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Recruitment')
@Controller('api/v1/recruitment/job-applicant-interviewers')
export class JobApplicantInterviewerController {
  constructor(
    private readonly jobApplicantInterviewerService: JobApplicantInterviewerService,
  ) {}

  @Post('create-job-applicant-interviewer')
  @ApiOperation({ summary: 'Assign an interviewer to a job applicant' })
  async createJobApplicantInterviewer(
    @Body() dto: CreateJobApplicantInterviewerDto,
  ) {
    const interviewer =
      await this.jobApplicantInterviewerService.createJobApplicantInterviewer(
        dto,
      );

    return {
      status: 'success',
      message: 'Interviewer assigned to applicant successfully',
      data: interviewer,
    };
  }

  @Patch('update-job-applicant-interviewer')
  @ApiOperation({ summary: 'Update an applicant interviewer assignment' })
  async updateJobApplicantInterviewer(
    @Body() dto: UpdateJobApplicantInterviewerDto,
  ) {
    const interviewer =
      await this.jobApplicantInterviewerService.updateJobApplicantInterviewer(
        +dto.id,
        dto,
      );

    return {
      status: 'success',
      message: 'Applicant interviewer assignment updated successfully',
      data: interviewer,
    };
  }

  @Get('get-all-job-applicant-interviewers')
  @ApiOperation({ summary: 'Get all applicant interviewer assignments' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 1, "jobApplicantId": 2, "employeeId": 3, "interviewStatus": "Pending" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc',
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
  async getAllJobApplicantInterviewers(@Query() query: any) {
    const queryResult =
      await this.jobApplicantInterviewerService.findAllJobApplicantInterviewers(
        query,
      );

    return {
      status: 'success',
      message: 'Applicant interviewers retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('get-job-applicant-interviewer-by-id/:id')
  @ApiOperation({
    summary: 'Get a specific applicant interviewer assignment by ID',
  })
  async getJobApplicantInterviewerById(@Param('id') id: string) {
    const interviewer =
      await this.jobApplicantInterviewerService.findJobApplicantInterviewerById(
        +id,
      );

    return {
      status: 'success',
      message: 'Applicant interviewer retrieved successfully',
      data: interviewer,
    };
  }

  @Delete('delete-job-applicant-interviewer-by-id/:id')
  @ApiOperation({ summary: 'Delete an applicant interviewer assignment by ID' })
  async deleteJobApplicantInterviewer(@Param('id') id: string) {
    await this.jobApplicantInterviewerService.deleteJobApplicantInterviewer(
      +id,
    );

    return {
      status: 'success',
      message: 'Applicant interviewer assignment deleted successfully',
    };
  }
}
