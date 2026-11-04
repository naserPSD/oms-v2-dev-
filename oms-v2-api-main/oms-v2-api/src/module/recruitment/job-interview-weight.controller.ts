import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
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
import { JobInterviewWeightService } from '@module/recruitment/job-interview-weight.service';
import { SubmitInterviewMarksDto } from '@module/recruitment/dto/job-weight.dto';
import { CreateApplicantRemarkDto } from '@module/recruitment/dto/remarks.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Recruitment')
@Controller('api/v1/job-interview-weights')
export class JobInterviewWeightController {
  constructor(
    private readonly jobInterviewWeightService: JobInterviewWeightService,
  ) {}

  @Post('/submit-marks')
  @ApiOperation({ summary: 'Submit interview marks for an applicant' })
  async submitInterviewMarks(@Body() dto: SubmitInterviewMarksDto) {
    const result =
      await this.jobInterviewWeightService.submitInterviewMarks(dto);

    return {
      status: 'success',
      message: result.message,
    };
  }

  @Post('/applicant/add-remarks')
  @ApiOperation({ summary: 'Add a remark/comment for a job applicant' })
  async addApplicantRemark(@Body() dto: CreateApplicantRemarkDto) {
    const remark = await this.jobInterviewWeightService.addApplicantRemark(dto);

    return {
      status: 'success',
      message: 'Remark added successfully',
      data: remark,
    };
  }

  @Get('/distribution/schedule/:scheduleId')
  @ApiOperation({
    summary: 'Get weight distribution matrix for an interview schedule',
  })
  async getWeightDistribution(@Param('scheduleId') scheduleId: string) {
    const distribution =
      await this.jobInterviewWeightService.getWeightDistribution(+scheduleId);

    return {
      status: 'success',
      message: 'Interview weight distribution retrieved successfully',
      data: distribution,
    };
  }

  @Get('/top-applicants/vacancy/:jobVacancyId')
  @ApiOperation({
    summary: 'Get top applicants for a job vacancy based on interview scores',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top applicants to return (default is 10)',
  })
  async getTopApplicantsByVacancy(
    @Param('jobVacancyId') jobVacancyId: string,
    @Query('limit') limit?: string,
  ) {
    const fetchLimit = limit ? parseInt(limit, 10) : 10;
    const topApplicants =
      await this.jobInterviewWeightService.getTopApplicantsByVacancy(
        +jobVacancyId,
        fetchLimit,
      );

    return {
      status: 'success',
      message: 'Top applicants retrieved successfully',
      data: topApplicants,
    };
  }
}
