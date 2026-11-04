import { RequestContext } from "@common/request-context";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Query,
  SerializeOptions,
  UseInterceptors,
  UploadedFiles,
  UnauthorizedException,
  ParseIntPipe,
  UploadedFile,
} from '@nestjs/common';
import { HrManagementService } from './hr-management.service';
import {
  CreateOfficeDto,
  GetAllOfficesResponseDto,
} from '../hr-management/dto/office.dto';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

import { User } from '@module/users/entities/user.entity';
import { CreateHrManagementDto } from './dto/create-hr-management.dto';
import { UpdateHrManagementDto } from './dto/update-hr-management.dto';
import {
  CreateOfficeShiftDto,
  GetAllOfficeShiftResponseDto,
} from './dto/office-shift.dto';
import {
  CreateOfficeWeekendDto,
  GetAllOfficeWeekendsResponseDto,
} from './dto/office-weekends.dto';
import { CreateJobScreeningDto } from './dto/job-screenings.dto';
import { CreateJobPostingDto } from './dto/job-posting.dto';
import { CreateJobPositionDto } from './dto/job-position.dto';
import { CreateJobApplicantScreeningDto } from './dto/job-applicant-screening.dto';
import { CreateJobApplicantDto } from './dto/job-applicant.dto';
import { CreateJobOfferDto } from './dto/job-offer.dto';
import { CreateJobScreeningMapDto } from './dto/job-screening-map.dto';
import { CreateJobInterviewDto } from './dto/job-interviews.dto';
import { CreateJobInterviewersDto } from './dto/job-interviewers.dto';
import { CreateJobInterviewFeedbackDto } from './dto/job-interview-feedback.dto';
import { CreateLeadGroupDto } from './dto/lead-groups.dto';
import { CreateLeadStageDto } from './dto/lead-stages.dto';
import {
  CreatePersonalNoteDto,
  UpdatePersonalNoteDto,
} from './dto/personal-notes.dto';
import { Helpers } from '@core/utils/helpers';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notices.dto';
import { JobInterviewFeedback } from './entities/job-interview-feedback.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDetailsDto,
  UpdateEmployeeOfficeInfoDto,
  UpdateEmployeeStatusDto,
} from './dto/employees.dto';
import { CreateEmpLeaveTypeDto } from './dto/employee-leaves-type.dto';
import {
  CreateEmpLeaveRequestDto,
  UpdateLeaveRequestDto,
} from './dto/employee-leave-request.dto';
import {
  AcceptInvitationDto,
  CreateEmpInvitationDto,
  UpdateEmpInvitationStatusDto,
} from './dto/employee-invitation.dto';
import {
  CreateCheckInDto,
  CreateCheckOutDto,
  EmpAttendanceResponseDto,
  RequestForRemovingLateCountDto,
} from './dto/employee-attendance.dto';
import {
  CreateRequisitionDto,
  UpdateRequisitionStatusDto,
} from './dto/requisitions.dto';
import {
  CreateEmployeeAssetDto,
  UpdateEmployeeAssetStatusDto,
} from './dto/employee-assets.dto';
import { CreateAssetTypeDto, CreateCompanyAssetTypeDto, ImportAssetTypesDto } from './dto/asset-types.dto';
import { Permissions } from '@core/guards/permissions.decorator';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { CreateLeadPipelineDto } from './dto/lead-pipelines.dto';
import { LeadPipeline } from './entities/lead-pipelines.entity';
import { QueryResult } from 'typeorm';
import { Leads } from './entities/leads.entity';
// import { CreateLeadDto } from './dto/create-lead.dto';
import { Office } from './entities/office.entity';
import { EmpInvitation } from './entities/employee-invitations.entity';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ALLOWED_IMAGE_AND_DOCUMENT_TYPES } from '@common/constants/file-constants';
import {
  CreateHolidayDto,
  HolidayResponseDto,
  UpdateHolidayDto,
} from './dto/holiday.dto';
import {
  AppHolidayResponseDto,
  CreateAppHolidayDto,
  GetAllAppHolidaysResponseDto,
} from './dto/app-holidays.dto';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';
import { Employee } from './entities/employees.entity';
import { CreateEmployeeHierarchyDto } from './dto/employee-hierarchy.dto';
import { CreateLifeEventDto } from './dto/life-events.dto';
import {
  CheckInApproveReconciliationDto,
  CheckOutApproveReconciliationDto,
  CreateAttendanceReconciliationDto,
  RequestMyAttendanceReconciliationDto,
} from './dto/Attendance-reconciliation.dto';
import {
  CheckInOutVisitorDto,
  CreateVisitApplicationDto,
  UpdateApplicationStatusDto,
  UpdateVisitorCheckTimeDto,
  UpdateVisitStatusDto,
} from './dto/visit-applications.dto';
import { CreateEventDto } from './dto/events.dto';
import { CreateEventAttendeeDto } from './dto/event-attendees.dto';
import { CreateEmpSalaryGradeDto } from '../payroll/dto/employee-salary-grades.dto';
import { CreateEmpPromotionDto } from '../payroll/dto/employee-promotions.dto';
import { CreateEmpIncomeTaxTierDto } from './dto/employee-income-tax-tiers.dto';
import { CreateEmpSalaryChangeTypeDto } from './dto/employee-salary-change-types.dto';
import { CreateLateAttendanceRuleDto } from './dto/late-attendance-rules.dto';
import { CreateNewEmployeeDto } from './dto/create-employee.dto';
import { tz } from 'moment-timezone';
import {
  CreateCompanyDocRecordDto,
  CreateCompanyDocRecordMultipleFilesDto,
} from './dto/company-doc-record.dto';
import {
  CreateMasterDocumentDto,
  ImportMasterDocumentsDto,
} from './dto/master-documents.dto';
import { CreateCompanyDocumentDto } from './dto/company-documents.dto';
import { CompanyDocument } from './entities/company-documents.entity';
import { MasterDocument } from './entities/master-documents.entity';
import { CreateUserDto } from '@module/users/dto/user.dto';
import { CreateEmployeeWithUserDto } from './dto/create-employee-with-user.dto';
import { UpdateUserPersonalInfoDto } from '@module/users/dto/update-user-personal-info.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('HR Management')
@Controller('api/v1/hr-management')
export class HrManagementController {
  constructor(private readonly hrManagementService: HrManagementService) {}

  @Get('/get-all-offices')
  @ApiOperation({ summary: 'Get all offices' })
  @ApiQuery({
    name: 'params',
    //type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Office name" }',
    example: '{ "search": "Head Office","addressType":"Commercial" }',
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
  @ApiResponse({
    status: 200,
    description: 'Offices retrieved successfully',
    type: [GetAllOfficesResponseDto],
  })
  async getAllOffices(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllOffices(query);

    return {
      status: 'success',
      message: 'Offices retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/office/list')
  @ApiOperation({ summary: 'Get all offices' })
  @ApiOkResponse({
    description: 'Offices retrieved successfully',
    type: [CommonResponseDto],
  })
  async getOfficeList() {
    return await this.hrManagementService.getOfficeList();
  }

  // Add or update office
  @Post('/add-or-update-office')
  // @SerializeOptions({ groups: ['withCountry'] }) // ✅ enables full country object
  @ApiOperation({ summary: 'Add or Update Office' })
  async addOrUpdate(@Body() dto: CreateOfficeDto, @Req() req) {
    const office = await this.hrManagementService.createOrUpdateOffice(dto);

    return {
      status: 'success',
      message: `Office ${dto.id ? 'updated' : 'added'} successfully`,
      data: office,
    };
  }

  @Get('/get-office/:id')
  @ApiOperation({ summary: 'Get an office by ID' })
  async getOfficeById(@Param('id') id: string) {
    const office = await this.hrManagementService.findOfficeById(+id); // service call
    return {
      status: 'success',
      message: 'Office retrieved successfully',
      data: office,
    };
  }

  @Delete('/delete-office/:id')
  @ApiOperation({ summary: 'Delete an office' })
  async deleteOffice(@Param('id') id: string) {
    await this.hrManagementService.deleteOffice(+id);
    return {
      status: 'success',
      message: 'Office deleted successfully',
    };
  }

  @Patch('/change-office-active-status/:id')
  @ApiOperation({ summary: 'Change office active status' })
  changeActiveStatus(@Param('id') id: string) {
    const result = this.hrManagementService.changeOfficeActiveStatus(+id);
    return {
      status: 'success',
      message: 'Office active status changed successfully',
      data: result,
    };
  }

  @Post('/add-or-update-office-shift')
  @ApiOperation({ summary: 'Add or update office shift' })
  async addOrUpdateOfficeShift(@Body() dto: CreateOfficeShiftDto, @Req() req) {
    const user: User = req.user;
    const shift = await this.hrManagementService.createOrUpdateOfficeShift(dto);
    return {
      status: 'success',
      message: `Office Shift ${dto.id ? 'updated' : 'added'} successfully`,
      data: shift,
    };
  }

  @Get('/get-all-office-shifts')
  @ApiOperation({ summary: 'Get all office shifts' })
  @ApiResponse({
    status: 200,
    description: 'Office shifts retrieved successfully',
    type: [GetAllOfficeShiftResponseDto],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Shift name" }',
    example: '{ "search": "Morning Shift" }',
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
  async getAllOfficeShift(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllOfficeShifts(query);

    return {
      status: 'success',
      message: 'Office shifts retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/office-shift-by-id/:id')
  @ApiOperation({ summary: 'Get office shift by ID' })
  async getOfficeShiftById(@Param('id') id: string) {
    const shift = await this.hrManagementService.findOfficeShiftById(+id);
    return {
      status: 'success',
      message: 'Office shift retrieved successfully',
      data: shift,
    };
  }

  @Delete('/delete-office-shift/:id')
  @ApiOperation({ summary: 'Delete office shift by ID' })
  async deleteOfficeShift(@Param('id') id: string) {
    await this.hrManagementService.deleteOfficeShift(+id);
    return {
      status: 'success',
      message: 'Office shift deleted successfully',
    };
  }

  @Get('/find-offices-shift-by-office-id/:id')
  async findAllOfficesShiftByOfficeId(@Param('id') id: string) {
    return this.hrManagementService.findAllOfficesShiftByOfficeId(id);
  }

  // Add or update Office Weekend
  @Post('/add-or-update-office-weekend')
  @ApiOperation({ summary: 'Add or Update Office Weekend' })
  async addOrUpdateOfficeWeekend(
    @Body() dto: CreateOfficeWeekendDto,
    @Req() req,
  ) {
    const user: User = req.user;
    const weekend =
      await this.hrManagementService.createOrUpdateOfficeWeekend(dto);

    return {
      status: 'success',
      message: `Office Weekend ${dto.id ? 'updated' : 'added'} successfully`,
      data: weekend,
    };
  }

  // Get all Office Weekends
  @Get('/get-all-office-weekends')
  @ApiOperation({ summary: 'Get all office weekends' })
  @ApiResponse({
    status: 200,
    description: 'Office weekends retrieved successfully',
    type: [GetAllOfficeWeekendsResponseDto],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Weekend name" }',
    example: '{ "search": "Weekend name" }',
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
  async getAllOfficeWeekends(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllOfficeWeekends(query);

    return {
      message: 'Office weekends retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Office Weekend by ID
  @Get('/office-weekend-by-id/:id')
  @ApiOperation({ summary: 'Get office weekend by ID' })
  async getOfficeWeekendById(@Param('id') id: string) {
    const weekend = await this.hrManagementService.findOfficeWeekendById(+id);
    return {
      status: 'success',
      message: 'Office weekend retrieved successfully',
      data: weekend,
    };
  }

  // Delete Office Weekend
  @Delete('/delete-office-weekend/:id')
  @ApiOperation({ summary: 'Delete office weekend by ID' })
  async deleteOfficeWeekend(@Param('id') id: string) {
    await this.hrManagementService.deleteOfficeWeekend(+id);
    return {
      status: 'success',
      message: 'Office weekend deleted successfully',
    };
  }

  @Post('/job/add-or-update-job-screening')
  @ApiOperation({ summary: 'Add or Update Job Screening' })
  async addOrUpdateJobScreening(
    @Body() dto: CreateJobScreeningDto,
    @Req() req,
  ) {
    const user: User = req.user;
    const jobScreening =
      await this.hrManagementService.createOrUpdateJobScreening(dto);

    return {
      status: 'success',
      message: `Job Screening ${dto.id ? 'updated' : 'added'} successfully`,
      data: jobScreening,
    };
  }

  // Get all Job Screenings
  @Get('/job/get-all-job-screenings')
  @ApiOperation({ summary: 'Get all job screenings' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Pending" }',
    example: '{ "search": "Pending" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, screeningDate:asc',
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
  async getAllJobScreenings(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobScreenings(query);

    return {
      status: 'success',
      message: 'Job screenings retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Screening by ID
  @Get('/job/job-screening-by-id/:id')
  @ApiOperation({ summary: 'Get job screening by ID' })
  async getJobScreeningById(@Param('id') id: string) {
    const screening = await this.hrManagementService.findJobScreeningById(+id);
    return {
      status: 'success',
      message: 'Job screening retrieved successfully',
      data: screening,
    };
  }

  // Delete Job Screening
  @Delete('/job/delete-job-screening/:id')
  @ApiOperation({ summary: 'Delete job screening by ID' })
  async deleteJobScreening(@Param('id') id: string) {
    await this.hrManagementService.deleteJobScreening(+id);
    return {
      status: 'success',
      message: 'Job screening deleted successfully',
    };
  }

  // Toggle Active Status
  @Post('/job/change-job-screening-status/:id')
  @ApiOperation({ summary: 'Toggle job screening active status' })
  async changeJobScreeningActiveStatus(@Param('id') id: string) {
    const screening =
      await this.hrManagementService.changeJobScreeningActiveStatus(+id);
    return {
      status: 'success',
      message: 'Job screening status changed successfully',
      data: screening,
    };
  }

  // Add or Update Job Posting
  @Post('/job/add-or-update-job-posting')
  @ApiOperation({ summary: 'Add or Update Job Posting' })
  async addOrUpdateJobPosting(@Body() dto: CreateJobPostingDto, @Req() req) {
    const user: User = req.user;
    const posting =
      await this.hrManagementService.createOrUpdateJobPosting(dto);

    return {
      status: 'success',
      message: `Job Posting ${dto.id ? 'updated' : 'added'} successfully`,
      data: posting,
    };
  }

  // Get all Job Postings
  @Get('/job/get-all-job-postings')
  @ApiOperation({ summary: 'Get all job postings' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Software Engineer" }',
    example: '{ "search": "Software Engineer" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, title:asc',
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
  async getAllJobPostings(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobPostings(query);

    return {
      status: 'success',
      message: 'Job postings retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job/job-posting-views/:id')
  @ApiOperation({ summary: 'Get Job Posting by ID and increment views' })
  async getJobPosting(@Param('id') id: number) {
    const posting = await this.hrManagementService.JobPostingIncrementViews(id);

    return {
      status: 'success',
      data: posting,
    };
  }

  // Get Job Posting by ID
  @Get('/job/job-posting-by-id/:id')
  @ApiOperation({ summary: 'Get job posting by ID' })
  async getJobPostingById(@Param('id') id: string) {
    const posting = await this.hrManagementService.findJobPostingById(+id);
    return {
      status: 'success',
      message: 'Job posting retrieved successfully',
      data: posting,
    };
  }

  // Delete Job Posting
  @Delete('/job/delete-job-posting/:id')
  @ApiOperation({ summary: 'Delete job posting by ID' })
  async deleteJobPosting(@Param('id') id: string) {
    await this.hrManagementService.deleteJobPosting(+id);
    return {
      status: 'success',
      message: 'Job posting deleted successfully',
    };
  }

  // Add or Update Job Position
  @Post('/job/add-or-update-job-position')
  @ApiOperation({ summary: 'Add or Update Job Position' })
  async addOrUpdateJobPosition(@Body() dto: CreateJobPositionDto, @Req() req) {
    const user: User = req.user;
    dto.creatorId = user?.id; // assign creator

    const position =
      await this.hrManagementService.createOrUpdateJobPosition(dto);

    return {
      status: 'success',
      message: `Job Position ${dto.id ? 'updated' : 'added'} successfully`,
      data: position,
    };
  }

  // Get all Job Positions
  @Get('/job/get-all-job-positions')
  @ApiOperation({ summary: 'Get all job positions' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Engineer" }',
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
  async getAllJobPositions(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobPositions(query);

    return {
      status: 'success',
      message: 'Job positions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Position by ID
  @Get('/job/get-job-position-by-id/:id')
  @ApiOperation({ summary: 'Get job position by ID' })
  async getJobPositionById(@Param('id') id: string) {
    const position = await this.hrManagementService.findJobPositionById(+id);
    return {
      status: 'success',
      message: 'Job position retrieved successfully',
      data: position,
    };
  }

  // Delete Job Position
  @Delete('/job/delete-job-position-by-id/:id')
  @ApiOperation({ summary: 'Delete job position by ID' })
  async deleteJobPosition(@Param('id') id: string) {
    await this.hrManagementService.deleteJobPosition(+id);
    return {
      status: 'success',
      message: 'Job position deleted successfully',
    };
  }

  // Toggle Active Status
  @Patch('/job/change-job-position-active-status/:id')
  @ApiOperation({ summary: 'job position active status' })
  async changeJobPositionActiveStatus(@Param('id') id: string) {
    const position =
      await this.hrManagementService.changeJobPositionActiveStatus(+id);
    return {
      status: 'success',
      message: 'Job position active status changed successfully',
      data: position,
    };
  }

  // Add or Update Job Applicant Screening
  @Post('/job/add-or-update-job-applicant-screening')
  @ApiOperation({ summary: 'Add or Update Job Applicant Screening' })
  async addOrUpdateJobApplicantScreening(
    @Body() dto: CreateJobApplicantScreeningDto,
    @Req() req,
  ) {
    const user: User = req.user;
    if (!dto.creatorId) dto.creatorId = user?.id;

    const screening =
      await this.hrManagementService.CreateOrUpdateJobApplicantScreening(dto);

    return {
      status: 'success',
      message: `Job Applicant Screening ${dto.id ? 'updated' : 'added'} successfully`,
      data: screening,
    };
  }

  // Get all Job Applicant Screenings
  @Get('/job/get-all-job-applicant-screenings')
  @ApiOperation({ summary: 'Get all Job Applicant Screenings' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Software Engineer" }',
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
  async getAllJobApplicantScreenings(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobApplicantScreenings(query);

    return {
      status: 'success',
      message: 'Job Applicant Screenings retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Applicant Screening by ID
  @Get('/job/job-applicant-screening-by-id/:id')
  @ApiOperation({ summary: 'Get Job Applicant Screening by ID' })
  async getJobApplicantScreeningById(@Param('id') id: string) {
    const screening =
      await this.hrManagementService.findJobApplicantScreeningById(+id);
    return {
      status: 'success',
      message: 'Job Applicant Screening retrieved successfully',
      data: screening,
    };
  }

  // Delete Job Applicant Screening
  @Delete('/job/delete-job-applicant-screening/:id')
  @ApiOperation({ summary: 'Delete Job Applicant Screening by ID' })
  async deleteJobApplicantScreening(@Param('id') id: string) {
    await this.hrManagementService.deleteJobApplicantScreening(+id);
    return {
      status: 'success',
      message: 'Job Applicant Screening deleted successfully',
    };
  }

  @Post('/job/add-or-update-job-applicant')
  @ApiOperation({ summary: 'Add Job Applicant' })
  async addJobApplicant(@Body() dto: CreateJobApplicantDto, @Req() req) {
    const applicant =
      await this.hrManagementService.createOrUpdateJobApplicant(dto);

    return {
      status: 'success',
      message: 'Job Applicant added successfully',
      data: applicant,
    };
  }

  // Get all Job Applicants
  @Get('/job/get-all-job-applicants')
  @ApiOperation({ summary: 'Get all Job Applicants' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Candidate name or code" }',
    example: '{ "search": "Software Engineer" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, expectedSalary:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobApplicants(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobApplicants(query);

    return {
      status: 'success',
      message: 'Job Applicants retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Applicant by ID
  @Get('/job/job-applicant-by-id/:id')
  @ApiOperation({ summary: 'Get Job Applicant by ID' })
  async getJobApplicantById(@Param('id') id: string) {
    const applicant = await this.hrManagementService.findJobApplicantById(+id);
    return {
      status: 'success',
      message: 'Job Applicant retrieved successfully',
      data: applicant,
    };
  }

  // Delete Job Applicant
  @Delete('/job/delete-job-applicant/:id')
  @ApiOperation({ summary: 'Delete Job Applicant by ID' })
  async deleteJobApplicant(@Param('id') id: string) {
    await this.hrManagementService.deleteJobApplicant(+id);
    return {
      status: 'success',
      message: 'Job Applicant deleted successfully',
    };
  }

  @Post('/job/add-or-update-job-offer')
  @ApiOperation({ summary: 'Add or Update Job Offer' })
  async addOrUpdateJobOffer(@Body() dto: CreateJobOfferDto, @Req() req) {
    const offer = await this.hrManagementService.createOrUpdateJobOffer(dto);
    return {
      status: 'success',
      message: `Job Offer ${dto.id ? 'updated' : 'added'} successfully`,
      data: offer,
    };
  }

  // Get all Job Offers
  @Get('/job/get-all-job-offers')
  @ApiOperation({ summary: 'Get all Job Offers' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Offer title or code" }',
    example: '{ "search": "Offer-001" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobOffers(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllJobOffers(query);

    return {
      status: 'success',
      message: 'Job Offers retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Offer by ID
  @Get('/job/job-offer-by-id/:id')
  @ApiOperation({ summary: 'Get Job Offer by ID' })
  async getJobOfferById(@Param('id') id: string) {
    const offer = await this.hrManagementService.findJobOfferById(+id);
    return {
      status: 'success',
      message: 'Job Offer retrieved successfully',
      data: offer,
    };
  }

  // Delete Job Offer
  @Delete('/job/delete-job-offer/:id')
  @ApiOperation({ summary: 'Delete Job Offer by ID' })
  async deleteJobOffer(@Param('id') id: string) {
    await this.hrManagementService.deleteJobOffer(+id);
    return {
      status: 'success',
      message: 'Job Offer deleted successfully',
    };
  }

  // Add or Update Job Screening Map
  @Post('/job/add-or-update-job-screening-map')
  @ApiOperation({ summary: 'Add or Update Job Screening Map' })
  async addOrUpdateJobScreeningMap(
    @Body() dto: CreateJobScreeningMapDto,
    @Req() req,
  ) {
    const user: User = req.user;
    if (!dto.creatorId) dto.creatorId = user?.id;

    const map =
      await this.hrManagementService.createOrUpdateJobScreeningMap(dto);
    return {
      status: 'success',
      message: `Job Screening Map ${dto.id ? 'updated' : 'added'} successfully`,
      data: map,
    };
  }

  // Get all Job Screening Maps
  @Get('/job/get-all-job-screening-maps')
  @ApiOperation({ summary: 'Get all Job Screening Maps' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Posting code or Screening name" }',
    example: '{ "search": "Engineer" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobScreeningMaps(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobScreeningMaps(query);

    return {
      status: 'success',
      message: 'Job Screening Maps retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Screening Map by ID
  @Get('/job/job-screening-map-by-id/:id')
  @ApiOperation({ summary: 'Get Job Screening Map by ID' })
  async getJobScreeningMapById(@Param('id') id: string) {
    const map = await this.hrManagementService.findJobScreeningMapById(+id);
    return {
      status: 'success',
      message: 'Job Screening Map retrieved successfully',
      data: map,
    };
  }

  // Delete Job Screening Map
  @Delete('/job/delete-job-screening-map/:id')
  @ApiOperation({ summary: 'Delete Job Screening Map by ID' })
  async deleteJobScreeningMap(@Param('id') id: string) {
    await this.hrManagementService.deleteJobScreeningMap(+id);
    return {
      status: 'success',
      message: 'Job Screening Map deleted successfully',
    };
  }

  // Add or Update Job Interview
  @Post('/job/add-or-update-job-interview')
  @ApiOperation({ summary: 'Add or Update Job Interview' })
  async addOrUpdateJobInterview(
    @Body() dto: CreateJobInterviewDto,
    @Req() req,
  ) {
    const user: User = req.user;
    if (!dto.creatorId) dto.creatorId = user?.id;

    const interview =
      await this.hrManagementService.CreateOrUpdateJobInterview(dto);

    return {
      status: 'success',
      message: `Job Interview ${dto.id ? 'updated' : 'added'} successfully`,
      data: interview,
    };
  }

  // Get all Job Interviews
  @Get('/job/get-all-job-interviews')
  @ApiOperation({ summary: 'Get all Job Interviews' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Candidate notes or coverLetter" }',
    example: '{ "search": "Software Engineer" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, expectedSalary:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobInterviews(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobInterviews(query);

    return {
      status: 'success',
      message: 'Job Interviews retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Job Interview by ID
  @Get('/job/job-interview-by-id/:id')
  @ApiOperation({ summary: 'Get Job Interview by ID' })
  async getJobInterviewById(@Param('id') id: string) {
    const interview = await this.hrManagementService.findJobInterviewById(+id);
    return {
      status: 'success',
      message: 'Job Interview retrieved successfully',
      data: interview,
    };
  }

  // Delete Job Interview
  @Delete('/job/delete-job-interview/:id')
  @ApiOperation({ summary: 'Delete Job Interview by ID' })
  async deleteJobInterview(@Param('id') id: string) {
    await this.hrManagementService.deleteJobInterview(+id);
    return {
      status: 'success',
      message: 'Job Interview deleted successfully',
    };
  }

  @Post('/job/add-or-update-job-interviewer')
  @ApiOperation({ summary: 'Add or Update Job Interviewer' })
  async addOrUpdateJobInterviewer(
    @Body() dto: CreateJobInterviewersDto,
    @Req() req,
  ) {
    const user: User = req.user;
    if (!dto.creatorId) dto.creatorId = user?.id;

    const interviewer =
      await this.hrManagementService.CreateOrUpdateJobInterviewer(dto);
    return {
      status: 'success',
      message: `Job Interviewer ${dto.id ? 'updated' : 'added'} successfully`,
      data: interviewer,
    };
  }

  @Get('/job/get-all-job-interviewers')
  @ApiOperation({ summary: 'Get all Job Interviewers' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Location or notes" }',
    example: '{ "search": "Head Office" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobInterviewers(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobInterviewers(query);

    return {
      status: 'success',
      message: 'Job Interviewers retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job/job-interviewer-by-id/:id')
  @ApiOperation({ summary: 'Get Job Interviewer by ID' })
  async getJobInterviewerById(@Param('id') id: string) {
    const interviewer =
      await this.hrManagementService.findJobInterviewerById(+id);
    return {
      status: 'success',
      message: 'Job Interviewer retrieved successfully',
      data: interviewer,
    };
  }

  @Delete('/job/delete-job-interviewer/:id')
  @ApiOperation({ summary: 'Delete Job Interviewer by ID' })
  async deleteJobInterviewer(@Param('id') id: string) {
    await this.hrManagementService.deleteJobInterviewer(+id);
    return {
      status: 'success',
      message: 'Job Interviewer deleted successfully',
    };
  }

  @Post('/job/add-or-update-job-interview-feedback')
  @ApiOperation({ summary: 'Add or Update Job Interview Feedback' })
  async addOrUpdateJobInterviewFeedback(
    @Body() dto: CreateJobInterviewFeedbackDto,
    @Req() req,
  ) {
    const feedback =
      await this.hrManagementService.CreateOrUpdateJobInterviewFeedback(dto);

    return {
      status: 'success',
      message: `Job Interview Feedback ${dto.id ? 'updated' : 'added'} successfully`,
      data: feedback,
    };
  }

  @Get('/job/get-all-job-interview-feedbacks')
  @ApiOperation({ summary: 'Get all Job Interview Feedbacks' })
  @ApiResponse({
    status: 200,
    description: 'Job Interview Feedbacks retrieved successfully',
    type: [JobInterviewFeedback],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Overall Rating }',
    example: '{ "search": "rating" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllJobInterviewFeedbacks(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllJobInterviewFeedbacks(query);

    return {
      status: 'success',
      message: 'Job Interview Feedbacks retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/job/job-interview-feedback-by-id/:id')
  @ApiOperation({ summary: 'Get Job Interview Feedback by ID' })
  async getJobInterviewFeedbackById(@Param('id') id: string) {
    const feedback =
      await this.hrManagementService.findJobInterviewFeedbackById(+id);
    return {
      status: 'success',
      message: 'Job Interview Feedback retrieved successfully',
      data: feedback,
    };
  }

  @Delete('/job/delete-job-interview-feedback/:id')
  @ApiOperation({ summary: 'Delete Job Interview Feedback by ID' })
  async deleteJobInterviewFeedback(@Param('id') id: string) {
    await this.hrManagementService.deleteJobInterviewFeedback(+id);
    return {
      status: 'success',
      message: 'Job Interview Feedback deleted successfully',
    };
  }

  // Create or Update Lead Group
  @Post('/lead/add-or-update-lead-group')
  @ApiOperation({ summary: 'Create or Update Lead Group' })
  async createOrUpdateLeadGroup(@Body() dto: CreateLeadGroupDto) {
    const group = await this.hrManagementService.createOrUpdateLeadGroup(dto);
    return {
      status: 'success',
      message: 'Lead Group saved successfully',
      data: group,
    };
  }

  // Get all Lead Groups
  @Get('/lead/get-all-lead-groups')
  @ApiOperation({ summary: 'Get all Lead Groups' })
  async getAllLeadGroups() {
    const groups = await this.hrManagementService.findAllLeadGroups();
    return {
      status: 'success',
      message: 'Lead Groups retrieved successfully',
      data: groups,
    };
  }

  // Get Lead Group by ID
  @Get('/lead/lead-group-by-id/:id')
  @ApiOperation({ summary: 'Get Lead Group by ID' })
  async getLeadGroupById(@Param('id') id: string) {
    const group = await this.hrManagementService.findLeadGroupById(+id);
    return {
      status: 'success',
      message: 'Lead Group retrieved successfully',
      data: group,
    };
  }

  // Delete Lead Group
  @Delete('/lead/delete-lead-group/:id')
  @ApiOperation({ summary: 'Delete Lead Group by ID' })
  async deleteLeadGroup(@Param('id') id: string) {
    await this.hrManagementService.deleteLeadGroup(+id);
    return {
      status: 'success',
      message: 'Lead Group deleted successfully',
    };
  }

  // Create or Update Lead Stage
  @Post('/lead/add-or-update-lead-stage')
  @ApiOperation({ summary: 'Create or Update Lead Stage' })
  async createOrUpdateLeadStage(@Body() dto: CreateLeadStageDto) {
    const stage = await this.hrManagementService.createOrUpdateLeadStage(dto);
    return {
      status: 'success',
      message: 'Lead Stage saved successfully',
      data: stage,
    };
  }

  // Get all Lead Stages
  // Get All Leads
  @Get('/lead/get-all-leads')
  @ApiOperation({ summary: 'Get all Leads' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Name" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({ name: 'sort', type: String, required: false })
  @ApiQuery({ name: 'fields', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async findAllLeads(@Req() req, @Query() query: any) {
    const leads = await this.hrManagementService.findAllLeads(query);

    return {
      status: 'success',
      message: 'Leads retrieved successfully',
      data: leads.data,
      pagination: Helpers.makePaginationData(query, leads),
    };
  }

  // Get Lead Stage by ID
  @Get('/lead/lead-stage-by-id/:id')
  @ApiOperation({ summary: 'Get Lead Stage by ID' })
  async getLeadStageById(@Param('id') id: string) {
    const stage = await this.hrManagementService.findLeadStageById(+id);
    return {
      status: 'success',
      message: 'Lead Stage retrieved successfully',
      data: stage,
    };
  }

  // Delete Lead Stage
  @Delete('/lead/delete-lead-stage/:id')
  @ApiOperation({ summary: 'Delete Lead Stage by ID' })
  async deleteLeadStage(@Param('id') id: string) {
    await this.hrManagementService.deleteLeadStage(+id);
    return {
      status: 'success',
      message: 'Lead Stage deleted successfully',
    };
  }

  // Create or Update Lead Pipeline
  @Post('/lead/add-lead-pipeline')
  @ApiOperation({ summary: 'Create or Update Lead Pipeline' })
  async createOrUpdateLeadPipeline(@Body() dto: CreateLeadPipelineDto) {
    const pipeline =
      await this.hrManagementService.createOrUpdateLeadPipeline(dto);
    return {
      status: 'success',
      message: 'Lead Pipeline saved successfully',
      data: pipeline,
    };
  }

  // Get all Lead Pipelines
  @Get('/lead/get-all-lead-pipelines')
  @ApiOperation({ summary: 'Get all Lead Pipelines' })
  @ApiResponse({
    status: 200,
    description: 'Lead Pipelines retrieved successfully',
    type: [LeadPipeline],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "lead Group Name }',
    example: '{ "search": "Name" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllLeadPipelines(@Query() queryString: any) {
    const pipelines =
      await this.hrManagementService.findAllLeadPipelines(queryString);
    return {
      status: 'success',
      message: 'Lead Pipelines retrieved successfully',
      data: pipelines,
    };
  }

  // Get Lead Pipeline by ID
  @Get('/lead/lead-pipeline-by-id/:id')
  @ApiOperation({ summary: 'Get Lead Pipeline by ID' })
  async getLeadPipelineById(@Param('id') id: string) {
    const pipeline = await this.hrManagementService.findLeadPipelineById(+id);
    return {
      status: 'success',
      message: 'Lead Pipeline retrieved successfully',
      data: pipeline,
    };
  }

  // Delete Lead Pipeline
  @Delete('/lead/delete-lead-pipeline/:id')
  @ApiOperation({ summary: 'Delete Lead Pipeline by ID' })
  async deleteLeadPipeline(@Param('id') id: string) {
    await this.hrManagementService.deleteLeadPipeline(+id);
    return {
      status: 'success',
      message: 'Lead Pipeline deleted successfully',
    };
  }

  // Create or Update Lead

  // @Post('/lead/add-or-update-lead')
  // @ApiOperation({ summary: 'Create or Update Lead' })
  // async createOrUpdateLead(@Body() dto: CreateLeadDto) {
  //   const lead = await this.hrManagementService.createOrUpdateLead(dto);
  //   return {
  //     status: 'success',
  //     message: 'Lead saved successfully',
  //     data: lead,
  //   };
  // }

  // Get all Leads
  @Get('/lead/get-all-leads')
  @ApiOperation({ summary: 'Get all Leads' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [Leads],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "lead Group Name }',
    example: '{ "search": "Name" }',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort results by field, e.g., id:desc, createdAt:asc',
  })
  @ApiQuery({
    name: 'fields',
    type: String,
    required: false,
    description: 'Limit fields returned, separated by comma',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of results per page',
  })
  async getAllLeads(@Query() queryString: any) {
    const leads = await this.hrManagementService.findAllLeads(queryString);
    return {
      status: 'success',
      message: 'Leads retrieved successfully',
      data: leads.data,
    };
  }

  // Get Lead by ID

  @Get('/lead/lead-by-id/:id')
  @ApiOperation({ summary: 'Get Lead by ID' })
  async getLeadById(@Param('id') id: string) {
    const lead = await this.hrManagementService.findLeadById(+id);
    return {
      status: 'success',
      message: 'Lead retrieved successfully',
      data: lead,
    };
  }

  // Delete Lead
  @Delete('/lead/delete-lead/:id')
  @ApiOperation({ summary: 'Delete Lead by ID' })
  async deleteLead(@Param('id') id: string) {
    await this.hrManagementService.deleteLead(+id);
    return {
      status: 'success',
      message: 'Lead deleted successfully',
    };
  }

  @Post('/personal-note/add-or-update')
  @ApiOperation({ summary: 'Create or Update Personal Note' })
  async createOrUpdatePersonalNote(
    @Body() dto: CreatePersonalNoteDto,
    @Req() req,
  ) {
    const user: User = req.user;
    dto.userId = user?.id;
    const note = await this.hrManagementService.createOrUpdatePersonalNote(
      dto,
      user.id,
    );
    return {
      status: 'success',
      message: `Personal Note ${dto.id ? 'updated' : 'added'} successfully`,
      data: note,
    };
  }

  @Get('/personal-note/get-all')

  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all personal notes' })
  @ApiResponse({
    status: 200,
    description: 'Personal notes retrieved successfully',
    // type: [PermissionResponseDto],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Search title", "isPinned": "false" }',
    example: '{ "search": "Search title" }',
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
  @ApiOperation({ summary: 'Get all Personal Notes' })
  async getAllPersonalNote(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllPersonalNotes(query);

    return {
      message: 'Personal Notes retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/personal-note/get-all-archived')

  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all personal archived notes' })
  @ApiResponse({
    status: 200,
    description: 'Archived notes retrieved successfully',
    // type: [PermissionResponseDto], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Search title", "isPinned": "false" }',
    example: '{ "search": "Search title" }',
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
      'Limit the fields returned in the response & fields separated by comma',
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
  @ApiOperation({ summary: 'Get all Personal Notes' })
  async findAllArchivedPersonalNotes(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllArchivedPersonalNotes(query);

    return {
      message: 'Personal Notes retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/personal-note/get-by-id/:id')
  @ApiOperation({ summary: 'Get Personal Note by ID' })
  async getPersonalNoteById(@Param('id') id: string) {
    const note = await this.hrManagementService.findPersonalNoteById(+id);
    return {
      status: 'success',
      message: 'Personal Note retrieved successfully',
      data: note,
    };
  }

  @Delete('/personal-note/delete/:id')
  @ApiOperation({ summary: 'Delete Personal Note by ID' })
  async deletePersonalNote(@Param('id') id: string) {
    await this.hrManagementService.deletePersonalNote(+id);
    return {
      status: 'success',
      message: 'Personal Note deleted successfully',
    };
  }

  @Patch('/personal-note/change-pinned-status/:id')
  @ApiOperation({ summary: 'Update isPinned of a Personal Note' })
  async updateNotePin(@Param('id') id: string, @Req() req) {
    const note = await this.hrManagementService.changePinnedStatus(+id);

    return {
      status: 'success',
      message: `Personal Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: note,
    };
  }

  @Patch('/personal-note/change-archive-status/:id')
  @ApiOperation({ summary: 'Update isArchived flag of a Personal Note' })
  async updateNoteArchive(@Param('id') id: string, @Req() req) {
    const note = await this.hrManagementService.changeArchiveStatus(+id);

    return {
      status: 'success',
      message: `Personal Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      data: note,
    };
  }

  @Post('/add-or-update-notice')
  @ApiOperation({ summary: 'Create or Update a Notice' })
  async createOrUpdateNotice(@Body() dto: CreateNoticeDto, @Req() req) {
    const user: User = req.user;
    dto.createdBy = user.id;
    const notice = await this.hrManagementService.createOrUpdateNotice(dto);
    return {
      status: 'success',
      message: `Notice ${dto.id ? 'updated' : 'created'} successfully`,
      data: notice,
    };
  }

  @Get('/get-all-notices/get-all')
  @ApiOperation({ summary: 'Get all Notices' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Search title", "isActive": "false" }',
    example: '{ "search": "Search title" }',
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
      'Limit the fields returned in the response & fields separated by comma',
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
  async getAllNotices(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllNotices(query);

    return {
      message: 'Notices retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-notice-by-id/:id')
  @ApiOperation({ summary: 'Get Notice by ID' })
  async getNoticeById(@Param('id') id: string) {
    const notice = await this.hrManagementService.findNoticeById(+id);
    return {
      status: 'success',
      message: 'Notice retrieved successfully',
      data: notice,
    };
  }

  @Delete('/delete-notice/:id')
  @ApiOperation({ summary: 'Delete Notice by ID' })
  async deleteNotice(@Param('id') id: string) {
    await this.hrManagementService.deleteNotice(+id);
    return {
      status: 'success',
      message: 'Notice deleted successfully',
    };
  }

  @Patch('/change-status/:id')
  @ApiOperation({ summary: 'Change Notice Active Status' })
  async changeNoticeStatus(@Param('id') id: string) {
    const result = await this.hrManagementService.changeNoticeActiveStatus(+id);
    return {
      status: 'success',
      message: 'Notice active status changed successfully',
      data: result,
    };
  }

  // Add or Update Employee
  @Post('/employee/add-or-update-employee')
  @ApiOperation({ summary: 'Add or Update Employee' })
  async addOrUpdateEmployee(
    @Body() body: CreateEmployeeWithUserDto,
    @Req() req,
  ) {
    const employee = await this.hrManagementService.createOrUpdateEmployee(
      body.employee,
      body.user,
    );

    return {
      status: 'success',
      message: `Employee ${body.employee?.id ? 'updated' : 'added'} successfully`,
      data: employee,
    };
  }

  // Get all Employees
  @Get('/employee/get-all-employees')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Employee name" }',
    example: '{ "search": "John" }',
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
    // description: 'Number of results per page',
  })
  async getAllEmployees(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllEmployees(query);

    return {
      message: 'Employees retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Employee by ID
  @Get('/employee/employee-by-id/:id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getEmployeeById(@Param('id') id: string) {
    const employee = await this.hrManagementService.findEmployeeById(+id);
    return {
      status: 'success',
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }

  // Delete Employee
  @Delete('/employee/delete-employee/:id')
  @ApiOperation({ summary: 'Delete employee by ID' })
  async deleteEmployee(@Param('id') id: string) {
    await this.hrManagementService.deleteEmployee(+id);
    return {
      status: 'success',
      message: 'Employee deleted successfully',
    };
  }

  // Add or Update EmpLeaveType
  @Post('/add-or-update-emp-leave-type')
  @ApiOperation({ summary: 'Add or Update Employee Leave Type' })
  async addOrUpdateEmpLeaveType(
    @Body() dto: CreateEmpLeaveTypeDto,
    @Req() req,
  ) {
    const leaveType =
      await this.hrManagementService.createOrUpdateEmpLeaveType(dto);

    return {
      status: 'success',
      message: `Employee Leave Type ${dto.id ? 'updated' : 'added'} successfully`,
      data: leaveType,
    };
  }

  // Get all EmpLeaveTypes
  @Get('/get-all-emp-leave-types')
  @ApiOperation({ summary: 'Get all employee leave types' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Annual" }',
    example: '{ "search": "Annual" }',
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
  async getAllEmpLeaveTypes(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEmpLeaveTypes(query);

    return {
      message: 'Employee leave types retrieved successfully',
      data: queryResult.data,
      pagination: queryResult.total
        ? {
            total: queryResult.total,
            page: query?.page || 1,
            limit: query?.limit || 10,
          }
        : null,
    };
  }

  // Get EmpLeaveType by ID
  @Get('/emp-leave-type-by-id/:id')
  @ApiOperation({ summary: 'Get employee leave type by ID' })
  async getEmpLeaveTypeById(@Param('id') id: string) {
    const leaveType = await this.hrManagementService.findEmpLeaveTypeById(+id);
    return {
      status: 'success',
      message: 'Employee leave type retrieved successfully',
      data: leaveType,
    };
  }

  // Delete EmpLeaveType
  @Delete('/delete-emp-leave-type/:id')
  @ApiOperation({ summary: 'Delete employee leave type by ID' })
  async deleteEmpLeaveType(@Param('id') id: string) {
    await this.hrManagementService.deleteEmpLeaveType(+id);
    return {
      status: 'success',
      message: 'Employee leave type deleted successfully',
    };
  }

  // Add or Update Employee Leave Request (JSON)
  @Post('/employee/add-or-update-emp-leave-request')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Add or Update Employee Leave Request (JSON)',
    description:
      'Create/update leave request without file. Uses logged-in user employee + active app. New requests get pending approval status automatically. Prefer this endpoint when no attachment is needed.',
  })
  @ApiBody({ type: CreateEmpLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Leave request created/updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation or status config error',
  })
  @ApiResponse({ status: 404, description: 'Employee or leave type not found' })
  async addOrUpdateEmpLeaveRequest(@Body() dto: CreateEmpLeaveRequestDto) {
    const leaveRequest =
      await this.hrManagementService.createOrUpdateEmpLeaveRequest(dto);

    return {
      status: 'success',
      message: `Employee Leave Request ${
        dto.id ? 'updated' : 'added'
      } successfully`,
      data: leaveRequest,
    };
  }

  // Add or Update Employee Leave Request with attachment upload
  @Post('/employee/add-or-update-emp-leave-request/upload')
  @ApiTags('HR Leave Request')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachmentMedia', maxCount: 1 }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add or Update Employee Leave Request (with attachment)',
    description:
      'Same as JSON create/update, but accepts multipart form-data with optional attachmentMedia file (image/PDF).',
  })
  @ApiBody({ type: CreateEmpLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Leave request created/updated with attachment',
  })
  async addOrUpdateEmpLeaveRequestUpload(
    @UploadedFiles()
    files: {
      attachmentMedia?: Express.Multer.File[];
    } = {},
    @Body() dto: CreateEmpLeaveRequestDto,
  ) {
    if (files.attachmentMedia?.[0]) {
      Helpers.validateFile(
        files.attachmentMedia[0],
        ALLOWED_IMAGE_AND_DOCUMENT_TYPES,
      );
      dto.attachmentMedia = files.attachmentMedia[0];
    }

    const leaveRequest =
      await this.hrManagementService.createOrUpdateEmpLeaveRequest(dto);

    return {
      status: 'success',
      message: `Employee Leave Request ${
        dto.id ? 'updated' : 'added'
      } successfully`,
      data: leaveRequest,
    };
  }

  // Get all Employee Leave Requests
  @Get('/employee/get-my-leave-requests')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get my leave requests',
    description:
      'Returns leave requests for the logged-in employee only (filtered by userId + activeAppId).',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'JSON filter string. Supports search and approvalStatusId, e.g. {"search":"Vacation","approvalStatusId":51}',
    example: '{ "search": "Vacation" }',
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
  @ApiResponse({ status: 200, description: 'My leave requests retrieved' })
  async getAllEmpLeaveRequests(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findMyLeaveRequests(query);

    return {
      message: 'Employee Leave Requests retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-my-requisitions')
  @ApiOperation({ summary: 'Get all my Requisitions' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "laptop" }',
    example: '{ "search": "Laptop" }',
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
  async getMyRequisitions(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findMyRequisitions(query);

    return {
      message: 'My Requisitions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-pending-requisitions')
  @ApiOperation({ summary: 'Get all pending Requisitions' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Laptop" }',
    example: '{ "search": "Laptop" }',
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
  async getAllPendingRequisitions(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllPendingRequisitions(query);

    return {
      message: 'Pending Requisitions retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-employee-leave-requests')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get all employee leave requests (HR)',
    description:
      'HR list of leave requests for the active app. Includes appId fallback from app_users when activeAppId is missing.',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "reason" }',
    example: '{ "search": "vacation" }',
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
  async findAllEmployeeLeaveRequests(@Req() req, @Query() query: any) {
    const leaveRequest =
      await this.hrManagementService.findAllEmployeeLeaveRequests(query);

    return {
      status: 'success',
      message: 'Employee Leave Requests retrieved successfully',
      data: leaveRequest.data,
      pagination: Helpers.makePaginationData(query, {
        total: leaveRequest.total,
      }),
    };
  }

  @Get('/get-all-employee-pending-leave-requests')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get all pending employee leave requests (HR)',
    description: 'Pending leave requests for HR approval workflow.',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "vacation", "officeTypeId": 1, "leaveTypeId": 2, "startDate": "2026-03-01", "endDate": "2026-03-10" }',
    example:
      '{ "search": "vacation", "officeTypeId": 1, "leaveTypeId": 2, "startDate": "2026-03-01", "endDate": "2026-03-10" }',
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
  async findAllEmployeePendingLeaveRequests(@Req() req, @Query() query: any) {
    const leaveRequest =
      await this.hrManagementService.findAllEmployeePendingLeaveRequests(query);
    return {
      status: 'success',
      message: 'Pending Employee Leave Requests retrieved successfully',
      data: leaveRequest.data.list,
      pagination: Helpers.makePaginationData(query, {
        total: leaveRequest.total,
      }),
    };
  }

  @Get('/get-employee-leave-summary')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get employee leave summary with essential details',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "vacation" }',
    example: '{ "search": "annual leave" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., startDate:desc',
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
  async getEmployeeLeaveSummary(@Req() req, @Query() query: any) {
    const leaveSummary =
      await this.hrManagementService.getEmployeeLeaveSummary(query);

    return {
      status: 'success',
      message: 'Employee Leave Headers retrieved successfully',
      data: leaveSummary.data,
      pagination: Helpers.makePaginationData(query, leaveSummary),
    };
  }

  // Get Employee Leave Request by ID
  @Get('/employee/emp-leave-request-by-id/:id')
  @ApiTags('HR Leave Request')
  @ApiOperation({ summary: 'Get Employee Leave Request by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async getEmpLeaveRequestById(@Param('id') id: string) {
    const leaveRequest =
      await this.hrManagementService.findEmpLeaveRequestById(+id);
    return {
      status: 'success',
      message: 'Employee Leave Request retrieved successfully',
      data: leaveRequest,
    };
  }

  // Delete Employee Leave Request
  @Delete('/employee/delete-emp-leave-request/:id')
  @ApiTags('HR Leave Request')
  @ApiOperation({ summary: 'Delete Employee Leave Request by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async deleteEmpLeaveRequest(@Param('id') id: string) {
    await this.hrManagementService.deleteEmpLeaveRequest(+id);
    return {
      status: 'success',
      message: 'Employee Leave Request deleted successfully',
    };
  }

  @Post('/employee/update-leave-request-approval-status-by-id/:id')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Update Leave Request Approval Status by ID',
    description:
      'HR/approver updates leave request approval status and reason.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateLeaveRequestDto })
  async updateLeaveRequestApprovalStatusById(
    @Param('id') id: number,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    const result =
      await this.hrManagementService.updateLeaveRequestApprovalStatusById(
        id,
        dto,
      );

    return {
      data: result,
      message: 'Leave Request Approval Status updated successfully',
    };
  }

  // Add or Update Employee Invitation
  @Post('/employee/send-employee-invitation')
  @ApiOperation({ summary: 'Send Employee Invitation' })
  async addOrUpdateEmpInvitation(
    @Body() dto: CreateEmpInvitationDto,
    @Req() req,
  ) {
    const invitation = await this.hrManagementService.createEmpInvitation(dto);
    return {
      status: 'success',
      message: `Employee Invitation ${dto.id ? 'updated' : 'added'} successfully`,
      data: invitation,
    };
  }

  @Get('/employee/get-my-employee-invitation-list')
  @ApiOperation({ summary: 'Get my employee invitations list ' })
  async getUserInvitations(@Query() queryString: any) {
    const invitations =
      await this.hrManagementService.getMyEmployeeInvitationList(queryString);

    return {
      status: 'success',
      message: 'Invitation list fetched successfully',
      data: invitations,
    };
  }

  @Patch('/employee/invitation-accept/:id')
  @ApiOperation({ summary: 'Accept Employee Invitation ' })
  async invitationAccept(@Param('id') id: number) {
    const invitation = await this.hrManagementService.invitationAccept(+id);
    return {
      status: 'success',
      message: 'Employee Invitation accepted successfully',
      data: invitation,
    };
  }

  @Get('/employee/get-app-employee-users')
  @ApiOperation({ summary: 'Get App Employee User List' })
  async getAppEmployeeUsers() {
    const result = await this.hrManagementService.getAppEmployeeUsers();

    return {
      data: result,
      message: 'App Employee User List retrieved successfully',
    };
  }

  // Get all Employee Invitations
  @Get('/employee/get-all-emp-invitations')
  @ApiOperation({ summary: 'Get all Employee Invitations' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "email" }',
    example: '{ "search": "test@example.com" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort by field, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, comma separated',
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
  async getAllEmpInvitations(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEmpInvitations(query);
    return {
      status: 'success',
      message: 'Employee Invitations retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/employee/emp-invitation-by-id/:id')
  @ApiOperation({ summary: 'Get Employee Invitation by ID' })
  async getEmpInvitationById(@Param('id') id: string) {
    const invitation =
      await this.hrManagementService.findEmpInvitationById(+id);
    return {
      status: 'success',
      message: 'Employee Invitation retrieved successfully',
      data: invitation,
    };
  }

  @Delete('/employee/delete-emp-invitation/:id')
  @ApiOperation({ summary: 'Delete Employee Invitation by ID' })
  async deleteEmpInvitation(@Param('id') id: string) {
    await this.hrManagementService.deleteEmpInvitation(+id);
    return {
      status: 'success',
      message: 'Employee Invitation deleted successfully',
    };
  }

  // Employee Check-In
  @Post('/employee/attendance/check-in')
  @ApiOperation({ summary: 'Employee Check-In' })
  async attendanceCheckIn(@Req() req, @Body() body: any) {
    const dto = new CreateCheckInDto();
    const ipAddress = (
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket?.remoteAddress ||
      req.ip
    ).replace(/^::1$/, '127.0.0.1');

    dto.userAgent = req.headers['user-agent'];
    dto.ipAddress = ipAddress;
    dto.checkInLatLong = body.checkInLatLong;

    const attendance = await this.hrManagementService.attendanceCheckIn(dto);

    return {
      status: 'success',
      message: 'Employee checked in successfully',
      data: attendance,
    };
  }

  // Employee Check-In
  @Post('/employee/attendance/check-out')
  @ApiOperation({ summary: 'Employee Check-Out' })
  async attendanceCheckOut(@Req() req, @Body() dto: CreateCheckOutDto) {
    // const dto = new CreateCheckOutDto();
    dto.userAgent = req.headers['user-agent'];

    const attendance = await this.hrManagementService.attendanceCheckOut(dto);

    return {
      status: 'success',
      message: 'Employee checked Out successfully',
      data: attendance,
    };
  }

  @Get('/get-all-employee-penalties-list')
  @ApiOperation({ summary: 'Get all Employee Penalties' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "month" }',
    example: '{ "search": "January" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort by field, e.g., id:desc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, comma separated',
  })
  async getEmpAttendancePenalties(@Query() query: any) {
    const penalties =
      await this.hrManagementService.getEmpAttendancePenalties(query);
    return {
      status: 'success',
      message: 'Employee Penalties retrieved successfully',
      data: penalties,
    };
  }

  // Employee Check-In
  @Post('/employee/attendance/request-for-removing-late-count')
  @ApiOperation({ summary: 'Request for removing attendance late count' })
  async requestForRemovingLateCount(
    @Req() req,
    @Body() dto: RequestForRemovingLateCountDto,
  ) {
    const attendance =
      await this.hrManagementService.requestForRemovingLateCount(dto);

    return {
      status: 'success',
      message: 'Employee checked Out successfully',
      data: attendance,
    };
  }

  @Post('/employee/attendance/break-start/:attendanceId')
  @ApiOperation({ summary: 'Employee Break Start' })
  async attendanceBreakStart(@Param('attendanceId') attendanceId: number) {
    const attendance =
      await this.hrManagementService.attendanceBreakStart(attendanceId);

    return {
      status: 'success',
      message: 'Employee break time started ',
      data: attendance,
    };
  }

  @Post('/employee/attendance/break-end/:attendanceId')
  @ApiOperation({ summary: 'Employee Break End' })
  async attendanceBreakEnd(@Param('attendanceId') attendanceId: number) {
    const attendance =
      await this.hrManagementService.attendanceBreakEnd(attendanceId);

    return {
      status: 'success',
      message: 'Employee break time ended',
      data: attendance,
    };
  }

  // Get all Employee Check-Ins
  @Get('/get-all-check-ins')
  @ApiOperation({ summary: 'Get all Employee Check-Ins' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "employee name" }',
    example: '{ "search": "John" }',
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
  async getAllCheckIns(@Req() req, @Query() query: any) {
    const checkIns = await this.hrManagementService.findAllCheckInEmployee();

    return {
      message: 'Employee Check-Ins retrieved successfully',
      data: checkIns,
      pagination: Helpers.makePaginationData(query, checkIns),
    };
  }

  @Get('/check-in-by-id/:id')
  @ApiOperation({ summary: 'Get Employee Check-In by ID' })
  async getCheckInById(@Param('id') id: string) {
    const attendance = await this.hrManagementService.findCheckInById(+id);
    return {
      status: 'success',
      message: 'Employee Check-In retrieved successfully',
      data: attendance,
    };
  }

  // Delete Employee Check-In
  @Delete('/delete-check-in/:id')
  @ApiOperation({ summary: 'Delete Employee Check-In by ID' })
  async deleteCheckIn(@Param('id') id: string) {
    await this.hrManagementService.deleteCheckIn(+id);
    return {
      status: 'success',
      message: 'Employee Check-In deleted successfully',
    };
  }

  // Get today's attendance for authenticated user
  @Get('/employee/attendance/my-attendance-today')
  @ApiOperation({ summary: 'Get today attendance for authenticated user' })
  async getMyAttendanceToday() {
    const result = await this.hrManagementService.getMyAttendanceToday();
    return {
      message: result.attendance
        ? 'Attendance retrieved successfully'
        : 'No attendance found for today',
      data: result.attendance,
      canCheckInOut: result.canCheckInOut,
      officeId: result.officeId,
      officeShiftId: result.officeShiftId,
    };
  }

  // Get today's attendance for authenticated user
  @Get('/employee/attendance/all-employee-attendance-today')
  @ApiOperation({ summary: 'Get today attendance for authenticated user' })
  async getAllAttendanceToday() {
    const attendance = await this.hrManagementService.getAllAttendanceToday();
    return {
      message: attendance
        ? 'Attendance retrieved successfully'
        : 'No attendance found for today',
      data: attendance,
    };
  }

  @Get('/employee/attendance/get-all-attendance-list-by-date')
  @ApiOperation({ summary: 'Get all attendance records by date' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Filter parameters as JSON, e.g., { "attendanceDate": "2025-10-16", "empId": 1, "officeId": 2, "shiftId": 3, "attendanceStatusId": 4, "search": "John" }',
    example: '{ "attendanceDate": "2025-10-16", "empId": 1, "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results, e.g., id:desc, attendanceDate:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit returned fields, separate by comma, e.g., id,empId,checkIn',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination, default 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page, default 20',
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'success',
        message: 'Attendance list retrieved successfully',
        data: [
          {
            id: 18,
            empId: 1,
            employee: {
              userId: 12,
              user: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
              },
            },
            office: { id: 1, name: 'Karwan Bazar Office' },
            shift: { id: 28, name: 'AfterNoon Shift' },
            attendanceDate: '2025-10-20',
            attendanceStatusId: 42,
            attendanceStatus: {
              name: 'Present',
              code: 'emp_attendance_status_present',
              colorName: 'success',
            },
            checkIn: '2025-10-19T23:10:30.000Z',
            checkInStatus: {
              name: 'On Time',
              code: 'attendance_checkin_status_ontime',
              colorName: 'success',
            },
            checkInMethodId: 47,
            checkInMethod: {
              name: 'Desktop',
              code: 'emp_attendance_method_desktop',
              colorName: '',
            },
            checkOut: '2025-10-20T05:59:26.000Z',
            checkOutStatus: null,
            checkOutMethod: null,
            lateApprovalUser: null,
            earlyLeaveReason: null,
          },
        ],
        pagination: {
          page: 1,
          total: 1,
          limit: 20,
          lastPage: 1,
          resultRows: 1,
        },
        summary: {
          onTimeCheckIn: 1,
          lateCheckIn: 0,
          earlyTiming: 0,
          absent: 0,
        },
      },
    },
  })
  async getAllAttendanceListByDate(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.getAllAttendanceListByDate(query);

    return {
      status: 'success',
      message: 'Attendance list retrieved successfully',
      data: {
        items: queryResult.data,
        summary: queryResult.summary || {},
      },
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/employee/attendance/get-pending-attendance')
  @ApiOperation({
    summary:
      'Get pending attendance list (employees who have not given attendance)',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Filter parameters as JSON, e.g., { "attendanceDate": "2025-10-16", "officeId": 2, "departmentId": 1, "designationId": 3, "search": "John" }',
    example: '{ "attendanceDate": "2025-10-16", "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results, e.g., id:desc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination, default 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page, default 10',
  })
  async getPendingAttendance(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.getPendingAttendanceList(query);

    return {
      status: 'success',
      message: 'Pending attendance list retrieved successfully',
      data: {
        items: queryResult.data,
        summary: queryResult.summary || {},
      },
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Post('/update-employee-status')
  @ApiOperation({ summary: 'Create  Employee Status' })
  async createOrUpdate(@Body() dto: UpdateEmployeeStatusDto) {
    const data = await this.hrManagementService.UpdateEmployeeStatus(dto);
    return {
      status: 'success',
      message: 'Employee status saved successfully',
      data,
    };
  }

  @Post('/add-or-update-requisition')
  @ApiOperation({ summary: 'Create or Update Requisition' })
  async createOrUpdateRequisition(@Body() dto: CreateRequisitionDto) {
    const data = await this.hrManagementService.createOrUpdateRequisition(dto);
    return {
      status: 'success',
      message: 'Requisition saved successfully',
      data,
    };
  }

  @Get('/get-all-requisitions')
  @ApiOperation({ summary: 'Get all Requisitions' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Laptop" }',
    example: '{ "search": "Laptop" }',
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
  async getAllRequisitions(@Req() req, @Query() query: any) {
    const requisitions =
      await this.hrManagementService.findAllRequisitions(query);

    return {
      status: 'success',
      message: 'Requisitions retrieved successfully',
      data: requisitions.data,
      pagination: Helpers.makePaginationData(query, requisitions.data),
    };
  }

  @Get('/get-requisition-by-id/:id')
  @ApiOperation({ summary: 'Get Requisition by ID' })
  async getRequisitionById(@Param('id') id: string) {
    const requisition = await this.hrManagementService.findRequisitionById(+id);
    return {
      status: 'success',
      message: 'Requisition retrieved successfully',
      data: requisition,
    };
  }

  @Delete('/delete-requisition/:id')
  @ApiOperation({ summary: 'Delete Requisition by ID' })
  async deleteRequisition(@Param('id') id: string) {
    await this.hrManagementService.deleteRequisition(+id);
    return {
      status: 'success',
      message: 'Requisition deleted successfully',
    };
  }

  @Post('/update-requisition-status')
  @ApiOperation({ summary: 'Update Requisition Status' })
  async updateRequisitionStatus(@Body() dto: UpdateRequisitionStatusDto) {
    const data = await this.hrManagementService.updateRequisitionStatus(dto);
    return {
      status: 'success',
      message: 'Requisition status updated successfully',
      data,
    };
  }

  @Post('/employee/add-or-update-employee-asset')
  @ApiOperation({ summary: 'Create or Update employee asset' })
  async createOrUpdateEmployeeAsset(@Body() dto: CreateEmployeeAssetDto) {
    const data =
      await this.hrManagementService.createOrUpdateEmployeeAssets(dto);
    return {
      status: 'success',
      message: 'Requisition saved successfully',
      data,
    };
  }

  @Get('/employee/get-all-employee-assets')
  @ApiOperation({ summary: 'Get all Employee Assets' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Mouse" }',
    example: '{ "search": "Mouse" }',
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
  async getAllEmployeeAssets(@Req() req, @Query() query: any) {
    const queryResult =
      await this.hrManagementService.getAllEmployeeAssets(query);

    return {
      message: 'Employee assets retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Post('/employee-asset/create-refund-request')
  @ApiOperation({ summary: 'Create refund request for employee assets' })
  async createAssetRefundRequest(
    @Body() dto: { assetIds: number[]; reason?: string; requestDate?: string },
  ) {
    const data = await this.hrManagementService.createAssetRefundRequest(dto);
    return {
      status: 'success',
      ...data,
    };
  }

  @Get('/employee-asset/get-my-refund-requests')
  @ApiOperation({ summary: 'Get current employee refund requests' })
  async getMyAssetRefundRequests() {
    const data = await this.hrManagementService.getMyAssetRefundRequests();
    return {
      status: 'success',
      data,
    };
  }

  @Get('/employee-asset/get-all-refund-requests')
  @ApiOperation({ summary: 'Get all asset refund requests for admin' })
  async getAllAssetRefundRequests(@Query() query: any) {
    const result =
      await this.hrManagementService.getAllAssetRefundRequests(query);
    return {
      status: 'success',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        lastPage: result.lastPage,
      },
    };
  }

  @Post('/employee-asset/action-refund-request')
  @ApiOperation({ summary: 'Approve or reject asset refund request' })
  async actionAssetRefundRequest(
    @Body()
    dto: {
      id: number;
      status: 'approved' | 'rejected';
      actionNote?: string;
    },
  ) {
    const result =
      await this.hrManagementService.actionAssetRefundRequest(dto);
    return {
      status: 'success',
      ...result,
    };
  }

  @Get('/get-all-requisition-info')
  @ApiOperation({ summary: 'Get all requisitions (all / pending / approved)' })
  async getAllRequisitionInfo() {
    const result = await this.hrManagementService.getRequisitionHeaders();

    return {
      status: 'success',
      message: 'Requisitions retrieved successfully',
      data: result.headers,
      total: result.total,
    };
  }

  @Get('/employee/get-employee-asset-by-id/:id')
  @ApiOperation({ summary: 'Get employee asset by ID' })
  async getEmployeeAssetById(@Param('id') id: string) {
    const requisition =
      await this.hrManagementService.findEmployeeAssetById(+id);
    return {
      status: 'success',
      message: 'Requisition retrieved successfully',
      data: requisition,
    };
  }

  @Delete('/employee/delete-employee-asset/:id')
  @ApiOperation({ summary: 'Delete employee asset by ID' })
  async deleteEmployeeAsset(@Param('id') id: string) {
    await this.hrManagementService.deleteEmployeeAsset(+id);
    return {
      status: 'success',
      message: 'Requisition deleted successfully',
    };
  }

  @Post('/employee/add-or-update-asset-type')
  @ApiOperation({ summary: 'Add or Update asset type' })
  @Permissions('master.category.manage')
  async addOrUpdateAssetType(@Body() dto: CreateAssetTypeDto) {
    const data = await this.hrManagementService.createOrUpdateAssetType(dto);
    return {
      status: 'success',
      message: 'Asset type saved successfully',
      data,
    };
  }

  @Get('/employee/get-all-asset-types')
  @ApiOperation({ summary: 'Get all asset types' })
  async getAllAssetTypes() {
    const data = await this.hrManagementService.findAllAssetTypes();

    return {
      status: 'success',
      message: 'Asset types retrieved successfully',
      data,
    };
  }

  @Get('/employee/get-asset-type-by-id/:id')
  @ApiOperation({ summary: 'Get asset type by ID' })
  async getAssetTypeById(@Param('id') id: string) {
    const data = await this.hrManagementService.findAssetTypeById(+id);
    return {
      status: 'success',
      message: 'Asset type retrieved successfully',
      data,
    };
  }

  @Delete('/employee/delete-asset-type/:id')
  @ApiOperation({ summary: 'Delete asset type by ID' })
  @Permissions('master.category.manage')
  async deleteAssetType(@Param('id') id: string) {
    await this.hrManagementService.deleteAssetType(+id);
    return {
      status: 'success',
      message: 'Asset type deleted successfully',
    };
  }

  // --- Company Asset Types ---

  @Post('/employee/add-or-update-company-asset-type')
  @ApiOperation({ summary: 'Add or Update company asset type' })
  async addOrUpdateCompanyAssetType(
    @Body() dto: CreateCompanyAssetTypeDto,
    @Req() req
  ) {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');
    const data = await this.hrManagementService.createOrUpdateCompanyAssetType(dto, appId, userId);
    return {
      status: 'success',
      message: 'Company asset type saved successfully',
      data,
    };
  }

  @Post('/employee/import-global-asset-types')
  @ApiOperation({ summary: 'Import global asset types to company' })
  async importGlobalAssetTypes(
    @Body() dto: ImportAssetTypesDto,
    @Req() req
  ) {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');
    const data = await this.hrManagementService.importGlobalAssetTypes(dto, appId, userId);
    return {
      status: 'success',
      message: 'Asset types imported successfully',
      data,
    };
  }

  @Get('/employee/get-company-asset-types')
  @ApiOperation({ summary: 'Get all company asset types' })
  async getCompanyAssetTypes(@Req() req) {
    const appId = RequestContext.get('activeAppId');
    const data = await this.hrManagementService.findCompanyAssetTypes(appId);
    return {
      status: 'success',
      message: 'Company asset types retrieved successfully',
      data,
    };
  }

  @Delete('/employee/delete-company-asset-type/:id')
  @ApiOperation({ summary: 'Delete company asset type by ID' })
  async deleteCompanyAssetType(
    @Param('id') id: string,
    @Req() req
  ) {
    const appId = RequestContext.get('activeAppId');
    await this.hrManagementService.deleteCompanyAssetType(+id, appId);
    return {
      status: 'success',
      message: 'Company asset type deleted successfully',
    };
  }

  @Post('/employee/update-employee-asset-status')
  @ApiOperation({ summary: 'Update employee asset status' })
  async updateEmployeeAssetStatus(@Body() dto: UpdateEmployeeAssetStatusDto) {
    const data = await this.hrManagementService.updateEmployeeAssetStatus(dto);
    return {
      status: 'success',
      message: 'Employee asset status updated successfully',
      data,
    };
  }

  @Post('/employee/update-employee-invitation-status/:id')
  @ApiOperation({ summary: 'Update employee invitation status' })
  async updateEmpInvitationStatusById(
    @Param('id') id: number,
    @Body() dto: UpdateEmpInvitationStatusDto,
  ) {
    const data = await this.hrManagementService.updateEmpInvitationStatusById(
      id,
      dto,
    );

    return {
      status: 'success',
      message: 'Employee invitation status updated successfully',
      data,
    };
  }

  @Get('/get-user-dashboard-data')
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboardData() {
    const data = await this.hrManagementService.getDashboardData();
    return {
      data,
      message: 'Dashboard data retrieved successfully',
    };
  }

  // Create or Update Holiday
  @Post('/holiday/add-or-update-holiday')
  @ApiOperation({ summary: 'Create or update a holiday' })
  async createOrUpdateHoliday(@Body() dto: CreateHolidayDto) {
    const holiday = await this.hrManagementService.createOrUpdateHolidays(dto);
    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'Holiday updated successfully'
        : 'Holiday created successfully',
      data: holiday,
    };
  }

  @Patch('/holiday/change-status/:id')
  @ApiOperation({ summary: 'Change Holiday Active Status' })
  async changeHolidayStatus(@Param('id') id: string) {
    const result =
      await this.hrManagementService.changeHolidayActiveStatus(+id);
    return {
      status: 'success',
      message: 'Holiday active status changed successfully',
      data: result,
    };
  }

  // Get all Holidays
  @Get('/holiday/get-all-holidays')
  @ApiOperation({ summary: 'Get all holidays' })
  @ApiResponse({
    status: 200,
    description: 'App holidays retrieved successfully',
    type: [HolidayResponseDto],
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "National" }',
    example: '{ "search": "National", "isActive": 1 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, holidayName:asc',
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
  async getAllHolidays(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllHolidays(query);

    return {
      status: 'success',
      message: 'Holidays retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Holiday by ID
  @Get('/holiday/get-holiday-by-id/:id')
  @ApiOperation({ summary: 'Get holiday by ID' })
  async getHolidayById(@Param('id') id: string) {
    const holiday = await this.hrManagementService.findHolidayById(+id);
    return {
      status: 'success',
      message: 'Holiday retrieved successfully',
      data: holiday,
    };
  }

  // Delete Holiday
  @Delete('/holiday/delete-holiday/:id')
  @ApiOperation({ summary: 'Delete holiday by ID' })
  async deleteHoliday(@Param('id') id: string) {
    await this.hrManagementService.deleteHoliday(+id);
    return {
      status: 'success',
      message: 'Holiday deleted successfully',
    };
  }

  // Create or Update App Holiday
  @Post('/holiday/add-or-update-app-holiday')
  @ApiOperation({ summary: 'Create or update an App Holiday' })
  async createOrUpdateAppHoliday(@Body() dto: CreateAppHolidayDto) {
    const result = await this.hrManagementService.createOrUpdateAppHoliday(dto);
    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'App holiday updated successfully'
        : 'App holiday created successfully',
      data: result,
    };
  }

  // Get all App Holidays
  @Get('/holiday/get-all-app-holidays')
  @ApiOperation({ summary: 'Get all App Holidays' })
  @ApiResponse({
    status: 200,
    description: 'App holidays retrieved successfully',
    type: [GetAllAppHolidaysResponseDto], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "search": "Eid" }',
    example: '{ "search": "Eid" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit returned fields',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Pagination page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page' })
  async getAllAppHolidays(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllAppHolidays(query);
    return {
      status: 'success',
      message: 'App holidays retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-holiday-list-without-pagination')
  @ApiOperation({ summary: 'Get all holidays without pagination' })
  async findAllHolidayListWithoutPagination(@Req() req, @Query() query: any) {
    const holidays =
      await this.hrManagementService.findAllHolidayListWithoutPagination(query);

    return {
      status: 'success',
      message: 'Holiday list retrieved successfully',
      data: holidays.data,
      total: holidays.total,
    };
  }

  // Get App Holiday by ID
  @Get('/holiday/get-app-holiday-by-id/:id')
  @ApiOperation({ summary: 'Get App Holiday by ID' })
  async getAppHolidayById(@Param('id') id: string) {
    const holiday = await this.hrManagementService.findAppHolidayById(+id);
    return {
      status: 'success',
      message: 'App holiday retrieved successfully',
      data: holiday,
    };
  }

  // Delete App Holiday
  @Delete('/holiday/delete-app-holiday-by-id/:id')
  @ApiOperation({ summary: 'Delete App Holiday by ID' })
  async deleteAppHoliday(@Param('id') id: string) {
    await this.hrManagementService.deleteAppHoliday(+id);
    return {
      status: 'success',
      message: 'App holiday deleted successfully',
    };
  }

  //Create or Update Employee hierarchy
  @Post('/employee/add-or-update-employee-hierarchy')
  @ApiOperation({ summary: 'Add or update an Employee hierarchy' })
  async createOrUpdateEmployeeHierarchy(
    @Body() dto: CreateEmployeeHierarchyDto,
  ) {
    const hierarchy =
      await this.hrManagementService.createOrUpdateEmployeeHierarchy(dto);

    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'Employee hierarchy updated successfully'
        : 'Employee hierarchy created successfully',
      data: hierarchy,
    };
  }

  // Get all EmployeeHierarchy records
  @Get('/employee/get-all-employee-hierarchies')
  @ApiOperation({ summary: 'Get all EmployeeHierarchy records' })
  @ApiResponse({
    status: 200,
    description: 'Employee hierarchies retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search/filter parameters as JSON, e.g., { "search": "John" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit returned fields',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Pagination page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page' })
  async findAllEmployeeHierarchies(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEmployeeHierarchies(query);

    return {
      status: 'success',
      message: 'Employee hierarchies retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Find EmployeeHierarchy by ID
  @Get('/employee/get-employee-hierarchy-by-employee/:id')
  @ApiOperation({ summary: 'Get EmployeeHierarchy by ID' })
  async findEmployeeHierarchyByEmployeeId(@Param('id') id: string) {
    const hierarchy =
      await this.hrManagementService.findEmployeeHierarchyByEmployeeId(+id);
    return {
      status: 'success',
      message: 'Employee hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  // Find EmployeeHierarchy by ID
  @Get('/employee/get-employee-hierarchy-by-id/:id')
  @ApiOperation({ summary: 'Get EmployeeHierarchy by ID' })
  async findEmployeeHierarchyById(@Param('id') id: string) {
    const hierarchy =
      await this.hrManagementService.findEmployeeHierarchyById(+id);
    return {
      status: 'success',
      message: 'Employee hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  // Delete EmployeeHierarchy by ID
  @Delete('/employee/delete-employee-hierarchy-by-id/:id')
  @ApiOperation({ summary: 'Delete EmployeeHierarchy by ID' })
  async deleteEmployeeHierarchy(@Param('id') id: string) {
    await this.hrManagementService.deleteEmployeeHierarchy(+id);
    return {
      status: 'success',
      message: 'Employee hierarchy deleted successfully',
    };
  }

  // Create or update life-events

  @Post('/employee/add-or-update-life-event')
  @ApiOperation({ summary: 'Add or update life event' })
  async createOrUpdateLifeEvent(@Body() dto: CreateLifeEventDto) {
    const lifeEvent =
      await this.hrManagementService.createOrUpdateLifeEvent(dto);
    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'Life event updated successfully'
        : 'Life event created successfully',
      data: lifeEvent,
    };
  }

  // Get all life-events
  @Get('/employee/get-all-life-events')
  @ApiOperation({ summary: 'Get all life events' })
  @ApiResponse({
    status: 200,
    description: 'Employee hierarchies retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search/filter parameters as JSON, e.g., { "search": "John" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit returned fields',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Pagination page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Results per page',
  })
  async findAllLifeEvents() {
    const lifeEvents = await this.hrManagementService.findAllLifeEvents();
    return {
      status: 'success',
      message: 'Life events retrieved successfully',
      data: lifeEvents,
    };
  }

  // Find life-event by ID
  @Get('/employee/get-life-event-by-id/:id')
  @ApiOperation({ summary: 'Get life event by ID' })
  async findLifeEventById(@Param('id') id: string) {
    const lifeEvent = await this.hrManagementService.findLifeEventById(+id);
    return {
      status: 'success',
      message: 'Life event retrieved successfully',
      data: lifeEvent,
    };
  }

  // Delete life-event by ID
  @Delete('/employee/delete-life-event-by-id/:id')
  @ApiOperation({ summary: 'Delete life event by ID' })
  async deleteLifeEvent(@Param('id') id: string) {
    await this.hrManagementService.deleteLifeEvent(+id);
    return {
      status: 'success',
      message: 'Life event deleted successfully',
    };
  }

  @Get('/employee/my-attendance')
  @ApiOperation({
    summary: 'Late and absent attendance for the logged-in employee',
  })
  async getMyAttendance() {
    const data = await this.hrManagementService.getMyLateAndAbsentAttendance();
    return {
      status: 'success',
      message: 'My attendance retrieved successfully',
      data,
    };
  }

  @Get('/employee/my-attendance-history')
  @ApiOperation({
    summary: 'Attendance history from emp_attendances for logged-in employee',
  })
  async getMyAttendanceHistory(@Query() query: any) {
    const result = await this.hrManagementService.getMyAttendanceHistory(query);
    return {
      status: 'success',
      message: 'My attendance history retrieved successfully',
      data: result,
    };
  }

  @Get('/employee/my-attendance-reconciliation')
  @ApiOperation({
    summary: 'Attendance reconciliation data for logged-in employee',
  })
  async getMyAttendanceReconciliation() {
    const data = await this.hrManagementService.getMyLateAndAbsentAttendance();
    return {
      status: 'success',
      message: 'My attendance reconciliation retrieved successfully',
      data,
    };
  }

  @Post('/employee/my-attendance-reconciliation')
  @ApiOperation({
    summary: 'Request reconciliation for own late or absent attendance',
  })
  async requestMyAttendanceReconciliation(
    @Body() dto: RequestMyAttendanceReconciliationDto,
  ) {
    const data =
      await this.hrManagementService.requestMyAttendanceReconciliation(dto);
    return {
      status: 'success',
      message: 'Attendance reconciliation request saved',
      data,
    };
  }

  // Create or update attendance reconciliation
  @Post('/employee/add-or-update-attendance-reconciliation')
  @ApiOperation({ summary: 'Add or update attendance reconciliation' })
  async createOrUpdateAttendanceReconciliation(
    @Body() dto: CreateAttendanceReconciliationDto,
  ) {
    const attendanceReconciliation =
      await this.hrManagementService.createOrUpdateAttendanceReconciliation(
        dto,
      );
    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'Attendance reconciliation updated successfully'
        : 'Attendance reconciliation created successfully',
      data: attendanceReconciliation,
    };
  }

  // Get all attendance reconciliations
  @Get('/employee/get-all-attendance-reconciliations')
  @ApiOperation({ summary: 'Get all attendance reconciliations' })
  @ApiResponse({
    status: 200,
    description: 'Attendance reconciliations retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search/filter parameters as JSON, e.g., { "empId": 1 }',
    example: '{ "empId": 1 }',
  })
  async findAllAttendanceReconciliations(@Query('params') params?: string) {
    const queryParams = params ? JSON.parse(params) : {};
    const attendanceReconciliations =
      await this.hrManagementService.findAllAttendanceReconciliations(
        queryParams,
      );
    return {
      status: 'success',
      message: 'Attendance reconciliations retrieved successfully',
      data: attendanceReconciliations,
    };
  }

  // Find attendance reconciliation by ID
  @Get('/employee/get-attendance-reconciliation-by-id/:id')
  @ApiOperation({ summary: 'Get attendance reconciliation by ID' })
  async findAttendanceReconciliationById(@Param('id') id: string) {
    const attendanceReconciliation =
      await this.hrManagementService.findAttendanceReconciliationById(+id);
    return {
      status: 'success',
      message: 'Attendance reconciliation retrieved successfully',
      data: attendanceReconciliation,
    };
  }

  // Delete attendance reconciliation by ID
  @Delete('/employee/delete-attendance-reconciliation-by-id/:id')
  @ApiOperation({ summary: 'Delete attendance reconciliation by ID' })
  async deleteAttendanceReconciliation(@Param('id') id: string) {
    await this.hrManagementService.deleteAttendanceReconciliation(+id);
    return {
      status: 'success',
      message: 'Attendance reconciliation deleted successfully',
    };
  }
  // Create or update visit application

  @Post('/employee/add-or-update-visit-application')
  @ApiOperation({ summary: 'Add or update visit application' })
  async createOrUpdateVisitApplication(@Body() dto: CreateVisitApplicationDto) {
    const visitApplication =
      await this.hrManagementService.createOrUpdateVisitApplication(dto);
    return {
      status: 'success',
      message: dto.hasOwnProperty('id')
        ? 'Visit application updated successfully'
        : 'Visit application created successfully',
      data: visitApplication,
    };
  }

  // Get all visit applications
  @Get('/employee/get-all-visitor-requests')
  @ApiOperation({ summary: 'Get all visitor requests' })
  @ApiResponse({
    status: 200,
    description: 'Visitor requests retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search/filter parameters as JSON, e.g., { "visitorEmpId": 1 }',
    example: '{ "visitorEmpId": 1 }',
  })
  async findAllVisitorRequests(@Req() req, @Query() query: any) {
    const queryParams = query?.params ? JSON.parse(query.params) : {};
    const visitApplications =
      await this.hrManagementService.findAllVisitorRequests(
        queryParams,
        query,
      );
    return {
      status: 'success',
      message: 'Visitor requests retrieved successfully',
      data: visitApplications.data,
      pagination: Helpers.makePaginationData(query, visitApplications),
    };
  }

  // Get all visit applications
  @Get('/employee/get-all-apply-for-visit')
  @ApiOperation({ summary: 'Get all visitor requests' })
  @ApiResponse({
    status: 200,
    description: 'Visitor requests retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search/filter parameters as JSON, e.g., { "visitorEmpId": 1 }',
    example: '{ "visitorEmpId": 1 }',
  })
  async findAllApplyForVisit(@Req() req, @Query() query: any) {
    const queryParams = query?.params ? JSON.parse(query.params) : {};
    const visitApplications =
      await this.hrManagementService.findAllApplyForVisit(queryParams, query);
    return {
      message: 'Visitor requests retrieved successfully',
      data: visitApplications.data,
      pagination: Helpers.makePaginationData(query, visitApplications),
    };
  }

  // Find visit application by ID
  @Get('/employee/get-visit-application-by-id/:id')
  @ApiOperation({ summary: 'Get visit application by ID' })
  async findVisitApplicationById(@Param('id') id: string) {
    const visitApplication =
      await this.hrManagementService.findVisitApplicationById(+id);
    return {
      status: 'success',
      message: 'Visit application retrieved successfully',
      data: visitApplication,
    };
  }
  // Delete visit application by ID
  @Delete('employee/delete-visit-application-by-id/:id')
  @ApiOperation({ summary: 'Delete visit application by ID' })
  async deleteVisitApplication(@Param('id') id: string) {
    await this.hrManagementService.deleteVisitApplication(+id);
    return {
      status: 'success',
      message: 'Visit application deleted successfully',
    };
  }

  @Post('/visit-application/update-visit-status')
  @ApiOperation({ summary: 'Update visit  Status' })
  async updateVisitorRequestStatus(@Body() dto: UpdateVisitStatusDto) {
    dto.timezone = tz.guess();
    const data = await this.hrManagementService.updateVisitStatus(dto);
    return {
      status: 'success',
      message: 'Visitor request status updated successfully',
      data,
    };
  }

  @Post('/visit-application/update-application-status')
  @ApiOperation({ summary: 'Update application  Status' })
  async updateApplicationStatus(@Body() dto: UpdateApplicationStatusDto) {
    const data = await this.hrManagementService.updateApplicationStatus(dto);
    return {
      status: 'success',
      message: 'Application status updated successfully',
      data,
    };
  }

  @Post('/visit-application/check-in-check-out')
  @ApiOperation({ summary: 'Visitor Check-In / Check-Out' })
  async checkInOut(@Req() req, @Body() dto: CheckInOutVisitorDto) {
    dto.timezone = tz.guess();
    const visitApplication =
      await this.hrManagementService.checkInOutVisitor(dto);

    return {
      status: 'success',
      message: 'Visitor check-in/check-out processed successfully',
      data: visitApplication,
    };
  }

  @Get('/get-all-visit-applications-stats')
  @ApiOperation({ summary: 'Get all Visit Applications' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Meeting" }',
    example: '{ "search": "Meeting" }',
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
  async findAllVisitApplicationStats(@Req() req, @Query() query: any) {
    const visits =
      await this.hrManagementService.findAllVisitApplicationStats(query);

    return {
      status: 'success',
      message: 'Visit applications retrieved successfully',
      data: visits.data,
      pagination: Helpers.makePaginationData(query, visits.data),
    };
  }

  @Get('/employee/get-dashboard-data/:id')
  @ApiOperation({ summary: 'Get complete employee dashboard overview' })
  async getEmployeeDashboard(@Param('id') id: number) {
    const data = await this.hrManagementService.getEmployeeDashboardStatus(id);

    return {
      status: 'success',
      message: 'Employee dashboard data retrieved successfully',
      data,
    };
  }

  @Get('/employee/my-dashboard-data')
  @ApiOperation({ summary: 'Get dashboard data for authenticated employee' })
  async getMyEmployeeDashboardStatus() {
    const data =
      await this.hrManagementService.getMyEmployeeDashboardStatus();
    return {
      status: 'success',
      message: 'Employee dashboard status fetched successfully',
      data,
    };
  }

  @Get('/employee/get-all-dashboard-data')
  async getAllEmployeeDashboardStatus() {
    const data = await this.hrManagementService.getAllEmployeeDashboardStatus();
    return {
      status: 'success',
      message: 'Employee dashboard status fetched successfully',
      data,
    };
  }

  @Get('employee/get-today-dashboard-data/:employeeId')
  @ApiOperation({ summary: 'Get today dashboard data for an employee' })
  async getEmployeeTodayDashboardData(@Param('employeeId') employeeId: number) {
    const data =
      await this.hrManagementService.getEmployeeTodayDashboard(employeeId);
    return {
      status: 'success',
      message: 'Today dashboard data retrieved successfully',
      data,
    };
  }

  @Post('/update-employee-office-info/:empId')
  async updateEmployeeOfficeInfo(
    @Param('empId', ParseIntPipe) empId: number,
    @Body() dto: UpdateEmployeeOfficeInfoDto,
  ) {
    const data = await this.hrManagementService.updateEmployeeOfficeInfo(
      empId,
      dto,
    );
    return {
      status: 'success',
      message: 'Employee office info updated successfully',
      data,
    };
  }

  @Get('/employee/get-my-leave-policy')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get my leave policy (allowed / used / remaining)',
    description:
      'Returns yearly leave allowance by leave type for the logged-in employee. Includes leaveOverview map and total totals.',
  })
  @ApiOkResponse({
    description: 'Leave policy retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Leave policy retrieved successfully',
        data: {
          leaveOverview: {
            'Annual Leave': { total: 14, used: 0, remaining: 14 },
            'Casual Leave': { total: 10, used: 1, remaining: 9 },
          },
          total: {
            totalLeave: 39,
            totalUsed: 2,
            totalRemaining: 37,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User or active app not found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getMyLeavePolicy() {
    const data = await this.hrManagementService.getMyLeavePolicy();

    return {
      status: 'success',
      message: 'Leave policy retrieved successfully',
      data,
    };
  }

  @Get('/employee/:empId/leave-balance')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Leave allowance, used, pending and remaining for one employee',
  })
  @ApiParam({ name: 'empId', type: Number })
  async getEmployeeLeaveBalance(@Param('empId') empId: string) {
    const data = await this.hrManagementService.getEmployeeLeaveBalance(+empId);
    return {
      status: 'success',
      message: 'Employee leave balance retrieved successfully',
      data,
    };
  }

  /** @deprecated alias — prefer /employee/get-my-leave-policy */
  @Get('/employee/my-leave-policy')
  @ApiTags('HR Leave Request')
  async getMyLeavePolicyAlias() {
    return this.getMyLeavePolicy();
  }

  @Get('/employee/get-my-today-dashboard-data')
  @ApiOperation({ summary: 'Get my today dashboard data' })
  async getMyTodayDashboardData() {
    const data = await this.hrManagementService.getMyTodayDashboardData();
    return {
      status: 'success',
      message: 'My dashboard data retrieved successfully',
      data,
    };
  }

  @Get('employee/get-employee-event-calendar/:employeeId')
  async getEmployeeHolidays(@Param('employeeId') employeeId: number) {
    const holidayEvents =
      await this.hrManagementService.getEmployeeEventCalendar(employeeId);

    return {
      success: true,
      data: holidayEvents,
    };
  }

  @Get('/employee/get-user-event-calendar')
  @ApiOperation({ summary: 'Get Employee Event Calendar (Logged In User)' })
  @ApiStandardResponses('Employee event calendar fetched successfully', 200)
  async getEmployeeEventCalendar() {
    const data = await this.hrManagementService.getMyEventCalendar();

    return {
      status: 'success',
      message: 'Employee event calendar fetched successfully',
      data,
    };
  }

  // Get all Employee reconciliations  records
  @Get('/employee/attendance/get-reconciliations')
  @ApiOperation({ summary: 'Get all attendance reconciliation records' })
  @ApiResponse({
    status: 200,
    description: 'Employee reconciliations retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search/filter parameters as JSON, e.g., { "search": "John" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit returned fields',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Pagination page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page' })
  async getEmployeeReconciliations(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.getEmployeeReconciliations(query);

    return {
      status: 'success',
      message: 'Employee attendance reconciliations retrieved successfully',
      data: queryResult,
      pagination: Helpers.makePaginationData(query, queryResult),
      //   summary: {
      //     checkIn: queryResult.checkInSummary,
      //     earlyLeave: queryResult.earlyLeaveSummary,
      //   },
      // };
    };
  }

  @Get('/attendance/get-monthly-attendance-summary')
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Employee name or code" }',
    example: '{ "search": "John" }',
  })
  @ApiOperation({ summary: 'Get monthly attendance summery for an employee' })
  async getEmployeeMontlyAttendanceSummery(@Query() query: any) {
    const data =
      await this.hrManagementService.getMonthlyAttendanceSummery(query);

    return {
      status: 'success',
      message: 'Monthly attendance retrieved successfully',
      data,
    };
  }

  @Post('/update-checkIn-reconciliation-status/:reconciliationId')
  async CheckInApproveReconciliation(
    @Param('reconciliationId', ParseIntPipe) reconciliationId: number,
    @Body() body: CheckInApproveReconciliationDto,
  ) {
    // const { inTimeSupervisorRemarks, inTimeStatusId } = body;
    body.reconciliationId = reconciliationId;

    const result =
      await this.hrManagementService.CheckInApproveReconciliation(body);

    return {
      status: 'success',
      data: result,
    };
  }

  @Post('/update-checkOut-reconciliation-status/:reconciliationId')
  async checkOutApproveReconciliation(
    @Param('reconciliationId', ParseIntPipe) reconciliationId: number,
    @Body() body: CheckOutApproveReconciliationDto,
  ) {
    const { outTimeSupervisorRemarks, outTimeStatusId } = body;

    const result = await this.hrManagementService.checkOutApproveReconciliation(
      reconciliationId,
      outTimeStatusId,
      outTimeSupervisorRemarks,
    );

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/attendance/get-monthly-attendance-summary-list')
  @ApiOperation({ summary: 'Get monthly attendance summary' })
  @ApiResponse({
    status: 200,
    description: 'Monthly attendance summary retrieved successfully',
    type: Object,
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "search": "Employee name or code" }',
    example: '{ "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, employeeName:asc',
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
  async getMonthlyAttendanceSummary(@Query() queryString: any) {
    const result =
      await this.hrManagementService.getMonthlyAttendanceSummary(queryString);

    return {
      message: 'Monthly attendance summary retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(queryString, result),
    };
  }

  @Get('/get-yearly-leave-summary-list')
  @ApiOperation({ summary: 'Get yearly leave summary report' })
  @ApiResponse({
    status: 200,
    description: 'Yearly leave summary retrieved successfully',
    type: Object,
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "year": 2026, "search": "Employee name or code" }',
    example: '{ "year": 2026, "search": "John" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, employeeName:asc',
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
  async getYearlyLeaveSummary(@Query() queryString: any) {
    const result =
      await this.hrManagementService.getYearlyLeaveSummary(queryString);

    return {
      message: 'Yearly leave summary retrieved successfully',
      data: result.data,
      pagination: Helpers.makePaginationData(queryString, result),
    };
  }

  @Get('/get-leave-types')
  @ApiTags('HR Leave Request')
  @ApiOperation({
    summary: 'Get leave types list (dropdown)',
    description:
      'Returns leave types for the logged-in user active app. Used by Request Leave form Leave Type dropdown.',
  })
  @ApiOkResponse({
    description: 'Leave types retrieved successfully',
    schema: {
      example: {
        message: 'Leave types retrieved successfully',
        data: [
          {
            id: 1,
            name: 'Annual Leave',
            isPaid: true,
            maxDaysPerYear: 14,
          },
        ],
      },
    },
  })
  async getLeaveTypes() {
    const result = await this.hrManagementService.getLeaveTypes();

    return {
      message: 'Leave types retrieved successfully',
      data: result,
    };
  }

  @Post('/attendance/add-or-update-event')
  @ApiOperation({ summary: 'Add or Update Event' })
  async addOrUpdateEvent(@Body() dto: CreateEventDto, @Req() req) {
    const event = await this.hrManagementService.CreateOrUpdateEvent(dto);

    return {
      status: 'success',
      message: `Event ${dto.id ? 'updated' : 'added'} successfully`,
      data: event,
    };
  }

  // Get all Events
  @Get('/attendance/get-all-events')
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Meeting" }',
    example: '{ "search": "Meeting" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., startDatetime:desc, title:asc',
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
  async getAllEvents(@Query() query: any) {
    const queryResult = await this.hrManagementService.findAllEvents(query);

    return {
      message: 'Events retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Event by ID
  @Get('/attendance/event-by-id/:id')
  @ApiOperation({ summary: 'Get event by ID' })
  async getEventById(@Param('id') id: string) {
    const event = await this.hrManagementService.findEventById(+id);
    return {
      status: 'success',
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  // Delete Event
  @Delete('/attendance/delete-event/:id')
  @ApiOperation({ summary: 'Delete event by ID' })
  async deleteEvent(@Param('id') id: string) {
    await this.hrManagementService.deleteEvent(+id);
    return {
      status: 'success',
      message: 'Event deleted successfully',
    };
  }

  // Add or Update Event Attendee
  @Post('/attendance/add-or-update-attendee')
  @ApiOperation({ summary: 'Add or Update Event Attendee' })
  async addOrUpdateEventAttendee(
    @Body() dto: CreateEventAttendeeDto,
    @Req() req,
  ) {
    const attendee =
      await this.hrManagementService.createOrUpdateEventAttendee(dto);

    return {
      status: 'success',
      message: `Event Attendee ${dto.id ? 'updated' : 'added'} successfully`,
      data: attendee,
    };
  }

  // Get all Event Attendees
  @Get('/attendance/get-all-attendees')
  @ApiOperation({ summary: 'Get all event attendees' })
  @ApiResponse({
    status: 200,
    description: 'Event attendees retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "employeeId": 1, "eventId": 5 }',
    example: '{ "employeeId": 1, "eventId": 5 }',
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
  async getAllEventAttendees(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEventAttendees(query);

    return {
      message: 'Event attendees retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  // Get Event Attendee by ID
  @Get('/attendance/attendee-by-id/:id')
  @ApiOperation({ summary: 'Get event attendee by ID' })
  async getEventAttendeeById(@Param('id') id: string) {
    const attendee = await this.hrManagementService.findEventAttendeeById(+id);
    return {
      status: 'success',
      message: 'Event attendee retrieved successfully',
      data: attendee,
    };
  }

  // Delete Event Attendee
  @Delete('/attendance/delete-attendee/:id')
  @ApiOperation({ summary: 'Delete event attendee by ID' })
  async deleteEventAttendee(@Param('id') id: string) {
    await this.hrManagementService.deleteEventAttendee(+id);
    return {
      status: 'success',
      message: 'Event attendee deleted successfully',
    };
  }

  // Get Upcoming Events by Employee ID
  @Get('/attendance/upcoming-events/:employeeId')
  @ApiOperation({ summary: 'Get upcoming events for an employee' })
  async getUpcomingEvents(@Param('employeeId') employeeId: string) {
    const events =
      await this.hrManagementService.getUpcomingEvents(+employeeId);
    return {
      status: 'success',
      message: 'Upcoming events retrieved successfully',
      data: events,
    };
  }

  @Get('/attendance/my-upcoming-events')
  @ApiOperation({ summary: 'Get upcoming events for the logged-in employee' })
  async getMyUpcomingEvents() {
    const events = await this.hrManagementService.getMyUpcomingEvents();

    return {
      status: 'success',
      message: 'Upcoming events retrieved successfully',
      data: events,
    };
  }

  @Get('/employee/get-all-upcoming-events')
  @ApiOperation({ summary: 'Get All Employee Upcoming Events' })
  @ApiStandardResponses('Employee upcoming events fetched successfully', 200)
  async getAllEmployeeUpcomingEvents() {
    const data = await this.hrManagementService.getAllEmployeeUpcomingEvents();

    return {
      status: 'success',
      message: 'Employee upcoming events fetched successfully',
      data,
    };
  }

  // get log-in user experience

  @Get('/employee/total-experience-and-promotion')
  @ApiOperation({ summary: 'Get total experience of the logged-in user' })
  async getTotalExperienceAndPromotion() {
    const totalExperience =
      await this.hrManagementService.getTotalExperienceAndPromotion();

    return {
      status: 'success',
      message: 'Total experience retrieved successfully',
      data: totalExperience,
    };
  }

  @Get('/employee/attendance-and-leave-summary-log-in-user')
  @ApiOperation({
    summary: 'Get attendance and leave summary for logged-in user',
  })
  async getAttendanceAndLeaveSummaryForLoggedInUser() {
    const summary =
      await this.hrManagementService.getMyAttendanceAndLeaveSummary();

    return {
      status: 'success',
      message: 'Attendance and leave summary retrieved successfully',
      data: summary,
    };
  }

  @Get('/employee/total-experience-and-promotion-by-employeeId/:employeeId')
  @ApiOperation({
    summary: 'Get total experience and promotion for a specific employee',
  })
  async getEmployeeTotalExperience(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const totalExperience =
      await this.hrManagementService.getEmployeeTotalExperienceAndPromotion(
        employeeId,
      );

    return {
      status: 'success',
      message:
        'Total experience and promotion for employee retrieved successfully',
      data: totalExperience,
    };
  }

  @Get('/employee/attendance-and-leave-summary/:employeeId')
  @ApiOperation({
    summary: 'Get attendance and leave summary for a specific employee',
  })
  async getEmployeeAttendanceAndLeaveSummary(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const summary =
      await this.hrManagementService.getEmployeeAttendanceAndLeaveSummary(
        employeeId,
      );

    return {
      status: 'success',
      message:
        'Attendance and leave summary for employee retrieved successfully',
      data: summary,
    };
  }

  // Get all calendar events (holidays, leaves, birthdays, office weekends)
  @Get('/calendar/get-all-events')
  @ApiOperation({ summary: 'Get all calendar events' })
  @ApiResponse({
    status: 200,
    description: 'Calendar events retrieved successfully',
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Holiday" }',
    example: '{ "search": "Holiday" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., date:asc, title:desc',
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
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Employee ID for employee-specific events',
  })
  async getAllCalendarEvents(
    @Query() query: any,
    @Query('employeeId') employeeId?: number, // optional for employee-specific events
  ) {
    const queryResult = await this.hrManagementService.getAllEventCalendar(
      query,
      employeeId,
    );

    return {
      message: 'Calendar events retrieved successfully',
      data: queryResult.data,
    };
  }

  @Post('/income-tax-tier/add-or-update')
  @ApiOperation({ summary: 'Add or Update Employee Income Tax Tier' })
  async addOrUpdateIncomeTaxTier(@Body() dto: CreateEmpIncomeTaxTierDto) {
    const data =
      await this.hrManagementService.createOrUpdateEmpIncomeTaxTier(dto);

    return {
      status: 'success',
      message: `Income Tax Tier ${dto.id ? 'updated' : 'created'} successfully`,
      data,
    };
  }
  @Get('/income-tax-tier/get-all-list')
  @ApiOperation({ summary: 'Get All Employee Income Tax Tier' })
  async getAllIncomeTaxTiers(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEmpIncomeTaxTiers();

    return {
      message: 'Employee income tax tiers retrieved successfully',
      data: queryResult,
    };
  }

  @Get('/income-tax-tier-by-id/:id')
  @ApiOperation({ summary: 'Get employee income tax tier by ID' })
  async getIncomeTaxTierById(@Param('id') id: string) {
    const data = await this.hrManagementService.findEmpIncomeTaxTierById(+id);
    return {
      status: 'success',
      message: 'Employee income tax tier retrieved successfully',
      data,
    };
  }

  @Delete('/delete-income-tax-tier/:id')
  @ApiOperation({ summary: 'Delete employee income tax tier by ID' })
  async deleteIncomeTaxTier(@Param('id') id: string) {
    const data = await this.hrManagementService.deleteEmpIncomeTaxTier(+id);
    return {
      status: 'success',
      message: 'Employee income tax tier deleted successfully',
      data,
    };
  }

  @Patch('/income-tax-tier/toggle-active/:id')
  @ApiOperation({ summary: 'Change active status of employee income tax tier' })
  async toggleActive(@Param('id') id: string) {
    const data = await this.hrManagementService.changeActiveStatus(+id);

    return {
      status: 'success',
      message: 'Income tax tier active status updated successfully',
      data,
    };
  }

  @Post('/employee-salary-change-type/add-or-update')
  @ApiOperation({ summary: 'Add or Update Employee salary change type' })
  async createOrUpdateEmpSalaryChangeType(
    @Body() dto: CreateEmpSalaryChangeTypeDto,
  ) {
    const data =
      await this.hrManagementService.createOrUpdateEmpSalaryChangeType(dto);

    return {
      status: 'success',
      message: `Employee salary change type ${dto.id ? 'updated' : 'created'} successfully`,
      data,
    };
  }
  @Get('/employee-salary-change-type/get-all-list')
  @ApiOperation({ summary: 'Get All Employee Salary Change Type' })
  async findAllEmpSalaryChangeTypes(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllEmpSalaryChangeTypes();

    return {
      message: 'Employee salary change types retrieved successfully',
      data: queryResult,
    };
  }

  @Get('/employee-salary-change-type-by-id/:id')
  @ApiOperation({ summary: 'Get employee salary change type by ID' })
  async findEmpSalaryChangeTypeById(@Param('id') id: string) {
    const data =
      await this.hrManagementService.findEmpSalaryChangeTypeById(+id);
    return {
      status: 'success',
      message: 'Employee salary change type retrieved successfully',
      data,
    };
  }

  @Delete('/delete-employee-salary-change-type/:id')
  @ApiOperation({ summary: 'Delete employee salary change type by ID' })
  async deleteEmpSalaryChangeType(@Param('id') id: string) {
    const data = await this.hrManagementService.deleteEmpSalaryChangeType(+id);
    return {
      status: 'success',
      message: 'Employee salary change type deleted successfully',
      data,
    };
  }

  @Patch('/change-employee-salary-change-type-active-status/:id')
  @ApiOperation({
    summary: 'Change active status of employee salary change type',
  })
  async changeEmpSalaryChangeTypeActiveStatus(@Param('id') id: string) {
    const data =
      await this.hrManagementService.changeEmpSalaryChangeTypeActiveStatus(+id);

    return {
      status: 'success',
      message: 'Employee salary change type active status updated successfully',
      data,
    };
  }

  @Post('/add-or-update-late-attendance-rule')
  @ApiOperation({ summary: 'Add or Update Late Attendance Rule' })
  async addOrUpdateLateAttendanceRule(
    @Body() dto: CreateLateAttendanceRuleDto,
  ) {
    const rule =
      await this.hrManagementService.createOrUpdateLateAttendanceRule(dto);

    return {
      status: 'success',
      message: `Late attendance rule ${
        dto.id ? 'updated' : 'added'
      } successfully`,
      data: rule,
    };
  }

  @Get('/get-all-late-attendance-rules')
  @ApiOperation({ summary: 'Get all late attendance rules' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "officeId": 1 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, minLateMinutes:asc',
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
  async getAllLateAttendanceRules(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllLateAttendanceRules(query);

    return {
      status: 'success',
      message: 'Late attendance rules retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-late-attendance-rule-by-id/:id')
  @ApiOperation({ summary: 'Get late attendance rule by ID' })
  async getLateAttendanceRuleById(@Param('id') id: string) {
    const rule = await this.hrManagementService.getLateAttendanceRuleById(+id);

    return {
      status: 'success',
      message: 'Late attendance rule retrieved successfully',
      data: rule,
    };
  }

  @Delete('/delete-late-attendance-rule-by-id/:id')
  @ApiOperation({ summary: 'Delete late attendance rule by ID' })
  async deleteLateAttendanceRule(@Param('id') id: string) {
    await this.hrManagementService.deleteLateAttendanceRule(+id);

    return {
      status: 'success',
      message: 'Late attendance rule deleted successfully',
    };
  }

  //active toggle

  @Patch('/change-late-attendance-rule-active-status/:id')
  @ApiOperation({ summary: 'Change active status of late attendance rule' })
  async toggleLateAttendanceRuleActiveStatus(@Param('id') id: string) {
    await this.hrManagementService.toggleLateAttendanceRuleActiveStatus(+id);

    return {
      status: 'success',
      message: 'Late attendance rule active status updated successfully',
    };
  }

  @Patch('/change-late-attendance-rule-absent-status/:id')
  @ApiOperation({ summary: 'Change absent status of late attendance rule' })
  async toggleLateAttendanceRuleAbsentStatus(@Param('id') id: string) {
    await this.hrManagementService.toggleLateAttendanceRuleAbsentStatus(+id);

    return {
      status: 'success',
      message: 'Late attendance rule active status updated successfully',
    };
  }

  @Get('/employee/generate-code')
  @ApiOperation({ summary: 'Generate Unique Employee Code for Company' })
  async generateEmployeeCode() {
    const data = await this.hrManagementService.generateEmployeeCode();

    return {
      status: 'success',
      message: 'Employee code generated successfully',
      data,
    };
  }

  @Post('/employee/add-new-employee')
  @ApiOperation({ summary: 'Add New Employee' })
  async addNewEmployee(@Body() dto: CreateNewEmployeeDto) {
    const data = await this.hrManagementService.addNewEmployee(dto);

    return {
      status: 'success',
      message: `New Employee ${data.id ? 'updated' : 'added'} successfully`,
      data,
    };
  }

  @Post('/master-documents/add-or-update')
  @ApiOperation({ summary: 'Add or Update Master Document' })
  async addOrUpdateMasterDocument(@Body() dto: CreateMasterDocumentDto) {
    const document =
      await this.hrManagementService.createOrUpdateMasterDocument(dto);

    return {
      status: 'success',
      message: `Master document ${dto.id ? 'updated' : 'added'} successfully`,
      data: document,
    };
  }

  @Get('/master-documents/get-all')
  @ApiOperation({ summary: 'Get all master documents' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters, e.g., { "documentTypeId": 1, "isActive": true }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, documentName:asc',
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
  async getAllMasterDocuments(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllMasterDocuments(query);

    return {
      status: 'success',
      message: 'Master documents retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/master-documents/get-by-id/:id')
  @ApiOperation({ summary: 'Get master document by ID' })
  async getMasterDocumentById(@Param('id') id: string) {
    const document = await this.hrManagementService.getMasterDocumentById(+id);

    return {
      status: 'success',
      message: 'Master document retrieved successfully',
      data: document,
    };
  }

  @Delete('/master-documents/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete master document by ID' })
  async deleteMasterDocument(@Param('id') id: string) {
    await this.hrManagementService.deleteMasterDocument(+id);

    return {
      status: 'success',
      message: 'Master document deleted successfully',
    };
  }

  //active toggle
  @Patch('/master-documents/change-active-status/:id')
  @ApiOperation({ summary: 'Change active status of master document' })
  async toggleMasterDocumentActiveStatus(@Param('id') id: string) {
    await this.hrManagementService.toggleMasterDocumentActiveStatus(+id);

    return {
      status: 'success',
      message: 'Master document active status updated successfully',
    };
  }

  @Get('/master-documents/get-all-without-pagination')
  @ApiOperation({ summary: 'Get all master documents without pagination' })
  async findAllMasterDocumentsWithoutPagination(): Promise<{
    status: string;
    message: string;
    data: MasterDocument[];
  }> {
    const data =
      await this.hrManagementService.findAllMasterDocumentsWithoutPagination();
    return {
      status: 'success',
      message: 'Master documents retrieved successfully',
      data,
    };
  }

  @Post('/company-documents/add-or-update-company-document')
  @ApiOperation({ summary: 'Add or Update Company Document' })
  async addOrUpdateCompanyDocument(@Body() dto: CreateCompanyDocumentDto) {
    const document =
      await this.hrManagementService.createOrUpdateCompanyDocument(dto);

    return {
      status: 'success',
      message: `Company document ${dto.id ? 'updated' : 'added'} successfully`,
      data: document,
    };
  }

  @Get('/company-documents/get-all')
  @ApiOperation({ summary: 'Get all company documents' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description: 'Search parameters, e.g., { "documentTypeId": 1 }',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllCompanyDocuments(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findAllCompanyDocuments(query);

    return {
      status: 'success',
      message: 'Company documents retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/company-documents/get-all-without-pagination')
  @ApiOperation({ summary: 'Get all company documents without pagination' })
  async findAllCompanyDocumentsWithoutPagination(): Promise<{
    status: string;
    message: string;
    data: CompanyDocument[];
  }> {
    const data =
      await this.hrManagementService.findAllCompanyDocumentsWithoutPagination();
    return {
      status: 'success',
      message: 'Company documents retrieved successfully',
      data,
    };
  }

  @Get('/company-documents/get-by-id/:id')
  @ApiOperation({ summary: 'Get company document by ID' })
  async getCompanyDocumentById(@Param('id') id: string) {
    const document = await this.hrManagementService.getCompanyDocumentById(+id);

    return {
      status: 'success',
      message: 'Company document retrieved successfully',
      data: document,
    };
  }

  @Delete('/company-documents/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete company document by ID' })
  async deleteCompanyDocument(@Param('id') id: string) {
    await this.hrManagementService.deleteCompanyDocument(+id);

    return {
      status: 'success',
      message: 'Company document deleted successfully',
    };
  }

  //active toggle
  @Patch('/company-documents/change-active-status/:id')
  @ApiOperation({ summary: 'Change active status of company document' })
  async toggleCompanyDocumentActiveStatus(@Param('id') id: string) {
    await this.hrManagementService.toggleCompanyDocumentActiveStatus(+id);

    return {
      status: 'success',
      message: 'Company document active status updated successfully',
    };
  }

  @Post('/company-documents/import-all-master-documents-to-company-documents')
  @ApiOperation({
    summary: 'Import all active master documents to company documents',
  })
  async importAllMasterDocuments() {
    const count =
      await this.hrManagementService.importAllMasterDocumentsToCompanyDocuments();

    return {
      status: 'success',
      message: `${count} master documents imported to company documents successfully`,
    };
  }

  @Post('/company-documents/import-master-documents-to-company-documents')
  @ApiOperation({
    summary: 'Import selected master documents to company documents',
  })
  async importSelectedMasterDocuments(@Body() dto: ImportMasterDocumentsDto) {
    const result =
      await this.hrManagementService.importSelectedMasterDocuments(dto);

    return {
      statusCode: 201,
      message: `${result.importedCount} master documents imported to company documents successfully`,
      data: { status: 'success' },
      pagination: null,
    };
  }

  @Post('/company-document-records/add-or-update')
  @UseInterceptors(FileInterceptor('documentFile'))
  @ApiOperation({ summary: 'Add Company Document Record' })
  @ApiStandardResponses(' Company document updated successfully', 200)
  @ApiBody({
    type: CreateCompanyDocRecordDto,
    description: 'Data for creating or updating a company document record',
  })
  async createOrUpdateUserCompanyDocumentRecords(
    @UploadedFile() documentFile: Express.Multer.File,
    @Body() dto: CreateCompanyDocRecordDto,
  ) {
    Helpers.validateFile(documentFile, ALLOWED_IMAGE_AND_DOCUMENT_TYPES);
    dto.documentFile = documentFile; // Attach the uploaded file to the DTO
    const document =
      await this.hrManagementService.createOrUpdateUserCompanyDocumentRecords(
        dto,
      );

    return {
      message: `Company document record successfully`,
      data: document,
    };
  }

  @Post('/company-document-records/add-or-update-multiple-files')
  @UseInterceptors(FilesInterceptor('documentFiles'))
  @ApiOperation({ summary: 'Add Company Document Record' })
  @ApiStandardResponses('Company document records processed successfully', 200)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentFiles: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple document files (PDF, DOC, images, etc.)',
        },

        companyDocumentId: { type: 'number' },
        documentTypeId: { type: 'number' },
        entityId: { type: 'number' },
        entity: { type: 'string' },
        issueDate: { type: 'string', format: 'date' },
        expiredDate: { type: 'string', format: 'date' },
      },
    },
  })
  async updateUserCompanyDocumentRecords(
    @UploadedFiles() documentFiles: Express.Multer.File[],
    @Body() dto: CreateCompanyDocRecordMultipleFilesDto,
  ) {
    // Validate each uploaded file individually (only image/pdf up to 2MB)
    if (!documentFiles || documentFiles.length === 0) {
      throw new BadRequestException('At least one document file is required');
    }
    const ALLOWED_IMAGE_AND_PDF_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    const MAX_DOC_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    for (const file of documentFiles) {
      Helpers.validateFile(file, ALLOWED_IMAGE_AND_PDF_TYPES, MAX_DOC_FILE_SIZE);
    }

    dto.documentFiles = documentFiles;

    const document =
      await this.hrManagementService.updateUserCompanyDocumentRecords(dto);

    return {
      message: `Company document records updated successfully`,
      data: document,
    };
  }

  @Post('/company-document-records/add-or-update/:employee_id')
  @UseInterceptors(FileInterceptor('documentFile'))
  @ApiOperation({ summary: 'Add Company Document Record' })
  @ApiStandardResponses('Profile picture updated successfully', 200)
  @ApiBody({
    type: CreateCompanyDocRecordDto,
    description: 'Data for creating or updating a company document record',
  })
  async createOrUpdateUserCompanyDocumentRecordsWithEmpId(
    @UploadedFile() documentFile: Express.Multer.File,
    @Param('employee_id') employee_id: string,
    @Body() dto: CreateCompanyDocRecordDto,
  ) {
    Helpers.validateFile(documentFile, ALLOWED_IMAGE_AND_DOCUMENT_TYPES);
    dto.documentFile = documentFile; // Attach the uploaded file to the DTO
    const document =
      await this.hrManagementService.createOrUpdateUserCompanyDocumentRecordsWithEmpId(
        dto,
        employee_id,
      );

    return {
      message: `Company document record successfully`,
      data: document,
    };
  }

  @Get('/company-document-records/get-all')
  @ApiOperation({ summary: 'Get all company document records' })
  async getUserAllCompanyDocumentRecords(@Query() query: any) {
    const queryResult =
      await this.hrManagementService.findUserAllCompanyDocumentRecords(query);

    return {
      message: 'Company document records retrieved successfully',
      data: queryResult,
    };
  }

  @Get('/company-document-records/get-all/:employeeId')
  @ApiOperation({
    summary: 'Get all company document records for a specific employee',
  })
  async getEmployeeAllCompanyDocumentRecords(
    @Query() query: any,
    @Param('employeeId') employeeId: string,
  ) {
    const queryResult =
      await this.hrManagementService.getEmployeeAllCompanyDocumentRecords(
        +employeeId,
      );

    return {
      message: 'Company document records retrieved successfully',
      data: queryResult,
    };
  }

  @Delete('/company-document-records/delete-by-id/:id')
  @ApiOperation({ summary: 'Delete company document record by ID' })
  async deleteCompanyDocumentRecord(@Param('id') id: string) {
    await this.hrManagementService.deleteCompanyDocumentRecord(+id);

    return {
      message: 'Company document record deleted successfully',
    };
  }

  @Get('/get-employee-assets-list/:employeeId')
  async getEmployeeAssets(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.hrManagementService.getEmployeeAssets(employeeId);

    return {
      status: 'success',
      message: 'Employee asset list retrieved successfully',
      data,
    };
  }

  @Get('/get-my-assets')
  async getMyAssets() {
    const data = await this.hrManagementService.getMyAssets();

    return {
      status: 'success',
      message: 'My asset list retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-work-experiences/:employeeId')
  async getEmployeeWorkExperiences(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data =
      await this.hrManagementService.getEmployeeWorkExperiences(employeeId);

    return {
      status: 'success',
      message: 'Work experiences retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-educations/:employeeId')
  async getEmployeeEducations(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data =
      await this.hrManagementService.getEmployeeEducations(employeeId);

    return {
      status: 'success',
      message: 'Educations retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-certifications/:employeeId')
  async getEmployeeCertifications(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data =
      await this.hrManagementService.getEmployeeCertifications(employeeId);

    return {
      status: 'success',
      message: 'Certifications retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-skills/:employeeId')
  async getEmployeeSkills(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.hrManagementService.getEmployeeSkills(employeeId);

    return {
      status: 'success',
      message: 'Skills retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-projects/:employeeId')
  async getEmployeeProjects(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.hrManagementService.getEmployeeProjects(employeeId);

    return {
      status: 'success',
      message: 'Skills retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-training/:employeeId')
  async getEmployeeTraining(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.hrManagementService.getEmployeeTraining(employeeId);

    return {
      status: 'success',
      message: 'Training retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-references/:employeeId')
  async getEmployeeReferences(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data =
      await this.hrManagementService.getEmployeeReferences(employeeId);

    return {
      status: 'success',
      message: 'References retrieved successfully',
      data,
    };
  }

  @Get('/get-employee-details/:employeeId')
  async getEmployeeDetails(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const data = await this.hrManagementService.getEmployeeDetails(employeeId);

    return {
      status: 'success',
      message: 'Employee details retrieved successfully',
      data,
    };
  }

  @Post('/employee/update-personal-information/:id')
  @ApiOperation({ summary: 'Update Employee Personal Information' })
  @ApiStandardResponses(
    'Employee personal information updated successfully',
    200,
  )
  async updateEmployeePersonalInformation(
    @Param('id') id: string,
    @Body() userBasicInfoDto: UpdateUserPersonalInfoDto,
  ) {
    const data =
      await this.hrManagementService.updateEmployeePersonalInformation(
        Number(id),
        userBasicInfoDto,
      );

    return {
      status: 'success',
      message: 'Employee personal information updated successfully',
      data,
    };
  }

  @Post('/update-my-personal-information')
  async updateMyPersonalInformation(
    @Req() req: any,
    @Body() dto: UpdateUserPersonalInfoDto,
  ) {
    const userId = req.user?.id;

    return this.hrManagementService.updateMyPersonalInformation(userId, dto);
  }

  @Post('/employee/update-employee-details/:id')
  @ApiOperation({ summary: 'Update Employee Details' })
  @ApiStandardResponses('Employee details updated successfully', 200)
  async updateEmployeeDetails(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDetailsDto,
  ) {
    const data = await this.hrManagementService.updateEmployeeDetails(
      Number(id),
      dto,
    );

    return {
      message: 'Employee details updated successfully',
      data,
    };
  }

  @Post('/employee/update-employee-profile-picture/:id')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiOperation({ summary: 'Update Employee Profile Picture by employee ID' })
  @ApiStandardResponses('Employee profile picture updated successfully', 200)
  async updateEmployeeProfilePicture(
    @Param('id') id: string,
    @UploadedFile() profilePic: Express.Multer.File,
    @Req() req,
  ) {
    const user: User = req.user;
    Helpers.validateFile(profilePic, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

    const queryResult =
      await this.hrManagementService.updateEmployeeProfilePicture(
        Number(id),
        profilePic,
      );

    return {
      status: 'success',
      message: `Employee profile picture updated successfully`,
      data: queryResult,
    };
  }

  @Get('/employee/my-summary')
  @ApiOperation({ summary: 'Get Logged In Employee Summary' })
  @ApiStandardResponses('Employee summary fetched successfully', 200)
  async getLoggedInEmployeeSummary() {
    const data = await this.hrManagementService.getLoggedInEmployeeSummary();

    return {
      status: 'success',
      message: 'Employee summary fetched successfully',
      data,
    };
  }

  @Get('/get-all-employee-hierarchies-with-subordinates')
  @ApiOperation({ summary: 'Get all employee hierarchies with subordinates' })
  async getAllEmployeeHierarchies() {
    const data =
      await this.hrManagementService.findAllEmployeeHierarchiesWithSubordinates();

    return {
      status: 'success',
      message: 'Employee hierarchies with subordinates retrieved successfully',
      data,
    };
  }

  @Delete('/delete-company-document-records/:id')
  @ApiOperation({ summary: 'Delete Company Document Record' })
  @ApiParam({ name: 'id', type: Number })
  async deleteCompanyDocumentsRecords(@Param('id') id: number) {
    const result =
      await this.hrManagementService.deleteCompanyDocumentRecords(id);

    return {
      message: 'Company document record deleted successfully',
      data: result,
    };
  }

  @Delete(
    '/delete-company-document-records-by-company-document/:companyDocumentId',
  )
  @ApiOperation({ summary: 'Delete all records of a company document' })
  async deleteByCompanyDocument(
    @Param('companyDocumentId') companyDocumentId: number,
  ) {
    const result =
      await this.hrManagementService.deleteByCompanyDocument(companyDocumentId);

    return {
      message: 'All records of the company document deleted successfully',
      data: result,
    };
  }
}
