import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { CreateJobCategoryDto } from './dto/job-categories.dto';
import { Helpers } from '@core/utils/helpers';
import { CreateJobRecruitmentStepNameDto } from './dto/job-recruitment-step-names.dto';
import {
  CreateJobVacancyDto,
  JobVacancyListResponseDto,
} from './dto/job-vacancies.dto';
import { JobWeightService } from '@module/recruitment/job-weight.service';
import {
  CreateJobWeightDto,
  UpdateJobWeightDto,
} from '@module/recruitment/dto/job-weight.dto';
import { JobInterviewerService } from '@module/recruitment/job-interviewer.service';
import {
  CreateJobInterviewerDto,
  SyncJobInterviewersDto,
  UpdateJobInterviewerDto,
} from '@module/recruitment/dto/job-interviewer.dto';
import {
  CreateJobRecruitmentStepDto,
  SaveJobRecruitmentStepsDto,
} from './dto/job-recruitment-steps.dto';
import { CreateJobInterviewScheduleDto } from './dto/job-interview-schedules.dto';
import {
  ChangeJobRecruitmentStepStatusDto,
  ConfirmRecruitmentDto,
  CreateJobApplicantDto,
  UpdateJobApplicantDto,
} from '@module/recruitment/dto/job-applicants.dto';
import { JobApplicantService } from '@module/recruitment/job-applicants.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ALLOWED_IMAGE_AND_DOCUMENT_TYPES } from '@common/constants/file-constants';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Recruitment')
@Controller('api/v1/recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly jobWeightService: JobWeightService,
    private readonly jobInterviewerService: JobInterviewerService,
    private readonly jobApplicantService: JobApplicantService,
  ) {}

  @Post('job-category/add-or-update')
  @ApiOperation({ summary: 'Add or Update Job Category' })
  async addOrUpdateJobCategory(@Body() dto: CreateJobCategoryDto, @Req() req) {
    const category =
      await this.recruitmentService.createOrUpdateJobCategory(dto);

    return {
      status: 'success',
      message: `Job Category ${dto.id ? 'updated' : 'added'} successfully`,
      data: category,
    };
  }

  @Get('/job-category/get-all')
  @ApiOperation({ summary: 'Get all job categories' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "IT" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  async getAllJobCategories(@Query() query: any) {
    const queryResult =
      await this.recruitmentService.findAllJobCategories(query);

    return {
      status: 'success',
      message: 'Job categories retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-category/get-all-without-pagination')
  @ApiOperation({ summary: 'Get all job categories without pagination' })
  async getAllJobCategoriesNoPagination(@Query() query: any) {
    const data =
      await this.recruitmentService.findAllJobCategoriesNoPagination(query);

    return {
      status: 'success',
      message: 'Job categories retrieved successfully',
      data,
    };
  }

  // Get Job Category by ID
  @Get('/job-category/get-by-id/:id')
  @ApiOperation({ summary: 'Get job category by ID' })
  async getJobCategoryById(@Param('id') id: string) {
    const category = await this.recruitmentService.findJobCategoryById(+id);

    return {
      status: 'success',
      message: 'Job category retrieved successfully',
      data: category,
    };
  }

  // Delete Job Category
  @Delete('/job-category/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete job category by ID' })
  async deleteJobCategory(@Param('id') id: string) {
    await this.recruitmentService.deleteJobCategory(+id);

    return {
      status: 'success',
      message: 'Job category deleted successfully',
    };
  }

  // Toggle Active Status
  @Patch('/job-category/change-active-status/:id')
  @ApiOperation({ summary: 'job category active status' })
  async changeJobCategoryActiveStatus(@Param('id') id: string) {
    const category =
      await this.recruitmentService.changeJobCategoryActiveStatus(+id);

    return {
      status: 'success',
      message: 'Job category active status changed successfully',
      data: category,
    };
  }

  @Post('/job-recruitment/add-or-update-job-recruitment-step-name')
  @ApiOperation({ summary: 'Add or Update Job Recruitment Step Name' })
  async addOrUpdateJobRecruitmentStepName(
    @Body() dto: CreateJobRecruitmentStepNameDto,
    @Req() req,
  ) {
    const stepName =
      await this.recruitmentService.createOrUpdateJobRecruitmentStepName(dto);

    return {
      status: 'success',
      message: `Job Recruitment Step Name ${
        dto.id ? 'updated' : 'added'
      } successfully`,
      data: stepName,
    };
  }

  @Get('/job-recruitment/get-all-job-recruitment-step-names')
  @ApiOperation({ summary: 'Get all job recruitment step names' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Interview" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
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
  async getAllJobRecruitmentStepNames(@Query() query: any) {
    const queryResult =
      await this.recruitmentService.findAllJobRecruitmentStepNames(query);

    return {
      status: 'success',
      message: 'Job recruitment step names retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-all-active-job-recruitment-step-names')
  @ApiOperation({ summary: 'Get all job recruitment step names' })
  async getAllactiveJobRecruitmentStepNames(@Query() query: any) {
    const stepNames =
      await this.recruitmentService.getAllactiveJobRecruitmentStepNames(query);

    return {
      status: 'success',
      message: 'Job recruitment step names retrieved successfully',
      data: stepNames,
    };
  }

  @Get('/job-recruitment/get-job-recruitment-step-name-by-id/:id')
  @ApiOperation({ summary: 'Get job recruitment step name by ID' })
  async getJobRecruitmentStepNameById(@Param('id') id: string) {
    const stepName =
      await this.recruitmentService.findJobRecruitmentStepNameById(+id);

    return {
      status: 'success',
      message: 'Job recruitment step name retrieved successfully',
      data: stepName,
    };
  }

  @Delete('/job-recruitment/delete-job-recruitment-step-name-by-id/:id')
  @ApiOperation({ summary: 'Delete job recruitment step name by ID' })
  async deleteJobRecruitmentStepName(@Param('id') id: string) {
    await this.recruitmentService.deleteJobRecruitmentStepName(+id);

    return {
      status: 'success',
      message: 'Job recruitment step name deleted successfully',
    };
  }

  @Post('/job-recruitment/add-or-update-job-vacancy')
  @ApiOperation({ summary: 'Add or Update Job Vacancy' })
  async addOrUpdateJobVacancy(@Body() dto: CreateJobVacancyDto, @Req() req) {
    const vacancy = await this.recruitmentService.createOrUpdateJobVacancy(dto);

    return {
      status: 'success',
      message: `Job Vacancy ${dto.id ? 'updated' : 'added'} successfully`,
      data: vacancy,
    };
  }

  @Get('/job-recruitment/get-all-job-vacancies')
  @ApiOkResponse({ type: JobVacancyListResponseDto })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Engineer", "jobCategoryId": 1 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, jobTitle:asc',
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
  async getAllJobVacancies(@Query() query: any): Promise<any> {
    const queryResult =
      await this.recruitmentService.findAllJobVacancies(query);
    return {
      status: 'success',
      message: 'Job vacancies retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-job-vacancy-by-id/:id')
  @ApiOperation({ summary: 'Get job vacancy by ID' })
  async getJobVacancyById(@Param('id') id: string) {
    const vacancy = await this.recruitmentService.findJobVacancyById(+id);

    return {
      status: 'success',
      message: 'Job vacancy retrieved successfully',
      data: vacancy,
    };
  }

  @Delete('/job-recruitment/delete-job-vacancy-by-id/:id')
  @ApiOperation({ summary: 'Delete job vacancy by ID' })
  async deleteJobVacancy(@Param('id') id: string) {
    await this.recruitmentService.deleteJobVacancy(+id);

    return {
      status: 'success',
      message: 'Job vacancy deleted successfully',
    };
  }

  @Post('/job-recruitment/add-or-update-job-recruitment-step')
  @ApiOperation({ summary: 'Add or Update Job Recruitment Step' })
  async addOrUpdateJobRecruitmentStep(
    @Body() dto: CreateJobRecruitmentStepDto,
    @Req() req,
  ) {
    const step =
      await this.recruitmentService.createOrUpdateJobRecruitmentStep(dto);

    return {
      status: 'success',
      message: `Job Recruitment Step ${dto.id ? 'updated' : 'added'} successfully`,
      data: step,
    };
  }

  @Get('/job-recruitment/get-all-job-recruitment-steps')
  @ApiOperation({ summary: 'Get all job recruitment steps' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "jobVacancyId": 1, "stepId": 2 }',
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
  async getAllJobRecruitmentSteps(@Query() query: any) {
    const queryResult =
      await this.recruitmentService.findAllJobRecruitmentSteps(query);

    return {
      status: 'success',
      message: 'Job recruitment steps retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-job-recruitment-step-by-id/:id')
  @ApiOperation({ summary: 'Get job recruitment step by ID' })
  async getJobRecruitmentStepById(@Param('id') id: string) {
    const step = await this.recruitmentService.findJobRecruitmentStepById(+id);

    return {
      status: 'success',
      message: 'Job recruitment step retrieved successfully',
      data: step,
    };
  }

  @Get(
    '/job-recruitment/get-job-recruitment-step-ids-by-job-vacancy-id/:jobVacancyId',
  )
  @ApiOperation({ summary: 'Get job recruitment step IDs by job vacancy ID' })
  async getJobRecruitmentStepIdsByJobVacancyId(
    @Param('jobVacancyId') jobVacancyId: string,
  ) {
    const stepIds =
      await this.recruitmentService.findJobRecruitmentStepIdsByJobVacancyId(
        +jobVacancyId,
      );

    return {
      status: 'success',
      message: 'Job recruitment step IDs retrieved successfully',
      data: stepIds,
    };
  }

  @Delete('/job-recruitment/delete-job-recruitment-step-by-id/:id')
  @ApiOperation({ summary: 'Delete job recruitment step by ID' })
  async deleteJobRecruitmentStep(@Param('id') id: string) {
    await this.recruitmentService.deleteJobRecruitmentStep(+id);

    return {
      status: 'success',
      message: 'Job recruitment step deleted successfully',
    };
  }

  @Post('/job-recruitment/add-or-update-job-recruitment-steps')
  @ApiOperation({ summary: 'Replace Job Recruitment Steps for a Vacancy' })
  @ApiBody({
    type: SaveJobRecruitmentStepsDto,
    examples: {
      example1: {
        summary: 'Replace steps',
        value: {
          jobVacancyId: 33,
          jobRecruitmentStepIds: [1, 2, 4, 5],
        },
      },
    },
  })
  async addOrUpdateJobRecruitmentSteps(
    @Body() dto: SaveJobRecruitmentStepsDto,
  ) {
    const steps =
      await this.recruitmentService.createOrUpdateJobRecruitmentSteps(dto);

    return {
      status: 'success',
      message: 'Job Recruitment Steps saved successfully',
      data: steps,
    };
  }

  // @Post('/job-interview-schedules/add-or-update')
  // @ApiOperation({ summary: 'Add or Update Job Interview Schedule' })
  // async addOrUpdateJobInterviewSchedule(
  //   @Body() dto: CreateJobInterviewScheduleDto,
  // ) {
  //   const schedule =
  //     await this.recruitmentService.createOrUpdateJobInterviewSchedule(dto);

  //   return {
  //     status: 'success',
  //     message: `Job Interview Schedule ${dto.id ? 'updated' : 'added'} successfully`,
  //     data: schedule,
  //   };
  // }

  @Post('/job-recruitment/add-job-interviewers')
  @ApiOperation({ summary: 'Add Multiple Job Interviewers (Bulk Insert)' })
  @ApiBody({
    description: 'Array of job interviewers to insert',
    type: [CreateJobInterviewerDto],
    examples: {
      bulkInsertExample: {
        summary: 'Example Array Payload',
        value: [
          {
            jobVacancyId: 1,
            employeeId: 10,
          },
          {
            jobVacancyId: 1,
            employeeId: 12,
          },
        ],
      },
    },
  })
  async addBulkJobInterviewers(
    @Body(new ParseArrayPipe({ items: CreateJobInterviewerDto }))
    dtos: CreateJobInterviewerDto[],
  ) {
    const interviewers =
      await this.jobInterviewerService.createBulkJobInterviewers(dtos);

    return {
      status: 'success',
      message: `${interviewers.length} Job Interviewer(s) added successfully`,
      data: interviewers,
    };
  }

  @Post('/job-recruitment/add-or-update-job-interviewers')
  @ApiOperation({ summary: 'Sync Job Interviewers (Add/Remove)' })
  async syncJobInterviewers(@Body() dto: SyncJobInterviewersDto) {
    const interviewers =
      await this.jobInterviewerService.syncJobInterviewers(dto);

    return {
      status: 'success',
      message: 'Job Interviewers synchronized successfully',
      data: interviewers,
    };
  }

  @Patch('/job-recruitment/update-job-interviewer')
  @ApiOperation({ summary: 'Update Job Interviewer' })
  async updateJobInterviewer(@Body() dto: UpdateJobInterviewerDto) {
    const interviewer =
      await this.jobInterviewerService.updateJobInterviewer(dto);

    return {
      status: 'success',
      message: `Job Interviewer ${dto.id ? 'updated' : 'added'} successfully`,
      data: interviewer,
    };
  }

  @Get('/job-recruitment/get-all-job-interviewers')
  @ApiOperation({ summary: 'Get all job interviewers' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 1, "employeeId": 2 }',
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
  async getAllJobInterviewers(@Query() query: any) {
    const queryResult =
      await this.jobInterviewerService.findAllJobInterviewers(query);

    return {
      status: 'success',
      message: 'Job interviewers retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-job-interviewer-by-id/:id')
  @ApiOperation({ summary: 'Get job interviewer by ID' })
  async getJobInterviewerById(@Param('id') id: string) {
    const interviewer =
      await this.jobInterviewerService.findJobInterviewerById(+id);

    return {
      status: 'success',
      message: 'Job interviewer retrieved successfully',
      data: interviewer,
    };
  }

  @Delete('/job-recruitment/delete-job-interviewer-by-id/:id')
  @ApiOperation({ summary: 'Delete job interviewer by ID' })
  async deleteJobInterviewer(@Param('id') id: string) {
    await this.jobInterviewerService.deleteJobInterviewer(+id);

    return {
      status: 'success',
      message: 'Job interviewer deleted successfully',
    };
  }

  @Get('/job-interview-schedules/get-all')
  @ApiOperation({
    summary: 'Get all job interview schedules with optional filters',
  })
  @ApiQuery({
    name: 'jobVacancyId',
    required: false,
    type: Number,
    description: 'Filter schedules by Job Vacancy ID',
  })
  @ApiQuery({
    name: 'jobApplicantId',
    required: false,
    type: Number,
    description: 'Filter schedules by Job Applicant ID',
  })
  async getAllJobInterviewSchedules(
    @Query('jobVacancyId') jobVacancyId?: number,
    @Query('jobApplicantId') jobApplicantId?: number,
  ) {
    const schedules =
      await this.recruitmentService.findAllJobInterviewSchedules(
        jobVacancyId ? Number(jobVacancyId) : undefined,
        jobApplicantId ? Number(jobApplicantId) : undefined,
      );

    return {
      status: 'success',
      message: 'Job interview schedules retrieved successfully',
      data: schedules,
    };
  }

  @Get('/job-interview-schedules/get-by-id/:id')
  @ApiOperation({ summary: 'Get job interview schedule by ID' })
  async getJobInterviewScheduleById(@Param('id') id: string) {
    const schedule =
      await this.recruitmentService.findJobInterviewScheduleById(+id);

    return {
      status: 'success',
      message: 'Job interview schedule retrieved successfully',
      data: schedule,
    };
  }

  @Delete('/job-interview-schedules/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete job interview schedule by ID' })
  async deleteJobInterviewSchedule(@Param('id') id: string) {
    await this.recruitmentService.deleteJobInterviewSchedule(+id);

    return {
      status: 'success',
      message: 'Job interview schedule deleted successfully',
    };
  }

  @Post('job-recruitment/add-or-update-job-applicant')
  @UseInterceptors(FileInterceptor('cvFile'))
  @ApiOperation({ summary: 'Create or Update a Job Applicant' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cvFile: {
          type: 'string',
          format: 'binary',
          description: 'The CV file (PDF, DOC, DOCX)',
        },
      },
    },
  })
  async createOrUpdateJobApplicant(
    @UploadedFile() cvFile: Express.Multer.File,
    @Body() dto: CreateJobApplicantDto,
  ) {
    if (cvFile) {
      Helpers.validateFile(cvFile, ALLOWED_IMAGE_AND_DOCUMENT_TYPES);
      dto.cvFile = cvFile; // Attach the uploaded file to the DTO
    }
    const applicant =
      await this.jobApplicantService.createOrUpdateJobApplicant(dto);

    return {
      status: 'success',
      message: 'Job Applicant created or updated successfully',
      data: applicant,
    };
  }

  // @Patch('job-recruitment/update-job-applicant')
  // @ApiOperation({ summary: 'Update an existing Job Applicant' })
  // async updateJobApplicant(
  //   @Body() dto: UpdateJobApplicantDto,
  // ) {
  //   const applicant = await this.jobApplicantService.updateJobApplicant(dto.id, dto);
  //
  //   return {
  //     status: 'success',
  //     message: 'Job Applicant updated successfully',
  //     data: applicant,
  //   };
  // }

  @Get('/job-recruitment/get-all-job-applicants')
  @ApiOperation({
    summary: 'Get all Job Applicants with pagination and filters',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 1, "jobRecruitmentStepNameId": 2 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, expectedSalary:asc',
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
  async getAllJobApplicants(@Query() query: any) {
    const queryResult =
      await this.jobApplicantService.findAllJobApplicants(query);

    return {
      status: 'success',
      message: 'Job Applicants retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-job-applicant-by-id/:id')
  @ApiOperation({ summary: 'Get a specific Job Applicant by ID' })
  async getJobApplicantById(@Param('id') id: string) {
    const applicant = await this.jobApplicantService.findJobApplicantById(+id);

    return {
      status: 'success',
      message: 'Job Applicant retrieved successfully',
      data: applicant,
    };
  }

  @Delete('job-recruitment/delete-job-applicant-by-id/:id')
  @ApiOperation({ summary: 'Delete a Job Applicant by ID (Soft Delete)' })
  async deleteJobApplicant(@Param('id') id: string) {
    await this.jobApplicantService.deleteJobApplicant(+id);

    return {
      status: 'success',
      message: 'Job Applicant deleted successfully',
    };
  }

  @Post('job-recruitment/change-job-recruitment-step-status')
  @ApiOperation({ summary: 'Change Job Recruitment Step Status' })
  async changeJobRecruitmentStepStatus(
    @Body() dto: ChangeJobRecruitmentStepStatusDto,
  ) {
    const step = this.jobApplicantService.changeJobRecruitmentStepStatus(dto);

    return {
      status: 'success',
      message: 'Job Recruitment Step Status changed successfully',
      data: step,
    };
  }

  @Post('job-recruitment/upload-applicant-cv/:id')
  @UseInterceptors(FileInterceptor('cvFile'))
  @ApiOperation({ summary: 'Upload or update Job Applicant CV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cvFile: {
          type: 'string',
          format: 'binary',
          description: 'The CV file (PDF, DOC, DOCX)',
        },
      },
    },
  })
  async uploadApplicantCv(
    @Param('id') id: string,
    @UploadedFile() cvFile: Express.Multer.File,
    @Req() req,
  ) {
    if (!cvFile) {
      throw new BadRequestException('CV file is required');
    }

    Helpers.validateFile(cvFile, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    const updatedApplicant = await this.jobApplicantService.uploadCv(
      +id,
      cvFile,
    );

    return {
      status: 'success',
      message: 'Applicant CV uploaded successfully',
      data: updatedApplicant,
    };
  }

  @Post('/job-recruitment/add-job-weight')
  @ApiOperation({ summary: 'Add Job Weight' })
  async addJobWeight(@Body() dto: CreateJobWeightDto) {
    const jobWeight = await this.jobWeightService.createJobWeight(dto);

    return {
      status: 'success',
      message: 'Job Weight added successfully',
      data: jobWeight,
    };
  }

  @Post('/job-recruitment/add-bulk-job-weights')
  @ApiOperation({ summary: 'Add Multiple Job Weights (Bulk Insert)' })
  @ApiBody({
    description: 'Array of job weights to insert',
    type: [CreateJobWeightDto],
    examples: {
      bulkInsertExample: {
        summary: 'Example Array Payload',
        value: [
          {
            jobVacancyId: 1,
            weightName: 'Communication Skills',
            weightValue: 5.5,
          },
          {
            jobVacancyId: 1,
            weightName: 'Technical Assessment',
            weightValue: 8.0,
          },
        ],
      },
    },
  })
  async addBulkJobWeights(
    @Body(new ParseArrayPipe({ items: CreateJobWeightDto }))
    dtos: CreateJobWeightDto[],
  ) {
    const jobWeights = await this.jobWeightService.createBulkJobWeights(dtos);

    return {
      status: 'success',
      message: `${jobWeights.length} Job Weights added successfully`,
      data: jobWeights,
    };
  }

  @Patch('/job-recruitment/update-job-weight')
  @ApiOperation({ summary: 'Update Job Weight' })
  async updateJobWeight(@Body() dto: UpdateJobWeightDto) {
    const jobWeight = await this.jobWeightService.updateJobWeight(dto);

    return {
      status: 'success',
      message: 'Job Weight updated successfully',
      data: jobWeight,
    };
  }

  @Get('/job-recruitment/get-all-job-weights')
  @ApiOperation({ summary: 'Get all job weights' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Communication", "jobVacancyId": 1 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, weightName:asc',
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
  async getAllJobWeights(@Query() query: any) {
    const queryResult = await this.jobWeightService.findAllJobWeights(query);

    return {
      status: 'success',
      message: 'Job weights retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-all-job-weights-dropdown')
  @ApiOperation({ summary: 'Get all job weights dropdown' })
  async getAllJobWeightsDropdown() {
    const queryResult = await this.jobWeightService.findAllJobWeightsDropdown();

    return {
      status: 'success',
      message: 'Job weights dropdown retrieved successfully',
      data: queryResult,
    };
  }

  @Get('/job-recruitment/get-job-weight-by-id/:id')
  @ApiOperation({ summary: 'Get job weight by ID' })
  async getJobWeightById(@Param('id') id: string) {
    const jobWeight = await this.jobWeightService.findJobWeightById(+id);

    return {
      status: 'success',
      message: 'Job weight retrieved successfully',
      data: jobWeight,
    };
  }

  @Delete('/job-recruitment/delete-job-weight-by-id/:id')
  @ApiOperation({ summary: 'Delete job weight by ID' })
  async deleteJobWeight(@Param('id') id: string) {
    await this.jobWeightService.deleteJobWeight(+id);

    return {
      status: 'success',
      message: 'Job weight deleted successfully',
    };
  }

  @Get('/job-recruitment/get-step-names')
  @ApiOperation({ summary: 'Get steps names for a given job vacancy' })
  @ApiQuery({ name: 'jobVacancyId', type: Number, required: true })
  async getSteps(@Query('jobVacancyId') jobVacancyId: number) {
    const data =
      await this.recruitmentService.getJobRecruitmentSteps(jobVacancyId);
    return { data, total: data.length };
  }

  @Get('/job-recruitment/get-applicants-by-job-vacancy-and-step-names')
  @ApiOperation({
    summary: 'Get applicants by job vacancy and step (with pagination)',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 36, "stepNameId": 1 }',
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
  async getApplicantsByVacancyAndStepNames(@Query() query: any) {
    const queryResult =
      await this.recruitmentService.getApplicantsByVacancyAndStepNames(query);

    return {
      status: 'success',
      message: 'Applicants retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-job-vacancy-titles')
  @ApiOperation({ summary: 'Get job vacancy titles' })
  async getJobVacancyTitles() {
    const data = await this.recruitmentService.getJobVacancyTitles();

    return {
      status: 'success',
      message: 'Job vacancy titles retrieved successfully',
      data,
    };
  }

  @Get('/job-recruitment/get-job-vancancy-interview-overview-by-job-vacancy-id')
  @ApiOperation({
    summary: 'Get job vacancy interview overview by job vacancy id',
  })
  @ApiQuery({
    name: 'jobVacancyId',
    required: true,
    description: 'Job Vacancy ID',
  })
  async getJobVacancyInterviewOverview(
    @Query('jobVacancyId') jobVacancyId: number,
  ) {
    const data = await this.recruitmentService.getJobVacancyInterviewOverview(
      Number(jobVacancyId),
    );

    return {
      status: 'success',
      message: 'Job vacancy interview overview retrieved successfully',
      data,
    };
  }

  @Get('/job-recruitment/get-applicants-by-vacancy-and-step')
  @ApiOperation({ summary: 'Get applicants by job vacancy and step' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "jobVacancyId": 1, "stepNameId": 2 }',
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
  async getApplicantsByVacancyAndStepWithPagination(@Query() query: any) {
    const queryResult =
      await this.recruitmentService.getApplicantsByVacancyAndStepWithPagination(
        query,
      );

    return {
      status: 'success',
      message: 'Applicants retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job-recruitment/get-all-job-recruitment-steps-list')
  @ApiOperation({ summary: 'Get all job recruitment steps list' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "jobVacancyId": 1 }',
  })
  async getAllJobRecruitmentStepsList(@Query() query: any) {
    const data =
      await this.recruitmentService.getAllJobRecruitmentStepsList(query);

    return {
      status: 'success',
      message: 'Job recruitment steps retrieved successfully',
      data,
    };
  }

  @Get('/job-recruitment/get-job-vacancy-interviewer/:id')
  async getAllJobVacanciesInterviewer(@Param('id') id: number) {
    const queryResult = await this.recruitmentService.findJobInterviewers(id);

    return {
      status: 'success',
      message: 'Job vacancies interviewer retrieved successfully',
      data: queryResult.data,
    };
  }

  @Post('/job-recruitment/confirm-recruitment')
  @ApiOperation({
    summary: 'Confirm recruitment and convert applicant to an employee',
  })
  async confirmRecruitment(@Body() dto: ConfirmRecruitmentDto) {
    const applicant = await this.jobApplicantService.confirmRecruitment(dto);

    return {
      status: 'success',
      message: 'Applicant successfully recruited and converted to an Employee!',
      data: applicant,
    };
  }
}
