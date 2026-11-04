import { UserContactInfo } from './../users/entities/user-contact-info.entity';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
  Req,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CreateHrManagementDto } from './dto/create-hr-management.dto';
import { UpdateHrManagementDto } from './dto/update-hr-management.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayOverlap,
  Between,
  DataSource,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { RolePermissionService } from '@module/role-permission/role-permission.service';
import { UseCase, User } from '@module/users/entities/user.entity';
import { Office } from '../hr-management/entities/office.entity';
import { CreateOfficeDto } from '../hr-management/dto/office.dto';
import { UserContextService } from '@module/auth/user-context.service';
import { HelperService } from '@common/helpers/helper.service';
import { OfficeShift } from './entities/office-shift.entity';
import { v4 as uuidv4 } from 'uuid';

import { OfficeWeekend } from './entities/office-weekends.entity';
import {
  CreateOfficeWeekendDto,
  OfficeWeekendResponseDto,
} from './dto/office-weekends.dto';
import { JobScreening } from './entities/job-screenings.entity';
import {
  CreateJobScreeningDto,
  JobScreeningResponseDto,
} from './dto/job-screenings.dto';
import { JobPosting } from './entities/job-posting.entity';
import {
  CreateJobPostingDto,
  JobPostingResponseDto,
} from './dto/job-posting.dto';
import { JobPosition } from './entities/job-position.entity';
import {
  CreateJobPositionDto,
  JobPositionResponseDto,
  UpdateJobPositionDto,
} from './dto/job-position.dto';
import { JobApplicantScreening } from './entities/job-applicant-screening.entity';
import {
  CreateJobApplicantScreeningDto,
  JobApplicantScreeningResponseDto,
} from './dto/job-applicant-screening.dto';
import { JobApplicant } from './entities/job-applicant.entity';
import { CreateJobApplicantDto } from './dto/job-applicant.dto';
import { JobOffer } from './entities/job-offer.entity';
import { CreateJobOfferDto } from './dto/job-offer.dto';
import { JobScreeningMap } from './entities/job-screenings-map.entity';
import { CreateJobScreeningMapDto } from './dto/job-screening-map.dto';
import { JobInterview } from './entities/job-interviews.entity';
import { CreateJobInterviewDto } from './dto/job-interviews.dto';
import { JobInterviewer } from './entities/job-interviewers.entity';
import { CreateJobInterviewersDto } from './dto/job-interviewers.dto';
import { JobInterviewFeedback } from './entities/job-interview-feedback.entity';
import { CreateJobInterviewFeedbackDto } from './dto/job-interview-feedback.dto';
import { Status } from '@module/status/entities/status.entity';
import { CreateLeadGroupDto } from './dto/lead-groups.dto';
import { LeadGroups } from './entities/lead-groups.entity';
import { LeadStage } from './entities/lead-stages.entity';
import {
  CreateLeadStageDto,
  LeadStageResponseDto,
} from './dto/lead-stages.dto';
import { JobRecruitmentDto } from './dto/job-recruitment.dto';
import { APIFeatures } from '@core/utils/apiFeatures';
import { PersonalNote } from './entities/personal-notes.entity';
import {
  CreatePersonalNoteDto,
  UpdatePersonalNoteDto,
} from './dto/personal-notes.dto';
import { Notice } from './entities/notices.entity';
import { CreateNoticeDto, NoticeResponseDto } from './dto/notices.dto';
import { Employee } from './entities/employees.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDetailsDto,
  UpdateEmployeeOfficeInfoDto,
  UpdateEmployeeStatusDto,
} from './dto/employees.dto';
import { EmpLeaveType } from './entities/employee-leaves-type.entity';
import { CreateEmpLeaveTypeDto } from './dto/employee-leaves-type.dto';
import { EmpLeaveRequest } from './entities/employee-leave-request.entity';
import {
  CreateEmpLeaveRequestDto,
  EmpLeaveRequestResponseDto,
  UpdateEmpLeaveRequestDto,
  UpdateLeaveRequestDto,
} from './dto/employee-leave-request.dto';
import { EmpInvitation } from './entities/employee-invitations.entity';
import {
  AcceptInvitationDto,
  CreateEmpInvitationDto,
  EmpInvitationResponseDto,
  UpdateEmpInvitationStatusDto,
} from './dto/employee-invitation.dto';
import { EmpAttendance } from './entities/employee-attendance.entity';
import {
  CreateCheckInDto,
  CreateCheckOutDto,
  EmpAttendanceResponseDto,
  RequestForRemovingLateCountDto,
} from './dto/employee-attendance.dto';
import {
  CreateOfficeShiftDto,
  OfficeShiftResponseDto,
} from './dto/office-shift.dto';
import { UAParser } from 'ua-parser-js';
import { AppUser } from '@module/users/entities/app-user.entity';
import { AddressService } from '@module/address/address.service';
import { Address } from '@module/address/entities/address.entity';
import { Helpers } from '@core/utils/helpers';
import { Designation } from '@module/application/entities/designations.entity';
import { Requisition, RequisitionType } from './entities/requisitions.entity';
import {
  CreateRequisitionDto,
  UpdateRequisitionStatusDto,
} from './dto/requisitions.dto';
import { Department } from '@module/application/entities/departments.entity';
import { CreateAddressDoc } from '@module/address/dto/create-address.dto';
import { parse, join } from 'path';
import { domainToASCII } from 'url';
import { EmployeeAsset } from './entities/employee-assets.entity';
import {
  CreateEmployeeAssetDto,
  UpdateEmployeeAssetStatusDto,
} from './dto/employee-assets.dto';
import { CreateAssetTypeDto } from './dto/asset-types.dto';
import { AssetType } from './entities/asset-types.entity';
import { CompanyAssetType } from './entities/company-asset-types.entity';
import { CreateCompanyAssetTypeDto, ImportAssetTypesDto } from './dto/asset-types.dto';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { CreateLeadPipelineDto } from './dto/lead-pipelines.dto';
import { LeadPipeline } from './entities/lead-pipelines.entity';
import { Leads } from './entities/leads.entity';
// import { CreateLeadDto } from './dto/leads.dto';
import { UsersService } from '@module/users/users.service';
import { CacheService } from 'src/redis/cache.service';
import { RequestContext } from '@common/request-context';
import { MailService } from 'src/mail/mail.service';
import { nullable } from 'zod';
import {
  DashboardResponseDto,
  RequisitionInfo,
} from './dto/dashboard-response';
import { count } from 'console';
import * as moment from 'moment';
import { HybridQueueService } from 'src/queue/hybrid-queue.service';
import { MediaService } from '@module/media/media.service';
import { CreateHolidayDto, HolidayResponseDto } from './dto/holiday.dto';
import { Holiday } from './entities/holiday.entity';
import { CreateAppHolidayDto } from './dto/app-holidays.dto';
import { AppHoliday } from './entities/app-holidays.entity';
import { AppHolidayDate } from './entities/app-holiday-dates.entity';
import { CreateAppHolidayDateDto } from './dto/app-holiday-dates.dto';
import { title } from 'process';
import { LoginResponseDto } from '@module/auth/dto/login-response-dto';
import { UserWorkExperience } from '@module/users/entities/user-work-experience.entity';
import { UserSkill } from '@module/users/entities/user-skill.entity';
import { UserEducation } from '@module/users/entities/user-education.entity';
import { UserCertification } from '@module/users/entities/user-certification.entity';
import { UserProject } from '@module/users/entities/user-project.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UserLanguageProficiency } from '@module/users/entities/user-language-proficiency.entity';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { Country } from '@module/country/entities/country.entity';
import { UserReference } from '@module/users/entities/user-reference.entity';
import { CreateEmployeeHierarchyDto } from './dto/employee-hierarchy.dto';
import { EmployeeHierarchy } from './entities/employee-hierarchy.entity';
import { CreateLifeEventDto } from './dto/life-events.dto';
import { LifeEvent } from './entities/life-events.entity';
import {
  CheckInApproveReconciliationDto,
  CheckOutApproveReconciliationDto,
  CreateAttendanceReconciliationDto,
} from './dto/Attendance-reconciliation.dto';

import { AttendanceReconciliation } from './entities/Attendance-reconciliation.entity';
import {
  CheckInOutVisitorDto,
  CreateVisitApplicationDto,
  UpdateApplicationStatusDto,
  UpdateVisitorCheckTimeDto,
  UpdateVisitStatusDto,
} from './dto/visit-applications.dto';
import { VisitApplication } from './entities/visit-applications.entity';
import { dsnToString } from '@sentry/core';
import { CreateEventDto } from './dto/events.dto';
import { Event } from './entities/events.entity';
import { EventAttendee } from './entities/event-attendees.entity';
import { CreateEventAttendeeDto } from './dto/event-attendees.dto';
import { EmpSalaryGrade } from '@module/payroll/entities/employee-salary-grades.entity';
import { EmpIncomeTaxTier } from './entities/employee-income-tax-tiers.entity';
import { CreateEmpIncomeTaxTierDto } from './dto/employee-income-tax-tiers.dto';
import { CreateEmpSalaryChangeTypeDto } from './dto/employee-salary-change-types.dto';
import { EmpSalaryChangeType } from './entities/employee-salary-change-types.entity';
import { NotificationGateway } from '@core/guards/notification.gateway';
import { CreateLateAttendanceRuleDto } from './dto/late-attendance-rules.dto';
import { LateAttendanceRule } from './entities/late-attendance-rules.entity';
import { CreateNewEmployeeDto } from './dto/create-employee.dto';
import { EmpLateCounter } from './entities/employee-late-counters.entity';
import { EmpAttendancePenalty } from './entities/emp-attendance-penalties.entity';
import * as bcrypt from 'bcrypt';
import { Application } from '@module/application/entities/application.entity';
import {
  CreateMasterDocumentDto,
  ImportMasterDocumentsDto,
} from './dto/master-documents.dto';
import { MasterDocument } from './entities/master-documents.entity';
import { CompanyDocumentRecords } from './entities/company-document-records.entity';
import {
  CreateCompanyDocRecordDto,
  CreateCompanyDocRecordMultipleFilesDto,
  FindCompanyDocRecordDto,
} from './dto/company-doc-record.dto';
import { CompanyDocument } from './entities/company-documents.entity';
import { CreateCompanyDocumentDto } from './dto/company-documents.dto';
import { CreateUserDto } from '@module/users/dto/user.dto';
import { NotificationResponseDto } from '@module/users/dto/notification.dto';
import { UpdateUserPersonalInfoDto } from '@module/users/dto/update-user-personal-info.dto';
import { PasswordReset } from '@module/auth/entites/password_reset.entity';
import { randomBytes } from 'crypto';
import { Session } from 'inspector/promises';

@Injectable()
export class HrManagementService implements OnModuleInit {
  private readonly logger = new Logger(HrManagementService.name);

  async onModuleInit() {
    try {
      const singleUniqueIndexes: Array<{ Key_name: string }> =
        await this.dataSource.query(`
          SELECT DISTINCT Key_name
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'employees'
            AND COLUMN_NAME = 'employee_code'
            AND NON_UNIQUE = 0
            AND Key_name != 'PRIMARY'
        `);

      for (const idx of singleUniqueIndexes) {
        if (idx.Key_name !== 'UQ_EMPLOYEES_APP_CODE') {
          try {
            await this.dataSource.query(
              `ALTER TABLE \`employees\` DROP INDEX \`${idx.Key_name}\``,
            );
          } catch (err) {}
        }
      }

      const existingComposite: Array<any> = await this.dataSource.query(`
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'employees'
          AND INDEX_NAME = 'UQ_EMPLOYEES_APP_CODE'
        LIMIT 1
      `);

      if (!existingComposite || existingComposite.length === 0) {
        await this.dataSource.query(`
          CREATE UNIQUE INDEX \`UQ_EMPLOYEES_APP_CODE\`
          ON \`employees\` (\`app_id\`, \`employee_code\`)
        `);
      }
    } catch (err: any) {
      this.logger.warn(
        'Could not auto-verify UQ_EMPLOYEES_APP_CODE index: ' + err?.message,
      );
    }
  }

  constructor(
    @InjectRepository(Office)
    private readonly officeRepo: Repository<Office>,
    @InjectRepository(OfficeShift)
    private readonly officeShiftRepo: Repository<OfficeShift>,
    @InjectRepository(OfficeWeekend)
    private readonly officeWeekendRepo: Repository<OfficeWeekend>,
    @InjectRepository(JobScreening)
    private readonly jobScreeningRepo: Repository<JobScreening>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(JobPosition)
    private readonly jobPositionRepo: Repository<JobPosition>,
    @InjectRepository(JobApplicantScreening)
    private readonly jobApplicantScreeningRepo: Repository<JobApplicantScreening>,
    @InjectRepository(JobApplicant)
    private readonly jobApplicantRepo: Repository<JobApplicant>,
    @InjectRepository(JobOffer)
    private readonly jobOfferRepo: Repository<JobOffer>,
    @InjectRepository(JobScreeningMap)
    private readonly jobScreeningMapRepo: Repository<JobScreeningMap>,
    @InjectRepository(JobInterview)
    private readonly jobInterviewRepo: Repository<JobInterview>,
    @InjectRepository(JobInterviewer)
    private readonly jobInterviewerRepo: Repository<JobInterviewer>,
    @InjectRepository(JobInterviewFeedback)
    private readonly JobInterviewFeedbackRepo: Repository<JobInterviewFeedback>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    private readonly jwtService: JwtService,

    @InjectRepository(UserReference)
    private readonly userReferenceRepo: Repository<UserReference>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    private readonly rolePermissionService: RolePermissionService,

    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(AppHoliday)
    private readonly appHolidayRepo: Repository<AppHoliday>,

    @InjectRepository(LeadGroups)
    private readonly leadGroupsRepo: Repository<LeadGroups>,
    @InjectRepository(LeadStage)
    private readonly leadStagesRepo: Repository<LeadStage>,
    @InjectRepository(LeadPipeline)
    private readonly leadPipelineRepo: Repository<LeadPipeline>,

    @InjectRepository(Leads)
    private readonly leadsRepo: Repository<Leads>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserContactInfo)
    private readonly userContactInfoRepo: Repository<UserContactInfo>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(UserLanguageProficiency)
    private readonly userLanguageProficiencyRepo: Repository<UserLanguageProficiency>,

    @InjectRepository(UserWorkExperience)
    private readonly userWorkExperienceRepo: Repository<UserWorkExperience>,

    @InjectRepository(UserSkill)
    private readonly userSkillRepo: Repository<UserSkill>,

    @InjectRepository(UserEducation)
    private readonly userEducationRepo: Repository<UserEducation>,

    @InjectRepository(UserCertification)
    private readonly certificationRepo: Repository<UserCertification>,

    @InjectRepository(UserProject)
    private readonly userProjectRepo: Repository<UserProject>,

    @InjectRepository(UserTraining)
    private readonly userTrainingRepo: Repository<UserTraining>,

    @InjectRepository(PersonalNote)
    private readonly personalNotesRepo: Repository<PersonalNote>,
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(EmpLeaveType)
    private readonly empLeaveTypeRepo: Repository<EmpLeaveType>,
    @InjectRepository(EmpLeaveRequest)
    private readonly empLeaveRequestRepo: Repository<EmpLeaveRequest>,
    @InjectRepository(EmpInvitation)
    private readonly empInvitationRepo: Repository<EmpInvitation>,
    @InjectRepository(EmpAttendance)
    private readonly empAttendanceRepo: Repository<EmpAttendance>,
    @InjectRepository(Requisition)
    private readonly requisitionRepo: Repository<Requisition>,
    @InjectRepository(AssetType)
    private readonly assetTypeRepo: Repository<AssetType>,
    @InjectRepository(CompanyAssetType)
    private readonly companyAssetTypeRepo: Repository<CompanyAssetType>,
    @InjectRepository(EmployeeAsset)
    private readonly employeeAssetRepo: Repository<EmployeeAsset>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,

    @InjectRepository(AppHolidayDate)
    private readonly appHolidayDateRepo: Repository<AppHolidayDate>,

    @InjectRepository(EmployeeHierarchy)
    private readonly employeeHierarchyRepo: Repository<EmployeeHierarchy>,

    @InjectRepository(LifeEvent)
    private readonly lifeEventRepo: Repository<LifeEvent>,

    @InjectRepository(AttendanceReconciliation)
    private readonly attendanceReconciliationRepo: Repository<AttendanceReconciliation>,

    @InjectRepository(VisitApplication)
    private readonly visitApplicationRepo: Repository<VisitApplication>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(EmpIncomeTaxTier)
    private readonly empIncomeTaxTierRepo: Repository<EmpIncomeTaxTier>,

    @InjectRepository(EventAttendee)
    private readonly attendeeRepo: Repository<EventAttendee>,

    @InjectRepository(EmpSalaryGrade)
    private readonly empSalaryGradeRepo: Repository<EmpSalaryGrade>,

    @InjectRepository(EmpSalaryChangeType)
    private readonly empSalaryChangeTypeRepo: Repository<EmpSalaryChangeType>,

    @InjectRepository(LateAttendanceRule)
    private readonly lateAttendanceRuleRepo: Repository<LateAttendanceRule>,

    @InjectRepository(EmpLateCounter)
    private readonly empLateCounterRepo: Repository<EmpLateCounter>,

    @InjectRepository(EmpAttendancePenalty)
    private readonly empAttendancePenaltyRepo: Repository<EmpAttendancePenalty>,

    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    @InjectRepository(MasterDocument)
    private readonly masterDocumentRepo: Repository<MasterDocument>,

    @InjectRepository(CompanyDocumentRecords)
    private readonly companyDocumentRecordsRepo: Repository<CompanyDocumentRecords>,
    @InjectRepository(CompanyDocument)
    private readonly companyDocumentRepo: Repository<CompanyDocument>,

    private readonly userContextService: UserContextService,
    private readonly commonDao: HelperService,
    private readonly addressService: AddressService,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly mailService: MailService,
    private readonly hybridQueue: HybridQueueService,
    private readonly mediaService: MediaService,
    private readonly notificationGateway: NotificationGateway,
    private readonly dataSource: DataSource,
  ) {}

  //   async createOrUpdateOffice(dto: CreateOfficeDto): Promise<Office> {
  //     const userId = RequestContext.get('userId');

  //     // Get the app user
  //     const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //     if (!appUser) throw new NotFoundException('App User not found');

  //     dto.appId = appUser.appId ?? undefined;
  //     if (!dto.typeId) dto.typeId = 124; // head office id

  //     dto.creatorId = userId;

  //     let office: any;

  //     if (dto.id) {
  //       // Updating existing office
  //       office = await this.officeRepo.findOne({ where: { id: dto.id } });
  //       if (!office)
  //         throw new NotFoundException(`Office with ID ${dto.id} not found`);
  //     } else {
  //       if (dto.typeId === 124) {
  //   const existingHeadOffice = await this.officeRepo.findOne({
  //     where: {
  //       typeId: 124,
  //       appId: dto.appId,
  //     },
  //   });

  //   if (existingHeadOffice) {
  //     throw new BadRequestException('Head office already exists');
  //   }
  // }

  //       office = this.officeRepo.create();
  //     }
  //     this.officeRepo.merge(office, dto);

  //     // Save office
  //     const savedOffice = await this.officeRepo.save(office);

  //     // create or update Office Address
  //     if (savedOffice.addressId) {
  //       await this.addressService.update(savedOffice.addressId, dto.address);
  //     } else {
  //       const address = await this.addressService.create(dto.address);

  //       await this.officeRepo.update(savedOffice.id, { addressId: address.id });
  //       savedOffice.addressId = address.id;
  //     }

  //     await this.deleteOfficeShiftByOfficeId(savedOffice.id);

  //     if (dto.officeShifts) {
  //       for (const shift of dto.officeShifts) {
  //         shift.officeId = savedOffice.id;
  //         await this.createOrUpdateOfficeShift(shift);
  //       }
  //     }

  //     const updatedOffice = await this.officeRepo.findOne({
  //       where: { id: savedOffice.id },
  //       relations: ['address.country'],
  //     });

  //     if (!updatedOffice) {
  //       throw new NotFoundException(`Office with ID ${savedOffice.id} not found`);
  //     }

  //     return updatedOffice;
  //   }

  async createOrUpdateOffice(dto: CreateOfficeDto): Promise<Office> {
    const userId = RequestContext.get('userId');

    // Get the app user
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId ?? undefined;
    if (!dto.typeId) dto.typeId = 124; // head office id

    dto.creatorId = userId;

    let office: any;

    if (dto.id) {
      if (dto.typeId === 124) {
        const existingHeadOffice = await this.officeRepo.findOne({
          where: {
            typeId: 124,
            appId: dto.appId,
          },
        });

        if (existingHeadOffice && existingHeadOffice.id !== dto.id) {
          throw new BadRequestException('Head office already exists');
        }
      }

      office = await this.officeRepo.findOne({ where: { id: dto.id } });
      if (!office)
        throw new NotFoundException(`Office with ID ${dto.id} not found`);
    } else {
      if (dto.typeId === 124) {
        const existingHeadOffice = await this.officeRepo.findOne({
          where: {
            typeId: 124,
            appId: dto.appId,
          },
        });

        if (existingHeadOffice) {
          throw new BadRequestException('Head office already exists');
        }
      }

      // Creating new office
      office = this.officeRepo.create();
    }

    this.officeRepo.merge(office, dto);

    // Save office
    const savedOffice = await this.officeRepo.save(office);

    // create or update Office Address
    if (savedOffice.addressId) {
      await this.addressService.update(savedOffice.addressId, dto.address);
    } else {
      const address = await this.addressService.create(dto.address);

      await this.officeRepo.update(savedOffice.id, { addressId: address.id });
      savedOffice.addressId = address.id;
    }

    await this.deleteOfficeShiftByOfficeId(savedOffice.id);

    if (dto.officeShifts) {
      for (const shift of dto.officeShifts) {
        shift.officeId = savedOffice.id;
        await this.createOrUpdateOfficeShift(shift);
      }
    }

    const updatedOffice = await this.officeRepo.findOne({
      where: { id: savedOffice.id },
      relations: ['address.country'],
    });

    if (!updatedOffice) {
      throw new NotFoundException(`Office with ID ${savedOffice.id} not found`);
    }

    return updatedOffice;
  }

  async findAllOffices(
    queryString: any,
  ): Promise<{ data: Office[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    const query = this.officeRepo.createQueryBuilder('office');

    // query.leftJoinAndMapOne(
    //   'office.weekend',
    //   'office_weekends',
    //   'weekend',
    //   'weekend.office_id = office.id AND weekend.app_id = :appId',
    //   { appId },
    // );

    query.leftJoinAndSelect('office.officeShifts', 'officeShifts');
    query.leftJoinAndSelect('office.officeWeekends', 'officeWeekends');
    query.leftJoinAndSelect('office.address', 'address');
    query.leftJoin('address.country', 'country');
    query.leftJoin('office.officeType', 'status');
    query.leftJoin('office.manager', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');
    query.leftJoin('profile.phoneCountry', 'phoneCountry');

    query.addSelect([
      'user.firstName',
      'user.lastName',
      'user.id',
      'profile.phone',
      'profile.phoneCountryId',
      'profile.profilePictureId',
      'profilePicture.id',
      'profilePicture.filename',
      'phoneCountry.callingCode',
      'status.name',
      'status.code',
      'country.name',

      // 'officeWeekends.shiftId',
      // 'officeWeekends.saturday',
      // 'officeWeekends.sunday',
      // 'officeWeekends.monday',
      // 'officeWeekends.tuesday',
      // 'officeWeekends.wednesday',
      // 'officeWeekends.thursday',
      // 'officeWeekends.friday',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('office.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(office.name LIKE :search
      OR address.email LIKE :search
      OR address.phone LIKE :search
      OR address.address LIKE :search
      OR address.city LIKE :search
      OR country.name LIKE :search
      OR address.postalCode LIKE :search)
      `,
        { search },
      );
    }

    if (params.timezone) {
      query.andWhere('office.timezone = :timezone', {
        timezone: params.timezone,
      });
    }
    if (params.typeId) {
      query.andWhere('office.typeId = :typeId', { typeId: params.typeId });
    }

    if (params.addressType) {
      query.andWhere('address.addressType = :addressType', {
        addressType: params.addressType,
      });
    }

    if (params.countryId) {
      query.andWhere('address.countryId = :countryId', {
        countryId: params.countryId,
      });
    }

    if (params.managerId) {
      query.andWhere('office.managerId = :managerId', {
        managerId: params.managerId,
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    const data = featureData.map((office: any) => {
      const holidaysSet = new Set<string>();

      // Prefer office-level weekend (where shiftId is null) if present, otherwise fallback
      const officeWeekendsList = office.officeWeekends || [];
      const officeLevel = officeWeekendsList.filter((w: any) => !w.shiftId);
      const targetWeekends = officeLevel.length > 0 ? officeLevel : officeWeekendsList;

      targetWeekends.forEach((w: any) => {
        if (w.saturday) holidaysSet.add('Saturday');
        if (w.sunday) holidaysSet.add('Sunday');
        if (w.monday) holidaysSet.add('Monday');
        if (w.tuesday) holidaysSet.add('Tuesday');
        if (w.wednesday) holidaysSet.add('Wednesday');
        if (w.thursday) holidaysSet.add('Thursday');
        if (w.friday) holidaysSet.add('Friday');
      });

      const orderedDays = [
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ];

      office.officeWeekends = orderedDays.filter((day) => holidaysSet.has(day));

      return office;
    });

    return { data, total };
  }

  async getOfficeList(): Promise<CommonResponseDto[]> {
    const appUser = await this.appUserRepo.findOne({
      where: { userId: this.userContextService.getUserId() },
    });

    const appId = RequestContext.get('activeAppId');

    if (!appUser) throw new NotFoundException('App User not found');

    const offices = await this.officeRepo.find({
      where: { appId: appId },
      order: { name: 'ASC' },
      relations: ['officeShifts'],
      select: ['id', 'name', 'hasShift', 'officeShifts'],
    });

    return offices.map((item) => ({
      value: item.id,
      label: item.name,
      hasShift: item.hasShift,
      officeShifts: item.officeShifts,
    }));
  }

  async findOfficeById(id: number): Promise<Office> {
    const office = await this.officeRepo.findOne({ where: { id } });
    if (!office) throw new NotFoundException(`Office with ID ${id} not found`);
    return office;
  }

  async deleteOffice(id: number): Promise<void> {
    const result = await this.officeRepo.softDelete(id);
    if (result.affected === 0) {
      const hardResult = await this.officeRepo.delete(id);
      if (hardResult.affected === 0) {
        throw new NotFoundException(`Office with ID ${id} not found`);
      }
    }
  }

  async changeOfficeActiveStatus(id: number): Promise<Office> {
    const office = await this.officeRepo.findOne({ where: { id } });
    if (!office) throw new NotFoundException(`Office with ID ${id} not found`);

    office['active'] = !office['active'];
    return this.officeRepo.save(office);
  }

  async createOrUpdateOfficeShift(
    dto: CreateOfficeShiftDto,
  ): Promise<OfficeShiftResponseDto> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    return this.dataSource.transaction(async (manager) => {
      const officeShiftRepo = manager.getRepository(OfficeShift);
      const officeRepo = manager.getRepository(Office);
      const officeWeekendRepo = manager.getRepository(OfficeWeekend);

      dto.appId = appId;

      let shift: OfficeShift;

      console.log('dto.id------>', dto.id);

      if (dto.id) {
        const found = await officeShiftRepo.findOne({
          where: { id: dto.id },
          relations: ['office'],
        });

        console.log('found------>', found);
        if (!found) {
          throw new NotFoundException(
            `OfficeShift with ID ${dto.id} not found`,
          );
        }

        shift = found;
        officeShiftRepo.merge(shift, dto);
      } else {
        const { id, ...rest } = dto;
        shift = officeShiftRepo.create(rest);
      }

      shift.appId = appId;

      if (shift.officeId) {
        const office = await officeRepo.findOne({
          where: { id: shift.officeId, appId: shift.appId as number },
        });

        if (!office) {
          throw new NotFoundException(
            `Office with ID ${shift.officeId} not found for this app`,
          );
        }

        shift.office = office;
      } else if (shift.appId) {
        const office = await officeRepo.findOne({
          where: { appId: shift.appId },
        });
        if (office) {
          shift.office = office;
          shift.officeId = office.id;
        }
      }

      const saved = await officeShiftRepo.save(shift);
      console.log('Saved----->', saved);

      if (!saved.officeId) {
        throw new BadRequestException('OfficeId is required to set weekend');
      }

      const defaultWeekend = {
        saturday: 1,
        sunday: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 1,
      };

      const weekendProvided =
        dto.weekend && Object.keys(dto.weekend).length > 0;

      const [findOffice, weekendRowExisting] = await Promise.all([
        officeRepo.findOne({
          where: { id: saved.officeId ?? undefined, appId },
        }),
        officeWeekendRepo.findOne({
          where: { appId, officeId: saved.officeId, shiftId: saved.id },
        }),
      ]);

      if (findOffice) {
        if (!findOffice.hasShift) {
          findOffice.hasShift = true;
          await officeRepo.save(findOffice);
        }
      } else {
        await officeRepo.update(
          { id: saved.officeId as number, appId },
          { hasShift: true },
        );
      }

      let weekendRow = weekendRowExisting;

      if (!weekendRow) {
        weekendRow = officeWeekendRepo.create({
          appId,
          officeId: saved.officeId,
          shiftId: saved.id,
          ...(weekendProvided
            ? {
                saturday: dto.weekend?.saturday ? 1 : 0,
                sunday: dto.weekend?.sunday ? 1 : 0,
                monday: dto.weekend?.monday ? 1 : 0,
                tuesday: dto.weekend?.tuesday ? 1 : 0,
                wednesday: dto.weekend?.wednesday ? 1 : 0,
                thursday: dto.weekend?.thursday ? 1 : 0,
                friday: dto.weekend?.friday ? 1 : 0,
              }
            : defaultWeekend),
        });

        await officeWeekendRepo.save(weekendRow);
      } else {
        if (weekendProvided) {
          weekendRow.saturday = dto.weekend?.saturday ? 1 : 0;
          weekendRow.sunday = dto.weekend?.sunday ? 1 : 0;
          weekendRow.monday = dto.weekend?.monday ? 1 : 0;
          weekendRow.tuesday = dto.weekend?.tuesday ? 1 : 0;
          weekendRow.wednesday = dto.weekend?.wednesday ? 1 : 0;
          weekendRow.thursday = dto.weekend?.thursday ? 1 : 0;
          weekendRow.friday = dto.weekend?.friday ? 1 : 0;

          await officeWeekendRepo.save(weekendRow);
        }
      }

      const weekendResponse = weekendRow
        ? {
            saturday: !!weekendRow.saturday,
            sunday: !!weekendRow.sunday,
            monday: !!weekendRow.monday,
            tuesday: !!weekendRow.tuesday,
            wednesday: !!weekendRow.wednesday,
            thursday: !!weekendRow.thursday,
            friday: !!weekendRow.friday,
          }
        : {
            saturday: true,
            sunday: false,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: true,
          };

      return {
        ...OfficeShiftResponseDto.fromEntity(saved),
        weekend: weekendResponse,
      };
    });
  }

  // Find all shifts
  async findAllOfficeShifts(
    queryString: any,
  ): Promise<{ data: OfficeShiftResponseDto[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    const appId = RequestContext.get('activeAppId');

    if (!appUser) throw new NotFoundException('App User not found');
    const query = this.officeShiftRepo.createQueryBuilder('shift');

    query.leftJoinAndSelect('shift.office', 'office');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('shift.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    // Example search: by office name or shift name
    if (params.search) {
      query.andWhere(`office.name LIKE :search OR shift.name LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    // Get paginated & filtered data
    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findOfficeShiftById(id: number): Promise<OfficeShiftResponseDto> {
    const shift = await this.officeShiftRepo.findOne({
      where: { id },
      relations: ['office'],
    });

    if (!shift)
      throw new NotFoundException(`OfficeShift with ID ${id} not found`);

    return OfficeShiftResponseDto.fromEntity(shift);
  }

  // Delete shift
  async deleteOfficeShift(id: number): Promise<void> {
    const officeShift = await this.officeShiftRepo.findOne({
      where: { id },
      select: ['id', 'officeId'],
    });

    if (!officeShift)
      throw new NotFoundException(`OfficeShift with ID ${id} not found`);

    if (!officeShift.officeId)
      throw new BadRequestException(`OfficeShift ${id} has no officeId`);

    await this.officeShiftRepo.delete(id);

    const remainingShiftCount = await this.officeShiftRepo.count({
      where: { officeId: officeShift.officeId },
    });

    if (remainingShiftCount === 0) {
      await this.officeRepo.update(officeShift.officeId, { hasShift: false });
    }
  }

  // Delete shift
  async deleteOfficeShiftByOfficeId(officeId: number): Promise<void> {
    const result = await this.officeShiftRepo.delete({ officeId: officeId });
    // if (result.affected === 0)
    //   throw new NotFoundException(`OfficeShift with Office ID ${officeId} not found`);
  }

  // Find all officesShift

  async findAllOfficesShiftByOfficeId(
    id: string,
  ): Promise<OfficeShiftResponseDto[]> {
    const officeShift = await this.officeShiftRepo.find({
      where: { officeId: parseInt(id) },
      order: { id: 'DESC' },
    });

    const officeWeekends = await this.officeWeekendRepo.find({
      where: { officeId: parseInt(id) },
    });

    const response = officeShift.map((data) => {
      const dto = OfficeShiftResponseDto.fromEntity(data);

      const weekend = officeWeekends.find((w) => w.shiftId === data.id);

      return {
        ...dto,
        weekends: weekend || null,
      };
    });

    return response;
  }

  //Office Weekend Methods
  async createOrUpdateOfficeWeekend(dto: CreateOfficeWeekendDto, user?: User) {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new BadRequestException('App User not found');

    dto.appId = appId;

    let weekend: OfficeWeekend;
    if (dto.id) {
      const found = await this.officeWeekendRepo.findOne({
        where: { id: dto.id },
      });
      if (!found)
        throw new NotFoundException(
          `OfficeWeekend with ID ${dto.id} not found`,
        );
      weekend = found;
      this.officeWeekendRepo.merge(weekend, dto);
    } else {
      const whereCondition: any = {
        appId: dto.appId,
        officeId: dto.officeId,
      };
      if (dto.shiftId) {
        whereCondition.shiftId = dto.shiftId;
      } else {
        whereCondition.shiftId = IsNull();
      }

      const existing = await this.officeWeekendRepo.findOne({
        where: whereCondition,
      });

      if (existing) {
        weekend = existing;
        this.officeWeekendRepo.merge(weekend, dto);
      } else {
        weekend = this.officeWeekendRepo.create(dto);
      }
    }

    if (dto.officeId) {
      const office = await this.officeRepo.findOne({
        where: { id: dto.officeId },
      });

      if (office) {
        weekend.office = office;
        weekend.officeId = office.id;
      }
    }

    if (dto.shiftId) {
      const shift = await this.officeShiftRepo.findOne({
        where: { id: dto.shiftId },
      });
      if (shift) {
        weekend.shift = shift;
        weekend.shiftId = shift.id;
      } else {
        weekend.shift = null;
        weekend.shiftId = null;
      }
    } else {
      weekend.shift = null;
      weekend.shiftId = null;
    }

    const saved = await this.officeWeekendRepo.save(weekend);
    return OfficeWeekendResponseDto.fromEntity(saved);
  }

  // Find all weekends
  async findAllOfficeWeekends(
    queryString: any,
  ): Promise<{ data: OfficeWeekendResponseDto[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    const query = this.officeWeekendRepo.createQueryBuilder('weekend');

    query.leftJoinAndSelect('weekend.office', 'office');
    query.leftJoinAndSelect('weekend.shift', 'shift');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('weekend.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`office.name LIKE :search OR weekend.id LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    const featureData = await features.getQuery().getMany();

    const transformedData = featureData.map(
      OfficeWeekendResponseDto.fromEntity,
    );
    const total = await query.getCount();

    return { data: transformedData, total };

    //return { data: featureData, total };
  }

  // Find weekend by ID
  async findOfficeWeekendById(id: number): Promise<OfficeWeekendResponseDto> {
    const weekend = await this.officeWeekendRepo.findOne({
      where: { id },
      relations: ['office'],
    });

    if (!weekend)
      throw new NotFoundException(`OfficeWeekend with ID ${id} not found`);

    if (weekend.office) {
      weekend.officeInfo = { name: weekend.office.name };
    }

    return OfficeWeekendResponseDto.fromEntity(weekend);
  }

  // Delete weekend
  async deleteOfficeWeekend(id: number): Promise<void> {
    const result = await this.officeWeekendRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`OfficeWeekend with ID ${id} not found`);
  }

  // Job Screening Methods
  async createOrUpdateJobScreening(
    dto: CreateJobScreeningDto,
  ): Promise<JobScreening> {
    let jobScreening: JobScreening;
    if (dto.id) {
      const found = await this.jobScreeningRepo.findOne({
        where: { id: dto.id },
      });

      if (!found)
        throw new NotFoundException(`JobScreening with ID ${dto.id} not found`);
      jobScreening = found;
      this.jobScreeningRepo.merge(jobScreening, dto);
    } else {
      jobScreening = this.jobScreeningRepo.create({ ...dto });
    }

    return await this.jobScreeningRepo.save(jobScreening);
  }

  async findAllJobScreenings(
    queryString: any,
  ): Promise<{ data: JobScreeningResponseDto[]; total: number }> {
    const query = this.jobScreeningRepo.createQueryBuilder('screening');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`screening.name LIKE :search `, {
        search: `%${params.search.trim()}%`,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findJobScreeningById(id: number): Promise<JobScreening> {
    const jobScreening = await this.jobScreeningRepo.findOne({ where: { id } });
    if (!jobScreening) {
      throw new NotFoundException(`JobScreening with ID ${id} not found`);
    }
    return jobScreening;
  }

  async deleteJobScreening(id: number): Promise<void> {
    const result = await this.jobScreeningRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`JobScreening with ID ${id} not found`);
    }
  }

  async changeJobScreeningActiveStatus(id: number): Promise<JobScreening> {
    const jobScreening = await this.findJobScreeningById(id);
    jobScreening.active = !jobScreening.active;
    return this.jobScreeningRepo.save(jobScreening);
  }

  //  async createOrUpdateOfficeWeekend(dto: CreateOfficeWeekendDto, user?: User) {
  //   const userId = RequestContext.get('userId');

  //   const appUser = await this.appUserRepo.findOne({ where: { userId } });
  //   if (!appUser) throw new NotFoundException('App User not found');

  //   dto.appId = appUser.appId ?? undefined;

  //   let weekend: OfficeWeekend;
  //   if (dto.id) {
  //     const found = await this.officeWeekendRepo.findOne({
  //       where: { id: dto.id },
  //     });
  //     if (!found)
  //       throw new NotFoundException(
  //         `OfficeWeekend with ID ${dto.id} not found`,
  //       );
  //     weekend = found;
  //     this.officeWeekendRepo.merge(weekend, dto);
  //   } else {
  //     weekend = this.officeWeekendRepo.create(dto);
  //   }

  //   if (dto.officeId) {
  //     const office = await this.officeRepo.findOne({
  //       where: { id: dto.officeId },
  //     });

  //     if (office) {
  //       weekend.office = office;
  //       weekend.officeId = office.id;
  //     }
  //   } else if (dto.appId) {
  //     const office = await this.officeRepo.findOne({
  //       where: { appId: dto.appId },
  //     });
  //     if (office) {
  //       weekend.office = office;
  //       weekend.officeId = office.id;
  //     } else {
  //       throw new NotFoundException('Office not found');
  //     }
  //   }

  //   const saved = await this.officeWeekendRepo.save(weekend);
  //   return OfficeWeekendResponseDto.fromEntity(saved);
  // }

  async createOrUpdateJobPosting(
    dto: CreateJobPostingDto,
  ): Promise<JobPosting> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let jobPosting: JobPosting;

    if (dto.id) {
      const found = await this.jobPostingRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(`JobPosting with ID ${dto.id} not found`);
      }
      jobPosting = found;

      this.jobPostingRepo.merge(jobPosting, dto);

      jobPosting.publishedBy = userId;
    } else {
      jobPosting = this.jobPostingRepo.create({
        ...dto,
        jobVacancy: dto.jobVacancy ?? 0,
        publishedBy: userId,
        viewsCount: 0,
      });
    }

    return await this.jobPostingRepo.save(jobPosting);
  }

  async JobPostingIncrementViews(id: number): Promise<JobPosting> {
    const posting = await this.findJobPostingById(id);
    posting.viewsCount = (posting.viewsCount || 0) + 1;
    return await this.jobPostingRepo.save(posting);
  }

  // Get all Job Postings
  async findAllJobPostings(
    queryString: any,
  ): Promise<{ data: JobPosting[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    const query = this.jobPostingRepo
      .createQueryBuilder('posting')
      .leftJoin('posting.jobPosition', 'jobPosition')
      .leftJoin('posting.postingStatus', 'postingStatus');

    query.addSelect([
      'jobPosition.id',
      'jobPosition.name',
      'jobPosition.description',
      'jobPosition.requirements',
      'jobPosition.benefits',
      'jobPosition.experience',

      'postingStatus.id',
      'postingStatus.name',
      'postingStatus.code',
      'postingStatus.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching() // search by title or job position name
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('posting.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`posting.name LIKE :search `, {
        search: `%${params.search.trim()}%`,
      });
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  // Get Job Posting by ID
  async findJobPostingById(id: number): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepo.findOne({ where: { id } });
    if (!jobPosting) {
      throw new NotFoundException(`JobPosting with ID ${id} not found`);
    }
    return jobPosting;
  }

  // Delete Job Posting
  async deleteJobPosting(id: number): Promise<void> {
    const result = await this.jobPostingRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`JobPosting with ID ${id} not found`);
    }
  }

  async changeJobPostingStatus(
    id: number,
    statusId: number,
  ): Promise<JobPosting> {
    const jobPosting = await this.findJobPostingById(id);
    jobPosting.postingStatusId = statusId;
    return await this.jobPostingRepo.save(jobPosting);
  }

  // Job Position Methods

  async createOrUpdateJobPosition(
    dto: CreateJobPositionDto,
  ): Promise<JobPosition> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    dto.appId = appId;
    dto.creatorId = userId;

    let jobPosition: JobPosition;
    if (dto.id) {
      const found = await this.jobPositionRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(`JobPosition with ID ${dto.id} not found`);
      }
      jobPosition = found;
      this.jobPositionRepo.merge(jobPosition, dto);
    } else {
      jobPosition = this.jobPositionRepo.create({
        ...dto,
      });
    }
    return await this.jobPositionRepo.save(jobPosition);
  }

  // Get all Job Positions
  async findAllJobPositions(
    queryString: any,
  ): Promise<{ data: JobPosition[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobPositionRepo.createQueryBuilder('position');

    query.leftJoin('position.designation', 'designation');
    query.leftJoin('position.employmentType', 'employmentType');
    query.leftJoin('position.workModel', 'workModel');
    query.leftJoin('position.creator', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');

    query.addSelect([
      'designation.id',
      'designation.name',

      'employmentType.id',
      'employmentType.name',
      'employmentType.code',
      'employmentType.colorName',

      'workModel.id',
      'workModel.name',
      'workModel.code',
      'workModel.colorName',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'profilePicture.id',
      'profilePicture.filename',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('position.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(
        'position.name LIKE :search OR position.description LIKE :search',
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    // Get filtered & paginated data
    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  // Get Job Position by ID
  async findJobPositionById(id: number): Promise<JobPosition> {
    const jobPosition = await this.jobPositionRepo.findOne({ where: { id } });
    if (!jobPosition) {
      throw new NotFoundException(`JobPosition with ID ${id} not found`);
    }
    return jobPosition;
  }

  // Delete Job Position
  async deleteJobPosition(id: number): Promise<void> {
    const result = await this.jobPositionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`JobPosition with ID ${id} not found`);
    }
  }

  // Toggle Active Status
  async changeJobPositionActiveStatus(id: number): Promise<JobPosition> {
    const jobPosition = await this.findJobPositionById(id);
    jobPosition.active = !jobPosition.active;
    return await this.jobPositionRepo.save(jobPosition);
  }

  // Create or Update Job Applicant Screening
  async CreateOrUpdateJobApplicantScreening(
    dto: CreateJobApplicantScreeningDto,
  ): Promise<JobApplicantScreening> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const jobPostingId = await this.jobPostingRepo.findOne({
      where: { id: dto.jobPostingId },
    });
    if (!jobPostingId)
      throw new NotFoundException(
        `JobPosting with ID ${dto.jobPostingId} not found`,
      );

    dto.jobPostingId = jobPostingId.id;

    const jobApplicantId = await this.jobApplicantRepo.findOne({
      where: { id: dto.jobApplicantId },
    });
    if (!jobApplicantId)
      throw new NotFoundException(
        `JobApplicant with ID ${dto.jobApplicantId} not found`,
      );

    dto.jobApplicantId = jobApplicantId.id;

    const jobScreeningId = await this.jobScreeningRepo.findOne({
      where: { id: dto.jobScreeningId },
    });
    if (!jobScreeningId)
      throw new NotFoundException(
        `JobScreening with ID ${dto.jobScreeningId} not found`,
      );

    dto.jobScreeningId = jobScreeningId.id;

    dto.creatorId = userId;

    let screening: JobApplicantScreening;

    if (dto.id) {
      const found = await this.jobApplicantScreeningRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(
          `JobApplicantScreening with ID ${dto.id} not found`,
        );
      }
      screening = found;
      this.jobApplicantScreeningRepo.merge(screening, dto);
    } else {
      screening = this.jobApplicantScreeningRepo.create({
        ...dto,
      });
    }

    return await this.jobApplicantScreeningRepo.save(screening);
  }

  // Get all Job Applicant Screenings
  async findAllJobApplicantScreenings(
    queryString: any,
  ): Promise<{ data: JobApplicantScreening[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    const query = this.jobApplicantScreeningRepo
      .createQueryBuilder('screening')
      .leftJoin('screening.jobPosting', 'jobPosting')
      .leftJoin('screening.jobApplicant', 'jobApplicant')
      .leftJoin('screening.jobScreening', 'jobScreening');

    query.addSelect([
      'jobPosting.code',
      'jobPosting.jobVacancy',
      'jobPosting.publishDate',
      'jobPosting.closeDate',

      'jobApplicant.id',
      'jobApplicant.coverLetter',
      'jobApplicant.expectedSalary',
      'jobApplicant.notes',

      'jobScreening.id',
      'jobScreening.name',
      'jobScreening.active',
    ]);

    // Initialize APIFeatures for searching, sorting, pagination
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('screening.appId = :appId', {
      appId: appId,
    });

    // Parse query params
    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    // Apply search filters
    // if (params.search) {
    //   query.andWhere(
    //     `jobPosting.code LIKE :search OR jobApplicant.coverLetter LIKE :search OR jobScreening.name LIKE :search`,
    //     { search: `%${params.search.trim()}%` },
    //   );
    // }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  // Get Job Applicant Screening by ID
  async findJobApplicantScreeningById(
    id: number,
  ): Promise<JobApplicantScreening> {
    const screening = await this.jobApplicantScreeningRepo.findOne({
      where: { id },
    });
    if (!screening) {
      throw new NotFoundException(
        `JobApplicantScreening with ID ${id} not found`,
      );
    }
    return screening;
  }

  // Delete Job Applicant Screening
  async deleteJobApplicantScreening(id: number): Promise<void> {
    const screening = await this.findJobApplicantScreeningById(id);
    await this.jobApplicantScreeningRepo.remove(screening);
  }

  //Create Job Applicant Methods
  async createOrUpdateJobApplicant(
    dto: CreateJobApplicantDto,
  ): Promise<JobApplicant> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const jobPostingId = await this.jobPostingRepo.findOne({
      where: { id: dto.jobPostingId },
    });
    if (!jobPostingId)
      throw new NotFoundException(
        `JobPosting with ID ${dto.jobPostingId} not found`,
      );

    dto.jobPostingId = jobPostingId.id;

    dto.userId = userId;

    const applicantStatus = await this.statusRepository.findOne({
      where: { id: dto.applicantStatusId },
    });

    if (!applicantStatus)
      throw new NotFoundException(
        `ApplicantStatus with ID ${dto.applicantStatusId} not found`,
      );

    dto.applicantStatusId = applicantStatus.id;

    let applicant: JobApplicant;

    if (dto.id) {
      const found = await this.jobApplicantRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(`JobApplicant with ID ${dto.id} not found`);
      }
      applicant = found;
      this.jobApplicantRepo.merge(applicant, dto);
    } else {
      applicant = this.jobApplicantRepo.create({
        ...dto,
      });
    }

    return await this.jobApplicantRepo.save(applicant);
  }

  // Find all Job Applicants
  async findAllJobApplicants(
    queryString: any,
  ): Promise<{ data: JobApplicant[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobApplicantRepo.createQueryBuilder('applicant');

    query.leftJoin('applicant.jobPosting', 'jobPosting');
    query.leftJoin('applicant.user', 'user');
    query.leftJoin('applicant.applicantStatus', 'applicantStatus');

    query.addSelect([
      'jobPosting.code',
      'jobPosting.jobVacancy',
      'jobPosting.publishDate',
      'jobPosting.closeDate',

      'user.firstName',
      'user.lastName',
      'user.email',

      'applicantStatus.name',
      'applicantStatus.code',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('applicant.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'jobPosting.code LIKE :search OR applicant.notes LIKE :search OR applicant.coverLetter LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobApplicantById(id: number): Promise<JobApplicant> {
    const applicant = await this.jobApplicantRepo.findOne({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException(`Job Applicant with ID ${id} not found`);
    }

    return applicant;
  }

  // Delete a Job Applicant by ID
  async deleteJobApplicant(id: number): Promise<{ message: string }> {
    const jobApplicant = await this.jobApplicantRepo.findOne({ where: { id } });
    if (!jobApplicant) {
      throw new NotFoundException(`JobApplicant with ID ${id} not found`);
    }

    await this.jobApplicantRepo.remove(jobApplicant);
    return { message: 'Job Applicant deleted successfully' };
  }

  async createOrUpdateJobOffer(dto: CreateJobOfferDto): Promise<JobOffer> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const jobPosting = await this.jobPostingRepo.findOne({
      where: { id: dto.jobPostingId },
    });

    if (!jobPosting) {
      throw new NotFoundException(
        `JobPosting with ID ${dto.jobPostingId} not found`,
      );
    }

    dto.jobPostingId = jobPosting.id;

    const jobApplicant = await this.jobApplicantRepo.findOne({
      where: { id: dto.jobApplicantId },
    });

    if (!jobApplicant) {
      throw new NotFoundException(
        `JobApplicant with ID ${dto.jobApplicantId} not found`,
      );
    }

    dto.jobApplicantId = jobApplicant.id;

    const offerStatus = await this.statusRepository.findOne({
      where: { id: dto.offerStatusId },
    });

    if (!offerStatus) {
      throw new NotFoundException(
        `OfferStatus with ID ${dto.offerStatusId} not found`,
      );
    }

    dto.offerStatusId = offerStatus.id;

    const employee = await this.employeeRepo.findOne({
      where: { id: dto.empId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.empId} not found`);
    }

    dto.empId = employee.id;

    dto.creatorId = userId;

    let jobOffer: JobOffer;

    if (dto.id) {
      const found = await this.jobOfferRepo.findOne({ where: { id: dto.id } });
      if (!found)
        throw new NotFoundException(`JobOffer with ID ${dto.id} not found`);

      jobOffer = found;
      this.jobOfferRepo.merge(jobOffer, dto);
    } else {
      jobOffer = this.jobOfferRepo.create({
        ...dto,
      });
    }

    return await this.jobOfferRepo.save(jobOffer);
  }

  async findAllJobOffers(
    queryString: any,
  ): Promise<{ data: JobOffer[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobOfferRepo
      .createQueryBuilder('offer')
      .leftJoin('offer.jobPosting', 'jobPosting')
      .leftJoin('offer.jobApplicant', 'jobApplicant')
      .leftJoin('offer.offerStatus', 'offerStatus')
      .leftJoin('offer.employee', 'employee');

    query.addSelect([
      'jobPosting.id',
      'jobPosting.code',
      'jobPosting.jobVacancy',
      'jobPosting.publishDate',
      'jobPosting.closeDate',

      'jobApplicant.id',
      'jobApplicant.coverLetter',
      'jobApplicant.expectedSalary',
      'jobApplicant.notes',

      'offerStatus.id',
      'offerStatus.name',
      'offerStatus.code',
      'offerStatus.colorName',

      'employee.id',
      'employee.employeeCode',
      'employee.joiningDate',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('offer.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'jobPosting.code LIKE :search OR jobApplicant.coverLetter LIKE :search OR jobApplicant.notes LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobOfferById(id: number): Promise<JobOffer> {
    const jobOffer = await this.jobOfferRepo.findOne({ where: { id } });
    if (!jobOffer)
      throw new NotFoundException(`JobOffer with ID ${id} not found`);
    return jobOffer;
  }

  async deleteJobOffer(id: number): Promise<void> {
    const jobOffer = await this.findJobOfferById(id);
    await this.jobOfferRepo.remove(jobOffer);
  }

  async createOrUpdateJobScreeningMap(
    dto: CreateJobScreeningMapDto,
  ): Promise<JobScreeningMap> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    // Assign appId
    dto.appId = appId;

    dto.creatorId = userId;

    let map: JobScreeningMap;
    if (dto.id) {
      const found = await this.jobScreeningMapRepo.findOne({
        where: { id: dto.id },
      });
      if (!found)
        throw new NotFoundException(
          `JobScreeningMap with ID ${dto.id} not found`,
        );

      map = found;
      this.jobScreeningMapRepo.merge(map, dto);
    } else {
      map = this.jobScreeningMapRepo.create({
        ...dto,
      });
    }

    return await this.jobScreeningMapRepo.save(map);
  }

  async findAllJobScreeningMaps(
    queryString: any,
  ): Promise<{ data: JobScreeningMap[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobScreeningMapRepo
      .createQueryBuilder('map')
      .leftJoin('map.jobPosting', 'jobPosting')
      .leftJoin('map.jobScreening', 'jobScreening');

    query.addSelect([
      'jobPosting.id',
      'jobPosting.code',
      'jobPosting.jobVacancy',
      'jobPosting.publishDate',
      'jobPosting.closeDate',

      'jobScreening.id',
      'jobScreening.name',
      'jobScreening.active',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('map.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'jobPosting.code LIKE :search OR jobScreening.name LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    const featureData = await features.getQuery().getMany();

    // Get total count for pagination
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobScreeningMapById(id: number): Promise<JobScreeningMap> {
    const map = await this.jobScreeningMapRepo.findOne({ where: { id } });
    if (!map)
      throw new NotFoundException(`JobScreeningMap with ID ${id} not found`);
    return map;
  }

  async deleteJobScreeningMap(id: number): Promise<void> {
    const result = await this.jobScreeningMapRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`JobScreeningMap with ID ${id} not found`);
  }

  // Create or update Job Interview
  async CreateOrUpdateJobInterview(
    dto: CreateJobInterviewDto,
  ): Promise<JobInterview> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const JobApplicantScreening = await this.jobApplicantScreeningRepo.findOne({
      where: { id: dto.jobApplicantScreeningId },
    });

    if (!JobApplicantScreening)
      throw new NotFoundException(
        `JobApplicantScreening with ID ${dto.jobApplicantScreeningId} not found`,
      );
    dto.jobApplicantScreeningId = JobApplicantScreening.id;

    const jobApplicant = await this.jobApplicantRepo.findOne({
      where: { id: dto.jobApplicantId },
    });

    if (!jobApplicant)
      throw new NotFoundException(
        `JobApplicant with ID ${dto.jobApplicantId} not found`,
      );
    dto.jobApplicantId = jobApplicant.id;

    const interviewStatusId = await this.statusRepository.findOne({
      where: { code: 'job_interviewer_status_pending' },
    });

    if (!interviewStatusId)
      throw new NotFoundException(
        `Status with code ${'job_interviewer_status_pending'} not found`,
      );

    dto.interviewStatusId = interviewStatusId.id;

    dto.creatorId = userId;

    let interview: JobInterview;

    if (dto.id) {
      const found = await this.jobInterviewRepo.findOne({
        where: { id: dto.id },
      });
      if (!found)
        throw new NotFoundException(`JobInterview with ID ${dto.id} not found`);

      interview = found;
      this.jobInterviewRepo.merge(interview, dto);
    } else {
      interview = this.jobInterviewRepo.create({
        ...dto,
      });
    }

    return await this.jobInterviewRepo.save(interview);
  }

  // Get all Job Interviews
  async findAllJobInterviews(
    queryString: any,
  ): Promise<{ data: JobInterview[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobInterviewRepo.createQueryBuilder('interview');
    query.leftJoin('interview.jobApplicant', 'jobApplicant');
    query.leftJoin('interview.interviewStatus', 'interviewStatus');

    query.addSelect([
      'jobApplicant.id',
      'jobApplicant.userId',
      'jobApplicant.coverLetter',
      'jobApplicant.expectedSalary',
      'jobApplicant.notes',

      'interviewStatus.name',
      'interviewStatus.code',
      'interviewStatus.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('interview.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'jobApplicant.coverLetter LIKE :search OR jobApplicant.notes LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    const featureData = await features.getQuery().getMany();

    // Total count
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  // Get Job Interview by ID
  async findJobInterviewById(id: number): Promise<JobInterview> {
    const interview = await this.jobInterviewRepo.findOne({ where: { id } });
    if (!interview)
      throw new NotFoundException(`JobInterview with ID ${id} not found`);
    return interview;
  }

  // Delete Job Interview
  async deleteJobInterview(id: number): Promise<void> {
    const result = await this.jobInterviewRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`JobInterview with ID ${id} not found`);
  }

  async CreateOrUpdateJobInterviewer(
    dto: CreateJobInterviewersDto,
  ): Promise<JobInterviewer> {
    const userId = RequestContext.get('userId');

    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const jobInterview = await this.jobInterviewRepo.findOne({
      where: { id: dto.jobInterviewId },
    });
    if (!jobInterview)
      throw new NotFoundException(
        `JobInterview with ID ${dto.jobInterviewId} not found`,
      );

    dto.jobInterviewId = jobInterview.id;

    dto.userId = userId;
    dto.creatorId = userId;

    let interviewer: JobInterviewer;

    if (dto.id) {
      const found = await this.jobInterviewerRepo.findOne({
        where: { id: dto.id },
      });
      if (!found)
        throw new NotFoundException(
          `JobInterviewer with ID ${dto.id} not found`,
        );

      interviewer = found;
      this.jobInterviewerRepo.merge(interviewer, dto);
    } else {
      // Create new
      interviewer = this.jobInterviewerRepo.create({
        ...dto,
      });
    }

    return await this.jobInterviewerRepo.save(interviewer);
  }

  async findAllJobInterviewers(
    queryString: any,
  ): Promise<{ data: JobInterviewer[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.jobInterviewerRepo.createQueryBuilder('interviewer');

    query.leftJoin('interviewer.jobInterview', 'jobInterview');
    query.leftJoin('interviewer.user', 'user');
    query.leftJoin('interviewer.interviewerStatus', 'status');

    query.addSelect([
      'jobInterview.meeting_link',
      'jobInterview.location',
      'jobInterview.notes',
      'user.id',
      'user.firstName',
      'user.lastName',
      'status.name',
      'status.code',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('interviewer.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'jobInterview.location LIKE :search OR jobInterview.notes LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobInterviewerById(id: number): Promise<JobInterviewer> {
    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id },
    });
    if (!interviewer)
      throw new NotFoundException(`JobInterviewer with ID ${id} not found`);
    return interviewer;
  }

  async deleteJobInterviewer(id: number): Promise<void> {
    const found = await this.jobInterviewerRepo.findOne({ where: { id } });
    if (!found)
      throw new NotFoundException(`JobInterviewer with ID ${id} not found`);
    await this.jobInterviewerRepo.delete(id);
  }

  // Create or Update Job Interview Feedback
  async CreateOrUpdateJobInterviewFeedback(
    dto: CreateJobInterviewFeedbackDto,
  ): Promise<JobInterviewFeedback> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const jobInterview = await this.jobInterviewRepo.findOne({
      where: { id: dto.jobInterviewId },
    });
    if (!jobInterview) throw new NotFoundException('Job Interview not found');

    dto.jobInterviewId = jobInterview.id;

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id: dto.applicantId },
    });
    if (!applicant) throw new NotFoundException('Job Applicant not found');

    dto.applicantId = applicant.id;

    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id: dto.jobInterviewerId },
    });
    if (!interviewer) throw new NotFoundException('Job Interviewer not found');

    dto.jobInterviewerId = interviewer.id;

    let feedback: JobInterviewFeedback;

    if (dto.id) {
      const found = await this.JobInterviewFeedbackRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(
          `JobInterviewFeedback with ID ${dto.id} not found`,
        );
      }
      feedback = found;
      this.JobInterviewFeedbackRepo.merge(feedback, dto);
    } else {
      feedback = this.JobInterviewFeedbackRepo.create({
        ...dto,
      });
    }

    return await this.JobInterviewFeedbackRepo.save(feedback);
  }

  async findAllJobInterviewFeedbacks(
    queryString: any,
  ): Promise<{ data: JobInterviewFeedback[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.JobInterviewFeedbackRepo.createQueryBuilder('feedback');

    query.leftJoin('feedback.jobInterview', 'jobInterview');
    query.leftJoin('feedback.jobApplicant', 'jobApplicant');
    query.leftJoin('feedback.interviewer', 'interviewer');

    query.addSelect([
      'jobInterview.meeting_link',
      'jobInterview.location',
      'jobInterview.notes',
      'jobApplicant.coverLetter',
      'jobApplicant.expectedSalary',
      'jobApplicant.notes',
      'interviewer.code',
      'interviewer.email',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('feedback.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('feedback.overall_rating LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobInterviewFeedbackById(
    id: number,
  ): Promise<JobInterviewFeedback> {
    const feedback = await this.JobInterviewFeedbackRepo.findOne({
      where: { id },
    });
    if (!feedback)
      throw new NotFoundException(
        `JobInterviewFeedback with ID ${id} not found`,
      );
    return feedback;
  }

  async deleteJobInterviewFeedback(id: number): Promise<void> {
    const result = await this.JobInterviewFeedbackRepo.findOne({
      where: { id },
    });
    if (!result)
      throw new NotFoundException(
        `JobInterviewFeedback with ID ${id} not found`,
      );
    await this.JobInterviewFeedbackRepo.delete(id);
  }

  // Create or Update Lead Group
  async createOrUpdateLeadGroup(dto: CreateLeadGroupDto): Promise<LeadGroups> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    if (dto.id) {
      const lead = await this.leadGroupsRepo.findOne({
        where: { id: dto.id },
      });
      if (!lead)
        throw new NotFoundException(`Lead with ID ${dto.id} not found`);
      this.leadGroupsRepo.merge(lead, dto);
      return this.leadGroupsRepo.save(lead);
    } else {
      const lead = this.leadGroupsRepo.create(dto);
      return this.leadGroupsRepo.save(lead);
    }
  }

  // Get all lead groups
  async findAllLeadGroups(): Promise<LeadGroups[]> {
    return await this.leadGroupsRepo.find();
  }

  // Get single lead group by ID
  async findLeadGroupById(id: number): Promise<LeadGroups> {
    const group = await this.leadGroupsRepo.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`LeadGroup with ID ${id} not found`);
    }
    return group;
  }

  // Delete lead group
  async deleteLeadGroup(id: number): Promise<void> {
    const result = await this.leadGroupsRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`LeadGroup with ID ${id} not found`);
    }
  }

  //lead-stages Methods
  async createOrUpdateLeadStage(dto: CreateLeadStageDto): Promise<LeadStage> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const leadStage = await this.leadStagesRepo.findOne({
      where: { id: dto.leadGroupId },
    });

    if (!leadStage) {
      throw new NotFoundException(
        `LeadStage with ID ${dto.leadGroupId} not found`,
      );
    }

    dto.leadGroupId = leadStage.id;

    if (dto.id) {
      const lead = await this.leadStagesRepo.findOne({
        where: { id: dto.id },
      });
      if (!lead)
        throw new NotFoundException(`Lead with ID ${dto.id} not found`);
      this.leadStagesRepo.merge(lead, dto);
      return this.leadStagesRepo.save(lead);
    } else {
      const lead = this.leadStagesRepo.create(dto);
      return this.leadStagesRepo.save(lead);
    }
  }

  // Get all lead stages
  async findAllLeadStages(): Promise<LeadStage[]> {
    return await this.leadStagesRepo.find();
  }

  // Get single lead stage by ID
  async findLeadStageById(id: number): Promise<LeadStage> {
    const stage = await this.leadStagesRepo.findOne({ where: { id } });
    if (!stage) {
      throw new NotFoundException(`LeadStage with ID ${id} not found`);
    }
    return stage;
  }

  // Delete lead stage
  async deleteLeadStage(id: number): Promise<void> {
    const result = await this.leadStagesRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`LeadStage with ID ${id} not found`);
    }
  }

  async createOrUpdateLeadPipeline(
    dto: CreateLeadPipelineDto,
  ): Promise<LeadPipeline> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    const leadGroup = await this.leadGroupsRepo.findOne({
      where: { id: dto.leadGroupId },
    });
    if (!leadGroup) {
      throw new NotFoundException(
        `LeadGroup with ID ${dto.leadGroupId} not found`,
      );
    }
    dto.leadGroupId = leadGroup.id;

    if (dto.id) {
      const lead = await this.leadPipelineRepo.findOne({
        where: { id: dto.id },
      });
      if (!lead)
        throw new NotFoundException(`Lead with ID ${dto.id} not found`);
      this.leadPipelineRepo.merge(lead, dto);
      return this.leadPipelineRepo.save(lead);
    } else {
      const lead = this.leadPipelineRepo.create(dto);
      return this.leadPipelineRepo.save(lead);
    }
  }

  // Get all lead pipelines

  async findAllLeadPipelines(
    queryString: any,
  ): Promise<{ data: LeadPipeline[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.leadPipelineRepo.createQueryBuilder('leadPipeline');
    query.leftJoin('leadPipeline.leadGroup', 'leadGroup');
    query.addSelect(['leadGroup.name', 'leadGroup.description']);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('leadPipeline.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('leadGroup.name LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }
  // Get single lead pipeline by ID
  async findLeadPipelineById(id: number): Promise<LeadPipeline> {
    const pipeline = await this.leadPipelineRepo.findOne({ where: { id } });
    if (!pipeline) {
      throw new NotFoundException(`LeadPipeline with ID ${id} not found`);
    }
    return pipeline;
  }

  // Delete lead pipeline
  async deleteLeadPipeline(id: number): Promise<void> {
    const result = await this.leadPipelineRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`LeadPipeline with ID ${id} not found`);
    }
  }

  //Lead Methods
  // async createOrUpdateLead(dto: CreateLeadDto): Promise<Leads> {
  //   const userId = RequestContext.get('userId');
  //   const appId = RequestContext.get('activeAppId');
  //   dto.appId = appId;

  //   const leadGroup = await this.leadGroupsRepo.findOne({
  //     where: { id: dto.leadGroupId },
  //   });
  //   if (!leadGroup) {
  //     throw new NotFoundException(
  //       `LeadGroup with ID ${dto.leadGroupId} not found`,
  //     );
  //   }
  //   dto.leadGroupId = leadGroup.id;

  //   const leadStage = await this.leadStagesRepo.findOne({
  //     where: { id: dto.leadStageId },
  //   });
  //   if (!leadStage) {
  //     throw new NotFoundException(
  //       `LeadStage with ID ${dto.leadStageId} not found`,
  //     );
  //   }
  //   dto.leadStageId = leadStage.id;
  //   dto.creatorId = userId;

  //   const emailExists = await this.leadsRepo.findOne({
  //     where: { email: dto.email },
  //   });

  //   if (dto.id) {
  //     const lead = await this.leadsRepo.findOne({ where: { id: dto.id } });
  //     if (!lead)
  //       throw new NotFoundException(`Lead with ID ${dto.id} not found`);
  //     if (emailExists && emailExists.id !== dto.id) {
  //       throw new Error('Email already exists for another lead');
  //     }
  //     this.leadsRepo.merge(lead, dto);
  //     return this.leadsRepo.save(lead);
  //   } else {
  //     if (emailExists) {
  //       throw new Error('Email already exists');
  //     }
  //     const lead = this.leadsRepo.create(dto);
  //     return this.leadsRepo.save(lead);
  //   }
  // }

  // Get all leads
  async findAllLeads(queryString: any): Promise<{
    data: { list: any[]; headers: any };
    total: number;
  }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.leadsRepo
      .createQueryBuilder('lead')
      .leftJoin('lead.leadGroup', 'leadGroup')
      .leftJoin('lead.leadStage', 'leadStage')
      .addSelect([
        'leadGroup.name',
        'leadGroup.description',
        'leadStage.name',
        'leadStage.serial',
      ])
      .andWhere('lead.app_id = :appId', { appId: appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'lead.first_name LIKE :search OR lead.last_name LIKE :search OR lead.email LIKE :search',
        { search },
      );
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    // Build headers
    const headers: {
      Lead: { users: { name: string; fileUrl: string }[]; count: number };
      Client: { users: { name: string; fileUrl: string }[]; count: number };
      FollowingUp: {
        users: { name: string; fileUrl: string }[];
        count: number;
      };
      More: { users: { name: string; fileUrl: string }[]; count: number };
    } = {
      Lead: { users: [], count: 0 },
      Client: { users: [], count: 0 },
      FollowingUp: { users: [], count: 0 },
      More: { users: [], count: 0 },
    };

    const totalUsers = data.map((lead) => ({
      name: `${lead.firstName} ${lead.lastName}`,
      fileUrl: '',
    }));

    data.forEach((lead) => {
      headers.Lead.users.push({
        name: `${lead.firstName} ${lead.lastName}`,
        fileUrl: '',
      });

      if (
        lead.company &&
        !headers.Client.users.find((u) => u.name === lead.company)
      ) {
        headers.Client.users.push({ name: lead.company, fileUrl: '' });
      }

      if (lead.nextFollowupAt) {
        headers.FollowingUp.users.push({
          name: `${lead.firstName} ${lead.lastName}`,
          fileUrl: '',
        });
      }

      if (
        !lead.nextFollowupAt &&
        !headers.More.users.find((u) => u.name === lead.firstName)
      ) {
        headers.More.users.push({
          name: `${lead.firstName} ${lead.lastName}`,
          fileUrl: '',
        });
      }
    });

    // Count for each header
    Object.keys(headers).forEach((key) => {
      headers[key].count = headers[key].users.length;
    });

    return { data: { list: data, headers }, total };
  }

  // Get single lead by ID

  async findLeadById(id: number): Promise<Leads> {
    const lead = await this.leadsRepo.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  // Delete lead
  async deleteLead(id: number): Promise<void> {
    const result = await this.leadsRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }

  //personal-notes Methods

  async createOrUpdatePersonalNote(
    dto: CreatePersonalNoteDto,
    userId: number,
  ): Promise<PersonalNote> {
    if (dto.id && Number(dto.id) > 0) {
      // Update existing
      const personalNote = await this.personalNotesRepo.findOne({
        where: { id: dto.id },
      });
      if (!personalNote) {
        throw new NotFoundException(`PersonalNote with ID ${dto.id} not found`);
      }
      const { id, ...rest } = dto;

      const updated = this.personalNotesRepo.merge(personalNote, rest);
      return await this.personalNotesRepo.save(updated);
    } else {
      // Create new
      const { id, ...dataWithoutId } = dto;
      const note = this.personalNotesRepo.create({
        ...dataWithoutId,
        userId: userId,
      });

      return await this.personalNotesRepo.save(note);
    }
  }

  // Get all personal notes
  async findAllPersonalNotes(
    queryString: any,
  ): Promise<{ data: PersonalNote[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    const query = this.personalNotesRepo.createQueryBuilder('note');
    query.where('note.isArchived = :isArchived', { isArchived: false });
    query.where('note.userId = :userId', { userId });

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(`note.title LIKE :search OR note.content LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    // Get the filtered data
    const featureData = await features.getQuery().getMany();

    // Get the total count of all non-deleted records using the IsNull operator
    const total = await query.getCount();

    return {
      data: featureData,
      total: total,
    };
  }

  // Get all personal notes
  async findAllArchivedPersonalNotes(
    queryString: any,
  ): Promise<{ data: PersonalNote[]; total: number }> {
    const userId = RequestContext.get('userId');
    const query = this.personalNotesRepo.createQueryBuilder('note');
    query.where('note.isArchived = :isArchived', { isArchived: true });
    query.where('note.userId = :userId', { userId });

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(`note.title LIKE :search OR note.content LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    // Get the filtered data
    const featureData = await features.getQuery().getMany();

    // Get the total count of all non-deleted records using the IsNull operator
    const total = await query.getCount();

    return {
      data: featureData,
      total: total,
    };
  }
  // Get single personal note by ID
  async findPersonalNoteById(id: number): Promise<PersonalNote> {
    const note = await this.personalNotesRepo.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException(`PersonalNote with ID ${id} not found`);
    }
    return note;
  }

  // Delete personal note
  async deletePersonalNote(id: number): Promise<void> {
    const result = await this.personalNotesRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`PersonalNote with ID ${id} not found`);
    }
  }

  async changeArchiveStatus(id: number): Promise<PersonalNote> {
    const note = await this.personalNotesRepo.findOne({
      where: { id },
    });
    if (!note)
      throw new NotFoundException(`PersonalNote with ID ${id} not found`);

    note.isArchived = !note.isArchived;
    return this.personalNotesRepo.save(note);
  }

  async changePinnedStatus(id: number): Promise<PersonalNote> {
    const note = await this.personalNotesRepo.findOne({
      where: { id },
    });
    if (!note)
      throw new NotFoundException(`PersonalNote with ID ${id} not found`);

    note.isPinned = !note.isPinned;
    return this.personalNotesRepo.save(note);
  }

  async createOrUpdateNotice(dto: CreateNoticeDto): Promise<Notice> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let notice: Notice;

    if (dto.id) {
      const existing = await this.noticeRepo.findOne({ where: { id: dto.id } });
      if (!existing)
        throw new NotFoundException(`Notice with ID ${dto.id} not found`);
      const { id, ...data } = dto;
      notice = this.noticeRepo.merge(existing, data);
    } else {
      notice = this.noticeRepo.create(dto);
    }

    return this.noticeRepo.save(notice);
  }

  // Get all notices
  async findAllNotices(
    queryString: any,
  ): Promise<{ data: Notice[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.noticeRepo.createQueryBuilder('notice');

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(
        `notice.title LIKE :search OR notice.content LIKE :search`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    if (params.startDate && params.endDate) {
      query.andWhere(`DATE(notice.startDate) BETWEEN :startDate AND :endDate`, {
        startDate: params.startDate.trim(),
        endDate: params.endDate.trim(),
      });
    } else if (params.startDate) {
      query.andWhere(`DATE(notice.startDate) = :startDate`, {
        startDate: params.startDate.trim(),
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('notice.appId = :appId', {
      appId: appId,
    });

    // Get the filtered data
    const featureData = await features.getQuery().getMany();

    // Get the total count of all records using the IsNull operator
    const total = await query.getCount();

    return {
      data: featureData,
      total: total,
    };
  }

  // Get single notice by ID
  async findNoticeById(id: number): Promise<Notice> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }
    return notice;
  }

  // Delete notice
  async deleteNotice(id: number): Promise<void> {
    const result = await this.noticeRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }
  }

  async changeNoticeActiveStatus(id: number): Promise<NoticeResponseDto> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }

    notice.isActive = !notice.isActive;
    const saved = await this.noticeRepo.save(notice);
    return NoticeResponseDto.fromEntity(saved);
  }

  async createOrUpdateEmployee(
    dto: CreateEmployeeDto,
    createUserDto: CreateUserDto,
  ): Promise<Employee> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({
      where: { userId: userId },
      relations: ['application'],
    });

    let targetUserId: number;

    if (createUserDto.id) {
      const user = await this.userRepository.findOne({
        where: { id: createUserDto.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { ...rest } = createUserDto;
      Object.assign(user, rest);

      let profile = await this.userProfileRepo.findOne({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = this.userProfileRepo.create({ userId: user.id });
      }

      profile.phoneCountryId = createUserDto?.phoneCountryId ?? null;
      profile.phone = createUserDto.phoneIdentifier;
      user.profile = profile;

      if (createUserDto.password) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        user.password = hashedPassword;
      }

      const updateUser = await this.userRepository.save(user);

      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        await this.rolePermissionService.assignRolesToUser(
          user.id,
          createUserDto.roleIds,
        );
        this.usersService.createUserNotification(user.id, 'Role assigned');
      }

      targetUserId = updateUser.id;
    } else {
      const targetCompanyId =
        appUser?.appId ?? RequestContext.get('activeAppId');
      const cleanEmail = createUserDto.email?.trim()?.toLowerCase();

      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: cleanEmail || createUserDto.email },
      });

      if (existingUserByEmail) {
        const inEmployee = targetCompanyId
          ? await this.employeeRepo.findOne({
              where: { appId: targetCompanyId, userId: existingUserByEmail.id },
            })
          : null;

        const inAppUser = targetCompanyId
          ? await this.appUserRepo.findOne({
              where: { appId: targetCompanyId, userId: existingUserByEmail.id },
            })
          : null;

        const isAlreadyInCompany =
          Boolean(inEmployee) ||
          Boolean(inAppUser) ||
          Boolean(
            targetCompanyId &&
              existingUserByEmail.activeAppId === targetCompanyId,
          );

        if (isAlreadyInCompany) {
          throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        // Email belongs to a user in another company: reuse user and link to this company
        targetUserId = existingUserByEmail.id;

        if (createUserDto.password) {
          const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
          existingUserByEmail.password = hashedPassword;
        }
        if (createUserDto.resetFirstPassword !== undefined) {
          existingUserByEmail.resetFirstPassword =
            createUserDto.resetFirstPassword;
        }
        await this.userRepository.save(existingUserByEmail);

        if (targetCompanyId) {
          let appUserEntry = await this.appUserRepo.findOne({
            where: { appId: targetCompanyId, userId: targetUserId },
          });
          if (!appUserEntry) {
            appUserEntry = this.appUserRepo.create({
              appId: targetCompanyId,
              userId: targetUserId,
            });
            await this.appUserRepo.save(appUserEntry);
          }
        }

        if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
          await this.rolePermissionService.assignRolesToUser(
            targetUserId,
            createUserDto.roleIds,
          );
          this.usersService.createUserNotification(targetUserId, 'Role assigned');
        }
      } else {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        const { id, ...rest } = createUserDto;
        const user = this.userRepository.create({
          ...rest,
          email: cleanEmail || rest.email,
          activeAppId: targetCompanyId ?? (rest as any).activeAppId,
        });

        let profile = await this.userProfileRepo.findOne({
          where: { userId: user.id },
        });

        if (!profile) {
          profile = this.userProfileRepo.create({ userId: user.id });
        }

        profile.phoneCountryId = createUserDto?.phoneCountryId ?? null;
        profile.phone = createUserDto.phoneIdentifier;
        user.profile = profile;

        const newUser = await this.userRepository.save(user);
        if (!newUser) {
          throw new HttpException(
            'User create failed',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        if (targetCompanyId) {
          let appUserEntry = await this.appUserRepo.findOne({
            where: { appId: targetCompanyId, userId: newUser.id },
          });
          if (!appUserEntry) {
            appUserEntry = this.appUserRepo.create({
              appId: targetCompanyId,
              userId: newUser.id,
            });
            await this.appUserRepo.save(appUserEntry);
          }
        }

        if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
          await this.rolePermissionService.assignRolesToUser(
            newUser.id,
            createUserDto.roleIds,
          );
          this.usersService.createUserNotification(newUser.id, 'Role assigned');
        }

        targetUserId = newUser.id;
      }
    }

    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    dto.userId = targetUserId;
    dto.appId = appUser.appId ?? undefined;

    const currentGrade = await this.empSalaryGradeRepo.findOne({
      where: { id: dto.currentGradeId ?? undefined },
    });

    if (!currentGrade) {
      throw new NotFoundException(
        `Employee grade with ID ${dto.currentGradeId} not found`,
      );
    }

    dto.currentGradeId = currentGrade.id;

    let savedEmployee: Employee;

    if (dto.id) {
      const employee = await this.employeeRepo.findOne({
        where: { id: dto.id },
      });
      if (!employee)
        throw new NotFoundException(`Employee with ID ${dto.id} not found`);

      this.employeeRepo.merge(employee, dto as Partial<Employee>);

      if (!employee.employeeCode) {
        const joiningDate = dto.joiningDate
          ? new Date(dto.joiningDate)
          : new Date();

        const year = joiningDate.getFullYear();

        const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const employeeCount = await this.employeeRepo.count({
          where: {
            appId: dto.appId,
            joiningDate: Between(startOfYear, endOfYear),
          },
        });

        const employeeCode =
          Helpers.avatarText(appUser?.application?.name ?? '') +
          year.toString() +
          (employeeCount + 1).toString().padStart(4, '0');

        employee.employeeCode = employeeCode;
      }

      savedEmployee = await this.employeeRepo.save(employee);
    } else {
      const employee = this.employeeRepo.create(dto as Partial<Employee>);
      const joiningDate = dto.joiningDate
        ? new Date(dto.joiningDate)
        : new Date();
      const year = joiningDate.getFullYear();

      const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      const employeeCount = await this.employeeRepo.count({
        where: {
          appId: dto.appId,
          joiningDate: Between(startOfYear, endOfYear),
        },
      });

      const employeeCode =
        Helpers.avatarText(appUser?.application?.name ?? '') +
        year.toString() +
        (employeeCount + 1).toString().padStart(4, '0');

      employee.employeeCode = employeeCode;
      savedEmployee = await this.employeeRepo.save(employee);
    }

    try {
      const user = await this.userRepo.findOne({
        where: { id: targetUserId },
        select: ['id', 'email', 'firstName', 'lastName', 'resetFirstPassword'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${targetUserId} not found`);
      }

      if (user?.resetFirstPassword === true) {
        const officeName = savedEmployee.officeId
          ? ((
              await this.officeRepo.findOne({
                where: { id: savedEmployee.officeId },
                select: ['id', 'name'],
              })
            )?.name ?? null)
          : null;

        const officeShiftName = savedEmployee.officeShiftId
          ? ((
              await this.officeShiftRepo.findOne({
                where: { id: savedEmployee.officeShiftId },
                select: ['id', 'name'],
              })
            )?.name ?? null)
          : null;

        await this.mailService.sendMail(
          user.email,
          'Congratulations! Welcome to the Company 🎉',
          'employee-welcome',
          {
            name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
            email: user.email,
            officeName,
            officeShiftName,
          },
        );

        await this.userRepo.update(
          { id: user.id },
          { resetFirstPassword: false },
        );
      }
    } catch (error) {
      console.error('signup email failed', error);
    }

    return savedEmployee;
  }

  async findAllEmployees(
    queryString: any,
  ): Promise<{ data: Employee[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.employeeRepo.createQueryBuilder('employee');
    query.withDeleted();
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.employmentStatus', 'employmentStatus');
    query.leftJoin('employee.employeeStatus', 'employeeStatus');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin(
      'user.userRoles',
      'userRoles',
      'userRoles.appId = :appId',
      { appId },
    );
    query.leftJoin('userRoles.role', 'role');

    // query.leftJoinAndSelect('employee.userProfile', 'userProfile');
    // query.leftJoinAndSelect('userProfile.profilePicture', 'profilePicture');

    query.addSelect([
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',
      'employeeStatus.name',
      'employeeStatus.code',
      'employeeStatus.colorName',
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'user.resetFirstPassword',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'userProfile.maritalStatusId',
      'userProfile.religionId',
      'profilePicture.id',
      'profilePicture.filename',
      'userRoles.id',
      'userRoles.roleId',
      'role.id',
      'role.name',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('employee.appId = :appId', {
      appId: appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    query.andWhere('employee.joiningDate IS NOT NULL');
    // query.andWhere('employee.resignationDate IS NULL');

    if (params.search) {
      query.andWhere(
        `user.firstName LIKE :search
         OR user.lastName LIKE :search
         OR user.email LIKE :search
         OR userProfile.phone LIKE :search
         OR designation.name LIKE :search`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    if (params.officeId) {
      query.andWhere('employee.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.officeShiftId) {
      query.andWhere('employee.officeShiftId = :officeShiftId', {
        officeShiftId: params.officeShiftId,
      });
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.employeeStatusId) {
      query.andWhere('employee.employeeStatusId = :employeeStatusId', {
        employeeStatusId: params.employeeStatusId,
      });
    }

    if (params.employmentStatusId) {
      query.andWhere('employee.employmentStatusId = :employmentStatusId', {
        employmentStatusId: params.employmentStatusId,
      });
    }

    if (params.status) {
      query.andWhere('user.isActive = :status', {
        status: params.status === 'true',
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findEmployeeById(id: number): Promise<Employee> {
    const employee = await this.employeeRepo
      .createQueryBuilder('employee')
      .withDeleted()
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoin('profile.phoneCountry', 'phoneCountry')
      .leftJoin('user.userLanguageProficiencies', 'userLanguageProficiencies')
      .leftJoin('user.userSkills', 'userSkills')
      .leftJoin('user.userContactInfos', 'userContactInfos')
      .leftJoin('user.userCertifications', 'userCertifications')
      .leftJoin('user.UserWorkExperiences', 'UserWorkExperiences')
      .leftJoin('user.userReferences', 'userReferences')
      .leftJoin('user.userProjects', 'userProjects')
      .leftJoin('user.userTrainings', 'userTrainings')
      .leftJoin('user.userEducations', 'userEducations')
      .addSelect([
        'employee.id',
        'employee.userId',
        'employee.appId',
        'employee.designationId',
        'employee.officeId',
        'employee.officeShiftId',
        'employee.joiningDate',
        'employee.remarks',
        'employee.resignationDate',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.lastTimezone',
        'user.isActive',

        'userContactInfos.id',
        'userContactInfos.mobilePersonal',
        'userContactInfos.telephone',
        'userContactInfos.emailPersonal',

        'profile.id',
        'profile.phone',
        'profile.bloodGroupId',
        'profile.maritalStatusId',
        'profile.countryId',
        'profile.phoneCountryId',
        'profile.profilePictureId',
        'profilePicture.id',
        'profilePicture.filename',
        'phoneCountry.callingCode',

        'userSkills.id',
        'userSkills.skillName',
        'userSkills.skillLevel',

        'userProjects.id',
        'userProjects.projectName',
        'userProjects.projectUrl',
        'userProjects.isCurrent',

        'UserWorkExperiences.id',
        'UserWorkExperiences.jobTitle',
        'UserWorkExperiences.companyName',
        'UserWorkExperiences.startDate',
        'UserWorkExperiences.endDate',
        'UserWorkExperiences.isCurrent',
      ])
      .where('employee.id = :id', { id })
      .getOne();

    if (!employee)
      throw new NotFoundException(`Employee with ID ${id} not found`);

    return employee;
  }

  async deleteEmployee(id: number): Promise<void> {
    const result = await this.employeeRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Employee with ID ${id} not found`);
  }

  // Create or Update EmpLeaveType
  async createOrUpdateEmpLeaveType(
    dto: CreateEmpLeaveTypeDto,
  ): Promise<EmpLeaveType> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    dto.appId = appId;
    dto.year = Number(dto.year) || new Date().getFullYear();

    const existingLeave = await this.empLeaveTypeRepo.findOne({
      where: {
        name: dto.name,
        appId: appId,
        year: dto.year,
      },
    });

    if (existingLeave && existingLeave.id !== dto.id) {
      throw new BadRequestException(
        `Leave type '${dto.name}' already exists for ${dto.year}`,
      );
    }

    if (dto.id) {
      const leaveType = await this.empLeaveTypeRepo.findOne({
        where: { id: dto.id },
      });
      if (!leaveType)
        throw new NotFoundException(`EmpLeaveType with ID ${dto.id} not found`);
      this.empLeaveTypeRepo.merge(leaveType, dto as Partial<EmpLeaveType>);
      return this.empLeaveTypeRepo.save(leaveType);
    } else {
      const leaveType = this.empLeaveTypeRepo.create(
        dto as Partial<EmpLeaveType>,
      );

      return this.empLeaveTypeRepo.save(leaveType);
    }
  }

  // Find all EmpLeaveTypes
  async findAllEmpLeaveTypes(
    queryString: any,
  ): Promise<{ data: EmpLeaveType[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }
    const query = this.empLeaveTypeRepo.createQueryBuilder('leaveType');

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('leaveType.appId = :appId', {
      appId: appUser.appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`leaveType.name LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.year) {
      query.andWhere('leaveType.year = :year', {
        year: Number(params.year),
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Find EmpLeaveType by ID
  async findEmpLeaveTypeById(id: number): Promise<EmpLeaveType> {
    const leaveType = await this.empLeaveTypeRepo.findOne({ where: { id } });
    if (!leaveType)
      throw new NotFoundException(`EmpLeaveType with ID ${id} not found`);
    return leaveType;
  }

  // Delete EmpLeaveType
  async deleteEmpLeaveType(id: number): Promise<void> {
    const result = await this.empLeaveTypeRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`EmpLeaveType with ID ${id} not found`);
  }

  private async ensureEmployee(
    userId: number,
    appId?: number | null,
  ): Promise<Employee> {
    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      if (appUser?.appId) {
        appId = appUser.appId;
      } else {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user?.activeAppId) {
          appId = user.activeAppId;
        }
      }
    }

    const existing =
      (await this.employeeRepo.findOne({
        where: { userId, ...(appId ? { appId } : {}) },
      })) ||
      (await this.employeeRepo.findOne({
        where: { userId },
        order: { id: 'ASC' },
      }));
    if (existing) return existing;

    const baseCode = `EMP${String(userId).padStart(6, '0')}`;
    const codeTaken = await this.employeeRepo.findOne({
      where: { employeeCode: baseCode },
    });
    const employee = this.employeeRepo.create({
      userId,
      appId: appId || null,
      employeeCode: codeTaken ? `${baseCode}${Date.now()}` : baseCode,
      joiningDate: new Date(),
      employeeStatusId: 132,
      employmentStatusId: 92,
    });
    return this.employeeRepo.save(employee);
  }

  private async ensureEmployeeForLeave(
    userId: number,
    appId: number,
  ): Promise<Employee> {
    return this.ensureEmployee(userId, appId);
  }

  async createOrUpdateEmpLeaveRequest(
    dto: CreateEmpLeaveRequestDto,
  ): Promise<EmpLeaveRequest> {
    const userId = Number(RequestContext.get('userId'));
    let appId = Number(RequestContext.get('activeAppId')) || null;

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId ?? null;
    }

    if (!userId || !appId) throw new NotFoundException('App User not found');

    const employee = await this.ensureEmployeeForLeave(userId, appId);

    dto.appId = appId;
    dto.empId = employee.id;

    const leaveType = await this.empLeaveTypeRepo.findOne({
      where: { id: dto.leaveTypeId, appId },
    });

    if (!leaveType)
      throw new NotFoundException(
        `EmpLeaveType with ID ${dto.leaveTypeId} not found`,
      );

    const yearOf = (value?: string | Date | null) => {
      if (!value) return null;
      const text =
        value instanceof Date
          ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
          : String(value).trim();
      const iso = text.match(/^(\d{4})[-/]/);
      if (iso) return Number(iso[1]);
      const dayFirst = text.match(/^\d{1,2}[-/]\d{1,2}[-/](\d{4})/);
      if (dayFirst) return Number(dayFirst[1]);
      return null;
    };
    const dayKey = (value?: string | Date | null) => {
      if (!value) return '';
      const text =
        value instanceof Date
          ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
          : String(value).trim();
      const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
      return iso ? iso[1] : '';
    };
    const startDay = dayKey(dto.startDate);
    const endDay = dayKey(dto.endDate);
    if (startDay && endDay && endDay < startDay) {
      throw new BadRequestException(
        'End date cannot be before the start date',
      );
    }

    const startYear = yearOf(dto.startDate);
    const endYear = yearOf(dto.endDate);
    if (
      leaveType.year &&
      startYear &&
      endYear &&
      (startYear !== Number(leaveType.year) ||
        endYear !== Number(leaveType.year))
    ) {
      throw new BadRequestException(
        `Leave dates must be in ${leaveType.year}, the year set on this leave type`,
      );
    }

    dto.leaveTypeId = leaveType.id;

    if (dto.attachmentMedia) {
      const media = await this.mediaService.uploadFile(dto.attachmentMedia);
      dto.attachmentMediaId = media.id;
      delete dto.attachmentMedia;
    }

    if (dto.id) {
      const leaveRequest = await this.empLeaveRequestRepo.findOne({
        where: { id: dto.id },
        relations: ['employee', 'approvalStatus'],
      });
      if (!leaveRequest)
        throw new NotFoundException(
          `EmpLeaveRequest with ID ${dto.id} not found`,
        );

      const prevStatusId = leaveRequest.approvalStatusId;

      this.empLeaveRequestRepo.merge(leaveRequest, dto);

      await this.empLeaveRequestRepo.save(leaveRequest);

      const updatedLeaveRequest = await this.empLeaveRequestRepo.findOne({
        where: { id: leaveRequest.id },
        relations: ['employee', 'approvalStatus'],
      });

      if (!updatedLeaveRequest)
        throw new NotFoundException(
          `Leave Request with ID ${leaveRequest.id} not found after update`,
        );

      if (dto.approvalStatusId !== prevStatusId) {
        const empUserId = updatedLeaveRequest?.employee?.userId;
        const approvalStatus = updatedLeaveRequest?.approvalStatus;

        if (empUserId && approvalStatus) {
          void this.usersService
            .createUserNotification(
              empUserId,
              `Your leave request status has been changed to <b class="text-${approvalStatus.colorName}">${approvalStatus.name}</b>`,
            )
            .catch(() => undefined);
        }
      }

      return updatedLeaveRequest;
    }

    const pendingStatus = await this.commonDao.findStatusByCode(
      'leave_request_approval_pending',
    );
    if (!pendingStatus) {
      throw new BadRequestException('Leave pending status is not configured');
    }
    dto.approvalStatusId = pendingStatus.id;

    const leaveRequest = this.empLeaveRequestRepo.create(dto);
    const saved = await this.empLeaveRequestRepo.save(leaveRequest);

    const savedLeaveRequest = await this.empLeaveRequestRepo.findOne({
      where: { id: saved.id },
      relations: ['employee', 'approvalStatus'],
    });

    if (!savedLeaveRequest)
      throw new NotFoundException(
        `Leave Request with ID ${saved.id} not found after creation`,
      );

    const empUserId = savedLeaveRequest?.employee?.userId;
    const approvalStatus = savedLeaveRequest?.approvalStatus;

    if (empUserId && approvalStatus) {
      void this.usersService
        .createUserNotification(
          empUserId,
          `Your leave request for <b>${leaveType.name}</b> has been submitted and is currently <b class="text-${approvalStatus.colorName}">${approvalStatus.name}</b>.`,
        )
        .catch(() => undefined);
    }

    return savedLeaveRequest;
  }

  async findMyLeaveRequests(
    queryString: any,
  ): Promise<{ data: EmpLeaveRequest[]; total: number }> {
    const userId = RequestContext.get('userId');
    let appId = RequestContext.get('activeAppId');

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    if (!userId) {
      throw new BadRequestException('User not found');
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.empLeaveRequestRepo.createQueryBuilder('leaveRequest');

    query.leftJoin('leaveRequest.employee', 'employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.employmentStatus', 'employmentStatus');
    query.leftJoin('employee.employeeStatus', 'employeeStatus');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('leaveRequest.empLeaveType', 'empLeaveType');
    query.leftJoin('leaveRequest.approvalStatus', 'approvalStatus');

    query.addSelect([
      // 'employee.userId',
      'employee.id',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',

      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'profilePicture.id',
      'profilePicture.filename',
      'empLeaveType.id',
      'empLeaveType.name',
      'empLeaveType.isPaid',
      'approvalStatus.name',
      'approvalStatus.code',
      'approvalStatus.colorName',
    ]);

    query.where('leaveRequest.appId = :appId', { appId });
    query.andWhere('employee.userId = :userId', { userId });

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(leaveRequest.reason LIKE :search
      OR user.firstName LIKE :search
      OR user.lastName LIKE :search
      OR user.email LIKE :search
    )`,
        { search },
      );
    }

    if (params.officeTypeId) {
      query.andWhere('officeType.id = :officeTypeId', {
        officeTypeId: params.officeTypeId,
      });
    }

    if (params.statusId) {
      query.andWhere('leaveRequest.approvalStatusId = :statusId', {
        statusId: params.statusId,
      });
    }

    if (params.approvalStatusId) {
      query.andWhere('leaveRequest.approvalStatusId = :approvalStatusId', {
        approvalStatusId: params.approvalStatusId,
      });
    }

    if (params.leaveTypeId) {
      query.andWhere('leaveRequest.leaveTypeId = :leaveTypeId', {
        leaveTypeId: params.leaveTypeId,
      });
    }

    if (params.createdAt) {
      query.andWhere('Date(leaveRequest.createdAt) = :createdAt', {
        createdAt: params.createdAt,
      });
    }

    if (params.approvalDate) {
      query.andWhere('Date(leaveRequest.approvalDate) = :approvalDate', {
        approvalDate: params.approvalDate,
      });
    }

    if (params.startDate) {
      query.andWhere('Date(leaveRequest.startDate) = :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('Date(leaveRequest.endDate) = :endDate', {
        endDate: params.endDate,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findMyRequisitions(
    queryString: any,
  ): Promise<{ data: Requisition[]; total: number }> {
    const userId = Number(RequestContext.get('userId'));
    let appId = Number(RequestContext.get('activeAppId')) || null;

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      if (appUser?.appId) {
        appId = appUser.appId;
      }
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.requisitionRepo.createQueryBuilder('requisition');

    query.leftJoin('requisition.employee', 'employee');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('employee.designation', 'designation');

    query.leftJoin('requisition.department', 'department');
    query.leftJoin('requisition.unitType', 'unitType');
    query.leftJoin('requisition.status', 'status');
    query.leftJoin('requisition.approvedByUser', 'approvedByUser');
    query.leftJoin(
      Employee,
      'approverEmployee',
      'approverEmployee.userId = approvedByUser.id AND approverEmployee.appId = requisition.appId',
    );
    query.leftJoin('approverEmployee.designation', 'approverDesignation');

    query.addSelect([
      'employee.id',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',

      'userProfile.id',
      'userProfile.phoneCountryId',
      'userProfile.phone',
      'userProfile.gender',

      'phoneCountry.id',
      'phoneCountry.callingCode',

      'profilePicture.id',
      'profilePicture.filename',

      'designation.id',
      'designation.name',

      'department.id',
      'department.name',

      'unitType.id',
      'unitType.name',
      'unitType.code',
      'unitType.colorName',

      'status.id',
      'status.name',
      'status.code',
      'status.colorName',

      'approvedByUser.id',
      'approvedByUser.firstName',
      'approvedByUser.lastName',
      'approvedByUser.email',

      'approverEmployee.id',
      'approverEmployee.employeeCode',

      'approverDesignation.id',
      'approverDesignation.name',
    ]);

    query.where('requisition.appId = :appId', { appId });
    query.andWhere('employee.userId = :userId', { userId });

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(requisition.requisitionNo LIKE :search
        OR requisition.itemDescription LIKE :search
        OR requisition.remarks LIKE :search
        OR user.firstName LIKE :search
        OR user.lastName LIKE :search
        OR user.email LIKE :search)`,
        { search },
      );
    }

    if (params.departmentId) {
      query.andWhere('requisition.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.statusId) {
      query.andWhere('requisition.statusId = :statusId', {
        statusId: params.statusId,
      });
    }

    if (params.unitTypeId) {
      query.andWhere('requisition.unitTypeId = :unitTypeId', {
        unitTypeId: params.unitTypeId,
      });
    }

    if (params.employeeId) {
      query.andWhere('requisition.employeeId = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    if (params.requisitionDate) {
      query.andWhere('DATE(requisition.requisitionDate) = :requisitionDate', {
        requisitionDate: params.requisitionDate,
      });
    }

    if (params.approvedDate) {
      query.andWhere('DATE(requisition.approvedDate) = :approvedDate', {
        approvedDate: params.approvedDate,
      });
    }

    if (params.createdAt) {
      query.andWhere('DATE(requisition.createdAt) = :createdAt', {
        createdAt: params.createdAt,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // get all pending requisition

  async findAllPendingRequisitions(
    queryString: any,
  ): Promise<{ data: Requisition[]; total: number }> {
    let appId = Number(RequestContext.get('activeAppId')) || null;

    if (!appId) {
      const userId = Number(RequestContext.get('userId'));
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      if (appUser?.appId) {
        appId = appUser.appId;
      }
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.requisitionRepo.createQueryBuilder('requisition');

    query.leftJoin('requisition.employee', 'employee');
    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.employmentStatus', 'employmentStatus');
    query.leftJoin('employee.employeeStatus', 'employeeStatus');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('employee.designation', 'designation');

    query.leftJoin('requisition.department', 'department');
    query.leftJoin('requisition.unitType', 'unitType');
    query.leftJoin('requisition.status', 'status');

    query.addSelect([
      'employee.id',
      'employee.employeeCode',

      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',
      'employeeStatus.name',
      'employeeStatus.code',
      'employeeStatus.colorName',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',

      'userProfile.id',
      'userProfile.phoneCountryId',
      'userProfile.phone',
      'userProfile.gender',

      'phoneCountry.id',
      'phoneCountry.callingCode',

      'profilePicture.id',
      'profilePicture.filename',

      'designation.id',
      'designation.name',

      'department.id',
      'department.name',

      'unitType.id',
      'unitType.name',
      'unitType.code',
      'unitType.colorName',

      'status.id',
      'status.name',
      'status.code',
      'status.colorName',
    ]);
    query.where('requisition.appId = :appId', { appId });
    query.andWhere('requisition.statusId = :statusId', { statusId: 138 });

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(requisition.requisitionNo LIKE :search
        OR requisition.itemDescription LIKE :search
        OR requisition.remarks LIKE :search
        OR user.firstName LIKE :search
        OR user.lastName LIKE :search
        OR user.email LIKE :search)`,
        { search },
      );
    }

    if (params.departmentId) {
      query.andWhere('requisition.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.unitTypeId) {
      query.andWhere('requisition.unitTypeId = :unitTypeId', {
        unitTypeId: params.unitTypeId,
      });
    }

    if (params.employeeId) {
      query.andWhere('requisition.employeeId = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    if (params.requisitionDate) {
      query.andWhere('DATE(requisition.requisitionDate) = :requisitionDate', {
        requisitionDate: params.requisitionDate,
      });
    }

    if (params.approvedDate) {
      query.andWhere('DATE(requisition.approvedDate) = :approvedDate', {
        approvedDate: params.approvedDate,
      });
    }

    if (params.createdAt) {
      query.andWhere('DATE(requisition.createdAt) = :createdAt', {
        createdAt: params.createdAt,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findAllEmployeeLeaveRequests(queryString: any): Promise<{
    data: { list: EmpLeaveRequest[]; headers: any };
    total: number;
  }> {
    let appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.empLeaveRequestRepo.createQueryBuilder('leaveRequest');

    query.leftJoin('leaveRequest.employee', 'employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('leaveRequest.empLeaveType', 'empLeaveType');
    query.leftJoin('leaveRequest.approvalStatus', 'approvalStatus');
    query.leftJoin('leaveRequest.approver', 'approver');
    query.leftJoin('approver.employee', 'approverEmployee');
    query.leftJoin('approverEmployee.designation', 'approverDesignation');
    query.where('leaveRequest.appId = :appId', { appId });

    query.addSelect([
      // 'employee.userId',
      'employee.id',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',

      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'profilePicture.id',
      'profilePicture.filename',
      'empLeaveType.id',
      'empLeaveType.name',
      'empLeaveType.isPaid',
      'approvalStatus.name',
      'approvalStatus.code',
      'approvalStatus.colorName',
      'approver.id',
      'approver.firstName',
      'approver.lastName',
      'approverEmployee.id',
      'approverDesignation.id',
      'approverDesignation.name',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search
      OR user.lastName LIKE :search
      OR user.email LIKE :search
    )`,
        { search },
      );
    }

    if (params.officeTypeId) {
      query.andWhere('officeType.id = :officeTypeId', {
        officeTypeId: params.officeTypeId,
      });
    }

    if (params.departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.designationId) {
      query.andWhere('designation.id = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.createdAt) {
      query.andWhere('Date(leaveRequest.createdAt) = :createdAt', {
        createdAt: params.createdAt,
      });
    }

    if (params.approvalDate) {
      query.andWhere('Date(leaveRequest.approvalDate) = :approvalDate', {
        approvalDate: params.approvalDate,
      });
    }

    if (params.year) {
      query.andWhere('YEAR(leaveRequest.startDate) = :leaveYear', {
        leaveYear: Number(params.year),
      });
    }

    if (params.statusId) {
      query.andWhere('leaveRequest.approvalStatusId = :statusId', {
        statusId: params.statusId,
      });
    }

    if (params.leaveTypeId) {
      query.andWhere('leaveRequest.leaveTypeId = :leaveTypeId', {
        leaveTypeId: params.leaveTypeId,
      });
    }

    if (params.startDate) {
      query.andWhere('Date(leaveRequest.startDate) = :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('Date(leaveRequest.endDate) = :endDate', {
        endDate: params.endDate,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    const totalUsers = await query.getMany();
    const totalUser = totalUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl,
    }));

    let leaveRequestPendingStatusId;
    let leaveRequestApprovedStatusId;
    let leaveRequestRejectedStatusId;

    if (
      (await this.cacheService.get('leaveRequestPendingStatusId')) &&
      (await this.cacheService.get('leaveRequestApprovedStatusId')) &&
      (await this.cacheService.get('leaveRequestRejectedStatusId'))
    ) {
      leaveRequestPendingStatusId = await this.cacheService.get(
        'leaveRequestPendingStatusId',
      );
      leaveRequestApprovedStatusId = await this.cacheService.get(
        'leaveRequestApprovedStatusId',
      );
      leaveRequestRejectedStatusId = await this.cacheService.get(
        'leaveRequestRejectedStatusId',
      );
    } else {
      leaveRequestPendingStatusId = await this.commonDao
        .findStatusByCode('leave_request_approval_pending')
        .then((s) => s?.id);
      leaveRequestApprovedStatusId = await this.commonDao
        .findStatusByCode('leave_request_approval_approved')
        .then((s) => s?.id);
      leaveRequestRejectedStatusId = await this.commonDao
        .findStatusByCode('leave_request_approval_rejected')
        .then((s) => s?.id);
      this.cacheService.set(
        'leaveRequestPendingStatusId',
        leaveRequestPendingStatusId,
      );
      this.cacheService.set(
        'leaveRequestApprovedStatusId',
        leaveRequestApprovedStatusId,
      );
      this.cacheService.set(
        'leaveRequestRejectedStatusId',
        leaveRequestRejectedStatusId,
      );
    }

    const pendingQuery = query
      .clone()
      .andWhere('leaveRequest.approvalStatusId = :statusId', {
        statusId: leaveRequestPendingStatusId,
      });

    const pendingUsers = await pendingQuery.getMany();
    const pendingUserNames = pendingUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));
    const pendingCount = await pendingQuery.getCount();

    const approvedQuery = query
      .clone()
      .andWhere('leaveRequest.approvalStatusId = :statusId', {
        statusId: leaveRequestApprovedStatusId,
      });

    const approvedUsers = await approvedQuery.getMany();
    const approvedUserNames = approvedUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));

    const approvedCount = await approvedQuery.getCount();

    const rejectedQuery = query
      .clone()
      .andWhere('leaveRequest.approvalStatusId IN(:...statusId)', {
        statusId: [leaveRequestRejectedStatusId],
      });

    const rejectedUsersData = await rejectedQuery.getMany();
    const rejectedUserNames = rejectedUsersData.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));
    const rejectedUsersCount = await rejectedQuery.getCount();

    const headers = {
      pending: {
        users: pendingUserNames,
        count: pendingCount,
      },
      approved: {
        users: approvedUserNames,
        count: approvedCount,
      },
      rejected: {
        users: rejectedUserNames,
        count: rejectedUsersCount,
      },
      total: {
        users: totalUser,
        count: total,
      },
    };
    await this.attachLeaveBalances(appId, data);
    return { data: { list: data, headers }, total };
  }

  //find all employee pending leave request

  async findAllEmployeePendingLeaveRequests(queryString: any): Promise<{
    data: { list: EmpLeaveRequest[] };
    total: number;
  }> {
    let appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.empLeaveRequestRepo.createQueryBuilder('leaveRequest');

    query.leftJoin('leaveRequest.employee', 'employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('leaveRequest.empLeaveType', 'empLeaveType');
    query.leftJoin('leaveRequest.approvalStatus', 'approvalStatus');
    query.leftJoin('leaveRequest.approver', 'approver');
    query.leftJoin('approver.employee', 'approverEmployee');
    query.leftJoin('approverEmployee.designation', 'approverDesignation');
    query.where('leaveRequest.appId = :appId', { appId });

    query.addSelect([
      'employee.id',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',

      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'profilePicture.id',
      'profilePicture.filename',
      'empLeaveType.id',
      'empLeaveType.name',
      'empLeaveType.isPaid',
      'approvalStatus.name',
      'approvalStatus.code',
      'approvalStatus.colorName',
      'approver.id',
      'approver.firstName',
      'approver.lastName',
      'approverEmployee.id',
      'approverDesignation.id',
      'approverDesignation.name',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    query.andWhere('leaveRequest.approvalStatusId = :statusId', {
      statusId: 51,
    });

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search
        OR user.lastName LIKE :search
        OR user.email LIKE :search)`,
        { search },
      );
    }

    if (params.officeTypeId) {
      query.andWhere('officeType.id = :officeTypeId', {
        officeTypeId: params.officeTypeId,
      });
    }

    if (params.departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.designationId) {
      query.andWhere('designation.id = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.year) {
      query.andWhere('YEAR(leaveRequest.startDate) = :pendingLeaveYear', {
        pendingLeaveYear: Number(params.year),
      });
    }

    if (params.leaveTypeId) {
      query.andWhere('leaveRequest.leaveTypeId = :leaveTypeId', {
        leaveTypeId: params.leaveTypeId,
      });
    }

    if (params.startDate) {
      query.andWhere('Date(leaveRequest.startDate) = :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('Date(leaveRequest.endDate) = :endDate', {
        endDate: params.endDate,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    await this.attachLeaveBalances(appId, data);

    return {
      data: { list: data },
      total,
    };
  }

  async getEmployeeLeaveSummary(
    queryString: any,
  ): Promise<{ data: any; total: number }> {
    const userId = RequestContext.get('userId');
    let appId = RequestContext.get('activeAppId');

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const query = this.empLeaveRequestRepo
      .createQueryBuilder('leaveRequest')
      .leftJoinAndSelect('leaveRequest.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('leaveRequest.empLeaveType', 'leaveType')
      .leftJoinAndSelect('leaveRequest.approvalStatus', 'approvalStatus')
      .leftJoinAndSelect('leaveRequest.approver', 'approver')
      .leftJoinAndSelect('approver.employee', 'approverEmployee')
      .leftJoinAndSelect('approverEmployee.designation', 'approverDesignation')
      .where('leaveRequest.appId = :appId', { appId })
      .orderBy('leaveRequest.createdAt', 'DESC');

    // Parse search params
    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search OR user.lastName LIKE :search OR leaveRequest.reason LIKE :search)`,
        { search },
      );
    }

    const data = await query.getMany();

    // Format each leave request
    const formatUser = (r) => ({
      id: r.id,
      empId: r.empId || r.employee?.id || null,
      employeeName: r.employee?.user
        ? `${r.employee.user.firstName} ${r.employee.user.lastName}`
        : null,
      email: r.employee?.user?.email || null,
      profilePicture:
        r.employee?.user?.profile?.profilePicture?.filename || null,
      profilePictureUrl:
        r.employee?.user?.profile?.profilePicture?.fileUrl || null,
      leaveType: r.empLeaveType?.name || null,
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason,
      decisionReason: r.decisionReason || null,
      appliedOn: r.createdAt,
      approvalDate: r.approvalDate,
      approveStatus: {
        name: r.approvalStatus?.name || null,
        code: r.approvalStatus?.code || null,
        colorName: r.approvalStatus?.colorName || null,
      },
      actionByName: r.approver
        ? `${r.approver.firstName || ''} ${r.approver.lastName || ''}`.trim()
        : null,
      actionByDesignation: r.approver?.employee?.designation?.name || null,
    });

    // Separate by status code
    const pendingUsers = data
      .filter(
        (r) => r.approvalStatus?.code === 'leave_request_approval_pending',
      )
      .map(formatUser);
    const approvedUsers = data
      .filter(
        (r) => r.approvalStatus?.code === 'leave_request_approval_approved',
      )
      .map(formatUser);
    const rejectedUsers = data
      .filter(
        (r) => r.approvalStatus?.code === 'leave_request_approval_rejected',
      )
      .map(formatUser);
    const totalUsers = data.map(formatUser);

    const headers = {
      pending: { users: pendingUsers, count: pendingUsers.length },
      approved: { users: approvedUsers, count: approvedUsers.length },
      rejected: { users: rejectedUsers, count: rejectedUsers.length },
      total: { users: totalUsers, count: totalUsers.length },
    };

    return { data: headers, total: totalUsers.length };
  }

  // Get Leave Request by ID
  async findEmpLeaveRequestById(id: number): Promise<EmpLeaveRequest> {
    const leaveRequest = await this.empLeaveRequestRepo.findOne({
      where: { id },
    });
    if (!leaveRequest)
      throw new NotFoundException(`Leave Request with ID ${id} not found`);
    return leaveRequest;
  }

  // Delete Leave Request
  async deleteEmpLeaveRequest(id: number): Promise<void> {
    const result = await this.empLeaveRequestRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Leave Request with ID ${id} not found`);
  }

  async updateLeaveRequestApprovalStatusById(
    id: number,
    dto: UpdateLeaveRequestDto,
  ): Promise<EmpLeaveRequestResponseDto> {
    const leaveRequest = await this.empLeaveRequestRepo.findOne({
      where: { id },
      relations: ['employee', 'approvalStatus'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }

    const prevStatusId = leaveRequest.approvalStatusId;

    const newStatus = await this.commonDao.findStatusById(dto.approvalStatusId);

    if (!newStatus) {
      throw new NotFoundException(
        `Status with ID ${dto.approvalStatusId} not found`,
      );
    }

    // Keep the employee's leave reason. The decision note is stored separately.
    const decisionNote = (dto.reason || '').trim();
    if (
      newStatus.code === 'leave_request_approval_rejected' &&
      !decisionNote
    ) {
      throw new BadRequestException('Rejection reason is required');
    }

    leaveRequest.approvalStatus = newStatus;
    leaveRequest.approvalStatusId = newStatus.id;

    if (
      newStatus.code === 'leave_request_approval_approved' ||
      newStatus.code === 'leave_request_approval_rejected'
    ) {
      leaveRequest.decisionReason = decisionNote || null;
      leaveRequest.approvedBy = this.userContextService.getUserId();
      leaveRequest.approvalDate = new Date();
    }

    const updatedLeaveRequest =
      await this.empLeaveRequestRepo.save(leaveRequest);

    const reloadedLeaveRequest = await this.empLeaveRequestRepo.findOne({
      where: { id: updatedLeaveRequest.id },
      relations: ['employee', 'employee.user', 'approvalStatus'],
    });

    if (!reloadedLeaveRequest) {
      throw new NotFoundException(
        `Leave Request with id ${updatedLeaveRequest.id} not found after update`,
      );
    }

    if (prevStatusId !== reloadedLeaveRequest.approvalStatusId) {
      const empUserId = reloadedLeaveRequest?.employee?.userId;
      const newStatus = reloadedLeaveRequest?.approvalStatus;

      const user = reloadedLeaveRequest?.employee?.user;

      if (user && [52, 53].includes(newStatus.id)) {
        try {
          await this.hybridQueue.publishEmailJob({
            to: user.email,
            subject: 'Leave Request Status Updated',
            template: 'update-leave-request-status',
            context: {
              name: user.firstName + ' ' + user.lastName,
              newStatus: reloadedLeaveRequest.approvalStatus.name,
              newStatusColor: reloadedLeaveRequest.approvalStatus.colorName,
              emailClosingNote: 'Thank you for using our management system.',
              supportTeamName: 'HR Team',
            },
          });
        } catch (error) {
          console.error('Leave status email was not queued:', error);
        }
      }
      // try {
      //   await this.mailService.sendMail(
      //     user.email,
      //     'Leave Request Status Updated',
      //     'update-leave-request-status',

      //     {
      //       name: `${user.firstName} ${user.lastName}`,
      //       newStatus: reloadedLeaveRequest.approvalStatus.name,
      //       newStatusColor: reloadedLeaveRequest.approvalStatus.colorName,
      //       emailClosingNote: 'Thank you for using our management system.',
      //       supportTeamName: 'HR Team',
      //     },
      //   );

      // } catch (error) {
      //   console.error('Email sending error:', error);
      // }

      if (empUserId && newStatus) {
        try {
          await this.usersService.createUserNotification(
            empUserId,
            `Your leave request has been <b class="text-${newStatus.colorName}">${newStatus.name}</b>.`,
          );
        } catch (error) {
          console.error('Leave status notification was not saved:', error);
        }
      }
    }
    return EmpLeaveRequestResponseDto.fromEntity(updatedLeaveRequest);
  }

  async createEmpInvitation(dto: CreateEmpInvitationDto) {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    dto.appId = appUser.appId ?? undefined;

    dto.code = uuidv4();
    const invitation = this.empInvitationRepo.create({ ...dto });
    invitation.createdAt = new Date();
    invitation.sentAt = new Date();
    const savedInvitation = await this.empInvitationRepo.save(invitation);
    invitation.invitationStatusId = 90; // status Draft

    const newInvitation = await this.empInvitationRepo.findOne({
      where: { id: savedInvitation.id },
      relations: [
        'office.address.country',
        'application.logoMedia',
        'designation',
      ],
    });

    if (!newInvitation) {
      throw new NotFoundException('Invitation not found');
    }

    const addressInfo = `
    <span>${newInvitation?.office?.address?.address}, </span><br/>
    <span>${newInvitation?.office?.address?.city}, </span><br/>
    <span>${newInvitation?.office?.address?.postalCode}, </span><br/>
    <span>${newInvitation?.office?.address?.country?.name}.</span>
    `;

    await this.mailService.sendMail(
      newInvitation.email,
      'Employee Invitation',
      'employee-invitation',
      {
        officeName: newInvitation?.office?.name,
        applicationName: newInvitation?.application?.name,
        email: newInvitation?.office?.address?.email,
        officeAddress: addressInfo,
        invitationLink: `${process.env.FRONTEND_URL}/sign-up?invitationCode=${newInvitation.code}&email=${newInvitation.email}`,
      },
    );

    return newInvitation;
  }

  async invitationAccept(id: number) {
    const invitation = await this.empInvitationRepo.findOne({
      where: { id },
      relations: ['office', 'designation', 'application'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitationStatusId === 92) {
      throw new BadRequestException('Invitation already accepted');
    }

    const user = await this.userRepo.findOne({
      where: { id: invitation.userId ?? 0 },
    });

    if (!user) {
      throw new NotFoundException('User not found with this invitation code');
    }

    const employeeCount = await this.employeeRepo.count({
      where: {
        appId: invitation.appId,
        joiningDate: new Date(),
      },
    });

    const employeeCode =
      Helpers.avatarText(invitation?.application?.name) +
      (new Date().getFullYear() + employeeCount + 1)
        .toString()
        .padStart(6, '0');

    const employee = this.employeeRepo.create({
      userId: user.id,
      employeeCode: employeeCode,
      appId: invitation.appId,
      officeId: invitation.officeId,
      designationId: invitation.designationId,
      joiningDate: new Date(),
      employeeStatusId: 132,
      employmentStatusId: 92,
    });

    const savedEmployee = await this.employeeRepo.save(employee);
    invitation.empId = savedEmployee.id;
    invitation.invitationStatusId = 92; // Accepted
    invitation.confirmedAt = new Date();

    const updatedInvitation = await this.empInvitationRepo.save(invitation);

    return updatedInvitation;
  }

  async getMyEmployeeInvitationList(
    queryString: any,
  ): Promise<EmpInvitation[]> {
    const userId = RequestContext.get('userId');

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const query = this.empInvitationRepo.createQueryBuilder('invitation');
    query.leftJoin('invitation.application', 'application');
    query.leftJoin('invitation.office', 'office');
    query.leftJoin('office.address', 'address');
    query.leftJoin('address.country', 'country');
    query.leftJoin('invitation.user', 'user');
    query.leftJoin('invitation.designation', 'designation');
    query.leftJoin('invitation.status', 'status');
    query.leftJoin('invitation.employee', 'employee');

    query.where('invitation.userId = :userId', { userId });

    query.addSelect([
      'application.name',
      'office.name',
      'address.email',
      'address.phone',
      'address.address',
      'address.city',
      'address.postalCode',
      'address.city',
      'address.countryId',
      'country.name',
      'user.firstName',
      'user.lastName',
      'designation.name',
      'designation.level',
      'status.name',
      'status.code',
      'status.colorName',
    ]);

    const features = new APIFeatures(query, queryString).sort().limitFields();

    const data = await features.getQuery().getMany();

    return data;

    // const invitations = await this.empInvitationRepo.find({
    //   where: { userId },
    //   relations: ['office', 'designation', 'application'],
    //   order: { createdAt: 'DESC' },
    // });

    //return invitations;
  }

  async findAllEmpInvitations(
    queryString: any,
  ): Promise<{ data: EmpInvitation[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    const query = this.empInvitationRepo.createQueryBuilder('invitation');
    query.leftJoin('invitation.office', 'office');
    query.leftJoin('invitation.shift', 'shift');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('invitation.user', 'user');
    query.leftJoin('invitation.designation', 'designation');
    query.leftJoin('designation.department', 'department');
    query.leftJoin('invitation.status', 'status');
    query.leftJoin('invitation.employee', 'employee');

    query.addSelect([
      'office.name',
      'officeType.id',
      'officeType.name',
      // 'shift.id',
      'shift.name',
      'shift.startTime',
      'shift.delayStartTime',
      'shift.endTime',
      'shift.earlyEndTime',
      'user.id',
      'user.firstName',
      'user.lastName',
      'designation.name',
      'department.name',
      'status.name',
      'status.code',
      'status.colorName',
      'employee.id',
      'employee.employeeStatusId',
      'employee.employmentStatusId',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('invitation.appId = :appId', {
      appId: appUser.id,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(office.name LIKE :search
      OR  designation.name LIKE :search
      OR  status.name LIKE :search
      OR  invitation.email LIKE :search
      OR  invitation.code LIKE :search

      )
      `,
        { search },
      );
    }

    if (params.officeId) {
      query.andWhere('invitation.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.designationId) {
      query.andWhere('invitation.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.statusId) {
      query.andWhere('invitation.invitationStatusId = :statusId', {
        statusId: params.statusId,
      });
    }

    if (params.employeeStatusId) {
      query.andWhere('employee.employeeStatusId = :employeeStatusId', {
        employeeStatusId: params.employeeStatusId,
      });
    }

    if (params.employmentStatusId) {
      query.andWhere('employee.employmentStatusId = :employmentStatusId', {
        employmentStatusId: params.employmentStatusId,
      });
    }

    if (params.sentAt) {
      query.andWhere('Date(invitation.sentAt) = :sentAt', {
        sentAt: params.sentAt,
      });
    }

    if (params.confirmedAt) {
      query.andWhere('Date(invitation.confirmedAt) = :confirmedAt', {
        confirmedAt: params.confirmedAt,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findEmpInvitationById(id: number): Promise<EmpInvitation> {
    const invitation = await this.empInvitationRepo.findOne({ where: { id } });
    if (!invitation)
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    return invitation;
  }

  async deleteEmpInvitation(id: number): Promise<void> {
    const result = await this.empInvitationRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Invitation with ID ${id} not found`);
  }

  async updateEmpInvitationStatusById(
    id: number,
    dto: UpdateEmpInvitationStatusDto,
  ): Promise<EmpInvitationResponseDto> {
    const invitation = await this.empInvitationRepo.findOne({
      where: { id },
      relations: ['employee', 'employee.user', 'status'],
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    const prevStatusId = invitation.invitationStatusId;

    const newStatus = await this.commonDao.findStatusById(
      dto.invitationStatusId,
    );
    if (!newStatus) {
      throw new NotFoundException(
        `Status with ID ${dto.invitationStatusId} not found`,
      );
    }

    invitation.status = newStatus;
    invitation.invitationStatusId = newStatus.id;

    if (newStatus.code === 'emp_invitation_sent') {
      invitation.sentAt = new Date();
    } else if (newStatus.code === 'emp_invitation_accepted') {
      invitation.confirmedAt = new Date();
    }

    const updatedInvitation = await this.empInvitationRepo.save(invitation);

    if (prevStatusId !== newStatus.id) {
      const empUserId = updatedInvitation.employee?.userId;
      const email = updatedInvitation.email;
      const user = updatedInvitation.employee?.user;

      if (email && [91, 92].includes(newStatus.id) && user) {
        const companyName =
          updatedInvitation.employee?.office?.name || 'Company';
        const designation =
          updatedInvitation.designation?.name || 'Designation';

        const subject = `Invitation To Join in ${companyName} for the Post of ${designation}`;
        const emailTitle = 'Accept Employee Invitation';
        await this.hybridQueue.publishEmailJob({
          to: user.email,
          subject: subject,
          template: 'update-employee-invitaion-status',
          context: {
            title: emailTitle,
            name: user.firstName + ' ' + user.lastName,
            newStatus: newStatus.name,
            newStatusColor: newStatus.colorName,
            emailClosingNote: 'Thank you for using our system.',
            supportTeamName: 'HR Team',
          },
        });
      }

      // try {
      //   await this.mailService.sendMail(
      //     email,
      //     'Employee Invitation Status Updated',
      //     'update-employee-invitaion-status',
      //     {
      //       name: `${user.firstName} ${user.lastName}`,
      //       newStatus: newStatus.name,
      //       newStatusColor: newStatus.colorName,
      //       emailClosingNote: 'Thank you for using our system.',
      //       supportTeamName: 'HR Team',
      //     },
      //   );
      // } catch (error) {
      //   console.error('Email sending error:', error);
      // }
      // }

      if (empUserId && newStatus) {
        await this.usersService.createUserNotification(
          empUserId,
          `Your invitation status is <b class="text-${newStatus.colorName}">${newStatus.name}</b>.`,
        );
      }
    }

    return EmpInvitationResponseDto.fromEntity(updatedInvitation);
  }

  // Employee Attendance Check-In
  async attendanceCheckIn(
    dto: CreateCheckInDto,
  ): Promise<EmpAttendance | null> {
    const attendance = new EmpAttendance();

    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo.findOne({
      where: { userId, ...(appId ? { appId: Number(appId) } : {}) },
      relations: ['officeShift'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    if (!employee.officeId || !employee.officeShiftId) {
      throw new BadRequestException(
        'Office and shift must be assigned before check-in',
      );
    }

    attendance.appId = appId || 0;
    attendance.empId = employee?.id || 0;
    attendance.officeId = employee.officeId;
    attendance.shiftId = employee.officeShiftId;
    attendance.attendanceDate = new Date().toISOString().split('T')[0];
    attendance.checkIn = new Date();

    // Prevent duplicate check-ins
    const existing = await this.empAttendanceRepo.findOne({
      where: {
        appId: attendance.appId,
        empId: attendance.empId,
        attendanceDate: attendance.attendanceDate,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Employee already checked in for this date',
      );
    }

    const parser = new UAParser(dto.userAgent);
    const device = parser.getDevice();
    const deviceType =
      device.type === 'mobile'
        ? 'Mobile'
        : device.type === 'tablet'
          ? 'Tablet'
          : 'Desktop';

    const checkInMethodStatus =
      await this.commonDao.findStatusByName(deviceType);

    if (!checkInMethodStatus) {
      throw new BadRequestException('Check-in method status not found');
    }
    attendance.checkInMethodId = checkInMethodStatus.id;
    attendance.ipAddress = dto.ipAddress;
    attendance.checkInLatLong = dto.checkInLatLong;

    let attendanceStatusCode = 'emp_attendance_status_absent';
    const checkInTime = Helpers.dDateUtc(attendance.checkIn, 'HH:mm:ss');
    const endTime = employee?.officeShift?.endTime;

    const office = await this.officeRepo.findOne({
      where: {
        id:
          employee?.officeId !== null && employee?.officeId !== undefined
            ? employee?.officeId
            : Not(IsNull()),
        appId: appId,
      },
    });

    const officeTimezone = office?.timezone || 'Asia/Dhaka';

    const comparison = Helpers.compareTimesWithTimezone(
      attendance.checkIn,
      employee?.officeShift?.delayStartTime || '',
      officeTimezone,
    );

    if (comparison < 0) {
      attendanceStatusCode = 'attendance_checkin_status_ontime';
    } else if (comparison > 0) {
      attendanceStatusCode = 'attendance_checkin_status_late';
    }

    if (endTime !== null && endTime !== undefined && checkInTime > endTime) {
      attendance.attendanceStatusId = 43; // Absent
    } else {
      attendance.attendanceStatusId = 42; // Present
    }

    const attendanceStatus =
      await this.commonDao.findStatusByCode(attendanceStatusCode);

    attendance.checkInStatusId = attendanceStatus?.id;

    const saved = await this.empAttendanceRepo.save(attendance);

    const findAttendance = await this.empAttendanceRepo.findOne({
      where: { id: saved.id },
      relations: ['attendanceStatus', 'checkInMethod'],
    });

    // === Late logic ===
    if (attendanceStatusCode === 'attendance_checkin_status_late') {
      const delayStartTime = employee?.officeShift?.delayStartTime;

      if (delayStartTime) {
        const lateMinutes = Helpers.diffInMinutes(
          attendance.checkIn,
          delayStartTime,
          officeTimezone,
        );

        const rule = await this.lateAttendanceRuleRepo
          .createQueryBuilder('rule')
          .where('rule.appId = :appId', { appId })
          .where('rule.officeId = :officeId', { officeId: employee.officeId })
          .andWhere(
            'rule.minLateMinutes <= :lateMinutes AND rule.maxLateMinutes >= :lateMinutes',
            { lateMinutes },
          )
          .orWhere(
            'rule.minLateMinutes <= :lateMinutes AND rule.maxLateMinutes IS NULL',
            { lateMinutes },
          )
          .andWhere('rule.isActive = 1')
          .orderBy('rule.minLateMinutes', 'ASC')
          .getOne();

        if (rule) {
          // === Find or create counter (always) ===
          let counter = await this.empLateCounterRepo.findOne({
            where: { appId, empId: employee.id, lateAttendanceRuleId: rule.id },
          });

          if (!counter) {
            counter = this.empLateCounterRepo.create({
              appId,
              empId: employee.id,
              officeId: employee.officeId,
              lateAttendanceRuleId: rule.id,
              lateCounter: 1,
            });
          } else {
            counter.lateCounter = (counter.lateCounter || 0) + 1;
          }

          await this.empLateCounterRepo.save(counter);

          const createAttendancePenalty = this.empAttendancePenaltyRepo.create({
            appId,
            empId: employee.id,
            amount: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            entryTime: attendance.checkIn,
            details: `Late penalty for exceeding ${rule.minLateMinutes} minutes late check-in`,
          });

          if (rule.isAbsent) {
            createAttendancePenalty.entryStatusId = 43; // Absent
            attendance.attendanceStatusId = 43; // Absent
            await this.empAttendanceRepo.save(attendance);
            await this.empAttendancePenaltyRepo.save(createAttendancePenalty);
          } else {
            if (counter.lateCounter === rule.fineIntervalDays) {
              createAttendancePenalty.entryStatusId =
                attendance.checkInStatusId; // Late
              createAttendancePenalty.amount = rule.fineAmount;
            }
            await this.empAttendancePenaltyRepo.save(createAttendancePenalty);
            counter.lateCounter = 0; // Reset counter
            await this.empLateCounterRepo.save(counter);
          }
        }
      }
    }

    // === Dashboard notification ===
    if (appId) {
      const dashboardData = await this.getDashboardData();
      await this.notificationGateway.broadcastAttendanceUpdate(
        appId,
        dashboardData,
      );
    }

    return findAttendance;
  }

  //get penalties list with filter by empId, month, year

  async getEmpAttendancePenalties(
    queryString: any,
  ): Promise<{ data: EmpAttendancePenalty[]; total: number }> {
    const query = this.empAttendancePenaltyRepo.createQueryBuilder('penalty');
    query.leftJoin('penalty.employee', 'employee');
    query.leftJoin('penalty.entryStatus', 'entryStatus');

    query.addSelect([
      'employee.id',
      'employee.employeeCode',

      'entryStatus.id',
      'entryStatus.name',
      'entryStatus.code',
      'entryStatus.colorName',
    ]);

    const features = new APIFeatures(query, queryString);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(`penalty.month LIKE :search`, { search });
    }

    if (params.empId) {
      query.andWhere('penalty.empId = :empId', { empId: params.empId });
    }

    if (params.month) {
      query.andWhere('penalty.month = :month', { month: params.month });
    }

    if (params.year) {
      query.andWhere('penalty.year = :year', { year: params.year });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Employee Attendance Check-Out
  async attendanceCheckOut(
    dto: CreateCheckOutDto,
  ): Promise<EmpAttendance | null> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId, ...(appId ? { appId: Number(appId) } : {}) },
      relations: ['officeShift'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    if (!employee.officeId || !employee.officeShiftId) {
      throw new BadRequestException(
        'Office and shift must be assigned before check-out',
      );
    }

    // const findAttendance = await this.empAttendanceRepo.findOne({
    //   where:
    //     appUser.appId !== null
    //       ? {
    //           empId: employee.id,
    //           appId: appUser.appId,
    //           attendanceDate: new Date().toISOString().split('T')[0],
    //         }
    //       : {
    //           empId: employee.id,
    //           attendanceDate: new Date().toISOString().split('T')[0],
    //         },
    // });

    const findAttendance = await this.empAttendanceRepo.findOne({
      where: { id: dto.id },
    });

    if (!findAttendance) {
      throw new BadRequestException('Employee has not checked in yet');
    }

    // Get office timezone
    const office = await this.officeRepo.findOne({
      where: {
        id:
          employee?.officeId !== null && employee?.officeId !== undefined
            ? employee?.officeId
            : Not(IsNull()),
        appId: appId,
      },
    });

    const officeTimezone = office?.timezone || 'Asia/Dhaka';

    findAttendance.checkOut = new Date();

    // Calculate worked hours
    findAttendance.workedHour = findAttendance.checkIn
      ? Helpers.getHoursBetweenDateTime(
          findAttendance.checkIn.toISOString(),
          findAttendance.checkOut.toISOString(),
        )
      : 0;

    const totalOfficeHour = employee?.officeShift?.totalOfficeHour || 0;

    if (findAttendance.workedHour > totalOfficeHour) {
      findAttendance.overtimeHours =
        findAttendance.workedHour - totalOfficeHour;
    } else {
      findAttendance.overtimeHours = 0;
    }

    const earlyEndTime = employee?.officeShift?.earlyEndTime;
    const endTime = employee?.officeShift?.endTime;
    // Use timezone-aware comparison for check-out status
    const checkOutStatusCode = 150; // Default: left timely (150)

    const checkOutTime = Helpers.dDateUtc(findAttendance.checkOut, 'HH:mm:ss');
    // Use timezone-aware comparison for check-out status
    findAttendance.checkOutStatusId = 150; // left timely

    if (earlyEndTime) {
      // Compare check-out time with earlyEndTime considering timezone
      const comparison = Helpers.compareTimesWithTimezone(
        findAttendance.checkOut,
        earlyEndTime,
        officeTimezone,
      );

      if (comparison < 0) {
        // Check-out time < earlyEndTime (left early)
        findAttendance.checkOutStatusId = 151; // left early
        findAttendance.earlyLeaveReasonId = dto.earlyLeaveReasonId;
      } else {
        // Check-out time >= earlyEndTime (left timely)
        findAttendance.checkOutStatusId = 150; // left timely
      }
    }

    // if (earlyEndTime !== null && earlyEndTime !== undefined) {
    //   if (checkOutTime < earlyEndTime) {
    //     findAttendance.checkOutStatusId = 151; // left early
    //     findAttendance.earlyLeaveReasonId = dto.earlyLeaveReasonId;
    //   }

    //   if (checkOutTime > earlyEndTime) {
    //     findAttendance.checkOutStatusId = 150; // left timely
    //   }
    // }

    const parser = new UAParser(dto.userAgent);
    const device = parser.getDevice();
    const deviceType =
      device.type === 'mobile'
        ? 'Mobile'
        : device.type === 'tablet'
          ? 'Tablet'
          : 'Desktop';

    const checkOutMethodStatus =
      await this.commonDao.findStatusByName(deviceType);

    if (!checkOutMethodStatus) {
      throw new BadRequestException('Check-in method status not found');
    }

    findAttendance.checkOutMethodId = checkOutMethodStatus.id;
    findAttendance.checkOutLatLong = dto.checkOutLatLong;
    // Update the attendance record
    await this.empAttendanceRepo.update(findAttendance.id, findAttendance);

    // Handle early leave reason
    const earlyLeaveReasonStatus = dto.earlyLeaveReasonId
      ? await this.commonDao.findStatusById(dto.earlyLeaveReasonId)
      : null;

    // Handle attendance reconciliation
    const attendanceReconciliation =
      await this.attendanceReconciliationRepo.findOne({
        where: {
          appId: findAttendance.appId,
          empId: findAttendance.empId,
          attendanceId: findAttendance.id,
        },
      });

    if (attendanceReconciliation) {
      await this.attendanceReconciliationRepo.update(
        attendanceReconciliation.id,
        {
          outTimeRemarks: earlyLeaveReasonStatus
            ? earlyLeaveReasonStatus.name
            : null,
          outTimeStatusId: 160, // pending
        },
      );
    } else {
      await this.attendanceReconciliationRepo.save({
        appId: findAttendance.appId,
        empId: findAttendance.empId,
        attendanceId: findAttendance.id,
        attendanceDate: findAttendance.attendanceDate,
        outTimeRemarks: earlyLeaveReasonStatus
          ? earlyLeaveReasonStatus.name
          : null,
        outTimeStatusId: 160, // pending
      });
    }

    // Get the updated attendance with relations
    const updatedAttendance = await this.empAttendanceRepo.findOne({
      where: { id: findAttendance.id },
      relations: ['attendanceStatus', 'checkOutStatus', 'earlyLeaveReason'],
    });

    // Send notifications
    if (appId) {
      const dashboardData = await this.getDashboardData();
      await this.notificationGateway.broadcastAttendanceUpdate(
        appId,
        dashboardData,
      );
    }

    return updatedAttendance;
  }

  // Employee Attendance Check-Out
  async requestForRemovingLateCount(
    dto: RequestForRemovingLateCountDto,
  ): Promise<EmpAttendance | null> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId: appId },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const findAttendance = await this.empAttendanceRepo.findOne({
      where: {
        id: dto.id,
        empId: employee.id,
        appId: appId,
      },
    });

    if (!findAttendance) {
      throw new BadRequestException('Employee has not checked in yet');
    }

    findAttendance.lateReason = dto.lateReason;

    await this.empAttendanceRepo.update(findAttendance.id, findAttendance);

    // this.attendanceReconciliationRepo.create({ empId: employee.id, attendanceId: findAttendance.id, lateReason: dto.lateReason, statusId: 162});
    const saved = await this.attendanceReconciliationRepo.save({
      appId: appId,
      empId: employee.id,
      attendanceId: findAttendance.id,
      attendanceDate: findAttendance.attendanceDate,
      inTimeRemarks: dto.lateReason,
      inTime: dto.inTime,
      inTimeStatusId: 160, // pending
    });

    return this.empAttendanceRepo.findOne({
      where: { id: findAttendance.id },
      relations: ['attendanceStatus'],
    });
  }

  // Employee Attendance Break Start
  async attendanceBreakStart(
    attendanceId: number,
  ): Promise<EmpAttendance | null> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const findAttendance = await this.empAttendanceRepo.findOne({
      where: { id: attendanceId },
    });

    if (!findAttendance) {
      throw new BadRequestException('Employee has not checked in yet');
    }

    findAttendance.startBreak = new Date();
    findAttendance.endBreak = undefined;

    await this.empAttendanceRepo.update(findAttendance.id, findAttendance);

    return this.empAttendanceRepo.findOne({
      where: { id: findAttendance.id },
      relations: ['attendanceStatus'],
    });
  }

  // Employee Attendance Break End
  async attendanceBreakEnd(
    attendanceId: number,
  ): Promise<EmpAttendance | null> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({
      where: { userId },
    });

    if (!appUser) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const findAttendance = await this.empAttendanceRepo.findOne({
      where: { id: attendanceId },
    });

    if (!findAttendance) {
      throw new BadRequestException('Employee has not checked in yet');
    }

    findAttendance.endBreak = new Date();

    const currentBreakMinutes = findAttendance.startBreak
      ? Helpers.getMinutesBetweenDateTime(
          findAttendance.startBreak,
          findAttendance.endBreak,
        )
      : 0;

    findAttendance.breakMinutes += currentBreakMinutes;

    await this.empAttendanceRepo.update(findAttendance.id, findAttendance);

    return this.empAttendanceRepo.findOne({
      where: { id: findAttendance.id },
      relations: ['attendanceStatus'],
    });
  }

  async findAllCheckInEmployee(): Promise<EmpAttendance[]> {
    return this.empAttendanceRepo.find({
      relations: ['employee', 'office', 'shift'],
    });
  }

  async findCheckInById(id: number): Promise<EmpAttendance> {
    const attendance = await this.empAttendanceRepo.findOne({ where: { id } });
    if (!attendance) throw new BadRequestException('Attendance not found');
    return attendance;
  }

  async deleteCheckIn(id: number): Promise<void> {
    const result = await this.empAttendanceRepo.delete(id);
    if (result.affected === 0)
      throw new BadRequestException('Attendance not found');
  }

  async getMyAttendanceToday(): Promise<{
    attendance: EmpAttendance | null;
    canCheckInOut: boolean;
    officeId: number | null;
    officeShiftId: number | null;
  }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    if (!userId) throw new NotFoundException('Authenticated user not found');

    const employeeLookupStartedAt = Date.now();
    let employee: Employee | null;
    try {
      employee = await this.employeeRepo.findOne({
        where: {
          userId,
          ...(appId ? { appId: Number(appId) } : {}),
        },
        select: ['id', 'userId', 'officeId', 'officeShiftId', 'appId'],
      });
      this.logger.debug(
        `Attendance employee lookup userId=${userId} durationMs=${Date.now() - employeeLookupStartedAt}`,
      );
    } catch (error) {
      this.logger.error(
        `Attendance employee lookup failed userId=${userId} durationMs=${Date.now() - employeeLookupStartedAt}: ${(error as Error).message}`,
      );
      throw error;
    }
    if (!employee) {
      return {
        attendance: null,
        canCheckInOut: false,
        officeId: null,
        officeShiftId: null,
      };
    }

    const canCheckInOut = Boolean(employee.officeId && employee.officeShiftId);

    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.office', 'office')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.checkInMethod', 'checkInMethod')
      .leftJoinAndSelect('attendance.checkInStatus', 'checkInStatus')
      .leftJoinAndSelect('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoinAndSelect('attendance.checkOutMethod', 'checkOutMethod')
      .leftJoinAndSelect('attendance.lateApprovalStatus', 'lateApprovalStatus')
      .leftJoinAndSelect('attendance.earlyLeaveReason', 'earlyLeaveReason')
      .leftJoinAndSelect('attendance.attendanceRecon', 'attendanceRecon')
      .leftJoinAndSelect('attendanceRecon.inTimeStatus', 'inTimeStatus')
      .leftJoinAndSelect('attendanceRecon.outTimeStatus', 'outTimeStatus')
      .where('attendance.empId = :empId', { empId: employee.id })
      .andWhere('attendance.attendanceDate = :today', { today })
      .select([
        'attendance.id',
        'attendance.attendanceStatusId',
        'attendance.checkInMethodId',
        'attendance.attendanceDate',
        'attendance.checkIn',
        'attendance.checkOut',
        'attendance.startBreak',
        'attendance.endBreak',
        'attendance.breakMinutes',
        'attendance.lateReason',
        'attendance.lateApprovalStatusId',
        'attendance.earlyLeaveReasonId',

        'lateApprovalStatus.name',
        'lateApprovalStatus.code',
        'lateApprovalStatus.colorName',

        'earlyLeaveReason.name',
        'earlyLeaveReason.code',
        'earlyLeaveReason.colorName',

        'office.endTime',
        'office.earlyEndTime',

        'shift.endTime',
        'shift.earlyEndTime',

        'attendanceStatus.name',
        'attendanceStatus.code',
        'attendanceStatus.colorName',

        'checkInStatus.name',
        'checkInStatus.code',
        'checkInStatus.colorName',

        'checkOutStatus.name',
        'checkOutStatus.code',
        'checkOutStatus.colorName',

        'checkInMethod.name',
        'checkInMethod.code',
        'checkInMethod.colorName',

        'checkOutMethod.name',
        'checkOutMethod.code',
        'checkOutMethod.colorName',

        'attendanceRecon.id',
        'attendanceRecon.attendanceDate',
        'attendanceRecon.inTime',
        'attendanceRecon.outTime',
        'attendanceRecon.inTimeRemarks',
        'attendanceRecon.outTimeRemarks',
        'attendanceRecon.inTimeApproveDate',
        'attendanceRecon.outTimeApproveDate',
        'attendanceRecon.inTimeSupervisorRemarks',
        'attendanceRecon.outTimeSupervisorRemarks',

        'inTimeStatus.name',
        'inTimeStatus.code',
        'inTimeStatus.colorName',

        'outTimeStatus.name',
        'outTimeStatus.code',
        'outTimeStatus.colorName',
      ])
      .getOne();

    return {
      attendance: attendance ?? null,
      canCheckInOut,
      officeId: employee.officeId ?? null,
      officeShiftId: employee.officeShiftId ?? null,
    };
  }

  async getAllAttendanceToday(): Promise<EmpAttendance[] | null> {
    const userId = RequestContext.get('userId');
    if (!userId) throw new NotFoundException('Authenticated user not found');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser)
      throw new NotFoundException('Employee attendance records not found');

    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('attendance.office', 'office')
      .leftJoin('attendance.shift', 'shift')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoin('profile.phoneCountry', 'phoneCountry')

      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.checkInMethod', 'checkInMethod')
      .leftJoinAndSelect('attendance.lateApprovalStatus', 'lateApprovalStatus')
      .where('attendance.appId = :appId', { appId: appUser.id })
      .andWhere('attendance.attendanceDate = :today', { today })
      .select([
        'attendance.id',
        'attendance.empId',
        'attendance.attendanceStatusId',
        'attendance.checkInMethodId',
        'attendance.attendanceDate',
        'attendance.checkIn',
        'attendance.checkOut',
        'attendance.startBreak',
        'attendance.endBreak',
        'attendance.breakMinutes',
        'attendance.workedHour',
        'attendance.overtimeHours',
        'attendance.lateReason',
        'attendance.ipAddress',
        'attendance.remarks',
        'attendance.jsonData',

        'employee.userId',
        'designation.id',
        'designation.name',
        'department.id',
        'department.name',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'profile.id',
        'profile.phoneCountryId',
        'phoneCountry.callingCode',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'office.id',
        'office.name',
        'office.startTime',
        'office.delayStartTime',
        'office.endTime',
        'office.earlyEndTime',

        'shift.id',
        'shift.name',
        'shift.startTime',
        'shift.delayStartTime',
        'shift.endTime',
        'shift.earlyEndTime',

        'attendanceStatus.name',
        'attendanceStatus.code',
        'attendanceStatus.colorName',

        'checkInMethod.name',
        'checkInMethod.code',
        'checkInMethod.colorName',

        'lateApprovalStatus.name',
        'lateApprovalStatus.code',
        'lateApprovalStatus.colorName',
      ])
      .getMany();

    return attendance ?? null;
  }

  async getAllAttendanceListByDate(
    queryString: any,
  ): Promise<{ data: EmpAttendance[]; total: number; summary: any }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    if (!userId) throw new NotFoundException('Authenticated user not found');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser)
      throw new NotFoundException('Employee attendance records not found');

    const query = this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoinAndSelect('attendance.office', 'office')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.checkInStatus', 'checkInStatus')
      .leftJoinAndSelect('attendance.checkInMethod', 'checkInMethod')
      .leftJoinAndSelect('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoinAndSelect('attendance.checkOutMethod', 'checkOutMethod')
      // .leftJoinAndSelect('attendance.lateApproveStatus', 'lateApproveStatus')
      .leftJoinAndSelect('attendance.lateApprovalUser', 'lateApprovalUser')
      .leftJoinAndSelect('attendance.earlyLeaveReason', 'earlyLeaveReason')

      .where('attendance.appId = :appId', { appId: appId })
      .select([
        'attendance.id',
        'attendance.empId',
        'attendance.attendanceStatusId',
        'attendance.checkInMethodId',
        'attendance.attendanceDate',
        'attendance.checkIn',
        'attendance.checkOut',
        'attendance.ipAddress',
        'attendance.workedHour',
        'attendance.overtimeHours',
        'attendance.remarks',
        'attendance.jsonData',
        'attendance.lateReason',
        'attendance.earlyLeaveReason',
        'attendance.startBreak',
        'attendance.endBreak',
        'attendance.breakMinutes',

        'employee.userId',
        'designation.id',
        'designation.name',
        'department.id',
        'department.name',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'profile.id',
        'profile.phoneCountryId',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'office.id',
        'office.name',
        'office.startTime',
        'office.delayStartTime',
        'office.endTime',
        'office.earlyEndTime',

        'shift.id',
        'shift.name',
        'shift.startTime',
        'shift.delayStartTime',
        'shift.endTime',
        'shift.earlyEndTime',

        'attendanceStatus.name',
        'attendanceStatus.code',
        'attendanceStatus.colorName',

        'checkInStatus.name',
        'checkInStatus.code',
        'checkInStatus.colorName',

        'checkInMethod.name',
        'checkInMethod.code',
        'checkInMethod.colorName',

        'checkOutStatus.name',
        'checkOutStatus.code',
        'checkOutStatus.colorName',

        'checkOutMethod.name',
        'checkOutMethod.code',
        'checkOutMethod.colorName',

        // 'lateApproveStatus.name',
        // 'lateApproveStatus.code',
        // 'lateApproveStatus.colorName',

        'lateApprovalUser.id',
        'lateApprovalUser.firstName',
        'lateApprovalUser.lastName',

        'earlyLeaveReason.name',
        'earlyLeaveReason.code',
        'earlyLeaveReason.colorName',
      ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.empId) {
      query.andWhere('attendance.empId = :empId', { empId: params.empId });
    }

    if (params.officeId) {
      query.andWhere('attendance.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.designationId) {
      query.andWhere('designation.id = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.shiftId) {
      query.andWhere('attendance.shiftId = :shiftId', {
        shiftId: params.shiftId,
      });
    }

    if (params.attendanceStatusId) {
      query.andWhere('attendance.attendanceStatusId = :statusId', {
        statusId: params.attendanceStatusId,
      });
    }

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search OR
         user.lastName LIKE :search OR
          office.name LIKE :search OR
           shift.name LIKE :search OR
           department.name LIKE :search OR
           designation.name LIKE :search)`,
        { search },
      );
    }

    const todayQuery = query.clone();

    const attendanceDate = params.attendanceDate
      ? params.attendanceDate
      : new Date().toISOString().split('T')[0];

    if (attendanceDate) {
      todayQuery.andWhere('Date(attendance.attendanceDate) = :attendanceDate', {
        attendanceDate,
      });
    }

    const features = new APIFeatures(todayQuery, queryString).sort().paginate();

    const data = await features.getQuery().getMany();
    const total = await todayQuery.getCount();

    const summary = {
      today: {
        onTimeCheckIn: 0,
        lateCheckIn: 0,
        earlyTiming: 0,
        absent: 0,
      },
      yesterday: {
        OntimeCheckInPercentage: '0.00',
        LateCheckInPercentage: '0.00',
        earlyTimingProgressPercentage: '0.00',
        absentPercentage: '0.00',
      },
    };

    data.forEach((att) => {
      const code = att.attendanceStatus?.code;
      const attendanceStatusCode = att.attendanceStatus?.code;
      const checkInStatusCode = att.checkInStatus?.code;
      const checkOutStatusCode = att.checkOutStatus?.code;
      const checkIn = att.checkIn ? new Date(att.checkIn) : null;

      if (attendanceStatusCode === 'emp_attendance_status_absent') {
        summary.today.absent++;
      } else if (
        checkOutStatusCode === 'attendance_checkout_status_left_early'
      ) {
        summary.today.earlyTiming++;
      } else if (
        code === 'emp_attendance_status_present' ||
        checkInStatusCode === 'attendance_checkin_status_ontime'
      ) {
        summary.today.onTimeCheckIn++;
      } else if (checkInStatusCode === 'attendance_checkin_status_late') {
        summary.today.lateCheckIn++;
      }
    });

    const yesterdayDate = moment(attendanceDate)
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    const yesterdayQuery = query
      .clone()
      .andWhere('Date(attendance.attendanceDate) = :yesterdayDate', {
        yesterdayDate,
      });

    const lastDayTotalOntimeCheckIn = await yesterdayQuery
      .clone()
      .andWhere('attendance.checkInStatusId = :checkInStatusId', {
        checkInStatusId: 148, // online checkin
      })
      .getCount();

    if (lastDayTotalOntimeCheckIn === 0) {
      summary.yesterday.OntimeCheckInPercentage = '0.00';
    } else {
      summary.yesterday.OntimeCheckInPercentage = Number(
        (summary.today.onTimeCheckIn / lastDayTotalOntimeCheckIn) * 100,
      ).toFixed(2);
    }

    // if (typeof summary.yesterday.OntimeCheckInPercentage === 'number') {
    //   summary.yesterday.OntimeCheckInPercentage =
    //     summary.yesterday.OntimeCheckInPercentage.toFixed(2);
    // }

    // summary.yesterday.OntimeCheckInPercentage = parseFloat(summary.yesterday.OntimeCheckInPercentage).toFixed(2);

    const lastDayTotalLateCheckIn = await yesterdayQuery
      .clone()
      .andWhere('attendance.checkInStatusId = :checkInStatusId', {
        checkInStatusId: 149, // late checkin
      })
      .getCount();

    summary.yesterday.LateCheckInPercentage = Number(
      lastDayTotalLateCheckIn === 0
        ? 0
        : (summary.today.onTimeCheckIn / lastDayTotalLateCheckIn) * 100,
    ).toFixed(2);

    const lastDayTotalEarlyLeftTiming = await yesterdayQuery
      .clone()
      .andWhere('attendance.checkOutStatusId = :checkOutStatusId', {
        checkOutStatusId: 151, // left early
      })
      .getCount();

    summary.yesterday.earlyTimingProgressPercentage = Number(
      lastDayTotalEarlyLeftTiming === 0
        ? 0
        : (summary.today.earlyTiming / lastDayTotalEarlyLeftTiming) * 100,
    ).toFixed(2);

    const lastDayTotalAbsent = await yesterdayQuery
      .clone()
      .andWhere('attendance.attendanceStatusId = :attendanceStatusId', {
        attendanceStatusId: 43, // Absent
      })
      .getCount();

    summary.yesterday.absentPercentage = Number(
      lastDayTotalAbsent === 0
        ? 0
        : (summary.today.absent / lastDayTotalAbsent) * 100,
    ).toFixed(2);

    return { data, total, summary };
  }

  async getPendingAttendanceList(
    queryString: any,
  ): Promise<{ data: any[]; total: number; summary: any }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    if (!userId) throw new NotFoundException('Authenticated user not found');
    if (!appId) throw new NotFoundException('Active app not found');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    const attendanceDate = params.attendanceDate
      ? params.attendanceDate
      : new Date().toISOString().split('T')[0];

    const query = this.employeeRepo.createQueryBuilder('employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');
    query.leftJoin('employee.office', 'office');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.employmentStatus', 'employmentStatus');
    query.leftJoin('employee.employeeStatus', 'employeeStatus');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');

    query.where('employee.appId = :appId', { appId });
    query.andWhere('employee.userId IS NOT NULL');
    query.andWhere('user.isActive = :isActive', { isActive: true });

    // Exclude employees who gave attendance (checked in) on this date
    query.andWhere(
      `NOT EXISTS (
        SELECT 1 FROM emp_attendances att
        WHERE att.emp_id = employee.id
          AND DATE(att.attendance_date) = :attendanceDate
          AND att.app_id = :appId
          AND att.check_in IS NOT NULL
      )`,
      { attendanceDate, appId },
    );

    if (params.officeId) {
      query.andWhere('employee.officeId = :officeId', {
        officeId: Number(params.officeId),
      });
    }

    if (params.designationId) {
      query.andWhere('designation.id = :designationId', {
        designationId: Number(params.designationId),
      });
    }

    if (params.departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId: Number(params.departmentId),
      });
    }

    if (params.shiftId) {
      query.andWhere('employee.officeShiftId = :shiftId', {
        shiftId: Number(params.shiftId),
      });
    }

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(user.firstName LIKE :search OR
         user.lastName LIKE :search OR
         user.email LIKE :search OR
         employee.employeeCode LIKE :search OR
         office.name LIKE :search OR
         officeShift.name LIKE :search OR
         department.name LIKE :search OR
         designation.name LIKE :search)`,
        { search },
      );
    }

    query.select([
      'employee.id',
      'employee.employeeCode',
      'employee.userId',
      'employee.officeId',
      'employee.officeShiftId',
      'employee.designationId',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.id',
      'office.name',
      'officeShift.id',
      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'employeeStatus.id',
      'employeeStatus.name',
      'employeeStatus.code',
      'employeeStatus.colorName',
      'employmentStatus.id',
      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.phone',
      'profilePicture.id',
      'profilePicture.filename',
    ]);

    const countQuery = query.clone();
    const total = await countQuery.getCount();

    const features = new APIFeatures(query, queryString).sort().paginate();
    const employees = await features.getQuery().getMany();

    const items = employees.map((emp) => ({
      id: emp.id,
      empId: emp.id,
      employeeCode: emp.employeeCode,
      attendanceDate,
      attendanceStatus: {
        name: 'Pending Attendance',
        code: 'emp_attendance_status_pending',
        colorName: 'warning',
      },
      checkIn: null,
      checkOut: null,
      employee: {
        id: emp.id,
        employeeCode: emp.employeeCode,
        userId: emp.userId,
        user: {
          id: emp.user?.id,
          firstName: emp.user?.firstName,
          lastName: emp.user?.lastName,
          fullName: `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim(),
          email: emp.user?.email,
          profile: emp.user?.profile,
        },
        designation: emp.designation,
        department: emp.designation?.department,
      },
      office: emp.office,
      shift: emp.officeShift,
      designation: emp.designation,
      department: emp.designation?.department,
    }));

    const totalCompanyEmployees = await this.employeeRepo
      .createQueryBuilder('emp')
      .innerJoin('emp.user', 'u', 'u.isActive = :isActive', { isActive: true })
      .where('emp.appId = :appId', { appId })
      .andWhere('emp.userId IS NOT NULL')
      .getCount();

    const summary = {
      totalPending: total,
      totalCompanyEmployees,
      attendanceDate,
      attendanceGiven: Math.max(0, totalCompanyEmployees - total),
    };

    return {
      data: items,
      total,
      summary,
    };
  }

  async UpdateEmployeeStatus(dto: UpdateEmployeeStatusDto): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.id },
    });

    if (!employee)
      throw new NotFoundException(`Employee with ID ${dto.id} not found`);
    employee.employeeStatusId = dto.employeeStatusId;
    employee.remarks = dto.remarks;
    employee.resignationDate = dto.resignationDate
      ? new Date(dto.resignationDate)
      : null;

    await this.employeeRepo.update(employee.id, employee);
    return employee;
  }

  async createOrUpdateRequisition(
    dto: CreateRequisitionDto,
  ): Promise<Requisition> {
    const userId = Number(RequestContext.get('userId'));
    let appId = Number(RequestContext.get('activeAppId')) || null;

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      if (appUser?.appId) {
        appId = appUser.appId;
      } else {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user?.activeAppId) {
          appId = user.activeAppId;
        }
      }
    }

    dto.appId = appId;

    let employee: Employee | null = null;
    if (dto.employeeId) {
      employee = await this.employeeRepo.findOne({
        where: { id: dto.employeeId },
      });
    }

    if (!employee && userId) {
      employee = await this.ensureEmployee(userId, appId ?? null);
    }

    if (!employee) throw new NotFoundException('Employee not found');

    dto.employeeId = employee.id;

    if (employee.designationId) {
      const designation = await this.designationRepo.findOne({
        where: { id: employee.designationId },
      });
      dto.departmentId = designation?.departmentId ?? null;
    } else {
      dto.departmentId = dto.departmentId ?? null;
    }

    const statusData = await this.statusRepository.findOne({
      where: {
        code: 'unit_type_pcs',
      },
    });

    if (!dto.unitTypeId) {
      dto.unitTypeId = statusData?.id;
    }

    if (!dto.statusId) {
      const pendingStatus = await this.statusRepository.findOne({
        where: { code: 'requisition_status_pending' },
      });
      dto.statusId = pendingStatus?.id ?? 138;
    }

    dto.requisitionType = dto.requisitionType || RequisitionType.NEW;
    if (
      dto.requisitionType === RequisitionType.IN_STOCK &&
      (dto.estimatedCost === undefined || dto.estimatedCost === null)
    ) {
      dto.estimatedCost = 0;
    }

    if (dto.id) {
      const requisition = await this.requisitionRepo.findOne({
        where: { id: dto.id },
        relations: ['status'],
      });

      if (!requisition)
        throw new NotFoundException(`Requisition with ID ${dto.id} not found`);

      if (
        requisition.status?.code &&
        requisition.status.code !== 'requisition_status_pending'
      ) {
        const statusLabel =
          requisition.status?.name ||
          requisition.status?.code?.replace('requisition_status_', '') ||
          'processed';

        throw new BadRequestException(
          `This requisition cannot be modified because its status is already "${statusLabel}". Only pending requisitions can be edited.`,
        );
      }

      this.requisitionRepo.merge(requisition, dto);
      return this.requisitionRepo.save(requisition);
    } else {
      delete (dto as any).id;
      dto.requisitionDate = new Date();
      dto.requisitionNo = await this.generateRequisitionNo(dto.appId ?? 0);
      const requisition = this.requisitionRepo.create(dto);
      const saved = await this.requisitionRepo.save(requisition);

      if (userId) {
        void this.usersService
          .createUserNotification(
            userId,
            `Your requisition #${saved.requisitionNo} has been submitted successfully.`,
          )
          .catch((err) =>
            this.logger.error(
              `Failed to send requisition creation notification: ${err}`,
            ),
          );
      }

      return saved;
    }
  }

  private async generateRequisitionNo(appId: number): Promise<string> {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');

    const lastReq = await this.requisitionRepo.findOne({
      where: { appId },
      order: { id: 'DESC' },
    });

    const nextId = (lastReq?.id ?? 0) + 1;
    const sequence = nextId.toString().padStart(6, '0');

    return `REQ${appId}-${datePart}-${sequence}`;
  }

  async findAllRequisitions(
    queryString: any,
  ): Promise<{ data: any; total: number }> {
    const userId = Number(RequestContext.get('userId'));
    let activeAppId = Number(RequestContext.get('activeAppId')) || null;

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser && !activeAppId) {
      throw new NotFoundException('App User not found');
    }

    const targetAppId = activeAppId || appUser?.appId;

    const query = this.requisitionRepo.createQueryBuilder('requisition');
    query.leftJoinAndSelect('requisition.employee', 'employee');
    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');
    query.leftJoin('profile.phoneCountry', 'phoneCountry');
    query.leftJoinAndSelect('requisition.department', 'department');
    query.leftJoinAndSelect('requisition.status', 'status');

    query.addSelect([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'profile.id',
      'profile.phoneCountryId',
      'phoneCountry.callingCode',
      'profile.phone',
      'profile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'office.id',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.id',
      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',

      'department.id',
      'department.name',
      'department.description',
      'status.id',
      'status.name',
      'status.code',
      'status.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    if (targetAppId) {
      query.andWhere('requisition.appId = :appId', {
        appId: targetAppId,
      });
    }

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        `user.firstName LIKE :search OR
         user.lastName LIKE :search OR 
         user.email LIKE :search OR 
         employee.employeeCode LIKE :search OR 
         profile.phone LIKE :search OR
         requisition.requisitionNo LIKE :search OR 
         requisition.itemDescription LIKE :search`,
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.requisitionDate) {
      query.andWhere('Date(requisition.requisitionDate) = :requisitionDate', {
        requisitionDate: params.requisitionDate,
      });
    }

    if (params.approvedDate) {
      query.andWhere('Date(requisition.approvedDate) = :approvedDate', {
        approvedDate: params.approvedDate,
      });
    }

    if (params.departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    // if (params.statusId) {
    //   query.andWhere('requisition.statusId = :statusId', {
    //     statusId: Number(params.statusId),
    //   });
    // }

    if (params.approvedBy) {
      query.andWhere('requisition.approvedBy = :approvedBy', {
        approvedBy: params.approvedBy,
      });
    }

    if (params.unitTypeId) {
      query.andWhere('requisition.unitTypeId = :unitTypeId', {
        unitTypeId: params.unitTypeId,
      });
    }

    if (params.requisitionType) {
      query.andWhere('requisition.requisitionType = :requisitionType', {
        requisitionType: params.requisitionType,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();
    const totalUsers = await query.getMany();
    const totalUser = totalUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl,
    }));

    let requisitionPendingStatusId;
    let requisitionApprovedStatusId;
    let requisitionRejectedStatusId;
    let requisitionCompletedStatusId;

    if (
      (await this.cacheService.get('requisitionPendingStatusId')) &&
      (await this.cacheService.get('requisitionApprovedStatusId')) &&
      (await this.cacheService.get('requisitionRejectedStatusId')) &&
      (await this.cacheService.get('requisitionCompletedStatusId'))
    ) {
      requisitionPendingStatusId = await this.cacheService.get(
        'requisitionPendingStatusId',
      );
      requisitionApprovedStatusId = await this.cacheService.get(
        'requisitionApprovedStatusId',
      );
      requisitionRejectedStatusId = await this.cacheService.get(
        'requisitionRejectedStatusId',
      );
      requisitionCompletedStatusId = await this.cacheService.get(
        'requisitionCompletedStatusId',
      );
    } else {
      requisitionPendingStatusId = await this.commonDao
        .findStatusByCode('requisition_status_pending')
        .then((s) => s?.id);
      requisitionApprovedStatusId = await this.commonDao
        .findStatusByCode('requisition_status_approved')
        .then((s) => s?.id);
      requisitionRejectedStatusId = await this.commonDao
        .findStatusByCode('requisition_status_rejected')
        .then((s) => s?.id);
      requisitionCompletedStatusId = await this.commonDao
        .findStatusByCode('requisition_status_completed')
        .then((s) => s?.id);

      this.cacheService.set(
        'requisitionPendingStatusId',
        requisitionPendingStatusId,
      );
      this.cacheService.set(
        'requisitionApprovedStatusId',
        requisitionApprovedStatusId,
      );
      this.cacheService.set(
        'requisitionRejectedStatusId',
        requisitionRejectedStatusId,
      );
      this.cacheService.set(
        'requisitionCompletedStatusId',
        requisitionCompletedStatusId,
      );
    }

    const todayQuery = query
      .clone()
      .andWhere('requisition.statusId IN(:...statusId)', {
        statusId: [requisitionRejectedStatusId, requisitionCompletedStatusId],
      });

    const todayUsersData = await todayQuery.getMany();
    const todayUserNames = todayUsersData.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));
    const todayCount = await todayQuery.getCount();

    const pendingQuery = query
      .clone()
      .andWhere('requisition.statusId = :statusId', {
        statusId: requisitionPendingStatusId,
      });
    const pendingUsers = await pendingQuery.getMany();
    const pendingUserNames = pendingUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));
    const pendingCount = await pendingQuery.getCount();

    const approvedQuery = query
      .clone()
      .andWhere('requisition.statusId = :statusId', {
        statusId: requisitionApprovedStatusId,
      });
    const approvedUsers = await approvedQuery.getMany();
    const approvedUserNames = approvedUsers.map((r) => ({
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl || '',
    }));
    const approvedCount = await approvedQuery.getCount();

    const headers = {
      today: {
        users: todayUserNames,
        count: todayCount,
      },
      pending: {
        users: pendingUserNames,
        count: pendingCount,
      },
      approved: {
        users: approvedUserNames,
        count: approvedCount,
      },
      total: {
        users: totalUser,
        count: total,
      },
    };

    return { data: { list: data, headers }, total };
  }

  async getRequisitionHeaders(): Promise<any> {
    const userId = Number(RequestContext.get('userId'));
    let activeAppId = Number(RequestContext.get('activeAppId')) || null;

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser && !activeAppId) {
      throw new NotFoundException('App User not found');
    }

    const targetAppId = activeAppId || appUser?.appId;

    const query = this.requisitionRepo
      .createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('requisition.department', 'department')
      .leftJoinAndSelect('requisition.status', 'status')
      .addSelect([
        'requisition.id',
        'requisition.requisitionNo',
        'requisition.itemDescription',
        'requisition.quantity',
        'requisition.estimatedCost',
        'requisition.statusId',

        'department.name',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',

        'profilePicture.id',
        'profilePicture.filename',
      ]);

    if (targetAppId) {
      query.where('requisition.appId = :appId', { appId: targetAppId });
    }

    const list = await query.getMany();

    const getStatusId = async (key: string, code: string) => {
      let id = await this.cacheService.get(key);
      if (!id) {
        id = await this.commonDao.findStatusByCode(code).then((s) => s?.id);
        await this.cacheService.set(key, id);
      }
      return id;
    };

    const pendingStatusId = await getStatusId(
      'requisitionPendingStatusId',
      'requisition_status_pending',
    );
    const approvedStatusId = await getStatusId(
      'requisitionApprovedStatusId',
      'requisition_status_approved',
    );
    const rejectedStatusId = await getStatusId(
      'requisitionRejectedStatusId',
      'requisition_status_rejected',
    );
    const completedStatusId = await getStatusId(
      'requisitionCompletedStatusId',
      'requisition_status_completed',
    );

    /* ================= MAPPER ================= */
    const mapItem = (r) => ({
      requisitionCode: r.requisitionNo,
      requisitionName: r.itemDescription,
      requisitionType: r.requisitionType || 'new',
      department: r.department?.name || '',
      quantity: r.quantity,
      cost: r.estimatedCost,
      name: r.employee?.user?.fullName,
      fileUrl: r.employee?.user?.profile?.profilePicture?.fileUrl,
    });

    const todayDateStr = new Date().toISOString().slice(0, 10);
    const today = list.filter((r) => {
      const itemDate = r.requisitionDate
        ? new Date(r.requisitionDate).toISOString().slice(0, 10)
        : '';
      return (
        itemDate === todayDateStr ||
        [rejectedStatusId, completedStatusId].includes(r.statusId)
      );
    });

    const pending = list.filter((r) => r.statusId === pendingStatusId);

    const approved = list.filter((r) => r.statusId === approvedStatusId);

    return {
      headers: {
        today: {
          users: today.map(mapItem),
          count: today.length,
        },
        pending: {
          users: pending.map(mapItem),
          count: pending.length,
        },
        approved: {
          users: approved.map(mapItem),
          count: approved.length,
        },
        total: {
          users: list.map(mapItem),
          count: list.length,
        },
      },
    };
  }

  async findRequisitionById(id: number): Promise<Requisition> {
    const query = this.requisitionRepo.createQueryBuilder('requisition');
    query.leftJoin('requisition.employee', 'employee');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');
    query.leftJoin('profile.phoneCountry', 'phoneCountry');
    query.leftJoin('requisition.department', 'department');
    query.leftJoin('requisition.status', 'status');

    query
      .addSelect([
        'employee.id',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'profile.id',
        'profile.phoneCountryId',
        'phoneCountry.callingCode',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'department.id',
        'department.name',

        'status.name',
        'status.code',
        'status.colorName',
      ])
      .where('requisition.id = :id', { id });

    const requisition = await query.getOne();

    if (!requisition)
      throw new NotFoundException(`Requisition with ID ${id} not found`);
    return requisition;
  }

  async deleteRequisition(id: number): Promise<void> {
    const requisition = await this.requisitionRepo.findOne({
      where: { id },
      relations: ['status'],
    });

    if (!requisition) {
      throw new NotFoundException(`Requisition with ID ${id} not found`);
    }

    const isPending =
      requisition.status?.code === 'requisition_status_pending' ||
      (!requisition.status?.code && requisition.statusId === 138);

    if (!isPending) {
      throw new BadRequestException(
        'Approved requisitions cannot be deleted. Only pending requisitions can be deleted.',
      );
    }

    const result = await this.requisitionRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Requisition with ID ${id} not found`);
  }

  async updateRequisitionStatus(
    dto: UpdateRequisitionStatusDto,
  ): Promise<Requisition> {
    const userId = RequestContext.get('userId');

    const requisition = await this.requisitionRepo.findOne({
      where: { id: dto.id },
      relations: ['status', 'employee', 'employee.user'],
    });

    if (!requisition)
      throw new NotFoundException(`Requisition with ID ${dto.id} not found`);

    const status = await this.commonDao.findStatusById(dto.statusId);

    if (!status) {
      throw new NotFoundException(`Status with ID ${dto.statusId} not found`);
    }

    if (
      requisition.status?.code &&
      requisition.status.code !== 'requisition_status_pending'
    ) {
      const currentStatus =
        requisition.status?.name ||
        requisition.status?.code?.replace('requisition_status_', '') ||
        'processed';
      throw new BadRequestException(
        `This requisition is already "${currentStatus}" and its status cannot be changed anymore.`,
      );
    }

    if (
      status.code === 'requisition_status_rejected' &&
      (!dto.remarks || !dto.remarks.trim())
    ) {
      throw new BadRequestException(
        'Remarks are required when rejecting a requisition.',
      );
    }

    requisition.statusId = dto.statusId;
    requisition.remarks = dto.remarks ?? requisition.remarks;

    if (
      status.code === 'requisition_status_approved' ||
      status.code === 'requisition_status_completed' ||
      status.code === 'requisition_status_rejected'
    ) {
      requisition.approvedBy = userId;
      requisition.approvedDate = new Date();
    }

    await this.requisitionRepo.save(requisition);

    const updated = await this.requisitionRepo.findOne({
      where: { id: requisition.id },
      relations: ['status', 'employee', 'employee.user', 'department'],
    });

    if (!updated)
      throw new NotFoundException(
        `Requisition with ID ${requisition.id} not found after update`,
      );

    const applicantUserId =
      updated.employee?.userId || updated.employee?.user?.id;
    if (applicantUserId) {
      const statusTitle =
        status.name || status.code.replace('requisition_status_', '');
      const message = `Your requisition #${updated.requisitionNo} (${
        updated.itemDescription
      }) status has been updated to "${statusTitle}".${
        dto.remarks ? ` Reason/Note: ${dto.remarks}` : ''
      }`;
      void this.usersService
        .createUserNotification(applicantUserId, message)
        .catch((err) =>
          this.logger.error(
            `Failed to send requisition status notification: ${err}`,
          ),
        );
    }

    return updated;
  }

  async createOrUpdateAssetType(dto: CreateAssetTypeDto): Promise<AssetType> {
    // const userId = RequestContext.get('userId');
    const userId = RequestContext.get('userId');
    dto.createdBy = userId;
    if (dto.id) {
      await this.cacheService.del(`assetTypes`);
      const cachekey = `assetTypes`;
      await this.cacheService.del(cachekey);

      const assetType = await this.assetTypeRepo.findOne({
        where: { id: dto.id },
      });
      if (!assetType)
        throw new NotFoundException(`Asset Type with ID ${dto.id} not found`);
      this.assetTypeRepo.merge(assetType, dto);
      return this.assetTypeRepo.save(assetType);
    } else {
      await this.cacheService.del(`assetTypes`);
      const cachekey = `assetTypes`;
      await this.cacheService.del(cachekey);

      const assetType = this.assetTypeRepo.create(dto);

      return this.assetTypeRepo.save(assetType);
    }
  }

  async findAllAssetTypes(): Promise<CommonResponseDto[]> {
    const cachekey = `assetTypes`;
    const cached = await this.cacheService.get(cachekey);
    if (cached) return cached;

    const assetTypes = await this.assetTypeRepo.find();
    if (!assetTypes || assetTypes.length === 0)
      return [];

    return assetTypes.map((assetType) => {
      const response = new CommonResponseDto();
      response.value = assetType.id;
      response.label = assetType.name;
      return response;
    });
  }

  async findAssetTypeById(id: number): Promise<CommonResponseDto> {
    const assetType = await this.assetTypeRepo.findOne({ where: { id } });
    if (!assetType)
      throw new NotFoundException(`Asset Type with ID ${id} not found`);
    const response = new CommonResponseDto();
    response.value = assetType.id;
    response.label = assetType.name;
    return response;
  }

  async deleteAssetType(id: number): Promise<void> {
    const result = await this.assetTypeRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Asset Type with ID ${id} not found`);

    await this.cacheService.del(`assetTypes`);
    const cachekey = `assetTypes`;
    await this.cacheService.del(cachekey);
  }

  // --- Company Asset Types ---

  async findCompanyAssetTypes(appId: number): Promise<CommonResponseDto[]> {
    const cachekey = `companyAssetTypes_${appId}`;
    const cached = await this.cacheService.get(cachekey);
    if (cached) return cached;

    const assetTypes = await this.companyAssetTypeRepo.find({ where: { appId } });
    if (!assetTypes || assetTypes.length === 0)
      return []; // Return empty if none imported/created yet

    const response = assetTypes.map((assetType) => {
      const res = new CommonResponseDto();
      res.value = assetType.id;
      res.label = assetType.name;
      return res;
    });

    await this.cacheService.set(cachekey, response, 3600);
    return response;
  }

  async importGlobalAssetTypes(dto: ImportAssetTypesDto, appId: number, userId: number): Promise<any> {
    if (!appId) throw new BadRequestException('Active Application ID is required to import asset types');
    
    const globalTypes = await this.assetTypeRepo.findByIds(dto.assetTypeIds);
    if (!globalTypes || globalTypes.length === 0) {
      throw new NotFoundException('No valid global asset types found to import');
    }

    const companyTypesToSave: CompanyAssetType[] = [];
    for (const globalType of globalTypes) {
      // Check if already exists for this app
      const exists = await this.companyAssetTypeRepo.findOne({ where: { appId, name: globalType.name }});
      if (!exists) {
        const newType = this.companyAssetTypeRepo.create({
          appId,
          name: globalType.name,
          createdBy: userId,
        });
        companyTypesToSave.push(newType);
      }
    }

    if (companyTypesToSave.length > 0) {
      await this.companyAssetTypeRepo.save(companyTypesToSave);
      const cachekey = `companyAssetTypes_${appId}`;
      await this.cacheService.del(cachekey);
    }

    return { imported: companyTypesToSave.length };
  }

  async createOrUpdateCompanyAssetType(dto: CreateCompanyAssetTypeDto, appId: number, userId: number): Promise<CompanyAssetType> {
    if (!appId) throw new BadRequestException('Active Application ID is required');

    const cachekey = `companyAssetTypes_${appId}`;
    await this.cacheService.del(cachekey);

    if (dto.id) {
      const assetType = await this.companyAssetTypeRepo.findOne({
        where: { id: dto.id, appId },
      });
      if (!assetType)
        throw new NotFoundException(`Company Asset Type with ID ${dto.id} not found`);
      this.companyAssetTypeRepo.merge(assetType, dto);
      return this.companyAssetTypeRepo.save(assetType);
    } else {
      const assetType = this.companyAssetTypeRepo.create({
        ...dto,
        appId,
        createdBy: userId
      });
      return this.companyAssetTypeRepo.save(assetType);
    }
  }

  async deleteCompanyAssetType(id: number, appId: number): Promise<void> {
    const result = await this.companyAssetTypeRepo.delete({ id, appId });
    if (result.affected === 0)
      throw new NotFoundException(`Company Asset Type with ID ${id} not found`);
    const cachekey = `companyAssetTypes_${appId}`;
    await this.cacheService.del(cachekey);
  }

  async createOrUpdateEmployeeAssets(
    dto: CreateEmployeeAssetDto,
  ): Promise<EmployeeAsset> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    dto.appId = appUser.appId ?? undefined;

    dto.employeeId = dto.employeeId;
    dto.allocatedBy = userId;

    if (dto.isRefundable === undefined && dto.refundable !== undefined) {
      dto.isRefundable = dto.refundable;
    }
    if (dto.isRefundable !== undefined) {
      dto.isRefundable = Boolean(dto.isRefundable);
    }
    delete (dto as any).refundable;

    if (dto.id) {
      const asset = await this.employeeAssetRepo.findOne({
        where: { id: dto.id },
      });

      if (!asset)
        throw new NotFoundException(`Asset with ID ${dto.id} not found`);

      const { id, employee, assetStatus, assetType, refundable, ...fieldsToUpdate } = {
        ...dto,
      } as any;
      await this.employeeAssetRepo.update(dto.id, fieldsToUpdate);

      const updatedAsset = await this.employeeAssetRepo.findOne({
        where: { id: asset.id },
        relations: ['employee', 'assetStatus'],
      });

      if (!updatedAsset) {
        throw new NotFoundException(
          `Asset with ID ${asset.id} not found after update`,
        );
      }

      if (dto.assetStatusId !== asset.assetStatusId) {
        const empUserId = updatedAsset?.employee?.userId;
        const assetStatus = updatedAsset?.assetStatus;

        if (empUserId) {
          await this.usersService.createUserNotification(
            empUserId,
            `Your asset status has been changed to <b class="text-${assetStatus?.colorName}">${assetStatus?.name}</b>`,
          );
        }
      }

      return updatedAsset;
    } else {
      const asset = this.employeeAssetRepo.create(dto);
      const savedData = await this.employeeAssetRepo.save(asset);

      const savedAsset = await this.employeeAssetRepo.findOne({
        where: { id: savedData.id },
        relations: ['employee', 'assetStatus'],
      });

      if (!savedAsset) {
        throw new NotFoundException(
          `Asset with ID ${savedData.id} not found after creation`,
        );
      }

      const empUserId = savedAsset?.employee?.userId;
      const assetStatus = savedAsset?.assetStatus;

      if (empUserId) {
        await this.usersService.createUserNotification(
          empUserId,
          `Your asset <b class="text-${assetStatus?.colorName}">${asset.description}</b> has been allocated to you`,
        );
      }

      return savedAsset;
    }
  }

  async getAllEmployeeAssets(
    queryString: any,
  ): Promise<{ data: EmployeeAsset[]; total: number }> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    const query = this.employeeAssetRepo.createQueryBuilder('employeeAsset');
    query.leftJoin('employeeAsset.employee', 'employee');
    query.leftJoin('employeeAsset.assetType', 'assetType');
    query.leftJoin('employeeAsset.assetStatus', 'assetStatus');

    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('userProfile.country', 'country');

    // query.leftJoinAndSelect('employee.userProfile', 'userProfile');
    // query.leftJoinAndSelect('userProfile.profilePicture', 'profilePicture');

    query.addSelect([
      'employee.id',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'userProfile.id',
      'userProfile.countryId',
      'country.currencyCode',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'assetType.name',
      'assetStatus.name',
      'assetStatus.code',
      'assetStatus.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('employeeAsset.appId = :appId', {
      appId: appUser.appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        `user.firstName LIKE :search
         OR user.lastName LIKE :search
         OR user.email LIKE :search
         OR userProfile.phone LIKE :search
         OR designation.name LIKE :search`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.assetTypeId) {
      query.andWhere('employeeAsset.assetTypeId = :assetTypeId', {
        assetTypeId: params.assetTypeId,
      });
    }

    if (params.employeeStatusId) {
      query.andWhere('employee.employeeStatusId = :employeeStatusId', {
        employeeStatusId: params.employeeStatusId,
      });
    }

    if (params.assetStatusId) {
      query.andWhere('employeeAsset.assetStatusId = :assetStatusId', {
        assetStatusId: params.assetStatusId,
      });
    }

    if (params.employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId: Number(params.employeeId),
      });
    }

    if (params.status) {
      query.andWhere('user.isActive = :status', {
        status: params.status === 'true',
      });
    }

    if (params.isRefundable !== undefined && params.isRefundable !== '') {
      query.andWhere('employeeAsset.isRefundable = :isRefundable', {
        isRefundable:
          params.isRefundable === 'true' ||
          params.isRefundable === true ||
          params.isRefundable === 1 ||
          params.isRefundable === '1',
      });
    }

    const featureData = await features.getQuery().getMany();

    featureData.map((item) => {
      item.currency =
        item.employee?.user?.profile?.country?.currencyCode || 'BDT';
      item.amountWithCurrency = item.amount + ' ' + item.currency;
      return item;
    });

    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findEmployeeAssetById(id: number): Promise<EmployeeAsset> {
    const asset = await this.employeeAssetRepo.findOne({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset with ID ${id} not found`);
    return asset;
  }

  async deleteEmployeeAsset(id: number): Promise<void> {
    const result = await this.employeeAssetRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Asset with ID ${id} not found`);
  }

  async updateEmployeeAssetStatus(
    dto: UpdateEmployeeAssetStatusDto,
  ): Promise<EmployeeAsset> {
    const userId = RequestContext.get('userId');
    const appId = await this.commonDao.getAppId();

    const query = appId ? { id: dto.id, appId } : { id: dto.id };

    const asset = await this.employeeAssetRepo.findOne({
      where: query,
      relations: ['employee', 'assetStatus'],
    });

    if (!asset)
      throw new NotFoundException(`Asset with ID ${dto.id} not found`);

    const status = await this.commonDao.findStatusById(dto.assetStatusId);

    if (!status) {
      throw new NotFoundException(
        `Status with ID ${dto.assetStatusId} not found`,
      );
    }

    const prevStatusId = asset.assetStatusId;

    asset.allocatedBy = userId;
    asset.remarks = dto.remarks;
    asset.assetStatus = status;
    //asset.assetStatusId = dto.assetStatusId;

    if (status.code === 'asset_status_withdrawn') {
      asset.withdrawalDate = new Date();
    }
    await this.employeeAssetRepo.save(asset);

    const updated = await this.employeeAssetRepo.findOne({
      where: { id: asset.id },
      relations: ['employee', 'assetStatus'],
    });

    if (!updated)
      throw new NotFoundException(
        `Asset with ID ${asset.id} not found after update`,
      );

    if (dto.assetStatusId !== prevStatusId) {
      const empUserId = updated?.employee?.userId;
      const assetStatus = updated?.assetStatus;

      const user = updated?.employee?.user;

      if (user && [143, 144].includes(assetStatus.id)) {
        await this.hybridQueue.publishEmailJob({
          to: user.email,
          subject: 'Asset Status Updated',
          template: 'Update-Asset-Status',
          context: {
            name: user.firstName + ' ' + user.lastName,
            newStatus: updated.assetStatus.name,
            assetStatusName: updated.assetStatus.name,
            assetStatusColor: updated.assetStatus.colorName,
            emailClosingNote:
              'Thank you for using our asset management system.',
            supportTeamName: 'HR Team',

            // Add 1 minute for buffer
          },
        });
      }

      // try {
      //   await this.mailService.sendMail(
      //     user.email,
      //     'Asset Status Updated',
      //     'update-asset-status',

      //     {
      //       name: `${user.firstName} ${user.lastName}`,
      //       newStatus: updated.assetStatus.name,
      //       assetStatusName: updated.assetStatus.name,
      //       assetStatusColor: updated.assetStatus.colorName,
      //       emailClosingNote:
      //         'Thank you for using our asset management system.',
      //       supportTeamName: 'HR Team',
      //     },
      //   );

      // } catch (error) {
      //   console.error('Email sending error:', error);
      // }

      if (empUserId) {
        await this.usersService.createUserNotification(
          empUserId,
          `Your asset status has been changed to <b class="text-${assetStatus?.colorName}">${assetStatus?.name}</b>`,
        );
      }
    }

    return updated;
  }

  async createAssetRefundRequest(dto: {
    assetIds: number[];
    reason?: string;
    requestDate?: string;
  }) {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId || !userId) {
      throw new BadRequestException('User session or active App not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    if (!dto.assetIds || !Array.isArray(dto.assetIds) || dto.assetIds.length === 0) {
      throw new BadRequestException('Please select at least one asset to refund');
    }

    const requestDate = dto.requestDate || new Date().toISOString().slice(0, 10);
    const createdRequests: any[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < dto.assetIds.length; i++) {
      const assetId = Number(dto.assetIds[i]);
      const asset = await this.employeeAssetRepo.findOne({
        where: { id: assetId, employeeId: employee.id, appId },
      });

      if (!asset) {
        continue;
      }

      const [existing] = await this.dataSource.query(
        `SELECT id FROM employee_asset_refund_requests WHERE asset_id = ? AND status = 'pending'`,
        [assetId],
      );

      if (existing) {
        continue;
      }

      const requestNo = `REF-REQ-${timestamp}-${i + 1}`;
      const insertResult = await this.dataSource.query(
        `INSERT INTO employee_asset_refund_requests 
        (app_id, employee_id, asset_id, request_no, status, reason, request_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())`,
        [appId, employee.id, assetId, requestNo, dto.reason || null, requestDate],
      );

      createdRequests.push({ id: insertResult.insertId, assetId, requestNo });
    }

    if (createdRequests.length === 0) {
      throw new BadRequestException(
        'Selected asset(s) already have pending refund requests or could not be processed.',
      );
    }

    return {
      message: `${createdRequests.length} refund request(s) submitted successfully.`,
      requests: createdRequests,
    };
  }

  async getMyAssetRefundRequests() {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId || !userId) {
      throw new BadRequestException('User session or active App not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
    });

    if (!employee) {
      return [];
    }

    const rows = await this.dataSource.query(
      `SELECT 
        r.id,
        r.app_id,
        r.employee_id,
        r.asset_id,
        r.request_no,
        r.status,
        r.reason,
        r.request_date,
        r.action_date,
        r.action_by,
        r.action_note,
        r.created_at,
        r.updated_at,
        e.employee_code,
        u.first_name,
        u.last_name,
        u.email,
        desig.name as designation_name,
        a.description as asset_description,
        a.model as asset_model,
        a.serial as asset_serial,
        a.amount as asset_amount,
        a.allocation_date as asset_allocation_date,
        at.name as asset_type_name,
        approver.first_name as approver_first_name,
        approver.last_name as approver_last_name,
        approver.email as approver_email,
        approver_emp.id as approver_employee_id,
        approver_emp.employee_code as approver_employee_code,
        approver_desig.name as approver_designation_name
      FROM employee_asset_refund_requests r
      JOIN employees e ON e.id = r.employee_id
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN designations desig ON desig.id = e.designation_id
      JOIN employee_assets a ON a.id = r.asset_id
      LEFT JOIN company_asset_types at ON at.id = a.asset_type_id
      LEFT JOIN users approver ON approver.id = r.action_by
      LEFT JOIN employees approver_emp ON approver_emp.user_id = approver.id
      LEFT JOIN designations approver_desig ON approver_desig.id = approver_emp.designation_id
      WHERE r.employee_id = ? AND r.app_id = ?
      ORDER BY r.created_at DESC`,
      [employee.id, appId],
    );

    return rows;
  }

  async getAllAssetRefundRequests(query: any = {}) {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('active App not found');
    }

    let sql = `
      SELECT 
        r.id,
        r.app_id,
        r.employee_id,
        r.asset_id,
        r.request_no,
        r.status,
        r.reason,
        r.request_date,
        r.action_date,
        r.action_by,
        r.action_note,
        r.created_at,
        r.updated_at,
        e.employee_code,
        u.first_name,
        u.last_name,
        u.email,
        desig.name as designation_name,
        a.description as asset_description,
        a.model as asset_model,
        a.serial as asset_serial,
        a.amount as asset_amount,
        a.allocation_date as asset_allocation_date,
        at.name as asset_type_name,
        s.name as current_asset_status_name,
        s.color_name as current_asset_status_color,
        approver.first_name as approver_first_name,
        approver.last_name as approver_last_name,
        approver.email as approver_email,
        approver_emp.id as approver_employee_id,
        approver_emp.employee_code as approver_employee_code,
        approver_desig.name as approver_designation_name
      FROM employee_asset_refund_requests r
      JOIN employees e ON e.id = r.employee_id
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN designations desig ON desig.id = e.designation_id
      JOIN employee_assets a ON a.id = r.asset_id
      LEFT JOIN company_asset_types at ON at.id = a.asset_type_id
      LEFT JOIN statuses s ON s.id = a.asset_status_id
      LEFT JOIN users approver ON approver.id = r.action_by
      LEFT JOIN employees approver_emp ON approver_emp.user_id = approver.id
      LEFT JOIN designations approver_desig ON approver_desig.id = approver_emp.designation_id
      WHERE r.app_id = ?
    `;
    const params: any[] = [appId];

    if (query.status && query.status !== 'all') {
      sql += ` AND r.status = ?`;
      params.push(query.status);
    }

    if (query.search) {
      sql += ` AND (
        r.request_no LIKE ? OR 
        e.employee_code LIKE ? OR 
        u.first_name LIKE ? OR 
        u.last_name LIKE ? OR 
        a.model LIKE ? OR 
        a.serial LIKE ? OR 
        a.description LIKE ?
      )`;
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const allRows = await this.dataSource.query(sql, params);
    const total = allRows.length;

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);
    const start = (page - 1) * limit;
    const paginatedRows = allRows.slice(start, start + limit);

    return {
      data: paginatedRows,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async actionAssetRefundRequest(dto: {
    id: number;
    status: 'approved' | 'rejected';
    actionNote?: string;
  }) {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId || !userId) {
      throw new BadRequestException('User session or active App not found');
    }

    if (!dto.id || !['approved', 'rejected'].includes(dto.status)) {
      throw new BadRequestException('Invalid request ID or status');
    }

    const [request] = await this.dataSource.query(
      `SELECT r.*, a.id as asset_id, a.description, a.model, e.user_id as emp_user_id 
       FROM employee_asset_refund_requests r
       JOIN employee_assets a ON a.id = r.asset_id
       JOIN employees e ON e.id = r.employee_id
       WHERE r.id = ? AND r.app_id = ?`,
      [dto.id, appId],
    );

    if (!request) {
      throw new NotFoundException('Refund request not found');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(`This request has already been ${request.status}`);
    }

    await this.dataSource.query(
      `UPDATE employee_asset_refund_requests 
       SET status = ?, action_date = NOW(), action_by = ?, action_note = ?, updated_at = NOW() 
       WHERE id = ?`,
      [dto.status, userId, dto.actionNote || null, dto.id],
    );

    if (dto.status === 'approved') {
      await this.dataSource.query(
        `UPDATE employee_assets 
         SET asset_status_id = 144, withdrawal_date = NOW(), updated_at = NOW() 
         WHERE id = ?`,
        [request.asset_id],
      );

      if (request.emp_user_id) {
        await this.usersService.createUserNotification(
          request.emp_user_id,
          `Your refund request for asset <b>${request.model || request.description || 'Asset'}</b> has been approved.`,
        );
      }
    } else if (dto.status === 'rejected') {
      if (request.emp_user_id) {
        await this.usersService.createUserNotification(
          request.emp_user_id,
          `Your refund request for asset <b>${request.model || request.description || 'Asset'}</b> was rejected.${dto.actionNote ? ` Reason: ${dto.actionNote}` : ''}`,
        );
      }
    }

    return {
      message: `Refund request successfully ${dto.status}.`,
    };
  }

  async getAppEmployeeUsers(): Promise<CommonResponseDto[]> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const employeeIds = await this.employeeRepo
      .createQueryBuilder('e')
      .select('e.id')
      .where('e.appId = :appId', { appId })
      .andWhere('e.employeeStatusId IN (:...statusIds)', {
        statusIds: [130, 132],
      })
      .andWhere('e.userId IS NOT NULL')
      .getRawMany();

    const activeEmployeeIds = employeeIds.map((row) => row.e_id);

    const employees = await this.employeeRepo
      .createQueryBuilder('employee')
      .where('employee.appId = :appId', { appId })
      .andWhere('employee.employeeStatusId IN (:...statusIds)', {
        statusIds: [130, 132],
      })
      .andWhere('employee.userId IS NOT NULL')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .addSelect(['designation.id', 'designation.name'])
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .addSelect(['profile.id', 'profilePicture.id', 'profilePicture.filename'])
      .orderBy('user.firstName', 'ASC')
      .getMany();

    if (!employees || employees.length === 0) {
      return [];
    } else {
      return employees.map((item) => {
        const response = new CommonResponseDto();
        response.value = item.id;
        // response.value = item.user?.id;
        response.label = item.user?.fullName || 'Unknown';
        response.designation = item.designation?.name || 'Unknown';
        response.employeeId = item?.id || undefined;
        response.code = item?.employeeCode || undefined;
        response.avatarUrl = item?.user?.profile?.profilePicture?.fileUrl || '';
        return response;
      });
    }
  }

  async setEmployeeAttendanceStatusAbsent(appIdFilter?: number): Promise<any> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    // const todayStr = `${yyyy}-${mm}-${dd}`;
    const todayStr = moment().tz('Asia/Dhaka').format('YYYY-MM-DD');

    // If appIdFilter is provided, process only that application; otherwise process all
    const whereCondition = appIdFilter
      ? { id: appIdFilter, deletedAt: IsNull() }
      : { deletedAt: IsNull() };

    const applications = await this.applicationRepo.find({
      where: whereCondition,
    });

    if (!applications || applications.length === 0) {
      return;
    }

    for (const app of applications) {
      const appId = app.id;

      const appHolidayDates = await this.appHolidayDateRepo
        .createQueryBuilder('appHolidayDate')
        .innerJoin('appHolidayDate.appHoliday', 'appHoliday')
        .where('appHoliday.appId = :appId', { appId })
        .andWhere('appHolidayDate.holidayDate = :today', { today: todayStr })
        .getOne();

      // If the app has a holiday on the current date, skip to the next application
      if (appHolidayDates) {
        continue; // skip this app
      }

      const employees = await this.employeeRepo
        .createQueryBuilder('e')
        .select(['e.id', 'e.officeId', 'e.officeShiftId'])
        .where('e.appId = :appId', { appId })
        .andWhere('e.employeeStatusId IN (:...statusIds)', {
          statusIds: [130, 132],
        })
        .andWhere('e.userId IS NOT NULL')
        .getRawMany();

      // If there are no active employees, skip to the next application
      if (!employees || employees.length === 0) {
        continue;
      }

      const checkedIn = await this.empAttendanceRepo
        .createQueryBuilder('a')
        .select('a.empId', 'empId')
        .where('a.appId = :appId', { appId })
        .andWhere('a.attendanceDate = :today', { today: todayStr })
        .getRawMany();

      const checkedInIds = checkedIn.map((e) => e.empId);

      const absentEmployees = employees.filter(
        (e) => !checkedInIds.includes(e.id),
      );

      if (!absentEmployees.length) continue;

      const absentRecords: EmpAttendance[] = [];
      for (const employee of absentEmployees) {
        const employeeId = employee.id;
        const officeId = employee.officeId;
        const officeShiftId = employee.officeShiftId;

        const isWeekend = await this.getOfficeWeekend(
          appId,
          officeId,
          officeShiftId,
        );

        // If it's a weekend, skip to the next employee
        if (isWeekend) {
          continue;
        }

        const absentRecord: EmpAttendance = await this.empAttendanceRepo.create(
          {
            appId,
            empId: employeeId,
            officeId,
            shiftId: officeShiftId,
            attendanceDate: todayStr,
            attendanceStatusId: 43,
            createdAt: new Date(),
          },
        );

        absentRecords.push(absentRecord);
      }

      await this.empAttendanceRepo.insert(absentRecords);
    }
  }

  async getOfficeWeekend(
    appId: number,
    officeId: number,
    officeShiftId: number,
  ): Promise<boolean> {
    const weekendQuery = this.officeWeekendRepo
      .createQueryBuilder('e')
      .where('e.appId = :appId', { appId: appId })
      .andWhere('e.officeId = :officeId', { officeId });

    if (officeShiftId) {
      weekendQuery.andWhere('e.shiftId = :officeShiftId', {
        officeShiftId,
      });
    }

    const todayName = new Date()
      .toLocaleString('en-US', { weekday: 'long' })
      .toLowerCase();
    const todayNameLowerCase = todayName.toLowerCase();

    if (todayNameLowerCase === 'saturday') {
      weekendQuery.andWhere('e.saturday = :saturday', {
        saturday: true,
      });
    }

    if (todayNameLowerCase === 'sunday') {
      weekendQuery.andWhere('e.sunday = :sunday', {
        sunday: true,
      });
    }

    if (todayNameLowerCase === 'monday') {
      weekendQuery.andWhere('e.monday = :monday', {
        monday: true,
      });
    }

    if (todayNameLowerCase === 'tuesday') {
      weekendQuery.andWhere('e.tuesday = :tuesday', {
        tuesday: true,
      });
    }

    if (todayNameLowerCase === 'wednesday') {
      weekendQuery.andWhere('e.wednesday = :wednesday', {
        wednesday: true,
      });
    }

    if (todayNameLowerCase === 'thursday') {
      weekendQuery.andWhere('e.thursday = :thursday', {
        thursday: true,
      });
    }

    if (todayNameLowerCase === 'friday') {
      weekendQuery.andWhere('e.friday = :friday', {
        friday: true,
      });
    }

    const isWeekend = await weekendQuery.getRawOne();

    return isWeekend ? true : false;
  }

  async setEmployeeAttendanceStatusAbsent2(): Promise<any> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const applications = await this.applicationRepo.find({
      where: { deletedAt: IsNull() },
    });

    if (!applications || applications.length === 0) {
      return;
    }

    for (const app of applications) {
      const appId = app.id;

      const appHolidayDates = await this.appHolidayDateRepo
        .createQueryBuilder('appHolidayDate')
        .innerJoin('appHolidayDate.appHoliday', 'appHoliday')
        .where('appHoliday.appId = :appId', { appId })
        .andWhere('appHolidayDate.holidayDate = :today', { today: new Date() })
        .getOne();

      if (!appHolidayDates) {
        break;
      }

      const employees = await this.employeeRepo
        .createQueryBuilder('e')
        .select(['e.id', 'e.officeId', 'e.officeShiftId'])
        .where('e.appId = :appId', { appId })
        .andWhere('e.employeeStatusId IN (:...statusIds)', {
          statusIds: [130, 132],
        })
        .andWhere('e.userId IS NOT NULL')
        .getRawMany();

      if (!employees || employees.length === 0) {
        return;
      }

      const activeEmployeeIds = employees.map((e) => e.e_id);
      if (!activeEmployeeIds.length) return;

      const checkedIn = await this.empAttendanceRepo
        .createQueryBuilder('a')
        .select('a.empId', 'empId')
        .where('a.appId = :appId', { appId })
        .andWhere('a.attendanceDate = :today', { today: todayStr })
        .getRawMany();

      const checkedInIds = checkedIn.map((e) => e.empId);

      const absentEmployeeIds = activeEmployeeIds.filter(
        (id) => !checkedInIds.includes(id),
      );

      if (!absentEmployeeIds.length)
        return { totalEmployees: activeEmployeeIds.length, markedAbsent: 0 };

      for (const employee of employees) {
        const employeeId = employee.id;
        const officeId = employee.officeId;
        const officeShiftId = employee.officeShiftId;

        const isWeekend = await this.getOfficeWeekend(
          appId,
          officeId,
          officeShiftId,
        );

        if (isWeekend) {
          continue;
        }
      }

      const absentEmployees = await this.employeeRepo
        .createQueryBuilder('e')
        .select(['e.id', 'e.officeId', 'e.officeShiftId'])
        .where('e.id IN (:...ids)', { ids: absentEmployeeIds })
        .getRawMany();

      const absentRecords = absentEmployees.map((emp) => ({
        appId,
        empId: emp.e_id,
        officeId: emp.e_office_id,
        shiftId: emp.e_office_shift_id,
        attendanceDate: todayStr,
        attendanceStatusId: 43,
        createdAt: new Date(),
      }));

      await this.empAttendanceRepo.save(absentRecords);

      return {
        totalEmployees: activeEmployeeIds.length,
        markedAbsent: absentRecords.length,
      };
    }
  }

  async sendBirthdayWishes(): Promise<void> {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${mm}-${dd}`;

    const birthdayEmployees = await this.userProfileRepo
      .createQueryBuilder('userProfile')
      .leftJoinAndSelect('userProfile.user', 'user')
      // .select(['user.id', 'user.firstName', 'user.lastName', 'user.email', 'userProfile.dateOfBirth'])
      .where("DATE_FORMAT(userProfile.dateOfBirth, '%m-%d') = :today", {
        today: todayStr,
      })
      .getMany();

    await Promise.all(
      birthdayEmployees
        .filter((emp) => emp.user?.email)
        .map((emp) =>
          this.mailService.sendMail(
            emp.user.email,
            'Happy Birthday! 🎉',
            'birthday',
            { name: `${emp.user.firstName} ${emp.user.lastName}` },
          ),
        ),
    );
  }

  async getDashboardData(): Promise<DashboardResponseDto> {
    const start = Date.now();
    // const userId = RequestContext.get('userId');
    const activeAppId = RequestContext.get('activeAppId');

    if (!activeAppId) {
      throw new BadRequestException({ message: 'App User not found' });
    }

    const response = new DashboardResponseDto();

    if (activeAppId) {
      response.attendanceStatistics =
        await this.getAttendanceStatistics(activeAppId);
      response.requisitions = await this.getRequisitionStatistics(activeAppId);
    }

    const end = Date.now();
    console.log(`⏱ API Response Time: ${end - start} ms`);

    return response;
  }

  async getAttendanceStatistics2(appId: number): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const query = this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoin('attendance.checkInStatus', 'checkInStatus')
      .leftJoin('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoin('employee.user', 'user')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('employee.officeShift', 'officeShift')
      .where('attendance.appId = :appId', { appId })
      .andWhere('attendance.attendanceDate = :today', { today });

    query.addSelect([
      'attendance.empId',
      'attendance.checkIn',
      'attendance.checkOut',

      'attendanceStatus.id',
      'attendanceStatus.name',
      'attendanceStatus.code',
      'attendanceStatus.colorName',

      'checkInStatus.id',
      'checkInStatus.code',
      'checkInStatus.name',
      'checkInStatus.colorName',

      'checkOutStatus.id',
      'checkOutStatus.code',
      'checkOutStatus.name',
      'checkOutStatus.colorName',

      'employee.id',
      'employee.employeeCode',
      'employee.userId',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'profile.profilePictureId',
      'profilePicture.id',
      'profilePicture.filename',

      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
    ]);

    const attendances = await query.getMany();

    const response = {
      absent: { count: 0, users: [] as any[] },
      onTimeCheckIn: { count: 0, users: [] as any[] },
      lateCheckIn: { count: 0, users: [] as any[] },
      earlyTiming: { count: 0, users: [] as any[] },
      totalPresent: 0,
      totalAbsent: 0,
      totalEmployees: 0,
    };

    for (const att of attendances) {
      const code = att.attendanceStatus?.code;
      const shiftStart = att.employee?.officeShift?.startTime;
      const user = att.employee?.user;

      const empUserObjectMapper =
        await this.UserObjectMapperForAttendanceStatistics(att);

      if (!att.checkIn) {
        response.absent.count++;
        response.totalAbsent++;
        response.absent.users.push(empUserObjectMapper);
      } else {
        response.totalPresent++;

        if (att?.checkInStatus?.code === 'attendance_checkin_status_ontime') {
          response.onTimeCheckIn.count++;
          response.onTimeCheckIn.users.push(empUserObjectMapper);
        }

        if (att?.checkInStatus?.code === 'attendance_checkin_status_late') {
          response.lateCheckIn.count++;
          response.lateCheckIn.users.push(empUserObjectMapper);
        }

        if (
          att?.checkOutStatus?.code === 'attendance_checkout_status_left_timely'
        ) {
          response.earlyTiming.count++;
          response.earlyTiming.users.push(empUserObjectMapper);
        }
      }

      response.totalEmployees++;
    }

    return response;
  }

  async getAttendanceStatistics(appId: number): Promise<any> {
    const employeeIds = await this.employeeRepo
      .createQueryBuilder('e')
      .select('e.id')
      .where('e.appId = :appId', { appId })
      .andWhere('e.employeeStatusId IN (:...statusIds)', {
        statusIds: [130, 132], // Resigned, Joined
      })
      .andWhere('e.userId IS NOT NULL')
      .getRawMany();

    const activeEmployeeIds = employeeIds.map((row) => row.e_id);

    // Return empty response if no active employees found
    if (activeEmployeeIds.length === 0) {
      return {
        absent: { count: 0, users: [] as any[] },
        onTimeCheckIn: { count: 0, users: [] as any[] },
        lateCheckIn: { count: 0, users: [] as any[] },
        earlyTiming: { count: 0, users: [] as any[] },
        totalPresent: 0,
        totalAbsent: 0,
        totalEmployees: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];

    const query = this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoin('attendance.checkInStatus', 'checkInStatus')
      .leftJoin('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoin('employee.user', 'user')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('employee.officeShift', 'officeShift')
      .where('attendance.appId = :appId', { appId })
      .andWhere('attendance.empId IN (:...empIds)', {
        empIds: activeEmployeeIds,
      })
      .andWhere('attendance.attendanceDate = :today', { today });

    query.addSelect([
      'attendance.empId',
      'attendance.checkIn',
      'attendance.checkOut',

      'attendanceStatus.id',
      'attendanceStatus.name',
      'attendanceStatus.code',
      'attendanceStatus.colorName',

      'checkInStatus.id',
      'checkInStatus.code',
      'checkInStatus.name',
      'checkInStatus.colorName',

      'checkOutStatus.id',
      'checkOutStatus.code',
      'checkOutStatus.name',
      'checkOutStatus.colorName',

      'employee.id',
      'employee.employeeCode',
      'employee.userId',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'profile.profilePictureId',
      'profilePicture.id',
      'profilePicture.filename',

      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
    ]);

    const attendances = await query.getMany();

    const response = {
      absent: { count: 0, users: [] as any[] },
      onTimeCheckIn: { count: 0, users: [] as any[] },
      lateCheckIn: { count: 0, users: [] as any[] },
      earlyTiming: { count: 0, users: [] as any[] },
      totalPresent: 0,
      totalAbsent: 0,
      totalEmployees: activeEmployeeIds ? activeEmployeeIds.length : 0,
    };

    for (const att of attendances) {
      const code = att.attendanceStatus?.code;
      const shiftStart = att.employee?.officeShift?.startTime;
      const user = att.employee?.user;

      const empUserObjectMapper =
        await this.UserObjectMapperForAttendanceStatistics(att);

      if (att?.attendanceStatus?.code === 'emp_attendance_status_absent') {
        response.absent.count++;
        response.absent.users.push(empUserObjectMapper);
      } else {
        response.totalPresent++;

        if (att?.checkInStatus?.code === 'attendance_checkin_status_ontime') {
          response.onTimeCheckIn.count++;
          response.onTimeCheckIn.users.push(empUserObjectMapper);
        }

        if (att?.checkInStatus?.code === 'attendance_checkin_status_late') {
          response.lateCheckIn.count++;
          response.lateCheckIn.users.push(empUserObjectMapper);
        }

        if (
          att?.checkOutStatus?.code === 'attendance_checkout_status_left_early'
        ) {
          response.earlyTiming.count++;
          response.earlyTiming.users.push(empUserObjectMapper);
        }
      }
    }

    response.totalAbsent = response.totalEmployees - response.totalPresent;

    return response;
  }

  async UserObjectMapperForAttendanceStatistics(att: any): Promise<any> {
    return {
      empId: att?.empId,
      employeeCode: att?.employee?.employeeCode || '',
      userId: att?.employee?.userId || '',
      // firstName: att?.employee?.user?.firstName || '',
      // lastName: att?.employee?.user?.lastName || '',
      fullName: att?.employee?.user?.fullName,
      email: att?.employee?.user?.email || '',
      imageUrl: att?.employee?.user?.profile?.profilePicture?.fileUrl || '',

      designation: att?.employee?.designation?.name || '',
      department: att?.employee?.designation?.department?.name || '',

      checkIn: att?.checkIn || '',
      checkOut: att?.checkOut || '',

      checkInStatus: att?.checkInStatus?.name || '',
      checkInCode: att?.checkInStatus?.code || '',
      checkInColor: att?.checkInStatus?.colorName || '',

      checkOutStatus: att?.checkOutStatus?.name || '',
      checkOutCode: att?.checkOutStatus?.code || '',
      checkOutColor: att?.checkOutStatus?.colorName || '',
    };
  }

  async getRequisitionStatistics(appId: number): Promise<any> {
    // const requisitions = await this.requisitionRepo.find({
    //   where: { appId },
    //   relations: [
    //     'employee',
    //     'employee.user',
    //     'employee.user.profile.profilePicture',
    //   ],
    // });

    const requisitions = await this.requisitionRepo
      .createQueryBuilder('requisition')
      .leftJoinAndSelect('requisition.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .where('requisition.appId = :appId', { appId })
      .getMany();

    const requisitionList = requisitions.map((req) => {
      const employeeName = req.employee?.user?.firstName;
      const itemDescription = req.itemDescription || 'Requisition';
      const requisitionDate = req.requisitionDate;
      const employeeProfileUrl =
        req.employee?.user?.profile?.profilePicture?.fileUrl || '';

      return {
        id: req.id,
        itemDescription,
        employeeName,
        requisitionDate,
        employeeProfileUrl,
      };
    });

    return {
      count: requisitions.length,
      requisitions: requisitionList,
    };
  }

  async createOrUpdateHolidays(dto: CreateHolidayDto): Promise<Holiday> {
    const userId = RequestContext.get('userId');

    if (dto.id) {
      const holiday = await this.holidayRepo.findOne({ where: { id: dto.id } });
      if (!holiday)
        throw new NotFoundException(`Holiday with ID ${dto.id} not found`);

      this.holidayRepo.merge(holiday, dto);
      holiday.editorId = userId;

      const updatedHoliday = this.holidayRepo.save(holiday);

      return updatedHoliday;
    } else {
      const holiday = this.holidayRepo.create(dto);
      holiday.creatorId = userId;
      return this.holidayRepo.save(holiday);
    }
  }

  async changeHolidayActiveStatus(id: number): Promise<HolidayResponseDto> {
    const findItem = await this.holidayRepo.findOne({ where: { id } });
    if (!findItem) {
      throw new NotFoundException(`Notice with ID ${id} not found`);
    }

    findItem.isActive = !findItem.isActive;
    const saved = await this.holidayRepo.save(findItem);
    return HolidayResponseDto.fromEntity(saved);
  }

  async findAllHolidays(
    queryString: any,
  ): Promise<{ data: Holiday[]; total: number }> {
    const query = this.holidayRepo.createQueryBuilder('holiday');

    query.leftJoin('holiday.holidayType', 'holidayType');

    query.addSelect([
      'holidayType.id',
      'holidayType.name',
      'holidayType.code',
      'holidayType.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('holiday.holidayName LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.holidayTypeId) {
      query.andWhere('holiday.holidayTypeId = :holidayTypeId', {
        holidayTypeId: params.holidayTypeId,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findHolidayById(id: number): Promise<Holiday> {
    const holiday = await this.holidayRepo.findOne({ where: { id } });
    if (!holiday)
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    return holiday;
  }

  async deleteHoliday(id: number): Promise<void> {
    const result = await this.holidayRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Holiday with ID ${id} not found`);
  }

  async createOrUpdateAppHoliday(
    dto: CreateAppHolidayDto,
  ): Promise<AppHoliday> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    if (!dto.startDate || !dto.endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const startDate = moment(dto.startDate, 'YYYY-MM-DD', true);
    const endDate = moment(dto.endDate, 'YYYY-MM-DD', true);
    if (!startDate.isValid() || !endDate.isValid()) {
      throw new BadRequestException(
        'startDate and endDate must define a valid holiday range',
      );
    }

    const rangeDayCount = endDate.diff(startDate, 'days') + 1;
    const dayCount = dto.dayCount ?? dto.holidayDates?.length ?? rangeDayCount;
    if (
      !Number.isInteger(dayCount) ||
      dayCount < 1 ||
      (dto.holidayDates && dto.holidayDates.length !== dayCount)
    ) {
      throw new BadRequestException(
        'dayCount must match the number of holidayDates',
      );
    }

    const holidayDates =
      dto.holidayDates ??
      Array.from({ length: dayCount }, (_, index) =>
        startDate.clone().add(index, 'days').format('YYYY-MM-DD'),
      );

    if (
      rangeDayCount < 1 ||
      holidayDates[0] !== startDate.format('YYYY-MM-DD') ||
      holidayDates[holidayDates.length - 1] !== endDate.format('YYYY-MM-DD') ||
      holidayDates.some((date, index) => {
        const parsedDate = moment(date, 'YYYY-MM-DD', true);
        const previousDate = index
          ? moment(holidayDates[index - 1], 'YYYY-MM-DD', true)
          : null;
        return (
          !parsedDate.isValid() ||
          parsedDate.format('YYYY-MM-DD') !== date ||
          (previousDate && !parsedDate.isAfter(previousDate, 'day'))
        );
      })
    ) {
      throw new BadRequestException(
        'holidayDates must be valid, ordered, unique, and match the start and end dates',
      );
    }

    dto.dayCount = dayCount;
    dto.appId = appUser.appId ?? undefined;

    const holidayDay = new AppHoliday();
    holidayDay.id = dto.id;
    holidayDay.appId = appUser.appId ?? undefined;
    holidayDay.holidayId = dto.holidayId;
    holidayDay.holidayTypeId = dto.holidayTypeId;
    holidayDay.holidayName = dto.holidayName;
    holidayDay.dayCount = dto.dayCount;
    holidayDay.isRecurring = dto.isRecurring;
    holidayDay.isOfficial = dto.isOfficial;

    if (holidayDay.id) {
      const existing = await this.appHolidayRepo.findOne({
        where: { id: holidayDay.id },
      });
      if (!existing)
        throw new NotFoundException(`AppHoliday with ID ${dto.id} not found`);
      this.appHolidayRepo.merge(existing, holidayDay);
      existing.editorId = userId;

      const savedData = await this.appHolidayRepo.save(existing);

      await this.appHolidayDateRepo.delete({ appHolidayId: savedData.id });
      if (holidayDates.length > 0) {
        const dateEntries: AppHolidayDate[] = [];

        for (const d of holidayDates) {
          const dateEntry = this.appHolidayDateRepo.create({
            appHolidayId: savedData.id,
            holidayDate: d, // format YYYY-MM-DD
          });
          dateEntries.push(dateEntry);
        }

        // Save all generated dates at once
        await this.appHolidayDateRepo.save(dateEntries);
      }

      return savedData;
    } else {
      holidayDay.editorId = userId;
      const newAppHoliday = this.appHolidayRepo.create(holidayDay);
      newAppHoliday.creatorId = userId;
      const savedData = await this.appHolidayRepo.save(newAppHoliday);

      if (holidayDates.length > 0) {
        const dateEntries: AppHolidayDate[] = [];

        for (const d of holidayDates) {
          const dateEntry = this.appHolidayDateRepo.create({
            appHolidayId: savedData.id,
            holidayDate: d, // format YYYY-MM-DD
          });
          dateEntries.push(dateEntry);
        }
        // Save all generated dates at once
        await this.appHolidayDateRepo.save(dateEntries);
      }

      return savedData;
    }
  }

  async findAllAppHolidays(
    queryString: any,
  ): Promise<{ data: AppHoliday[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.appHolidayRepo.createQueryBuilder('appHoliday');
    query.leftJoin('appHoliday.appHolidayDates', 'appHolidayDates');
    query.leftJoin('appHoliday.holidayType', 'holidayType');
    query.leftJoin('appHoliday.holiday', 'holiday');

    query.addSelect([
      'holidayType.id',
      'holidayType.name',
      'holidayType.code',
      'holidayType.colorName',

      'appHolidayDates.id',
      'appHolidayDates.holidayDate',
      'holiday.id',
      'holiday.holidayName',
    ]);
    query.andWhere('appHoliday.appId = :appId', { appId: appUser.appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('appHoliday.holidayName LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.holidayTypeId) {
      query.andWhere('appHoliday.holidayTypeId = :holidayTypeId', {
        holidayTypeId: params.holidayTypeId,
      });
    }

    if (params.holidayDate) {
      query.andWhere('Date(appHolidayDates.holidayDate) = :holidayDate', {
        holidayDate: params.holidayDate,
      });
    }

    if (params.holidayDates?.length) {
      if (params.holidayDates.length === 2) {
        const [startDate, endDate] = params.holidayDates;

        query.andWhere(
          'DATE(appHolidayDates.holidayDate) BETWEEN :startDate AND :endDate',
          { startDate, endDate },
        );
      } else {
        query.andWhere(
          'DATE(appHolidayDates.holidayDate) IN (:...holidayDates)',
          {
            holidayDates: params.holidayDates,
          },
        );
      }
    }

    if (params.holidayYear) {
      query.andWhere('YEAR(appHolidayDates.holidayDate) = :holidayYear', {
        holidayYear: params.holidayYear,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();
    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findAllHolidayListWithoutPagination(
    queryString: any,
  ): Promise<{ data: AppHoliday[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });

    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    const query = this.appHolidayRepo.createQueryBuilder('appHoliday');

    query.leftJoin('appHoliday.appHolidayDates', 'appHolidayDates');
    query.leftJoin('appHoliday.holidayType', 'holidayType');

    query.select([
      'appHoliday.id',
      'appHoliday.holidayName',
      'appHoliday.dayCount',

      'appHolidayDates.id',
      'appHolidayDates.holidayDate',
    ]);

    query.andWhere('appHoliday.appId = :appId', { appId: appUser.appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('appHoliday.holidayName LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.holidayDate) {
      query.andWhere('DATE(appHolidayDates.holidayDate) = :holidayDate', {
        holidayDate: params.holidayDate,
      });
    }

    if (params.holidayDates?.length) {
      if (params.holidayDates.length === 2) {
        const [startDate, endDate] = params.holidayDates;

        query.andWhere(
          'DATE(appHolidayDates.holidayDate) BETWEEN :startDate AND :endDate',
          { startDate, endDate },
        );
      } else {
        query.andWhere(
          'DATE(appHolidayDates.holidayDate) IN (:...holidayDates)',
          {
            holidayDates: params.holidayDates,
          },
        );
      }
    }

    if (params.holidayYear) {
      query.andWhere('YEAR(appHolidayDates.holidayDate) = :holidayYear', {
        holidayYear: params.holidayYear,
      });
    }

    query.orderBy('appHolidayDates.holidayDate', 'ASC');

    const data = await query.getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findAppHolidayById(id: number): Promise<AppHoliday> {
    const holiday = await this.appHolidayRepo.findOne({ where: { id } });
    if (!holiday)
      throw new NotFoundException(`AppHoliday with ID ${id} not found`);
    return holiday;
  }

  async deleteAppHoliday(id: number): Promise<void> {
    await this.appHolidayDateRepo.delete({ appHolidayId: id });
    const result = await this.appHolidayRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`AppHoliday with ID ${id} not found`);
  }

  async createOrUpdateAppHolidayDate(
    dto: CreateAppHolidayDateDto,
  ): Promise<AppHolidayDate> {
    const appHoliday = await this.appHolidayRepo.findOne({
      where: { id: dto.appHolidayId },
    });
    if (!appHoliday)
      throw new NotFoundException(
        `AppHoliday with ID ${dto.appHolidayId} not found`,
      );

    // Update if exists
    if (dto.id) {
      const existing = await this.appHolidayDateRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(
          `AppHolidayDate with ID ${dto.id} not found`,
        );

      this.appHolidayDateRepo.merge(existing, dto);
      return this.appHolidayDateRepo.save(existing);
    }

    const newDate = this.appHolidayDateRepo.create(dto);
    return this.appHolidayDateRepo.save(newDate);
  }

  async findAllAppHolidayDates(
    queryString: any,
  ): Promise<{ data: AppHolidayDate[]; total: number }> {
    const userId = RequestContext.get('userId');
    const query = this.appHolidayDateRepo.createQueryBuilder('holidayDate');

    query.leftJoin('holidayDate.appHoliday', 'appHoliday');
    query.addSelect(['appHoliday.id', 'appHoliday.holidayName']);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.appHolidayId) {
      query.andWhere('holidayDate.appHolidayId = :appHolidayId', {
        appHolidayId: params.appHolidayId,
      });
    }

    if (params.search) {
      query.andWhere('holidayDate.holidayDate LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findAppHolidayDateById(id: number): Promise<AppHolidayDate> {
    const holidayDate = await this.appHolidayDateRepo.findOne({
      where: { id },
      relations: ['appHoliday'],
    });
    if (!holidayDate)
      throw new NotFoundException(`AppHolidayDate with ID ${id} not found`);
    return holidayDate;
  }

  async deleteAppHolidayDate(id: number): Promise<void> {
    const result = await this.appHolidayDateRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`AppHolidayDate with ID ${id} not found`);
  }

  // Create or Update EmployeeHierarchy
  async createOrUpdateEmployeeHierarchy(
    dto: CreateEmployeeHierarchyDto,
  ): Promise<EmployeeHierarchy> {
    // if (dto.startDate) {
    //   dto.startDate = dto.startDate?.toISOString() || '';
    // }

    const appId = RequestContext.get('activeAppId');
    if (!appId) throw new NotFoundException(`App not found`);
    dto.appId = appId;

    const employee = await this.employeeRepo.findOne({
      where: { id: dto.empId },
    });
    if (!employee)
      throw new NotFoundException(`Employee with ID ${dto.empId} not found`);

    dto.empId = employee.id;

    const supervisor = await this.employeeRepo.findOne({
      where: { id: dto.supervisorId },
    });
    if (!supervisor)
      throw new NotFoundException(
        `Supervisor with ID ${dto.supervisorId} not found`,
      );

    dto.supervisorId = supervisor.id;

    let found: EmployeeHierarchy;

    if (dto.id) {
      const hierarchy = await this.employeeHierarchyRepo.findOne({
        where: { id: dto.id },
      });

      if (!hierarchy) {
        throw new NotFoundException(
          `EmployeeHierarchy with ID ${dto.id} not found`,
        );
      }

      found = hierarchy;

      this.employeeHierarchyRepo.merge(found, dto);
    } else {
      found = this.employeeHierarchyRepo.create({ ...dto });
    }

    return await this.employeeHierarchyRepo.save(found);
  }

  async findAllEmployeeHierarchies(
    queryString?: any,
  ): Promise<{ data: EmployeeHierarchy[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.employeeHierarchyRepo.createQueryBuilder('hierarchy');

    query.leftJoin('hierarchy.employee', 'employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');
    query.leftJoin('hierarchy.supervisor', 'supervisor');
    query.leftJoin('supervisor.designation', 'supervisorDesignation');
    query.leftJoin('supervisorDesignation.department', 'supervisorDepartment');
    query.leftJoin('supervisor.user', 'supervisorUser');
    query.leftJoin('supervisorUser.profile', 'supervisorProfile');
    query.leftJoin(
      'supervisorProfile.profilePicture',
      'supervisorProfilePicture',
    );
    query.where('hierarchy.appId = :appId', { appId });

    query.addSelect([
      'employee.id',
      //'employee.user',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'profile.id',
      'profile.phoneCountryId',
      'profile.phone',
      'profile.gender',
      'profilePicture.id',
      'profilePicture.filename',

      'designation.id',
      'designation.name',
      'designation.level',

      'department.id',
      'department.name',
      'department.description',

      'supervisor.id',
      // 'supervisor.user',
      'supervisorUser.id',
      'supervisorUser.firstName',
      'supervisorUser.lastName',
      'supervisorUser.email',
      'supervisorUser.isActive',
      'supervisorProfile.id',
      'supervisorProfile.phoneCountryId',
      'supervisorProfile.phone',
      'supervisorProfile.gender',
      'supervisorProfilePicture.id',
      'supervisorProfilePicture.filename',

      'supervisorDesignation.id',
      'supervisorDesignation.name',
      'supervisorDesignation.level',

      'supervisorDepartment.id',
      'supervisorDepartment.name',
      'supervisorDepartment.description',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.startDate) {
      query.andWhere('hierarchy.startDate = :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('hierarchy.endDate = :endDate', {
        endDate: params.endDate,
      });
    }

    // Add sorting, pagination, etc. if you have APIFeatures
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();
    const featureData = await features.getQuery().getMany();

    //const data = await query.getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async findEmployeeHierarchyById(id: number): Promise<EmployeeHierarchy> {
    const hierarchy = await this.employeeHierarchyRepo.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!hierarchy) {
      throw new NotFoundException(`EmployeeHierarchy with ID ${id} not found`);
    }

    return hierarchy;
  }

  async findEmployeeHierarchyByEmployeeId(id: number) {
    const query = this.employeeHierarchyRepo
      .createQueryBuilder('employeeHierarchy')
      .leftJoin('employeeHierarchy.employee', 'employee')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('employeeHierarchy.supervisor', 'supervisor')
      .leftJoin('supervisor.designation', 'supervisorDesignation')
      .leftJoin('supervisorDesignation.department', 'supervisorDepartment')
      .leftJoin('supervisor.user', 'supervisorUser')
      .leftJoin('supervisorUser.profile', 'supervisorProfile')
      .leftJoin('supervisorProfile.profilePicture', 'supervisorProfilePicture')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture');

    query
      .addSelect([
        'employeeHierarchy.startDate',
        'employeeHierarchy.endDate',
        'employee.id',

        // Current Employee User details
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',

        // Current Employee Profile details
        'profile.id',
        'profile.phoneCountryId',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'designation.id',
        'designation.name',
        'designation.level',

        'department.id',
        'department.name',
        'department.description',

        'supervisor.id',
        // 'supervisor.user',
        'supervisorUser.id',
        'supervisorUser.firstName',
        'supervisorUser.lastName',
        'supervisorUser.email',
        'supervisorUser.isActive',
        'supervisorProfile.id',
        'supervisorProfile.phoneCountryId',
        'supervisorProfile.phone',
        'supervisorProfile.gender',
        'supervisorProfilePicture.id',
        'supervisorProfilePicture.filename',

        'supervisorDesignation.id',
        'supervisorDesignation.name',
        'supervisorDesignation.level',

        'supervisorDepartment.id',
        'supervisorDepartment.name',
        'supervisorDepartment.description',
      ])
      .orderBy('employeeHierarchy.startDate', 'DESC')
      .orderBy('employeeHierarchy.endDate', 'DESC');

    const supervisors = await query
      .clone()
      .andWhere('employeeHierarchy.empId = :empId', {
        empId: id,
      })
      .getMany();

    const subordinates = await query
      .clone()
      .andWhere('employeeHierarchy.supervisorId = :empId', {
        empId: id,
      })
      .getMany();

    return { supervisors, subordinates };
  }

  // Delete EmployeeHierarchy by ID
  async deleteEmployeeHierarchy(id: number): Promise<{ message: string }> {
    const hierarchy = await this.employeeHierarchyRepo.findOne({
      where: { id },
    });

    if (!hierarchy) {
      throw new NotFoundException(`EmployeeHierarchy with ID ${id} not found`);
    }

    await this.employeeHierarchyRepo.remove(hierarchy);
    return { message: 'EmployeeHierarchy deleted successfully' };
  }

  // Create or Update LifeEvent
  async createOrUpdateLifeEvent(dto: CreateLifeEventDto): Promise<LifeEvent> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    dto.appId = appUser.appId ?? undefined;

    let lifeEvent: LifeEvent;

    if (!dto.empId) throw new BadRequestException('empId is required');

    const employee = await this.employeeRepo.findOne({
      where: { id: dto.empId },
    });

    if (!employee)
      throw new NotFoundException(`Employee with ID ${dto.empId} not found`);

    dto.empId = employee.id;

    if (!dto.eventTypeId)
      throw new BadRequestException('eventTypeId is required');

    const eventTypeId = await this.statusRepo.findOne({
      where: { id: dto.eventTypeId },
    });
    if (!eventTypeId)
      throw new NotFoundException(
        `Status with ID ${dto.eventTypeId} not found`,
      );
    dto.eventTypeId = eventTypeId.id;

    if (dto.id) {
      const existing = await this.lifeEventRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(`LifeEvent with ID ${dto.id} not found`);

      lifeEvent = existing;
      this.lifeEventRepo.merge(lifeEvent, dto);
    } else {
      lifeEvent = this.lifeEventRepo.create({ ...dto });
    }

    return await this.lifeEventRepo.save(lifeEvent);
  }

  async findAllLifeEvents(
    queryParams?: any,
  ): Promise<{ data: LifeEvent[]; total: number }> {
    const query = this.lifeEventRepo.createQueryBuilder('lifeEvent');

    query.leftJoin('lifeEvent.employee', 'employee');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');

    query.addSelect([
      'employee.id',
      'employee.user',

      'user.id',
      'user.firstName',
      'user.lastName',

      'user.email',
      'user.isActive',

      'profile.id',
      'profile.phone',
      'profile.gender',

      'profilePicture.id',
      'profilePicture.filename',
    ]);

    if (queryParams?.search) {
      query.andWhere(
        'lifeEvent.eventDetails LIKE :search OR lifeEvent.eventDate LIKE :search',
        { search: `%${queryParams.search.trim()}%` },
      );
    }

    if (queryParams?.empId) {
      query.andWhere('lifeEvent.empId = :empId', { empId: queryParams.empId });
    }

    if (queryParams?.eventTypeId) {
      query.andWhere('lifeEvent.eventTypeId = :eventTypeId', {
        eventTypeId: queryParams.eventTypeId,
      });
    }

    const data = await query.getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findLifeEventById(id: number): Promise<LifeEvent> {
    const lifeEvent = await this.lifeEventRepo.findOne({ where: { id } });
    if (!lifeEvent)
      throw new NotFoundException(`LifeEvent with ID ${id} not found`);
    return lifeEvent;
  }

  async deleteLifeEvent(id: number): Promise<{ message: string }> {
    const lifeEvent = await this.lifeEventRepo.findOne({ where: { id } });
    if (!lifeEvent)
      throw new NotFoundException(`LifeEvent with ID ${id} not found`);

    await this.lifeEventRepo.remove(lifeEvent);
    return { message: 'LifeEvent deleted successfully' };
  }

  private async findLoggedInEmployee() {
    const userId = Number(RequestContext.get('userId'));
    const appId =
      Number(RequestContext.get('activeAppId')) ||
      (await this.commonDao.getAppId());
    if (!userId || !appId) return null;

    return this.employeeRepo.findOne({
      where: { userId, appId },
      relations: ['user'],
    });
  }

  async getMyLateAndAbsentAttendance() {
    const employee = await this.findLoggedInEmployee();
    const appId = Number(employee?.appId);
    if (!employee?.userId || !appId) {
      return { isEmployee: false, employee: null, list: [] };
    }
    const attendances = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .innerJoin('attendance.employee', 'employee')
      .innerJoin('employee.user', 'user')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.checkInStatus', 'checkInStatus')
      .leftJoinAndSelect('attendance.checkOutStatus', 'checkOutStatus')
      .where('employee.id = :empId', { empId: employee.id })
      .andWhere('employee.user_id = :userId', { userId: employee.userId })
      .andWhere('user.id = :userId', { userId: employee.userId })
      .andWhere('attendance.app_id = :appId', { appId })
      .andWhere(
        '(attendanceStatus.code = :absentCode OR attendanceStatus.code = :presentCode OR checkInStatus.code = :lateCode)',
        {
          absentCode: 'emp_attendance_status_absent',
          presentCode: 'emp_attendance_status_present',
          lateCode: 'attendance_checkin_status_late',
        },
      )
      .leftJoinAndSelect('attendance.lateApprovalUser', 'lateApprovalUser')
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.id', 'DESC')
      .getMany();

    const attendanceIds = attendances.map((row) => row.id);
    const reconciliations = attendanceIds.length
      ? await this.attendanceReconciliationRepo.find({
          where: {
            empId: employee.id,
            appId,
            attendanceId: In(attendanceIds),
          },
          relations: ['inTimeStatus', 'outTimeStatus'],
          order: { id: 'DESC' },
        })
      : [];

    const reconciliationByAttendance = new Map<number, AttendanceReconciliation>();
    for (const reconciliation of reconciliations) {
      if (
        reconciliation.attendanceId &&
        !reconciliationByAttendance.has(reconciliation.attendanceId)
      ) {
        reconciliationByAttendance.set(
          reconciliation.attendanceId,
          reconciliation,
        );
      }
    }

    const locked = new Set([
      'attendance_reconciliation_status_approved',
      'attendance_reconciliation_status_completed',
    ]);

    const approverUserIds = [
      ...new Set(
        attendances
          .map((row) => row.lateApprovalUserId)
          .filter((id): id is number => Boolean(id)),
      ),
    ];
    const approverEmployees = approverUserIds.length
      ? await this.employeeRepo.find({
          where: { userId: In(approverUserIds), appId },
          relations: ['user', 'designation'],
        })
      : [];
    const approverByUserId = new Map(
      approverEmployees.map((row) => [row.userId, row]),
    );

    const hierarchies = (
      await this.employeeHierarchyRepo.find({
        where: { empId: employee.id, endDate: IsNull() },
        relations: ['supervisor', 'supervisor.user', 'supervisor.designation'],
      })
    ).filter((row) => !row.appId || Number(row.appId) === appId);
    const approvers = hierarchies
      .map((row) => {
        const supervisor = row.supervisor;
        const name = [supervisor?.user?.firstName, supervisor?.user?.lastName]
          .filter(Boolean)
          .join(' ');
        if (!name) return null;
        return {
          name,
          designation: supervisor?.designation?.name || null,
        };
      })
      .filter(Boolean);

    const list = attendances.map((attendance) => {
      const reconciliation = reconciliationByAttendance.get(attendance.id);
      const isAbsent =
        attendance.attendanceStatus?.code === 'emp_attendance_status_absent';
      const isLate =
        !isAbsent &&
        attendance.checkInStatus?.code === 'attendance_checkin_status_late';
      const kind = isAbsent ? 'Absent' : isLate ? 'Late' : 'Present';
      const inStatusCode = reconciliation?.inTimeStatus?.code || null;
      const outStatusCode = reconciliation?.outTimeStatus?.code || null;
      const decidedEmployee = attendance.lateApprovalUserId
        ? approverByUserId.get(attendance.lateApprovalUserId)
        : null;
      const decidedByName = decidedEmployee
        ? [decidedEmployee.user?.firstName, decidedEmployee.user?.lastName]
            .filter(Boolean)
            .join(' ')
        : [attendance.lateApprovalUser?.firstName, attendance.lateApprovalUser?.lastName]
            .filter(Boolean)
            .join(' ');

      // Summary status: if both exist, or either
      let overallStatus: string | null = null;
      let overallStatusCode: string | null = null;
      if (reconciliation?.inTimeStatus && reconciliation?.outTimeStatus) {
        if (inStatusCode === outStatusCode) {
          overallStatus = reconciliation.inTimeStatus.name;
          overallStatusCode = inStatusCode;
        } else {
          overallStatus = `In: ${reconciliation.inTimeStatus.name} / Out: ${reconciliation.outTimeStatus.name}`;
          overallStatusCode = inStatusCode;
        }
      } else if (reconciliation?.inTimeStatus) {
        overallStatus = reconciliation.inTimeStatus.name;
        overallStatusCode = inStatusCode;
      } else if (reconciliation?.outTimeStatus) {
        overallStatus = reconciliation.outTimeStatus.name;
        overallStatusCode = outStatusCode;
      }

      const isLockedIn = inStatusCode && locked.has(inStatusCode);
      const isLockedOut = outStatusCode && locked.has(outStatusCode);
      const canRequest =
        kind !== 'Present' && (!reconciliation || !isLockedIn || !isLockedOut);

      return {
        attendanceId: attendance.id,
        attendanceDate: dayjs(attendance.attendanceDate).format('YYYY-MM-DD'),
        kind,
        checkIn: attendance.checkIn
          ? dayjs(attendance.checkIn).format('h:mm A')
          : null,
        checkOut: attendance.checkOut
          ? dayjs(attendance.checkOut).format('h:mm A')
          : null,
        attendanceStatus: attendance.attendanceStatus?.name || null,
        checkInStatus: attendance.checkInStatus?.name || null,
        checkOutStatus: attendance.checkOutStatus?.name || null,
        reason: reconciliation?.inTimeRemarks || reconciliation?.outTimeRemarks || null,
        reconciliationId: reconciliation?.id || null,
        reconciliationStatus: overallStatus,
        reconciliationStatusCode: overallStatusCode,
        inTimeStatus: reconciliation?.inTimeStatus?.name || null,
        inTimeStatusCode: inStatusCode,
        outTimeStatus: reconciliation?.outTimeStatus?.name || null,
        outTimeStatusCode: outStatusCode,
        requestedInTime: reconciliation?.inTime || null,
        requestedOutTime: reconciliation?.outTime || null,
        inTimeRemarks: reconciliation?.inTimeRemarks || null,
        outTimeRemarks: reconciliation?.outTimeRemarks || null,
        inTimeSupervisorRemarks: reconciliation?.inTimeSupervisorRemarks || null,
        outTimeSupervisorRemarks: reconciliation?.outTimeSupervisorRemarks || null,
        supervisorRemarks:
          reconciliation?.inTimeSupervisorRemarks ||
          reconciliation?.outTimeSupervisorRemarks ||
          null,
        canRequest,
        decidedBy: decidedByName || null,
        decidedByDesignation: decidedEmployee?.designation?.name || null,
      };
    });

    return {
      isEmployee: true,
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode || null,
        name: [employee.user?.firstName, employee.user?.lastName]
          .filter(Boolean)
          .join(' '),
      },
      approvers,
      list,
    };
  }

  async getMyAttendanceHistory(queryString?: any) {
    const employee = await this.findLoggedInEmployee();
    const appId = Number(employee?.appId);
    if (!employee?.userId || !appId) {
      return {
        isEmployee: false,
        employee: null,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        summary: {
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          totalWorkedHours: 0,
          totalOvertimeHours: 0,
        },
      };
    }

    let params: any = {};
    if (queryString?.params) {
      try {
        params =
          typeof queryString.params === 'string'
            ? JSON.parse(queryString.params)
            : queryString.params;
      } catch (e) {
        params = {};
      }
    } else {
      params = queryString || {};
    }

    const page = Math.max(1, Number(params.page || queryString?.page) || 1);
    const limitParam = params.limit || queryString?.limit;
    const isAll = limitParam === 'all' || limitParam === '-1';
    const limit = isAll
      ? 1000
      : Math.max(1, Math.min(100, Number(limitParam) || 10));
    const skip = (page - 1) * limit;

    const qb = this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.checkInStatus', 'checkInStatus')
      .leftJoinAndSelect('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.office', 'office')
      .where('attendance.empId = :empId', { empId: employee.id })
      .andWhere('(attendance.appId = :appId OR attendance.appId IS NULL)', {
        appId,
      });

    const startDate =
      params.startDate ||
      params.from_date ||
      (Array.isArray(params.dateRange) ? params.dateRange[0] : null);
    const endDate =
      params.endDate ||
      params.to_date ||
      (Array.isArray(params.dateRange) ? params.dateRange[1] : null);
    const specificDate = params.attendanceDate || params.date;

    if (startDate && endDate) {
      qb.andWhere('attendance.attendanceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('attendance.attendanceDate >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('attendance.attendanceDate <= :endDate', { endDate });
    } else if (specificDate) {
      qb.andWhere('attendance.attendanceDate = :specificDate', {
        specificDate,
      });
    }

    if (params.attendanceStatusId) {
      qb.andWhere('attendance.attendanceStatusId = :statusId', {
        statusId: params.attendanceStatusId,
      });
    }

    if (params.status) {
      qb.andWhere(
        '(attendanceStatus.name = :status OR attendanceStatus.code = :status)',
        {
          status: params.status,
        },
      );
    }

    if (params.search) {
      const search = `%${String(params.search).trim()}%`;
      qb.andWhere(
        '(attendance.lateReason LIKE :search OR attendance.remarks LIKE :search OR attendanceStatus.name LIKE :search)',
        { search },
      );
    }

    // Summary calculation
    const summaryQb = qb.clone();
    const allRecords = await summaryQb
      .select([
        'attendance.id',
        'attendance.workedHour',
        'attendance.overtimeHours',
        'attendanceStatus.code',
        'attendanceStatus.name',
        'checkInStatus.code',
      ])
      .getMany();

    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let totalWorkedHours = 0;
    let totalOvertimeHours = 0;

    for (const row of allRecords) {
      const statusCode = row.attendanceStatus?.code || '';
      const checkInCode = row.checkInStatus?.code || '';
      if (statusCode.includes('absent')) {
        absentDays++;
      } else {
        presentDays++;
      }
      if (checkInCode.includes('late')) {
        lateDays++;
      }
      totalWorkedHours += Number(row.workedHour) || 0;
      totalOvertimeHours += Number(row.overtimeHours) || 0;
    }

    qb.orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [attendances, total] = await qb.getManyAndCount();

    const data = attendances.map((item) => {
      const checkInTime = item.checkIn
        ? dayjs(item.checkIn).format('h:mm A')
        : null;
      const checkOutTime = item.checkOut
        ? dayjs(item.checkOut).format('h:mm A')
        : null;
      const workedHour = Number(item.workedHour) || 0;
      const overtimeHours = Number(item.overtimeHours) || 0;

      return {
        id: item.id,
        attendanceDate: dayjs(item.attendanceDate).format('YYYY-MM-DD'),
        checkIn: checkInTime,
        checkInRaw: item.checkIn,
        checkOut: checkOutTime,
        checkOutRaw: item.checkOut,
        workedHour,
        overtimeHours,
        startBreak: item.startBreak
          ? dayjs(item.startBreak).format('h:mm A')
          : null,
        endBreak: item.endBreak
          ? dayjs(item.endBreak).format('h:mm A')
          : null,
        breakMinutes: item.breakMinutes || 0,
        lateReason: item.lateReason || null,
        remarks: item.remarks || null,
        attendanceStatus: item.attendanceStatus
          ? {
              id: item.attendanceStatus.id,
              name: item.attendanceStatus.name,
              code: item.attendanceStatus.code,
              colorName: item.attendanceStatus.colorName,
            }
          : null,
        checkInStatus: item.checkInStatus
          ? {
              id: item.checkInStatus.id,
              name: item.checkInStatus.name,
              code: item.checkInStatus.code,
              colorName: item.checkInStatus.colorName,
            }
          : null,
        checkOutStatus: item.checkOutStatus
          ? {
              id: item.checkOutStatus.id,
              name: item.checkOutStatus.name,
              code: item.checkOutStatus.code,
              colorName: item.checkOutStatus.colorName,
            }
          : null,
        shift: item.shift
          ? {
              id: item.shift.id,
              name: item.shift.name,
              startTime: item.shift.startTime,
              endTime: item.shift.endTime,
            }
          : null,
        office: item.office
          ? {
              id: item.office.id,
              name: item.office.name,
            }
          : null,
      };
    });

    return {
      isEmployee: true,
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode || null,
        name: [employee.user?.firstName, employee.user?.lastName]
          .filter(Boolean)
          .join(' '),
      },
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        totalDays: allRecords.length,
        presentDays,
        lateDays,
        absentDays,
        totalWorkedHours: Number(totalWorkedHours.toFixed(2)),
        totalOvertimeHours: Number(totalOvertimeHours.toFixed(2)),
      },
    };
  }

  async requestMyAttendanceReconciliation(dto: {
    attendanceId: number;
    reason: string;
    requestType?: 'check_in' | 'check_out' | 'both';
    requestedCheckInTime?: string | null;
    requestedCheckOutTime?: string | null;
  }) {
    const employee = await this.findLoggedInEmployee();
    const appId = Number(employee?.appId);
    if (!employee?.userId || !appId) {
      throw new ForbiddenException(
        'Only an employee can request attendance reconciliation',
      );
    }

    const reason = String(dto.reason || '').trim();
    if (reason.length < 3) {
      throw new BadRequestException(
        'Write why you were late or absent',
      );
    }
    if (reason.length > 255) {
      throw new BadRequestException('Reason cannot be longer than 255 characters');
    }

    const attendance = await this.empAttendanceRepo.findOne({
      where: {
        id: Number(dto.attendanceId),
        empId: employee.id,
        appId,
      },
      relations: [
        'attendanceStatus',
        'checkInStatus',
        'checkOutStatus',
        'employee',
        'employee.user',
      ],
    });

    if (
      !attendance ||
      attendance.employee?.userId !== employee.userId
    ) {
      throw new NotFoundException('Attendance record was not found');
    }

    const pendingStatus = await this.commonDao.findStatusByCode(
      'attendance_reconciliation_status_pending',
    );
    if (!pendingStatus?.id) {
      throw new BadRequestException('Reconciliation pending status is not set up');
    }

    const existing = await this.attendanceReconciliationRepo.findOne({
      where: {
        attendanceId: attendance.id,
        empId: employee.id,
        appId,
      },
      relations: ['inTimeStatus', 'outTimeStatus'],
      order: { id: 'DESC' },
    });

    const locked = new Set([
      'attendance_reconciliation_status_approved',
      'attendance_reconciliation_status_completed',
    ]);

    const reqType = dto.requestType || 'check_in';
    const isCheckInReq = reqType === 'check_in' || reqType === 'both';
    const isCheckOutReq = reqType === 'check_out' || reqType === 'both';

    if (isCheckInReq && existing?.inTimeStatus?.code && locked.has(existing.inTimeStatus.code)) {
      throw new BadRequestException(
        'Check-in reconciliation for this record is already approved',
      );
    }
    if (isCheckOutReq && existing?.outTimeStatus?.code && locked.has(existing.outTimeStatus.code)) {
      throw new BadRequestException(
        'Check-out reconciliation for this record is already approved',
      );
    }

    // Determine times
    const defaultInTime = attendance.checkIn
      ? dayjs(attendance.checkIn).format('HH:mm:ss')
      : null;
    const inTime = dto.requestedCheckInTime || defaultInTime;

    const defaultOutTime = attendance.checkOut
      ? dayjs(attendance.checkOut).format('HH:mm:ss')
      : null;
    const outTime = dto.requestedCheckOutTime || defaultOutTime;

    if (existing) {
      existing.attendanceDate = attendance.attendanceDate;
      if (isCheckInReq) {
        existing.inTimeRemarks = reason;
        if (inTime) existing.inTime = inTime;
        existing.inTimeStatusId = pendingStatus.id;
      }
      if (isCheckOutReq) {
        existing.outTimeRemarks = reason;
        if (outTime) existing.outTime = outTime;
        existing.outTimeStatusId = pendingStatus.id;
      }
      return this.attendanceReconciliationRepo.save(existing);
    }

    const newReconData: Partial<AttendanceReconciliation> = {
      appId,
      empId: employee.id,
      attendanceId: attendance.id,
      attendanceDate: attendance.attendanceDate,
    };

    if (isCheckInReq) {
      newReconData.inTime = inTime;
      newReconData.inTimeRemarks = reason;
      newReconData.inTimeStatusId = pendingStatus.id;
    }
    if (isCheckOutReq) {
      newReconData.outTime = outTime;
      newReconData.outTimeRemarks = reason;
      newReconData.outTimeStatusId = pendingStatus.id;
    }

    return this.attendanceReconciliationRepo.save(newReconData);
  }

  // Create or Update attendance reconciliation
  async createOrUpdateAttendanceReconciliation(
    dto: CreateAttendanceReconciliationDto,
  ): Promise<AttendanceReconciliation> {
    let attendanceReconciliation: AttendanceReconciliation;

    const employee = await this.employeeRepo.findOne({
      where: { id: dto.empId },
    });

    const appId = await this.commonDao.getAppId();

    dto.appId = appId;

    if (!employee)
      throw new NotFoundException(`Employee with ID ${dto.empId} not found`);

    dto.empId = employee.id;

    dto.inTimeStatusId = 160; //pending
    // dto.outTimeStatusId = 160; //pending

    if (dto.id) {
      const existing = await this.attendanceReconciliationRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(
          `Attendance Reconciliation with ID ${dto.id} not found`,
        );

      attendanceReconciliation = existing;
      this.attendanceReconciliationRepo.merge(attendanceReconciliation, dto);
    } else {
      attendanceReconciliation = this.attendanceReconciliationRepo.create({
        ...dto,
      });
    }

    return await this.attendanceReconciliationRepo.save(
      attendanceReconciliation,
    );
  }

  //Find all attendance reconciliations
  async findAllAttendanceReconciliations(
    queryParams?: any,
  ): Promise<{ data: AttendanceReconciliation[]; total: number }> {
    const query = this.attendanceReconciliationRepo.createQueryBuilder(
      'attendanceReconciliation',
    );

    query.leftJoin('attendanceReconciliation.employee', 'employee');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'profile');
    query.leftJoin('profile.profilePicture', 'profilePicture');
    query.leftJoin('attendanceReconciliation.inTimeStatus', 'inTimeStatus');
    query.leftJoin('attendanceReconciliation.outTimeStatus', 'outTimeStatus');

    query.addSelect([
      'employee.id',
      'employee.user',

      'user.id',
      'user.firstName',
      'user.lastName',

      'profile.id',
      'profile.phone',
      'profile.gender',

      'profilePicture.id',
      'profilePicture.filename',
      'inTimeStatus.id',
      'inTimeStatus.name',
      'inTimeStatus.code',
      'inTimeStatus.colorName',
      'outTimeStatus.id',
      'outTimeStatus.name',
      'outTimeStatus.code',
      'outTimeStatus.colorName',
    ]);

    if (queryParams?.empId) {
      query.andWhere('attendanceReconciliation.empId = :empId', {
        empId: queryParams.empId,
      });
    }

    const data = await query.getMany();
    const total = await query.getCount();

    return { data, total };
  }

  //Find all attendance reconciliations by id
  async findAttendanceReconciliationById(
    id: number,
  ): Promise<AttendanceReconciliation> {
    const attendanceReconciliation =
      await this.attendanceReconciliationRepo.findOne({ where: { id } });
    if (!attendanceReconciliation)
      throw new NotFoundException(
        `Attendance Reconciliation with ID ${id} not found`,
      );
    return attendanceReconciliation;
  }

  //Delete attendance reconciliation
  async deleteAttendanceReconciliation(
    id: number,
  ): Promise<{ message: string }> {
    const attendanceReconciliation =
      await this.attendanceReconciliationRepo.findOne({ where: { id } });
    if (!attendanceReconciliation)
      throw new NotFoundException(
        `Attendance Reconciliation with ID ${id} not found`,
      );

    await this.attendanceReconciliationRepo.remove(attendanceReconciliation);
    return { message: 'Attendance Reconciliation deleted successfully' };
  }

  // Create or Update Visit Application
  async createOrUpdateVisitApplication(
    dto: CreateVisitApplicationDto,
  ): Promise<VisitApplication> {
    const userId = RequestContext.get('userId');
    dto.createdBy = userId;

    const visitor = await this.employeeRepo.findOne({
      where: { id: dto.visitorEmpId },
    });

    if (!visitor)
      throw new NotFoundException(
        `Visitor Employee with ID ${dto.visitorEmpId} not found`,
      );

    dto.visitorEmpId = visitor.id;

    const activeAppId = RequestContext.get('activeAppId');
    const appId =
      activeAppId || (await this.commonDao.getAppId()) || visitor.appId;
    dto.appId = appId;

    let hostEmpId = dto.hostEmpId;
    if (!hostEmpId) {
      const host = await this.employeeRepo.findOne({
        where: { userId },
      });
      if (host) {
        hostEmpId = host.id;
      } else {
        hostEmpId = visitor.id;
      }
    }

    dto.hostEmpId = hostEmpId;

    dto.visitStatusId = 156; //pending
    dto.applicationStatusId = 156; //pending

    let visitApplication: VisitApplication;
    if (dto.id) {
      const existing = await this.visitApplicationRepo.findOne({
        where: { id: dto.id },
      });
      if (!existing)
        throw new NotFoundException(
          `Visit Application with ID ${dto.id} not found`,
        );

      visitApplication = existing;
      this.visitApplicationRepo.merge(visitApplication, dto);
    } else {
      visitApplication = this.visitApplicationRepo.create({ ...dto });
    }

    return await this.visitApplicationRepo.save(visitApplication);
  }

  // Find all Visit Applications
  async findAllVisitorRequests(
    queryParams?: any,
    queryString?: any,
  ): Promise<{ data: VisitApplication[]; total: number }> {
    const userId = Number(RequestContext.get('userId'));
    const appUser = userId
      ? await this.appUserRepo.findOne({ where: { userId } })
      : null;

    const appId =
      Number(RequestContext.get('activeAppId')) ||
      (await this.commonDao.getAppId()) ||
      appUser?.appId;

    const hostEmp = userId
      ? await this.employeeRepo.findOne({ where: { userId } })
      : null;

    const query =
      this.visitApplicationRepo.createQueryBuilder('visitApplication');

    query.leftJoinAndSelect('visitApplication.visitor', 'visitor');
    query.leftJoinAndSelect('visitor.office', 'office');
    query.leftJoinAndSelect('visitor.designation', 'designation');
    query.leftJoinAndSelect('visitor.user', 'user');
    query.leftJoinAndSelect('user.profile', 'profile');
    query.leftJoinAndSelect('profile.profilePicture', 'profilePicture');
    query.leftJoinAndSelect('visitApplication.host', 'host');
    query.leftJoinAndSelect('host.user', 'hostUser');
    query.leftJoinAndSelect('visitApplication.visitStatus', 'visitStatus');
    query.leftJoinAndSelect('visitApplication.applicationStatus', 'applicationStatus');

    if (appId) {
      query.andWhere('visitApplication.appId = :appId', { appId });
    }

    if (hostEmp) {
      query.andWhere('visitApplication.hostEmpId = :hostEmpId', {
        hostEmpId: hostEmp?.id,
      });
    }

    if (queryParams?.visitStatusId) {
      query.andWhere('visitApplication.visitStatusId = :visitStatusId', {
        visitStatusId: queryParams.visitStatusId,
      });
    }

    if (queryParams?.applicationStatusId) {
      query.andWhere(
        'visitApplication.applicationStatusId = :applicationStatusId',
        {
          applicationStatusId: queryParams.applicationStatusId,
        },
      );
    }

    if (queryParams?.officeId) {
      query.andWhere('visitor.officeId = :officeId', {
        officeId: queryParams.officeId,
      });
    }

    if (queryParams?.designationId) {
      query.andWhere('visitor.designationId = :designationId', {
        designationId: queryParams.designationId,
      });
    }

    if (queryParams?.visitorEmpId) {
      query.andWhere('visitApplication.visitorEmpId = :visitorEmpId', {
        visitorEmpId: queryParams.visitorEmpId,
      });
    }

    if (queryParams?.hostEmpId) {
      query.andWhere('visitApplication.hostEmpId = :hostEmpId', {
        hostEmpId: queryParams.hostEmpId,
      });
    }

    if (queryParams?.visitDate) {
      query.andWhere('DATE(visitApplication.visitDate) = :visitDate', {
        visitDate: queryParams.visitDate,
      });
    }

    if (queryParams?.applicationDate) {
      query.andWhere('DATE(visitApplication.createdAt) = :applicationDate', {
        applicationDate: queryParams.applicationDate,
      });
    }

    if (queryParams?.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR profile.phone LIKE :search OR visitor.employeeCode LIKE :search OR visitApplication.purpose LIKE :search)',
        {
          search: `%${queryParams.search.trim()}%`,
        },
      );
    }

    query.orderBy('visitApplication.id', 'DESC');

    const total = await query.getCount();

    if (queryString) {
      const features = new APIFeatures(query, queryString)
        .sort()
        .paginate();
      const data = await features.getQuery().getMany();
      return { data, total };
    }

    const data = await query.getMany();
    return { data, total };
  }

  // Find all Visit Applications
  async findAllApplyForVisit(
    queryParams?: any,
    queryString?: any,
  ): Promise<{ data: VisitApplication[]; total: number }> {
    const userId = Number(RequestContext.get('userId'));
    const appUser = userId
      ? await this.appUserRepo.findOne({ where: { userId } })
      : null;

    const appId =
      Number(RequestContext.get('activeAppId')) ||
      (await this.commonDao.getAppId()) ||
      appUser?.appId;

    const query =
      this.visitApplicationRepo.createQueryBuilder('visitApplication');

    query.leftJoinAndSelect('visitApplication.visitor', 'visitor');
    query.leftJoinAndSelect('visitor.office', 'office');
    query.leftJoinAndSelect('visitor.designation', 'designation');
    query.leftJoinAndSelect('visitor.user', 'user');
    query.leftJoinAndSelect('user.profile', 'profile');
    query.leftJoinAndSelect('profile.profilePicture', 'profilePicture');
    query.leftJoinAndSelect('visitApplication.host', 'host');
    query.leftJoinAndSelect('host.user', 'hostUser');
    query.leftJoinAndSelect('visitApplication.visitStatus', 'visitStatus');
    query.leftJoinAndSelect('visitApplication.applicationStatus', 'applicationStatus');

    if (appId) {
      query.andWhere('visitApplication.appId = :appId', { appId });
    }

    if (queryParams?.visitStatusId) {
      query.andWhere('visitApplication.visitStatusId = :visitStatusId', {
        visitStatusId: queryParams.visitStatusId,
      });
    }

    if (queryParams?.applicationStatusId) {
      query.andWhere(
        'visitApplication.applicationStatusId = :applicationStatusId',
        {
          applicationStatusId: queryParams.applicationStatusId,
        },
      );
    }

    if (queryParams?.officeId) {
      query.andWhere('visitor.officeId = :officeId', {
        officeId: queryParams.officeId,
      });
    }

    if (queryParams?.designationId) {
      query.andWhere('visitor.designationId = :designationId', {
        designationId: queryParams.designationId,
      });
    }

    if (queryParams?.visitorEmpId) {
      query.andWhere('visitApplication.visitorEmpId = :visitorEmpId', {
        visitorEmpId: queryParams.visitorEmpId,
      });
    }

    if (queryParams?.hostEmpId) {
      query.andWhere('visitApplication.hostEmpId = :hostEmpId', {
        hostEmpId: queryParams.hostEmpId,
      });
    }

    if (queryParams?.visitDate) {
      query.andWhere('DATE(visitApplication.visitDate) = :visitDate', {
        visitDate: queryParams.visitDate,
      });
    }

    if (queryParams?.applicationDate) {
      query.andWhere('DATE(visitApplication.createdAt) = :applicationDate', {
        applicationDate: queryParams.applicationDate,
      });
    }

    if (queryParams?.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR profile.phone LIKE :search OR visitor.employeeCode LIKE :search OR visitApplication.purpose LIKE :search)',
        {
          search: `%${queryParams.search.trim()}%`,
        },
      );
    }

    query.orderBy('visitApplication.id', 'DESC');

    const total = await query.getCount();

    if (queryString) {
      const features = new APIFeatures(query, queryString)
        .sort()
        .paginate();
      const data = await features.getQuery().getMany();
      return { data, total };
    }

    const data = await query.getMany();
    return { data, total };
  }

  // Find Visit Application by ID
  async findVisitApplicationById(id: number): Promise<VisitApplication> {
    const visitApplication = await this.visitApplicationRepo.findOne({
      where: { id },
    });
    if (!visitApplication)
      throw new NotFoundException(`Visit Application with ID ${id} not found`);
    return visitApplication;
  }

  // Delete Visit Application
  async deleteVisitApplication(id: number): Promise<{ message: string }> {
    const visitApplication = await this.visitApplicationRepo.findOne({
      where: { id },
    });
    if (!visitApplication)
      throw new NotFoundException(`Visit Application with ID ${id} not found`);

    await this.visitApplicationRepo.remove(visitApplication);
    return { message: 'Visit Application deleted successfully' };
  }

  async updateVisitStatus(
    dto: UpdateVisitStatusDto,
  ): Promise<VisitApplication> {
    const userId = RequestContext.get('userId');

    const visitApplication = await this.visitApplicationRepo.findOne({
      where: { id: dto.id },
    });

    if (!visitApplication) {
      throw new NotFoundException(
        `Visit Application with ID ${dto.id} not found`,
      );
    }

    const visitStatus = await this.commonDao.findStatusById(dto.visitStatusId);

    if (!visitStatus) {
      throw new NotFoundException(
        `Visit Status with ID ${dto.visitStatusId} not found`,
      );
    }

    visitApplication.visitStatusId = dto.visitStatusId;
    visitApplication.remarks = dto.remarks ?? null;

    if (
      (visitStatus.code === 'completed' || visitStatus.id === 159) &&
      !visitApplication.checkOutTime
    ) {
      const now = new Date();
      visitApplication.checkOutTime = now.toTimeString().split(' ')[0]; // HH:mm:ss
    }

    await this.visitApplicationRepo.update(
      visitApplication.id,
      visitApplication,
    );

    const updated = await this.visitApplicationRepo.findOne({
      where: { id: visitApplication.id },
    });

    if (!updated) {
      throw new NotFoundException(
        `Visit Application with ID ${visitApplication.id} not found after update`,
      );
    }

    return updated;
  }

  async updateApplicationStatus(
    dto: UpdateApplicationStatusDto,
  ): Promise<VisitApplication> {
    const userId = RequestContext.get('userId');

    const visitApplication = await this.visitApplicationRepo.findOne({
      where: { id: dto.id },
    });

    if (!visitApplication) {
      throw new NotFoundException(
        `Visit Application with ID ${dto.id} not found`,
      );
    }

    const applicationStatus = await this.commonDao.findStatusById(
      dto.applicationStatusId,
    );

    if (!applicationStatus) {
      throw new NotFoundException(
        `Application Status with ID ${dto.applicationStatusId} not found`,
      );
    }

    visitApplication.applicationStatusId = dto.applicationStatusId;
    visitApplication.remarks = dto.remarks ?? null;

    await this.visitApplicationRepo.update(
      visitApplication.id,
      visitApplication,
    );

    const updated = await this.visitApplicationRepo.findOne({
      where: { id: visitApplication.id },
    });

    if (!updated) {
      throw new NotFoundException(
        `Visit Application with ID ${visitApplication.id} not found after update`,
      );
    }

    return updated;
  }

  async checkInOutVisitor(dto: CheckInOutVisitorDto): Promise<any> {
    const visitApplication = await this.visitApplicationRepo.findOne({
      where: { id: dto.id },
    });

    if (!visitApplication) {
      throw new NotFoundException(
        `Visit Application with ID ${dto.id} not found`,
      );
    }

    if (visitApplication.checkOutTime) {
      throw new BadRequestException(
        'Checkout already completed. No further update allowed.',
      );
    }

    if (!dto.checkInTime && !dto.checkOutTime) {
      throw new BadRequestException('Provide checkInTime or checkOutTime');
    }

    if (dto.checkInTime) {
      // visitApplication.checkInTime = dto.checkInTime;
      visitApplication.checkInTime = Helpers.setTimeStringWithTimezone(
        dto.checkInTime,
        dto.timezone,
      );
    }

    if (dto.checkOutTime) {
      if (!visitApplication.checkInTime) {
        throw new BadRequestException('Cannot checkout before checkin');
      }
      // visitApplication.checkOutTime = dto.checkOutTime;
      visitApplication.checkOutTime = Helpers.setTimeStringWithTimezone(
        dto.checkOutTime,
        dto.timezone,
      );
    }

    if (visitApplication.checkOutTime) {
      visitApplication.visitStatusId = 159; // completed
    } else {
      visitApplication.visitStatusId = 156; // pending
    }

    await this.visitApplicationRepo.save(visitApplication);

    return this.visitApplicationRepo.findOne({
      where: { id: visitApplication.id },
    });
  }

  async findAllVisitApplicationStats(
    queryString: any,
  ): Promise<{ data: any; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) {
      throw new NotFoundException('App User not found');
    }

    const appId =
      RequestContext.get('activeAppId') ||
      (await this.commonDao.getAppId()) ||
      appUser?.appId;

    const query = this.visitApplicationRepo.createQueryBuilder('visit');

    query.leftJoinAndSelect('visit.visitor', 'visitor');
    query.leftJoinAndSelect('visit.host', 'host');

    query.leftJoin('visitor.user', 'visitorUser');
    query.leftJoin('host.user', 'hostUser');

    query.leftJoin('visitorUser.profile', 'visitorProfile');
    query.leftJoin('visitorProfile.profilePicture', 'visitorProfilePicture');
    query.leftJoin('hostUser.profile', 'hostProfile');

    query.leftJoin('visit.visitStatus', 'visitStatus');
    query.leftJoin('visit.applicationStatus', 'applicationStatus');

    query.addSelect([
      'visitorUser.id',
      'visitorUser.firstName',
      'visitorUser.lastName',
      'visitorUser.email',

      'visitorProfilePicture.id',
      'visitorProfilePicture.filename',
      //'visitorProfilePicture.fileUrl',
      'hostUser.id',
      'hostUser.firstName',
      'hostUser.lastName',
      'hostUser.email',
      'visitorProfile.id',
      'visitorProfile.phone',
      'hostProfile.id',
      'hostProfile.phone',
      'visitStatus.id',
      'visitStatus.name',
      'visitStatus.code',
      'visitStatus.colorName',
      'applicationStatus.id',
      'applicationStatus.name',
      'applicationStatus.code',
      'applicationStatus.colorName',
    ]);

    query.andWhere('visit.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        `visitorUser.firstName LIKE :search OR
       visitorUser.lastName LIKE :search OR
       hostUser.firstName LIKE :search OR
       hostUser.lastName LIKE :search OR
       visit.purpose LIKE :search`,
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.visitDate) {
      query.andWhere('visit.visitDate = :visitDate', {
        visitDate: params.visitDate,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    const pendingStatusId = await this.commonDao
      .findStatusByCode('visit_application_status_pending')
      .then((s) => s?.id);

    const approvedStatusId = await this.commonDao
      .findStatusByCode('visit_application_status_approved')
      .then((s) => s?.id);

    const today = dayjs().format('YYYY-MM-DD');

    const todayQuery = query
      .clone()
      .andWhere('visit.visitDate = :today', { today });
    const todayUsers = await todayQuery.getMany();
    const todayCount = await todayQuery.getCount();

    const pendingQuery = query
      .clone()
      .andWhere('visit.applicationStatusId = :statusId', {
        statusId: pendingStatusId,
      });
    const pendingUsers = await pendingQuery.getMany();
    const pendingCount = await pendingQuery.getCount();

    const approvedQuery = query
      .clone()
      .andWhere('visit.applicationStatusId = :statusId', {
        statusId: approvedStatusId,
      });
    const approvedUsers = await approvedQuery.getMany();
    const approvedCount = await approvedQuery.getCount();

    const formatUser = (r: any) => {
      const u = r.visitor?.user;
      const name = u
        ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.fullName || ''
        : '';
      return {
        name,
        fileUrl: r.visitor?.user?.profile?.profilePicture?.fileUrl || '',
      };
    };

    const totalUsers = await query.getMany();
    const totalUser = totalUsers.map(formatUser);

    const headers = {
      today: {
        users: todayUsers.map(formatUser),
        count: todayCount,
      },
      pending: {
        users: pendingUsers.map(formatUser),
        count: pendingCount,
      },
      approved: {
        users: approvedUsers.map(formatUser),
        count: approvedCount,
      },
      total: {
        users: totalUser.map((r) => ({
          name: r.name,
          fileUrl: r.fileUrl || '',
        })),
        count: total,
      },
    };

    return { data: { list: data, headers }, total };
  }

  async getEmployeeDashboardStatus(employeeId: number): Promise<any> {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const appId = employee.appId || undefined;

    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: appId ? { appId } : {},
    });

    const leaveOverview: Record<
      string,
      { total: number; used: number; remaining: number }
    > = {};

    let totalLeave = 0;
    let totalUsed = 0;

    await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const leaveDaysRaw = await this.empLeaveRequestRepo
          .createQueryBuilder('leave')
          .select(
            'COALESCE(SUM(DATEDIFF(leave.end_date, leave.start_date) + 1), 0)',
            'totalDays',
          )
          .where('leave.empId = :empId', { empId: employeeId })
          .andWhere(
            '(leave.appId = :appId OR leave.appId IS NULL OR :appId IS NULL)',
            { appId: appId || null },
          )
          .andWhere('leave.approvalStatusId = :status', { status: 52 })
          .andWhere('leave.leaveTypeId = :typeId', { typeId: leaveType.id })
          .getRawOne();

        const usedCount = Number(leaveDaysRaw?.totalDays) || 0;

        leaveOverview[leaveType.name] = {
          total: leaveType.maxDaysPerYear,
          used: usedCount,
          remaining: Math.max(0, leaveType.maxDaysPerYear - usedCount),
        };

        totalLeave += leaveType.maxDaysPerYear;
        totalUsed += usedCount;
      }),
    );

    //Leave remaining
    const totalRemaining =
      totalLeave - totalUsed >= 0 ? totalLeave - totalUsed : 0;

    //total worked hours
    const totalWorkHours = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .select('COALESCE(SUM(attendance.worked_hour), 0)', 'total')
      .where('attendance.emp_id = :empId', { empId: employeeId })
      .andWhere(
        '(attendance.app_id = :appId OR attendance.app_id IS NULL OR :appId IS NULL)',
        { appId: employee.appId || null },
      )
      .andWhere(
        '(attendance.attendance_status_id IN (42, 45) OR attendance.check_in IS NOT NULL)',
      )
      .getRawOne();

    // Total Asset distributed
    const totalAssets = await this.employeeAssetRepo.count({
      where: appId ? { employeeId, appId } : { employeeId },
    });

    //Total client visit
    const totalClientVisit = await this.visitApplicationRepo.count({
      where: {
        visitorEmpId: employeeId,
        ...(appId ? { appId } : {}),
        applicationStatusId: 157, // approved
      },
    });

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    //Present
    const presentCount = await this.empAttendanceRepo
      .createQueryBuilder('att')
      .where('att.empId = :empId', { empId: employeeId })
      .andWhere('(att.appId = :appId OR att.appId IS NULL OR :appId IS NULL)', {
        appId: employee.appId || null,
      })
      .andWhere(
        '(att.attendanceStatusId IN (42, 45) OR att.checkIn IS NOT NULL)',
      )
      .andWhere('MONTH(att.attendanceDate) = :month', {
        month: now.getMonth() + 1,
      })
      .andWhere('YEAR(att.attendanceDate) = :year', {
        year: now.getFullYear(),
      })
      .getCount();

    //Absent
    const absentCount = await this.empAttendanceRepo
      .createQueryBuilder('att')
      .where('att.empId = :empId', { empId: employeeId })
      .andWhere('(att.appId = :appId OR att.appId IS NULL OR :appId IS NULL)', {
        appId: employee.appId || null,
      })
      .andWhere('att.attendanceStatusId = 43 AND att.checkIn IS NULL')
      .andWhere('MONTH(att.attendanceDate) = :month', {
        month: now.getMonth() + 1,
      })
      .andWhere('YEAR(att.attendanceDate) = :year', {
        year: now.getFullYear(),
      })
      .getCount();

    const delayCount = await this.empAttendanceRepo
      .createQueryBuilder('att')
      .where('att.empId = :empId', { empId: employeeId })
      .andWhere('(att.appId = :appId OR att.appId IS NULL OR :appId IS NULL)', {
        appId: employee.appId || null,
      })
      .andWhere('(att.attendanceStatusId = 45 OR att.checkInStatusId = 149)')
      .andWhere('MONTH(att.attendanceDate) = :month', {
        month: now.getMonth() + 1,
      })
      .andWhere('YEAR(att.attendanceDate) = :year', {
        year: now.getFullYear(),
      })
      .getCount();

    //holiday
    const holidayCount = await this.appHolidayDateRepo
      .createQueryBuilder('appHolDate')
      .innerJoin('appHolDate.appHoliday', 'appHoliday')
      .where(
        '(appHoliday.appId = :appId OR appHoliday.appId IS NULL OR :appId IS NULL)',
        {
          appId: employee.appId || null,
        },
      )
      .andWhere('MONTH(appHolDate.holidayDate) = :month', {
        month: now.getMonth() + 1,
      })
      .andWhere('YEAR(appHolDate.holidayDate) = :year', {
        year: now.getFullYear(),
      })
      .getCount();

    const attendanceOverview = {
      title: `Attendance Overview - ${month} ${year}`,
      present: presentCount,
      absent: absentCount,
      leave: totalUsed,
      delay: delayCount,
      holiday: holidayCount,
    };

    const employeeOverView = {
      totalWorkHours: Number(totalWorkHours?.total) || 0,
      totalAssets: totalAssets,
      totalLeaveRemaining: totalRemaining,
      totalClientVisit: totalClientVisit,
    };

    return {
      attendanceOverview,
      employeeOverView,
      leaveOverview,
      total: {
        totalLeave,
        totalUsed,
        totalRemaining,
      },
    };
  }

  async getMyEmployeeDashboardStatus(): Promise<any> {
    const userId = RequestContext.get('userId');
    if (!userId) throw new NotFoundException('User not found');
    const appId = RequestContext.get('activeAppId');

    let employee = await this.employeeRepo.findOne({
      where: appId ? { userId, appId } : { userId },
    });

    if (!employee) {
      employee = await this.employeeRepo.findOne({
        where: { userId },
      });
    }

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return await this.getEmployeeDashboardStatus(employee.id);
  }

  async getAllEmployeeDashboardStatus(): Promise<any[]> {
    const t1 = Date.now();
    const start = Date.now();
    const employees = await this.employeeRepo
      .createQueryBuilder('emp')
      .select(['emp.id', 'emp.appId'])
      .getMany();

    if (!employees || employees.length === 0) {
      return [];
    }

    const t2 = Date.now();
    console.log(`Time taken to fetch employees: ${t2 - t1} ms`);

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    const results = await Promise.all(
      employees.map(async (employee) => {
        const employeeId = employee.id;

        const appId = employee.appId || undefined;

        // const leaveTypes = await this.empLeaveTypeRepo.find({
        //   where: { appId: appId },
        // });

        const leaveTypes = await this.empLeaveTypeRepo
          .createQueryBuilder('leaveType')
          .select([
            'leaveType.id',
            'leaveType.name',
            'leaveType.maxDaysPerYear',
          ])
          .where('leaveType.appId = :appId', { appId })
          .getMany();

        const leaveOverview: Record<
          string,
          { total: number; used: number; remaining: number }
        > = {};

        let totalLeave = 0;
        let totalUsed = 0;

        await Promise.all(
          leaveTypes.map(async (leaveType) => {
            const usedCount = await this.empLeaveRequestRepo.count({
              where: {
                empId: employeeId,
                appId,
                approvalStatusId: 52, // approved
                leaveTypeId: leaveType.id,
              },
            });

            leaveOverview[leaveType.name] = {
              total: leaveType.maxDaysPerYear,
              used: usedCount,
              remaining:
                leaveType.maxDaysPerYear - usedCount >= 0
                  ? leaveType.maxDaysPerYear - usedCount
                  : 0,
            };

            totalLeave += leaveType.maxDaysPerYear;
            totalUsed += usedCount;
          }),
        );

        const totalRemaining =
          totalLeave - totalUsed >= 0 ? totalLeave - totalUsed : 0;

        const totalWorkHours = await this.empAttendanceRepo
          .createQueryBuilder('attendance')
          .select('SUM(attendance.worked_hour)', 'total')
          .where('attendance.emp_id = :empId', { empId: employeeId })
          .andWhere('attendance.app_id = :appId', { appId: employee.appId })
          .andWhere('attendance.attendance_status_id = :status', { status: 42 }) // present
          .getRawOne();

        const totalAssets = await this.employeeAssetRepo.count({
          where: { employeeId, appId },
        });

        const totalClientVisit = await this.visitApplicationRepo.count({
          where: {
            visitorEmpId: employeeId,
            appId,
            applicationStatusId: 157, // approved
          },
        });

        const presentCount = await this.empAttendanceRepo.count({
          where: {
            empId: employeeId,
            appId,
            attendanceStatusId: 42, // Present
          },
        });

        const absentCount = await this.empAttendanceRepo.count({
          where: {
            empId: employeeId,
            appId,
            attendanceStatusId: 43, // Absent
          },
        });

        const delayCount = await this.empAttendanceRepo.count({
          where: {
            empId: employeeId,
            appId,
            attendanceStatusId: 45, // Delay
          },
        });

        const holidayCount = await this.appHolidayDateRepo
          .createQueryBuilder('appHolDate')
          .innerJoin('appHolDate.appHoliday', 'appHoliday')
          .andWhere('appHoliday.appId = :appId', {
            appId: employee.appId,
          })
          .andWhere('MONTH(appHolDate.holidayDate) = :month', {
            month: now.getMonth() + 1,
          })
          .andWhere('YEAR(appHolDate.holidayDate) = :year', {
            year: now.getFullYear(),
          })
          .getCount();

        const attendanceOverview = {
          title: `Attendance Overview - ${month} ${year}`,
          present: presentCount,
          absent: absentCount,
          leave: totalUsed,
          delay: delayCount,
          holiday: holidayCount,
        };

        const employeeOverView = {
          totalWorkHours: totalWorkHours?.total ?? 0,
          totalAssets: totalAssets,
          totalLeaveRemaining: totalRemaining,
          totalClientVisit: totalClientVisit,
        };

        return {
          employeeId: employeeId,
          attendanceOverview,
          employeeOverView,
          leaveOverview,
          total: {
            totalLeave,
            totalUsed,
            totalRemaining,
          },
        };
      }),
    );

    console.log(`Total query time : ${Date.now() - start} ms`);
    return results;
  }

  async getEmployeeTodayDashboard(employeeId: number): Promise<any> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const query = this.employeeRepo.createQueryBuilder('employee');

    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');

    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');

    query.addSelect([
      'employee.id',
      'employee.joiningDate',
      'designation.id',
      'designation.name',
      'department.id',
      'department.name',
      'office.name',
      'office.startTime',
      'office.endTime',
      'office.delayStartTime',
      'office.earlyEndTime',

      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',
      'officeShift.delayStartTime',
      'officeShift.earlyEndTime',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',
      'user.profileCompleted',
      'userProfile.id',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'userProfile.gender',
      'profilePicture.id',
      'profilePicture.filename',
    ]);

    query.where('employee.id = :employeeId', { employeeId });
    query.andWhere('employee.appId = :appId', { appId: appId });

    const employeeProfile = await query.getOne();

    if (!employeeProfile) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    //  Today attendance
    const attendance = await this.empAttendanceRepo.findOne({
      where: {
        appId,
        empId: employeeId,
        ...(employeeProfile.officeId !== undefined
          ? { officeId: employeeProfile.officeId }
          : {}),
        attendanceDate: new Date().toISOString().split('T')[0],
      } as FindOptionsWhere<EmpAttendance>,
      order: { checkIn: 'DESC' },
    });

    const todayAttendance = {
      id: attendance?.id || null,
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      workedHour: attendance?.workedHour || 0,
      startBreak: attendance?.startBreak || null,
      endBreak: attendance?.endBreak || null,
      breakMinutes: attendance?.breakMinutes || 0,
    };

    //  Breaks today
    const breaksTodayRecords = await this.empAttendanceRepo.find({
      where: {
        empId: employeeId,
        startBreak: Between(startOfDay, endOfDay),
      },
      order: { startBreak: 'ASC' },
    });

    const breaksToday = breaksTodayRecords.map((b) => ({
      startTime: b.startBreak,
      endTime: b.endBreak || null,
    }));

    return {
      employeeProfile,
      todayAttendance,
      breaksToday,
    };
  }

  async getMyTodayDashboardData(): Promise<any> {
    const start = Date.now();

    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo
      .createQueryBuilder('employee')
      .select(['employee.id', 'employee.officeId'])
      .where('employee.appId = :appId', { appId })
      .andWhere('employee.userId = :userId', { userId })
      .getOne();

    console.log(`employee query: ${Date.now() - start}ms`);

    if (!employee) {
      throw new NotFoundException(`Employee not found for this user`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendanceStart = Date.now();

    const qb = this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.checkIn',
        'attendance.checkOut',
        'attendance.workedHour',
        'attendance.startBreak',
        'attendance.endBreak',
        'attendance.breakMinutes',
      ])
      .where('attendance.appId = :appId', { appId })
      .andWhere('attendance.empId = :empId', { empId: employee.id })
      .andWhere('attendance.attendanceDate >= :today', { today })
      .andWhere('attendance.attendanceDate < :tomorrow', { tomorrow });

    if (employee.officeId) {
      qb.andWhere('attendance.officeId = :officeId', {
        officeId: employee.officeId,
      });
    }

    const attendance = await qb.orderBy('attendance.checkIn', 'DESC').getOne();

    console.log(`attendance query: ${Date.now() - attendanceStart}ms`);
    console.log(`Total query time: ${Date.now() - start}ms`);

    return {
      todayAttendance: {
        id: attendance?.id || null,
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
        workedHour: attendance?.workedHour || 0,
        startBreak: attendance?.startBreak || null,
        endBreak: attendance?.endBreak || null,
        breakMinutes: attendance?.breakMinutes || 0,
      },
    };
  }

  async getEmployeeEventCalendar(employeeId: number): Promise<any> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });

    if (!appUser) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,

        appId: appUser.appId || 0,
        employmentStatusId: 92, // Accepted
        employeeStatusId: In([131, 132]), // Joined and Rejoined
        joiningDate: Not(IsNull()),
        resignationDate: IsNull(),
      },
      relations: ['user'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const employeeName = [employee.user?.firstName, employee.user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const today = new Date();

    const holidays = await this.appHolidayRepo
      .createQueryBuilder('appHoliday')
      .leftJoinAndSelect('appHoliday.appHolidayDates', 'holidayDates')
      .leftJoinAndSelect('appHoliday.holidayType', 'holidayType')
      .where('appHoliday.app_id = :appId', { appId: employee.appId })
      .getMany();

    const holidayEvents = holidays.flatMap((h) =>
      (h.holidayDates || []).map((date) => ({
        id: h.id,
        name: h.holidayName || h.holiday?.holidayName,
        date,
        typeId: h.holidayTypeId,
        typeName: h.holidayType?.name,
        code: h.holidayType?.code,
      })),
    );

    //  Employee leaves
    const leaves = await this.empLeaveRequestRepo.find({
      where: {
        empId: employeeId,
        approvalStatusId: 52,
        endDate: MoreThanOrEqual(today),
      },
      relations: ['empLeaveType'],
      order: { startDate: 'ASC' },
    });

    const leaveEvents = leaves.map((l) => ({
      type: 'Leave',
      title: [employeeName, l.empLeaveType?.name].filter(Boolean).join(' - '),
      startDate: l.startDate,
      endDate: l.endDate,
      description: l.reason || null,
    }));

    // 3️ Employee Birthday (only users who are employees of this company)

    const birthdayUsers = await this.userProfileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user')
      .innerJoin(Employee, 'emp', 'emp.user_id = user.id')
      .where('profile.dateOfBirth IS NOT NULL')
      .andWhere('emp.app_id = :appId', { appId: employee.appId })
      .getMany();

    const birthdayEvents = birthdayUsers
      .map((profile) => {
        const dobString = profile.dateOfBirth;
        if (!dobString) return null;
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return null;
        const name = [profile.user?.firstName, profile.user?.lastName]
          .filter(Boolean)
          .join(' ');

        return {
          type: 'Birthday',
          title: `${name} Birthday`.trim(),
          month: dob.getMonth() + 1,
          day: dob.getDate(),
          birthday: dob.toISOString().split('T')[0],
        };
      })
      .filter(Boolean);

    return {
      holidayEvents,
      leaveEvents,
      birthdayEvents,
    };
  }

  async getMyEventCalendar(): Promise<any> {
    const start = Date.now();

    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo
      .createQueryBuilder('emp')
      .leftJoinAndSelect('emp.user', 'user')
      .select(['emp.id', 'user.firstName', 'user.lastName'])
      .where('emp.appId = :appId', { appId })
      .andWhere('emp.userId = :userId', { userId })
      .andWhere('emp.employmentStatusId = 92')
      .andWhere('emp.employeeStatusId IN (:...status)', { status: [131, 132] })
      .andWhere('emp.joiningDate IS NOT NULL')
      .andWhere('emp.resignationDate IS NULL')
      .getOne();

    if (!employee) throw new NotFoundException('Employee not found');

    const today = new Date();

    const holidays = await this.appHolidayRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.holidayType', 'holidayType')
      .leftJoinAndSelect('h.appHolidayDates', 'dates')
      .where('h.app_id = :appId', { appId })
      .getMany();

    const holidayEvents = holidays.flatMap((h) =>
      (h.appHolidayDates || []).map((d) => ({
        id: h.id,
        name: h.holidayName,
        date: d.holidayDate,
        typeId: h.holidayTypeId,
        typeName: h.holidayType?.name,
        code: h.holidayType?.code,
      })),
    );

    // ================= LEAVES =================
    const leaves = await this.empLeaveRequestRepo.find({
      where: {
        empId: employee.id,
        approvalStatusId: 52,
        endDate: MoreThanOrEqual(today),
      },
      relations: ['empLeaveType'],
      order: { startDate: 'ASC' },
    });

    const leaveEvents = leaves.map((l) => ({
      type: 'Leave',
      title: [
        [employee.user?.firstName, employee.user?.lastName]
          .filter(Boolean)
          .join(' '),
        l.empLeaveType?.name,
      ]
        .filter(Boolean)
        .join(' - '),
      startDate: l.startDate,
      endDate: l.endDate,
      description: l.reason || null,
    }));

    const birthdayUsers = await this.userProfileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user')
      .innerJoin(Employee, 'emp', 'emp.user_id = user.id')
      .where('profile.dateOfBirth IS NOT NULL')
      .andWhere('emp.app_id = :appId', { appId })
      .getMany();

    const birthdayEvents = birthdayUsers
      .map((profile) => {
        const dobString = profile.dateOfBirth;

        if (!dobString) return null;

        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return null;
        const name = [profile.user?.firstName, profile.user?.lastName]
          .filter(Boolean)
          .join(' ');

        return {
          type: 'Birthday',
          title: `${name} Birthday`.trim(),
          month: dob.getMonth() + 1,
          day: dob.getDate(),
          birthday: dob.toISOString().split('T')[0],
        };
      })
      .filter(Boolean);
    console.log(`TOTAL TIME: ${Date.now() - start} ms`);

    return {
      holidayEvents,
      leaveEvents,
      birthdayEvents,
    };
  }

  async getEmployeeReconciliations(queryString: any): Promise<any> {
    const userId = RequestContext.get('userId');
    const activeAppId = Number(RequestContext.get('activeAppId')) || null;

    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });

    const appId = Number(appUser?.appId) || activeAppId;
    if (!appId) throw new NotFoundException('App User not found');

    const supervisor = await this.employeeRepo.findOne({
      where: {
        userId,
        appId,
        employmentStatusId: 92, // Accepted
        employeeStatusId: In([131, 132]), // Joined and Rejoined
        joiningDate: Not(IsNull()),
        resignationDate: IsNull(),
      },
    });

    let subordinateIds: number[] = [];
    if (supervisor?.id) {
      const subordinates = await this.employeeHierarchyRepo
        .createQueryBuilder('hierarchy')
        .where('hierarchy.supervisorId = :supervisorId', {
          supervisorId: supervisor.id,
        })
        .andWhere('hierarchy.appId = :appId', { appId })
        .andWhere('hierarchy.endDate IS NULL')
        .select(['hierarchy.empId'])
        .getMany();

      subordinateIds = [...new Set(subordinates.map((e) => e.empId))];
    }

    const attendanceDate = new Date();

    const currentMonth = attendanceDate.getMonth() + 1;
    const currentYear = attendanceDate.getFullYear();

    const query = await this.attendanceReconciliationRepo
      .createQueryBuilder('reconciliations')
      .leftJoinAndSelect('reconciliations.employee', 'employee')
      .leftJoinAndSelect('reconciliations.attendance', 'attendance')
      .leftJoinAndSelect('attendance.office', 'office')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .leftJoinAndSelect('attendance.checkInStatus', 'checkInStatus')
      .leftJoinAndSelect('attendance.checkInMethod', 'checkInMethod')
      .leftJoinAndSelect('attendance.checkOutStatus', 'checkOutStatus')
      .leftJoinAndSelect('attendance.checkOutMethod', 'checkOutMethod')
      .leftJoinAndSelect('attendance.lateApprovalUser', 'lateApprovalUser')
      .leftJoinAndSelect('attendance.earlyLeaveReason', 'earlyLeaveReason')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('designation.department', 'department')

      .leftJoinAndSelect('reconciliations.inTimeStatus', 'inTimeStatus')
      .leftJoinAndSelect('reconciliations.outTimeStatus', 'outTimeStatus')
      .leftJoinAndSelect('reconciliations.application', 'application')
      .where('application.id = :appId', { appId })
      .andWhere(
        subordinateIds.length
          ? 'reconciliations.empId IN (:...ids)'
          : '1 = 1',
        subordinateIds.length ? { ids: subordinateIds } : {},
      )
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.emailVerifiedAt IS NOT NULL')
      .select([
        'reconciliations.id',
        'reconciliations.attendanceDate',

        'reconciliations.inTimeStatusId',
        'reconciliations.outTimeStatusId',
        'reconciliations.inTime',
        'reconciliations.outTime',
        'reconciliations.inTimeRemarks',
        'reconciliations.outTimeRemarks',
        'reconciliations.inTimeSupervisorRemarks',
        'reconciliations.outTimeSupervisorRemarks',

        'attendance.id',
        'attendance.empId',
        'attendance.attendanceStatusId',
        'attendance.checkInMethodId',
        'attendance.attendanceDate',
        'attendance.checkIn',
        'attendance.checkOut',
        'attendance.ipAddress',
        'attendance.workedHour',
        'attendance.overtimeHours',
        'attendance.remarks',
        'attendance.jsonData',
        'attendance.lateReason',
        'attendance.earlyLeaveReason',
        'attendance.startBreak',
        'attendance.endBreak',
        'attendance.breakMinutes',

        'employee.id',
        'employee.userId',
        'designation.id',
        'designation.name',
        'department.id',
        'department.name',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',
        'profile.id',
        'profile.phoneCountryId',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'office.id',
        'office.name',
        'office.startTime',
        'office.delayStartTime',
        'office.endTime',
        'office.earlyEndTime',

        'shift.id',
        'shift.name',
        'shift.startTime',
        'shift.delayStartTime',
        'shift.endTime',
        'shift.earlyEndTime',

        'attendanceStatus.name',
        'attendanceStatus.code',
        'attendanceStatus.colorName',

        'checkInStatus.name',
        'checkInStatus.code',
        'checkInStatus.colorName',

        'checkInMethod.name',
        'checkInMethod.code',
        'checkInMethod.colorName',

        'checkOutStatus.name',
        'checkOutStatus.code',
        'checkOutStatus.colorName',

        'checkOutMethod.name',
        'checkOutMethod.code',
        'checkOutMethod.colorName',

        'lateApprovalUser.id',
        'lateApprovalUser.firstName',
        'lateApprovalUser.lastName',

        'earlyLeaveReason.name',
        'earlyLeaveReason.code',
        'earlyLeaveReason.colorName',

        'inTimeStatus.id',
        'inTimeStatus.name',
        'inTimeStatus.colorName',

        'outTimeStatus.id',
        'outTimeStatus.name',
        'outTimeStatus.colorName',
      ]);

    // .andWhere('MONTH(reconciliation.attendanceDate) = :month', {
    //   month: currentMonth,
    // });
    // .andWhere('YEAR(reconciliation.attendanceDate) = :year', {
    //   year: currentYear,
    // })

    //   .orderBy('reconciliations.attendanceDate', 'DESC')
    //   .getMany();

    query.orderBy('reconciliations.id', 'DESC');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;

      query.andWhere(
        `(user.firstName LIKE :search OR user.lastName LIKE :search OR designation.name LIKE :search)`,
        { search },
      );
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.attendanceDate) {
      query.andWhere('DATE(reconciliations.attendanceDate) = :searchDate', {
        searchDate: params.attendanceDate,
      });
    }

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    const checkInSummary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    };
    const earlyLeaveSummary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    };

    for (const item of featureData) {
      // In-time (check-in) reconciliation
      const inStatus = item?.inTimeStatus?.name?.toLowerCase();
      if (inStatus?.includes('pending')) checkInSummary.pending++;
      else if (inStatus?.includes('approved')) checkInSummary.approved++;
      else if (inStatus?.includes('rejected')) checkInSummary.rejected++;
      else if (inStatus?.includes('completed')) checkInSummary.completed++;

      // Out-time (early leave) reconciliation
      const outStatus = item?.outTimeStatus?.name?.toLowerCase();
      if (outStatus?.includes('pending')) earlyLeaveSummary.pending++;
      else if (outStatus?.includes('approved')) earlyLeaveSummary.approved++;
      else if (outStatus?.includes('rejected')) earlyLeaveSummary.rejected++;
      else if (outStatus?.includes('completed')) earlyLeaveSummary.completed++;
    }

    const reconciliationSummary = {
      checkIn: checkInSummary,
      earlyLeave: earlyLeaveSummary,
    };

    return { data: featureData, total, reconciliationSummary };
  }

  async getEmployeeMonthlyAttendanceSummery2(
    employeeId: number,
    queryString: any,
  ): Promise<any> {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const attendanceDate = params.attendanceDate
      ? params.attendanceDate
      : new Date();

    const attendanceMonth = attendanceDate.getMonth() + 1;
    const attendanceYear = attendanceDate.getFullYear();

    const appId = employee.appId;

    const lastDayOfMonth = Helpers.getLastDayOfMonth(
      attendanceYear,
      attendanceMonth - 1,
    );

    const attendanceDates: any[] = [];

    for (let day = 1; day <= lastDayOfMonth; day++) {
      let date = '';
      const actualMonth =
        attendanceMonth < 10 ? `0${attendanceMonth}` : attendanceMonth;
      if (day < 10) {
        date = `${attendanceYear}-${actualMonth}-0${day}`;
      } else {
        date = `${attendanceYear}-${actualMonth}-${day}`;
      }
      attendanceDates.push(date);
    }

    const attendanceRecords = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.emp_id = :employeeId', { employeeId })
      .andWhere('attendance.app_id = :appId', { appId })
      .andWhere('MONTH(attendance.attendance_date) = :month', {
        month: attendanceMonth,
      })
      .andWhere('YEAR(attendance.attendance_date) = :year', {
        year: attendanceYear,
      })
      .getMany();

    const holidayRecords = await this.appHolidayDateRepo
      .createQueryBuilder('appHoliDate')
      .innerJoin('appHoliDate.appHoliday', 'appHoliday')
      .where('appHoliday.appId = :appId', { appId })
      .andWhere('MONTH(appHoliDate.holidayDate) = :month', {
        month: attendanceMonth,
      })
      .andWhere('YEAR(appHoliDate.holidayDate) = :year', {
        year: attendanceYear,
      })
      .getMany();

    const dailyAttendance: Record<
      string,
      { label: string; colorName: string }
    > = {};

    const dayObject = {
      label: '',
      colorName: '',
      day: '',
      present: 0,
      absent: 0,
      extremeDelay: 0,
      delay: 0,
      onLeave: 0,
      weekend: 0,
      holidays: 0,
    };

    attendanceDates.forEach((date) => {
      const attendance = attendanceRecords.find(
        (a) => a.attendanceDate.toString().split('T')[0] === date,
      );

      const holiday = holidayRecords.find(
        (h) => h.holidayDate.toString().split('T')[0] === date,
      );

      const dayOfWeek = new Date(date).getDay();

      if (holiday) {
        dailyAttendance[date] = { label: 'Holiday', colorName: 'primary' };
      } else if (dayOfWeek === 5 || dayOfWeek === 6) {
        dailyAttendance[date] = { label: 'Weekend', colorName: 'warning' };
      } else if (attendance) {
        switch (attendance.attendanceStatusId) {
          case 42:
            dailyAttendance[date] = { label: 'Present', colorName: 'success' };
            break;
          case 43:
            dailyAttendance[date] = { label: 'Absent', colorName: 'danger' };
            break;
          case 45:
            dailyAttendance[date] = {
              label: 'Half Day',
              colorName: 'secondary',
            };
            break;
          case 46:
            dailyAttendance[date] = {
              label: 'On Leave',
              colorName: 'secondary',
            };
          default:
            dailyAttendance[date] = { label: 'Absent', colorName: 'danger' };
        }
      } else {
        dailyAttendance[date] = { label: '', colorName: '' };
      }
    });

    return {
      month: attendanceMonth,
      year: attendanceYear,
      overview: dailyAttendance,
    };
  }

  async getMonthlyAttendanceSummery(queryString: any): Promise<any> {
    let employeeId = 0;
    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const userId = RequestContext.get('userId');
    const activeAppId = RequestContext.get('activeAppId');

    if (params.employeeId) {
      employeeId = params.employeeId;
    }

    let employee: Employee | Promise<Employee> | null = null;

    if (!employeeId) {
      if (activeAppId) {
        employee = await this.employeeRepo.findOne({
          where: { userId, appId: activeAppId },
        });
      }
      if (!employee) {
        employee = await this.employeeRepo.findOne({
          where: { userId },
        });
      }
    } else {
      employee = await this.employeeRepo.findOne({
        where: { id: employeeId },
      });
      if (!employee && userId) {
        employee = await this.employeeRepo.findOne({
          where: { userId },
        });
      }
    }

    if (!employee) {
      throw new NotFoundException(`Employee not found`);
    }

    // const attendanceDate = params.attendanceDate
    //   ? params.attendanceDate
    //   : new Date();

    const attendanceDate = params.attendanceDate
      ? new Date(params.attendanceDate)
      : new Date();

    const attendanceMonth = attendanceDate.getMonth() + 1;
    const attendanceYear = attendanceDate.getFullYear();

    const appId = employee?.appId;

    const lastDayOfMonth = Helpers.getLastDayOfMonth(
      attendanceYear,
      attendanceMonth - 1,
    );

    const attendanceDates: any[] = [];

    // If the requested month is the current month → limit days up to today
    const today = new Date();
    let maxDay = lastDayOfMonth;

    if (
      attendanceYear === today.getFullYear() &&
      attendanceMonth === today.getMonth() + 1
    ) {
      maxDay = today.getDate();
    }

    for (let day = 1; day <= maxDay; day++) {
      let date = '';
      const actualMonth =
        attendanceMonth < 10 ? `0${attendanceMonth}` : attendanceMonth;
      if (day < 10) {
        date = `${attendanceYear}-${actualMonth}-0${day}`;
      } else {
        date = `${attendanceYear}-${actualMonth}-${day}`;
      }
      attendanceDates.push(date);
    }

    const attendanceRecords = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.attendanceStatus', 'attendanceStatus')
      .where('attendance.empId = :empId', { empId: employee.id })
      .andWhere(
        '(attendance.appId = :appId OR attendance.appId IS NULL OR :appId IS NULL)',
        { appId: appId || null },
      )
      .andWhere('MONTH(attendance.attendanceDate) = :month', {
        month: attendanceMonth,
      })
      .andWhere('YEAR(attendance.attendanceDate) = :year', {
        year: attendanceYear,
      })
      .getMany();

    const holidayRecords = await this.appHolidayDateRepo
      .createQueryBuilder('appHoliDate')
      .innerJoin('appHoliDate.appHoliday', 'appHoliday')
      .where(
        '(appHoliday.appId = :appId OR appHoliday.appId IS NULL OR :appId IS NULL)',
        { appId: appId || null },
      )
      .andWhere('MONTH(appHoliDate.holidayDate) = :month', {
        month: attendanceMonth,
      })
      .andWhere('YEAR(appHoliDate.holidayDate) = :year', {
        year: attendanceYear,
      })
      .getMany();

    let officeWeekends: any = null;
    if (employee.officeId) {
      officeWeekends = await this.officeWeekendRepo
        .createQueryBuilder('ow')
        .where(
          '(ow.appId = :appId OR ow.appId IS NULL OR :appId IS NULL)',
          { appId: appId || null },
        )
        .andWhere('ow.officeId = :officeId', { officeId: employee.officeId })
        .getOne();
    }

    const weekendData = officeWeekends;

    const weekendDays = Object.entries(weekendData || {})
      .filter(
        ([key, value]) =>
          [
            'saturday',
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
          ].includes(key) && value === 1,
      )
      .map(([key]) => key);

    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const weekendNumbers = weekendDays.map((day) => dayMap[day]);

    const dailyAttendance: Record<
      string,
      { label: string; colorName: string }
    > = {};

    const dateWiseSummery: any = [];

    const dailySummery = attendanceDates.map((date) => {
      const dayObject = {
        label: '',
        colorName: '',
        day: '01',
        present: 0,
        absent: 0,
        halfDay: 0,
        onLeave: 0,
        onTime: 0,
        late: 0,
        leftTimely: 0,
        leftEarly: 0,
        weekend: 0,
        holiday: 0,
      };

      const dateObject = {
        statusName: '',
        colorName: '',
        date: '',
        checkIn: '',
        checkOut: '',
        workedHour: 0.0,
        overtimeHours: 0.0,
      };

      const attendance = attendanceRecords.find(
        (a) => a.attendanceDate.toString().split('T')[0] === date,
      );

      const holiday = holidayRecords.find(
        (h) => h.holidayDate.toString().split('T')[0] === date,
      );

      const jsDay = new Date(date).getDay(); // 0–6 format

      dayObject.day = date.split('-')[2];
      dateObject.date = date;

      if (holiday) {
        dayObject.holiday = 1;
        dayObject.label = 'Holiday';
        dayObject.colorName = 'primary';
        dateObject.statusName = dayObject.label;
        dateObject.colorName = dayObject.colorName;
      } else if (weekendNumbers.includes(jsDay)) {
        dayObject.weekend = 1;
        dayObject.label = 'Weekend';
        dayObject.colorName = 'warning';
        dateObject.statusName = dayObject.label;
        dateObject.colorName = dayObject.colorName;
      }

      if (attendance) {
        switch (attendance.attendanceStatusId) {
          case 42:
            dayObject.present = 1;
            dayObject.label = 'Present';
            dayObject.colorName = 'success';
            break;
          case 43:
            dayObject.absent = 1;
            dayObject.label = 'Absent';
            dayObject.colorName = 'danger';
            break;
          case 45:
            dayObject.halfDay = 1;
            dayObject.label = 'Half Day';
            dayObject.colorName = 'secondary';
            break;
          case 46:
            dayObject.onLeave = 1;
            dayObject.label = 'On Leave';
            dayObject.colorName = 'secondary';
            break;
        }

        switch (attendance.checkInStatusId) {
          case 148:
            dayObject.onTime = 1;
            dayObject.label = 'On Time';
            dayObject.colorName = 'success';
            break;
          case 149:
            dayObject.late = 1;
            dayObject.label = 'Late';
            dayObject.colorName = 'danger';
            break;
        }

        switch (attendance.checkOutStatusId) {
          case 150:
            dayObject.leftTimely = 1;
            dayObject.label = 'Left Timely';
            dayObject.colorName = 'success';
            break;
          case 151:
            dayObject.leftEarly = 1;
            dayObject.label = 'Left Early';
            dayObject.colorName = 'warning';
            break;
        }

        dateObject.checkIn = attendance.checkIn
          ? attendance.checkIn.toISOString()
          : '';
        dateObject.checkOut = attendance.checkOut
          ? attendance.checkOut.toISOString()
          : '';
        dateObject.workedHour = attendance.workedHour ?? 0;
        dateObject.overtimeHours = attendance.overtimeHours ?? 0;
        dateObject.statusName = attendance?.attendanceStatus?.name || '';
        dateObject.colorName = attendance.attendanceStatus?.colorName || '';
      }

      if (!dayObject.label) {
        dayObject.absent = 1;
        dayObject.label = 'Absent';
        dayObject.colorName = 'danger';
      }

      if (!dateObject.statusName) {
        dateObject.statusName = dayObject.label;
        dateObject.colorName = dayObject.colorName;
      }

      dateWiseSummery.push(dateObject);
      // dailyAttendance[date] = dayObject;
      return dayObject;
    });

    return {
      month: attendanceMonth,
      year: attendanceYear,
      dailySummery: dailySummery,
      dateWiseSummery: dateWiseSummery,
    };
  }

  async CheckInApproveReconciliation(
    body: CheckInApproveReconciliationDto,
  ): Promise<CheckInApproveReconciliationDto> {
    const reconciliation = await this.attendanceReconciliationRepo.findOne({
      where: { id: body.reconciliationId },
      relations: [
        'attendance',
        'attendance.employee',
        'attendance.employee.user',
        'inTimeStatus',
      ],
    });

    if (!reconciliation)
      throw new NotFoundException('Reconciliation not found');

    const userId = Number(RequestContext.get('userId'));
    if (!userId) throw new NotFoundException('Approver not found');

    const pendingStatus = await this.commonDao.findStatusByCode(
      'attendance_reconciliation_status_pending',
    );
    const isPending =
      reconciliation.inTimeStatus?.code ===
        'attendance_reconciliation_status_pending' ||
      (pendingStatus?.id && reconciliation.inTimeStatusId === pendingStatus.id);

    if (isPending) {
      const targetStatus = await this.statusRepo.findOne({
        where: { id: body.inTimeStatusId },
      });
      if (!targetStatus?.id) {
        throw new BadRequestException('Select an approval status');
      }

      reconciliation.inTimeStatusId = targetStatus.id;
      reconciliation.inTimeApproveDate = new Date();
      reconciliation.inTimeSupervisorRemarks = body.inTimeSupervisorRemarks;

      const isApproved =
        targetStatus.code === 'attendance_reconciliation_status_approved';

      if (reconciliation.attendanceId) {
        const attendance = await this.empAttendanceRepo.findOne({
          where: { id: reconciliation.attendanceId },
          relations: ['attendanceStatus', 'checkInStatus'],
        });

        if (attendance) {
          attendance.lateApprovalUserId = userId;
          if (isApproved) {
            if (reconciliation.inTime) {
              const fullCheckIn = `${attendance.attendanceDate} ${reconciliation.inTime}`;
              attendance.checkIn = new Date(fullCheckIn);
            }
            const onTime = await this.commonDao.findStatusByCode(
              'attendance_checkin_status_ontime',
            );
            if (onTime?.id) attendance.checkInStatusId = onTime.id;

            // If employee was absent, change status to present
            if (attendance.attendanceStatus?.code === 'emp_attendance_status_absent') {
              const presentStatus = await this.commonDao.findStatusByCode(
                'emp_attendance_status_present',
              );
              if (presentStatus?.id) attendance.attendanceStatusId = presentStatus.id;
            }
          }
          await this.empAttendanceRepo.save(attendance);
        }
      }

      await this.attendanceReconciliationRepo.update(reconciliation.id, {
        inTimeStatusId: targetStatus.id,
        inTimeSupervisorRemarks: body.inTimeSupervisorRemarks,
        inTimeApproveDate: new Date(),
      });
    }

    //  Notification
    const employeeUserId = reconciliation.attendance?.employee?.userId;
    const status = reconciliation.inTimeStatus;

    if (employeeUserId) {
      const statusText =
        body.inTimeStatusId &&
        (await this.statusRepo.findOne({ where: { id: body.inTimeStatusId } }))
          ?.code === 'attendance_reconciliation_status_approved'
          ? 'approved'
          : 'rejected';
      await this.usersService.createUserNotification(
        employeeUserId,
        `Your check-in reconciliation request for ${reconciliation.attendance?.attendanceDate} has been  <b class="text-${status?.colorName}">${statusText}</b>`,
      );
    }

    return body;
  }

  async checkOutApproveReconciliation(
    reconciliationId: number,
    outTimeStatusId: number,
    outTimeSupervisorRemarks: string,
  ): Promise<CheckOutApproveReconciliationDto> {
    const reconciliation = await this.attendanceReconciliationRepo.findOne({
      where: { id: reconciliationId },
      relations: [
        'attendance',
        'attendance.employee',
        'attendance.employee.user',
        'outTimeStatus',
      ],
    });

    if (!reconciliation)
      throw new NotFoundException('Reconciliation not found');

    const userId = Number(RequestContext.get('userId'));
    if (!userId) throw new NotFoundException('Approver not found');

    const pendingStatus = await this.commonDao.findStatusByCode(
      'attendance_reconciliation_status_pending',
    );
    const isPending =
      reconciliation.outTimeStatus?.code ===
        'attendance_reconciliation_status_pending' ||
      (pendingStatus?.id && reconciliation.outTimeStatusId === pendingStatus.id);

    // Only update if pending
    if (isPending) {
      reconciliation.outTimeStatusId = outTimeStatusId; // approved/rejected
      reconciliation.outTimeApproveDate = new Date();
      reconciliation.outTimeSupervisorRemarks = outTimeSupervisorRemarks;

      await this.attendanceReconciliationRepo.update(reconciliation.id, {
        outTimeStatusId: outTimeStatusId,
        outTimeSupervisorRemarks: outTimeSupervisorRemarks,
        outTimeApproveDate: new Date(),
      });

      const targetStatus = await this.statusRepo.findOne({
        where: { id: outTimeStatusId },
      });
      const isApproved =
        targetStatus?.code === 'attendance_reconciliation_status_approved';

      if (reconciliation.attendanceId) {
        const attendance = await this.empAttendanceRepo.findOne({
          where: { id: reconciliation.attendanceId },
          relations: ['checkOutStatus'],
        });

        if (attendance) {
          attendance.lateApprovalUserId = userId;
          if (isApproved) {
            if (reconciliation.outTime) {
              const fullCheckOut = `${attendance.attendanceDate} ${reconciliation.outTime}`;
              attendance.checkOut = new Date(fullCheckOut);

              if (attendance.checkIn) {
                const diffMs = attendance.checkOut.getTime() - new Date(attendance.checkIn).getTime();
                if (diffMs > 0) {
                  attendance.workedHour = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
                }
              }
            }

            const leftOnTime = await this.commonDao.findStatusByCode(
              'attendance_checkout_status_left_timely',
            );
            if (leftOnTime?.id) attendance.checkOutStatusId = leftOnTime.id;
          }
          await this.empAttendanceRepo.save(attendance);
        }
      }

      const employeeUserId = reconciliation.attendance?.employee?.userId;
      const status = reconciliation.outTimeStatus;

      if (employeeUserId) {
        const statusText = isApproved ? 'approved' : 'rejected';
        await this.usersService.createUserNotification(
          employeeUserId,
          `Your check-out reconciliation request for ${reconciliation.attendance?.attendanceDate} has been  <b class="text-${status?.colorName}">${statusText}</b>`,
        );
      }
    }

    return {
      outTimeSupervisorRemarks,
      outTimeStatusId,
    };
  }

  async getMonthlyAttendanceSummary(queryString: any): Promise<any> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });

    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('employee.application', 'application')
      .leftJoinAndSelect('employee.designation', 'designation')
      .andWhere('application.id = :appId', { appId: appUser.appId })
      .andWhere('employee.officeId IS NOT NULL')
      .andWhere('employee.officeShiftId IS NOT NULL')

      .andWhere('employee.employeeStatusId IN(:...employeeStatusIds) ', {
        employeeStatusIds: [130, 131, 132],
      })
      .andWhere('employee.joiningDate IS NOT NULL')
      .andWhere('employee.resignationDate IS NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.emailVerifiedAt IS NOT NULL');

    const today = new Date();
    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    let month = today.getMonth() + 1;
    let year = today.getFullYear();

    if (params.month) {
      if (typeof params.month === 'string' && params.month.includes('-')) {
        const [y, m] = params.month.split('-');
        year = Number(y) || year;
        month = Number(m) || month;
      } else {
        month = Number(params.month) || month;
      }
    }

    if (params.year) {
      year = Number(params.year) || year;
    }

    if (params.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.officeId) {
      query.andWhere('employee.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.designationId) {
      query.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    const summaryMap: any = [];

    featureData.forEach((emp) => {
      const newEmployee = {
        employeeId: emp.id,
        employeeProfilePictureURL:
          emp.user?.profile?.profilePicture?.filename || '',
        appId: emp.appId,
        officeId: emp.officeId,
        shiftId: emp.officeShiftId,
        employeeCode: emp.employeeCode,
        employeeName: emp.user?.firstName + ' ' + emp.user?.lastName || 'N/A',
        designation: emp.designation?.name || 'N/A',
        present: 0,
        absent: 0,
        late: 0,
        checkInOnTime: 0,
        earlyLeave: 0,
        leftTimely: 0,
        onLeave: 0,
        workedHours: 0,
        overTimeHours: 0,
        attendancePercentage: 0,
      };

      summaryMap.push(newEmployee);
    });

    const attendancesBaseQuery = this.empAttendanceRepo
      .createQueryBuilder('employeeAttendance')
      .where('employeeAttendance.appId = :appId', { appId: appUser.appId })
      .andWhere('MONTH(employeeAttendance.attendanceDate) = :month', { month })
      .andWhere('YEAR(employeeAttendance.attendanceDate) = :year', { year })
      .andWhere('employeeAttendance.empId IS NOT NULL');

    if (params.attendanceDate) {
      attendancesBaseQuery.andWhere(
        'DATE(employeeAttendance.attendanceDate) = :searchDate',
        {
          searchDate: params.attendanceDate,
        },
      );
    }

    await Promise.all(
      summaryMap &&
        summaryMap.map(async (item: any) => {
          const attQuery = attendancesBaseQuery
            .clone()
            .andWhere('employeeAttendance.empId = :empId', {
              empId: item.employeeId,
            });

          if (item.officeId) {
            attQuery.andWhere('employeeAttendance.officeId = :officeId', {
              officeId: item.officeId,
            });
          }

          if (item.shiftId) {
            attQuery.andWhere('employeeAttendance.shiftId = :shiftId', {
              shiftId: item.shiftId,
            });
          }

          item.present = await attQuery
            .clone()
            .andWhere(
              'employeeAttendance.attendanceStatusId = :attendanceStatusId',
              { attendanceStatusId: 42 },
            )
            .getCount();

          item.absent = await attQuery
            .clone()
            .andWhere(
              'employeeAttendance.attendanceStatusId = :attendanceStatusId',
              { attendanceStatusId: 43 },
            )
            .getCount();

          item.late = await attQuery
            .clone()
            .andWhere('employeeAttendance.checkInStatusId = :checkInStatusId', {
              checkInStatusId: 149,
            })
            .getCount();

          item.checkInOnTime = await attQuery
            .clone()
            .andWhere('employeeAttendance.checkInStatusId = :checkInStatusId', {
              checkInStatusId: 148,
            })
            .getCount();

          item.earlyLeave = await attQuery
            .clone()
            .andWhere(
              'employeeAttendance.checkOutStatusId = :checkOutStatusId',
              { checkOutStatusId: 151 },
            )
            .getCount();

          item.leftTimely = await attQuery
            .clone()
            .andWhere(
              'employeeAttendance.checkOutStatusId = :checkOutStatusId',
              { checkOutStatusId: 150 },
            )
            .getCount();

          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0, 23, 59, 59); // last day of month

          const result = await this.empLeaveRequestRepo
            .createQueryBuilder('leave')
            .select(
              'SUM(DATEDIFF(LEAST(leave.end_date, :monthEnd), GREATEST(leave.start_date, :monthStart)) + 1)',
              'totalLeaveDays',
            )
            .where('leave.empId = :empId', { empId: item.employeeId })
            .andWhere('leave.appId = :appId', { appId: item.appId })
            .andWhere('leave.approvalStatusId = :approvalStatus', {
              approvalStatus: 52,
            }) // approved
            .andWhere(
              'leave.start_date <= :monthEnd AND leave.end_date >= :monthStart',
              { monthStart, monthEnd },
            )
            .setParameters({ monthStart, monthEnd })
            .getRawOne();

          item.onLeave = Number(result?.totalLeaveDays) || 0;

          const hoursResult = await attQuery
            .clone()
            .select(
              `SUM(employeeAttendance.worked_hour) AS totalWorkedHours,
               SUM(employeeAttendance.overtime_hours) AS totalOvertimeHours`,
            )
            .getRawOne();

          item.workedHours = parseFloat(hoursResult?.totalWorkedHours) || 0;
          item.overTimeHours = parseFloat(hoursResult?.totalOvertimeHours) || 0;
          const totalDays = item.present + item.absent;
          item.attendancePercentage =
            totalDays > 0
              ? Math.round((item.present / totalDays) * 100)
              : 0;

          return item;
        }),
    );

    return {
      total,
      data: summaryMap,
      // employees: featureData,
    };
  }

  async getYearlyLeaveSummary(queryString: any): Promise<any> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App not found');
    }

    const employeeQuery = this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('employee.application', 'application')
      .leftJoinAndSelect('employee.designation', 'designation')
      .andWhere('application.id = :appId', { appId: appId })
      .andWhere('employee.officeId IS NOT NULL')
      .andWhere('employee.officeShiftId IS NOT NULL')
      .andWhere('employee.employeeStatusId IN(:...employeeStatusIds)', {
        employeeStatusIds: [131, 132],
      })
      .andWhere('employee.joiningDate IS NOT NULL')
      .andWhere('employee.resignationDate IS NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.emailVerifiedAt IS NOT NULL');

    const today = new Date();
    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    const year = params.year ? Number(params.year) : today.getFullYear();

    if (params.search) {
      employeeQuery.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.officeId) {
      employeeQuery.andWhere('employee.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    if (params.designationId) {
      employeeQuery.andWhere('employee.designationId = :designationId', {
        designationId: params.designationId,
      });
    }

    if (params.departmentId) {
      employeeQuery.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    const total = await employeeQuery.clone().getCount();

    const features = new APIFeatures(employeeQuery, queryString)
      .sort()
      .limitFields()
      .paginate();

    const employees = await features.getQuery().getMany();

    if (!employees.length) {
      return {
        total,
        data: [],
      };
    }

    const employeeIds = employees.map((emp) => emp.id);

    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: { appId: appId, year },
      order: { id: 'ASC' },
    });

    const yearStart = new Date(year, 0, 1, 0, 0, 0);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const leaveSummaryRaw = await this.empLeaveRequestRepo
      .createQueryBuilder('leave')
      .leftJoin(
        'emp_leave_types',
        'leaveType',
        'leaveType.id = leave.leaveTypeId',
      )
      .select('leave.empId', 'empId')
      .addSelect('leave.leaveTypeId', 'leaveTypeId')
      .addSelect('leaveType.name', 'leaveTypeName')
      .addSelect('leaveType.max_days_per_year', 'maxDaysPerYear')
      .addSelect(
        `SUM(
        DATEDIFF(
          LEAST(DATE(leave.end_date), DATE(:yearEnd)),
          GREATEST(DATE(leave.start_date), DATE(:yearStart))
        ) + 1
      )`,
        'usedDays',
      )
      .where('leave.appId = :appId', { appId: appId })
      .andWhere('leave.empId IN (:...employeeIds)', { employeeIds })
      .andWhere('leave.approvalStatusId = :approvalStatusId', {
        approvalStatusId: 52,
      })
      .andWhere('leave.start_date <= :yearEnd', { yearEnd })
      .andWhere('leave.end_date >= :yearStart', { yearStart })
      .groupBy('leave.empId')
      .addGroupBy('leave.leaveTypeId')
      .addGroupBy('leaveType.name')
      .addGroupBy('leaveType.max_days_per_year')
      .getRawMany();

    const leaveSummaryMap = new Map<number, any[]>();

    leaveSummaryRaw.forEach((row) => {
      const empId = Number(row.empId);

      if (!leaveSummaryMap.has(empId)) {
        leaveSummaryMap.set(empId, []);
      }

      const employeeLeaveRows = leaveSummaryMap.get(empId);
      if (Array.isArray(employeeLeaveRows)) {
        employeeLeaveRows.push({
          leaveTypeId: Number(row.leaveTypeId),
          leaveTypeName: row.leaveTypeName,
          maxDaysPerYear: Number(row.maxDaysPerYear) || 0,
          usedDays: Number(row.usedDays) || 0,
        });
      }
    });

    const data = employees.map((emp) => {
      const employeeLeaveRows = leaveSummaryMap.get(emp.id) || [];

      const leaveTypesSummary = leaveTypes.map((type) => {
        const matched = employeeLeaveRows.find(
          (item) => item.leaveTypeId === type.id,
        );

        const usedDays = matched?.usedDays || 0;
        const maxDaysPerYear = Number(type.maxDaysPerYear) || 0;

        return {
          leaveTypeId: type.id,
          leaveTypeName: type.name,
          usedDays,
          remainingDays:
            maxDaysPerYear - usedDays > 0 ? maxDaysPerYear - usedDays : 0,
        };
      });

      const totalLeaveDays = leaveTypesSummary.reduce(
        (sum, item) => sum + item.usedDays,
        0,
      );

      return {
        employeeId: emp.id,
        employeeProfilePictureURL:
          emp.user?.profile?.profilePicture?.fileUrl || '',
        appId: emp.appId,
        officeId: emp.officeId,
        shiftId: emp.officeShiftId,
        employeeCode: emp.employeeCode,
        employeeName:
          `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() ||
          'N/A',
        designation: emp.designation?.name || 'N/A',
        year,
        totalLeaveDays,
        leaveTypes: leaveTypesSummary,
      };
    });

    return {
      total,
      data,
    };
  }

  async getLeaveTypes(): Promise<any> {
    const userId = RequestContext.get('userId');
    // const appId = RequestContext.get('appId');
    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });

    if (!appUser) throw new NotFoundException('App User not found');
    const appId = appUser.appId;

    const leaveTypes = await this.empLeaveTypeRepo
      .createQueryBuilder('leaveType')
      .select([
        'leaveType.id',
        'leaveType.name',
        'leaveType.isPaid',
        'leaveType.maxDaysPerYear',
        'leaveType.year',
      ])
      .where('leaveType.appId = :appId', { appId })
      .andWhere('leaveType.year = :year', {
        year: new Date().getFullYear(),
      })
      .orderBy('leaveType.id', 'ASC')
      .getMany();

    return leaveTypes;
  }
  //create events

  async CreateOrUpdateEvent(dto: CreateEventDto): Promise<Event> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId ?? undefined!;

    const department = await this.departmentRepo.findOne({
      where: { id: dto.departmentId },
    });

    if (!department) throw new NotFoundException('Department not found');
    dto.departmentId = department.id;

    const eventType = await this.statusRepo.findOne({
      where: {
        id: dto.eventTypeId,
        statusGroup: { code: 'event_types' },
      },
      relations: ['statusGroup'],
    });

    if (!eventType) throw new NotFoundException('Event Type not found');
    dto.eventTypeId = eventType.id;

    dto.creatorId = userId;

    const status = await this.statusRepo.findOne({
      where: {
        id: dto.statusId,
        statusGroup: { code: 'event_statuses' },
      },
      relations: ['statusGroup'],
    });

    if (!status) throw new NotFoundException('Status not found');
    dto.statusId = status.id;

    let event;
    if (dto.id) {
      event = await this.eventRepo.findOne({ where: { id: dto.id } });
      if (!event) throw new NotFoundException('Event not found');

      this.eventRepo.merge(event, dto);
      event = await this.eventRepo.save(event);
    } else {
      event = this.eventRepo.create(dto);
      event = await this.eventRepo.save(event);
    }

    //Notification

    const statusText = status.name;
    const color = status.colorName;

    await this.usersService.createUserNotification(
      event.creatorId,
      `<b class="text-${color}">${statusText}</b> ${event.title} has been created.`,
    );

    return event;
  }

  //findAllEvents

  async findAllEvents(
    queryString: any,
  ): Promise<{ data: Event[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    const query = this.eventRepo.createQueryBuilder('event');

    query.leftJoin('event.department', 'department');
    query.leftJoin('event.eventType', 'eventType');
    query.leftJoin('event.status', 'status');

    query.addSelect([
      'department.id',
      'department.name',
      'eventType.name',
      'eventType.code',
      'status.name',
      'status.code',
      'status.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('event.appId = :appId', {
      appId: appUser.appId,
    });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        `(event.title LIKE :search OR event.location LIKE :search OR event.description LIKE :search)`,
        { search },
      );
    }

    if (params.departmentId) {
      query.andWhere('event.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.eventTypeId) {
      query.andWhere('event.eventTypeId = :eventTypeId', {
        eventTypeId: params.eventTypeId,
      });
    }

    if (params.statusId) {
      query.andWhere('event.statusId = :statusId', {
        statusId: params.statusId,
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  //find event by id

  async findEventById(id: number): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  //delete event
  async deleteEvent(id: number): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepo.remove(event);
  }

  // Create or Update Event Attendee
  async createOrUpdateEventAttendee(
    dto: CreateEventAttendeeDto,
  ): Promise<EventAttendee> {
    const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
    if (!event) throw new NotFoundException('Event not found');
    dto.eventId = event.id;

    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    dto.employeeId = employee.id;

    const status = await this.statusRepo.findOne({
      where: {
        id: dto.attendanceStatusId,
        statusGroup: { code: 'event_attendance_statuses' },
      },
      relations: ['statusGroup'],
    });
    if (!status) throw new NotFoundException('Attendance status not found');
    dto.attendanceStatusId = status.id;

    let attendee;
    if (dto.id) {
      attendee = await this.attendeeRepo.findOne({ where: { id: dto.id } });
      if (!attendee) throw new NotFoundException('Event attendee not found');

      this.attendeeRepo.merge(attendee, dto);
      attendee = await this.attendeeRepo.save(attendee);
    } else {
      attendee = this.attendeeRepo.create(dto);
      attendee = await this.attendeeRepo.save(attendee);
    }

    // Notification to Employee
    await this.usersService.createUserNotification(
      employee.id,
      `Your attendance for event <b>${event.title}</b> has been marked as <b class="text-${status.colorName}">${status.name}</b>.`,
    );

    return attendee;
  }

  // Find All Event Attendees
  async findAllEventAttendees(
    queryString: any,
  ): Promise<{ data: EventAttendee[]; total: number }> {
    const query = this.attendeeRepo.createQueryBuilder('attendee');

    query.leftJoin('attendee.event', 'event');
    query.leftJoin('attendee.employee', 'employee');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('attendee.attendanceStatus', 'status');

    query.addSelect([
      'event.title',
      'user.firstName',
      'user.lastName',
      'status.name',
      'status.code',
      'status.colorName',
    ]);

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.eventId) {
      query.andWhere('attendee.eventId = :eventId', {
        eventId: params.eventId,
      });
    }

    if (params.employeeId) {
      query.andWhere('attendee.employeeId = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    if (params.attendanceStatusId) {
      query.andWhere('attendee.attendanceStatusId = :statusId', {
        statusId: params.attendanceStatusId,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // Find Event Attendee by ID
  async findEventAttendeeById(id: number): Promise<EventAttendee> {
    const attendee = await this.attendeeRepo.findOne({ where: { id } });
    if (!attendee) throw new NotFoundException('Event attendee not found');
    return attendee;
  }

  // Delete Event Attendee
  async deleteEventAttendee(id: number): Promise<void> {
    const attendee = await this.attendeeRepo.findOne({ where: { id } });
    if (!attendee) throw new NotFoundException('Event attendee not found');
    await this.attendeeRepo.remove(attendee);
  }

  async getUpcomingEvents(employeeId: number): Promise<any[]> {
    // Ensure employee exists
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    // Get attendee records for employee with event status = 'upcoming'
    const attendees = await this.attendeeRepo
      .createQueryBuilder('attendee')
      .leftJoinAndSelect('attendee.event', 'event')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .leftJoinAndSelect('event.status', 'status')
      .where('attendee.employeeId = :employeeId', { employeeId })
      .andWhere('event.statusId = status.id')
      .andWhere('status.name = :name', { name: 'upcoming' })
      .andWhere('event.startDatetime > NOW()')
      .select([
        'attendee.id',
        'event.id',
        'event.title',
        'eventType.id',
        'eventType.name',
        'event.startDatetime',
        'event.endDatetime',
        'event.statusId',
        'status.name',
        'status.colorName',
      ])
      .getMany();

    // Map to DTO
    return attendees.map((att) => ({
      eventId: att.event?.id,
      title: att.event?.title,
      eventType: att.event?.eventType?.name,
      startDatetime: att.event?.startDatetime?.toISOString(),
      endDatetime: att.event?.endDatetime?.toISOString(),
      statusId: att.event.statusId,
      statusName: att.event?.status?.name ?? '',
      colorName: att.event?.status?.colorName ?? '',
    }));
  }

  async getMyUpcomingEvents(): Promise<any[]> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
    });
    if (!employee) return [];

    // Fetch only upcoming events for this employee
    const attendees = await this.attendeeRepo
      .createQueryBuilder('attendee')
      .leftJoin('attendee.event', 'event')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .leftJoin('event.status', 'status')
      .where('attendee.employeeId = :employeeId', { employeeId: employee.id })
      .andWhere('event.statusId = status.id')
      .andWhere('LOWER(status.name) = :name', { name: 'upcoming' })
      .andWhere('event.startDatetime > NOW()')
      .select([
        'attendee.id',
        'event.id',
        'event.title',
        'eventType.id',
        'eventType.name',
        'event.startDatetime',
        'event.endDatetime',
        'event.statusId',
        'status.name',
        'status.colorName',
      ])
      .orderBy('event.startDatetime', 'ASC')
      .getMany();

    return attendees.map((att) => ({
      eventId: att.event.id,
      title: att.event.title,
      eventType: att.event?.eventType?.name,
      startDatetime: att.event.startDatetime
        ? new Date(att.event.startDatetime).toISOString()
        : '',
      endDatetime: att.event.endDatetime
        ? new Date(att.event.endDatetime).toISOString()
        : '',
      statusId: att.event.statusId,
      statusName: att.event.status?.name ?? '',
      colorName: att.event.status?.colorName ?? '',
    }));
  }

  async getAllEmployeeUpcomingEvents(): Promise<any[]> {
    // Fetch all upcoming attendee records in ONE query
    const attendees = await this.attendeeRepo
      .createQueryBuilder('attendee')
      .innerJoinAndSelect('attendee.event', 'event')
      .innerJoinAndSelect('event.eventType', 'eventType')
      .innerJoinAndSelect('event.status', 'status')
      .where('status.name = :name', { name: 'Upcoming' })
      .andWhere('event.startDatetime > NOW()')
      .select([
        'attendee.id',
        'attendee.employeeId',
        'event.id',
        'event.title',
        'event.startDatetime',
        'event.endDatetime',
        'event.statusId',
        'eventType.id',
        'eventType.name',
        'status.name',
        'status.colorName',
      ])
      .getMany();

    // Group by employeeId in memory
    const grouped = new Map<number, any[]>();

    for (const att of attendees) {
      const empId = att.employeeId;
      if (!grouped.has(empId)) grouped.set(empId, []);

      grouped.get(empId)!.push({
        eventId: att.event?.id,
        title: att.event?.title,
        eventType: att.event?.eventType?.name,
        startDatetime: att.event?.startDatetime?.toISOString(),
        endDatetime: att.event?.endDatetime?.toISOString(),
        statusId: att.event?.statusId,
        statusName: att.event?.status?.name ?? '',
        colorName: att.event?.status?.colorName ?? '',
      });
    }

    return Array.from(grouped.entries()).map(([employeeId, events]) => ({
      employeeId,
      events,
    }));
  }

  async getTotalExperienceAndPromotion(): Promise<any> {
    const userId = RequestContext.get('userId');
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const experiences = await this.userWorkExperienceRepo.find({
      where: { userId },
    });

    if (experiences.length === 0) {
      return '0 years ';
    }

    const employmentHistory = {
      totalExperience: {
        years: 0,
        months: 0,
      },
      promotions: 5,
    };

    let totalDays = 0;
    experiences.forEach((exp) => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent
        ? new Date()
        : exp.endDate
          ? new Date(exp.endDate)
          : null;

      if (!end) return;
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      totalDays += diff;
    });

    const years = Math.floor(totalDays / 365);
    const month = Math.floor((totalDays % 365) / 30);
    employmentHistory.totalExperience.years = years;
    employmentHistory.totalExperience.months = month;
    return employmentHistory;
  }

  private async attachLeaveBalances(appId: number, rows: any[]): Promise<void> {
    const empIds = [
      ...new Set(
        rows.map((row) => Number(row?.empId)).filter((id) => Number.isFinite(id) && id > 0),
      ),
    ];
    if (!appId || !empIds.length) return;

    const policyYear = new Date().getFullYear();
    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: { appId, year: policyYear },
      order: { name: 'ASC' },
      select: ['id', 'name', 'maxDaysPerYear', 'year', 'isPaid'],
    });

    const usedByKey = new Map<string, number>();
    const pendingByKey = new Map<string, number>();

    if (leaveTypes.length) {
      const rawRows = await this.empLeaveRequestRepo
        .createQueryBuilder('leave')
        .select('leave.empId', 'empId')
        .addSelect('leave.leaveTypeId', 'leaveTypeId')
        .addSelect('leave.approvalStatusId', 'approvalStatusId')
        .addSelect(
          'COALESCE(SUM(DATEDIFF(leave.end_date, leave.start_date) + 1), 0)',
          'days',
        )
        .where('leave.empId IN (:...empIds)', { empIds })
        .andWhere('leave.appId = :appId', { appId })
        .andWhere('leave.approvalStatusId IN (:...statusIds)', {
          statusIds: [51, 52],
        })
        .andWhere('YEAR(leave.start_date) = :policyYear', { policyYear })
        .groupBy('leave.empId')
        .addGroupBy('leave.leaveTypeId')
        .addGroupBy('leave.approvalStatusId')
        .getRawMany();

      rawRows.forEach((row) => {
        const key = `${Number(row.empId)}:${Number(row.leaveTypeId)}`;
        const days = Number(row.days) || 0;
        if (Number(row.approvalStatusId) === 52) usedByKey.set(key, days);
        else pendingByKey.set(key, days);
      });
    }

    const balanceByEmpId = new Map<number, any>();
    empIds.forEach((empId) => {
      const sample = rows.find((row) => Number(row.empId) === empId);
      const user = sample?.employee?.user;
      const name =
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
        user?.fullName ||
        'Employee';
      let totalLeave = 0;
      let totalUsed = 0;
      let totalPending = 0;
      const types = leaveTypes.map((leaveType) => {
        const key = `${empId}:${leaveType.id}`;
        const used = usedByKey.get(key) || 0;
        const pending = pendingByKey.get(key) || 0;
        const remaining = Math.max(0, leaveType.maxDaysPerYear - used);
        totalLeave += leaveType.maxDaysPerYear;
        totalUsed += used;
        totalPending += pending;
        return {
          id: leaveType.id,
          name: leaveType.name,
          isPaid: leaveType.isPaid,
          total: leaveType.maxDaysPerYear,
          used,
          pending,
          remaining,
        };
      });
      balanceByEmpId.set(empId, {
        employee: { id: empId, name, email: user?.email || '' },
        year: policyYear,
        types,
        total: {
          totalLeave,
          totalUsed,
          totalPending,
          totalRemaining: Math.max(0, totalLeave - totalUsed),
        },
      });
    });

    rows.forEach((row) => {
      row.leaveBalance = balanceByEmpId.get(Number(row.empId)) || null;
    });
  }

  async getEmployeeLeaveBalance(empId: number): Promise<any> {
    const employee = await this.employeeRepo.findOne({
      where: { id: empId },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const appId = employee.appId;
    if (!appId) {
      throw new BadRequestException('Employee app not found');
    }
    const policyYear = new Date().getFullYear();
    const employeeName =
      `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim();

    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: { appId, year: policyYear },
      order: { name: 'ASC' },
      select: ['id', 'name', 'maxDaysPerYear', 'year', 'isPaid'],
    });

    const usedByTypeId = new Map<number, number>();
    const pendingByTypeId = new Map<number, number>();

    if (leaveTypes.length) {
      const rows = await this.empLeaveRequestRepo
        .createQueryBuilder('leave')
        .select('leave.leaveTypeId', 'leaveTypeId')
        .addSelect('leave.approvalStatusId', 'approvalStatusId')
        .addSelect(
          'COALESCE(SUM(DATEDIFF(leave.end_date, leave.start_date) + 1), 0)',
          'days',
        )
        .where('leave.empId = :empId', { empId: employee.id })
        .andWhere('leave.appId = :appId', { appId })
        .andWhere('leave.approvalStatusId IN (:...statusIds)', {
          statusIds: [51, 52],
        })
        .andWhere('YEAR(leave.start_date) = :policyYear', { policyYear })
        .groupBy('leave.leaveTypeId')
        .addGroupBy('leave.approvalStatusId')
        .getRawMany();

      rows.forEach((row) => {
        const typeId = Number(row.leaveTypeId);
        const days = Number(row.days) || 0;
        if (Number(row.approvalStatusId) === 52) {
          usedByTypeId.set(typeId, days);
        } else {
          pendingByTypeId.set(typeId, days);
        }
      });
    }

    let totalLeave = 0;
    let totalUsed = 0;
    let totalPending = 0;

    const types = leaveTypes.map((leaveType) => {
      const used = usedByTypeId.get(leaveType.id) || 0;
      const pending = pendingByTypeId.get(leaveType.id) || 0;
      const remaining = Math.max(0, leaveType.maxDaysPerYear - used);
      totalLeave += leaveType.maxDaysPerYear;
      totalUsed += used;
      totalPending += pending;
      return {
        id: leaveType.id,
        name: leaveType.name,
        isPaid: leaveType.isPaid,
        total: leaveType.maxDaysPerYear,
        used,
        pending,
        remaining,
      };
    });

    return {
      employee: {
        id: employee.id,
        name: employeeName || 'Employee',
        email: employee.user?.email || '',
      },
      year: policyYear,
      types,
      total: {
        totalLeave,
        totalUsed,
        totalPending,
        totalRemaining: Math.max(0, totalLeave - totalUsed),
      },
    };
  }

  async getMyLeavePolicy(): Promise<any> {
    const userId = RequestContext.get('userId');

    if (!userId) {
      throw new BadRequestException('User not found');
    }

    // Same app resolution as getLeaveTypes() — more reliable than JWT activeAppId alone
    let appId = RequestContext.get('activeAppId');
    if (!appId) {
      const appUser = await this.appUserRepo.findOne({
        where: { userId, isActive: true },
      });
      appId = appUser?.appId;
    }
    if (!appId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    if (!appId) {
      throw new BadRequestException('Active app not found');
    }

    const employee =
      (await this.employeeRepo.findOne({
        where: { userId, appId },
        select: ['id', 'appId', 'userId'],
      })) ||
      (await this.employeeRepo.findOne({
        where: { userId },
        select: ['id', 'appId', 'userId'],
        order: { id: 'ASC' },
      }));

    const policyYear = new Date().getFullYear();

    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: { appId, year: policyYear },
      order: { id: 'ASC' },
      select: ['id', 'name', 'maxDaysPerYear', 'year'],
    });

    // Match dashboard (status id 52) — avoid extra status lookup latency on remote DB
    const approvedStatusId = 52;

    const usedByTypeId = new Map<number, number>();

    if (leaveTypes.length && employee) {
      const usedRows = await this.empLeaveRequestRepo
        .createQueryBuilder('leave')
        .select('leave.leaveTypeId', 'leaveTypeId')
        .addSelect(
          'COALESCE(SUM(DATEDIFF(leave.end_date, leave.start_date) + 1), 0)',
          'usedDays',
        )
        .where('leave.empId = :empId', { empId: employee.id })
        .andWhere('leave.appId = :appId', { appId })
        .andWhere('leave.approvalStatusId = :statusId', {
          statusId: approvedStatusId,
        })
        .andWhere('YEAR(leave.start_date) = :policyYear', { policyYear })
        .groupBy('leave.leaveTypeId')
        .getRawMany();

      usedRows.forEach((row) => {
        usedByTypeId.set(Number(row.leaveTypeId), Number(row.usedDays) || 0);
      });
    }

    const leaveOverview: Record<
      string,
      { total: number; used: number; remaining: number }
    > = {};

    let totalLeave = 0;
    let totalUsed = 0;

    leaveTypes.forEach((leaveType) => {
      const used = usedByTypeId.get(leaveType.id) || 0;
      const remaining = Math.max(0, leaveType.maxDaysPerYear - used);

      leaveOverview[leaveType.name] = {
        total: leaveType.maxDaysPerYear,
        used,
        remaining,
      };

      totalLeave += leaveType.maxDaysPerYear;
      totalUsed += used;
    });

    return {
      leaveOverview,
      total: {
        totalLeave,
        totalUsed,
        totalRemaining: Math.max(0, totalLeave - totalUsed),
      },
    };
  }

  async getMyAttendanceAndLeaveSummary(): Promise<any> {
    const totalStart = Date.now();

    const userId = RequestContext.get('userId');
    if (!userId) throw new NotFoundException('User not found');

    let appId = RequestContext.get('activeAppId');

    if (!appId && userId) {
      const appUser = await this.appUserRepo.findOne({ where: { userId } });
      appId = appUser?.appId;
    }

    const empStart = Date.now();

    let employee = await this.employeeRepo
      .createQueryBuilder('emp')
      .leftJoinAndSelect('emp.user', 'user')
      .select(['emp.id', 'user.id', 'user.firstName', 'user.lastName'])
      .where(appId ? 'emp.appId = :appId' : '1=1', { appId })
      .andWhere('emp.userId = :userId', { userId })
      .getOne();

    if (!employee) {
      employee = await this.employeeRepo
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.user', 'user')
        .select(['emp.id', 'user.id', 'user.firstName', 'user.lastName'])
        .where('emp.userId = :userId', { userId })
        .getOne();
    }

    console.log('Employee Query Time:', Date.now() - empStart, 'ms');

    if (!employee) throw new NotFoundException('Employee not found');

    const year = new Date().getFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    // ---------------- Attendance Query ----------------
    const attStart = Date.now();

    const attendanceCounts = await this.empAttendanceRepo
      .createQueryBuilder('att')
      .select([
        `SUM(CASE WHEN att.attendanceStatusId IN (42, 45) OR att.checkIn IS NOT NULL THEN 1 ELSE 0 END) AS present`,
        `SUM(CASE WHEN att.attendanceStatusId = 43 AND att.checkIn IS NULL THEN 1 ELSE 0 END) AS absent`,
        `SUM(CASE WHEN att.attendanceStatusId = 45 OR att.checkInStatusId = 149 THEN 1 ELSE 0 END) AS late`,
      ])
      .where('att.empId = :empId', { empId: employee.id })
      .andWhere(
        '(att.appId = :appId OR att.appId IS NULL OR :appId IS NULL)',
        { appId: appId || null },
      )
      .andWhere('att.attendanceDate >= :yearStart', { yearStart })
      .andWhere('att.attendanceDate < :yearEnd', { yearEnd })
      .getRawOne();

    console.log('Attendance Query Time:', Date.now() - attStart, 'ms');

    const present = Number(attendanceCounts?.present) || 0;
    const absent = Number(attendanceCounts?.absent) || 0;
    const late = Number(attendanceCounts?.late) || 0;

    const leaveStart = Date.now();

    const leaveResult = await this.empLeaveRequestRepo
      .createQueryBuilder('leave')
      .select(
        'COALESCE(SUM(DATEDIFF(LEAST(leave.end_date, :yearEnd), GREATEST(leave.start_date, :yearStart)) + 1), 0)',
        'totalLeaveDays',
      )
      .where('leave.empId = :empId', { empId: employee.id })
      .andWhere(
        '(leave.appId = :appId OR leave.appId IS NULL OR :appId IS NULL)',
        { appId: appId || null },
      )
      .andWhere('leave.approvalStatusId = :status', { status: 52 })
      .andWhere('leave.start_date < :yearEnd', { yearEnd })
      .andWhere('leave.end_date >= :yearStart', { yearStart })
      .setParameters({ yearStart, yearEnd })
      .getRawOne();

    console.log('Leave Query Time:', Date.now() - leaveStart, 'ms');

    const totalLeaveTaken = Number(leaveResult?.totalLeaveDays) || 0;

    const totalDays = present + absent;
    const attendancePercentage =
      totalDays > 0
        ? Math.round((present / totalDays) * 100)
        : present > 0
          ? 100
          : 0;

    const onTimePercentage =
      present > 0
        ? Math.max(0, Math.round(((present - late) / present) * 100))
        : 100;

    console.log('TOTAL TIME:', Date.now() - totalStart, 'ms');

    return {
      employeeId: employee.id,
      employeeName: `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim(),
      userId,
      year,
      present,
      absent,
      late,
      totalLeaveTaken,
      attendancePercentage,
      onTimePercentage,
    };
  }

  async getEmployeeTotalExperienceAndPromotion(
    employeeId: number,
  ): Promise<any> {
    if (!employeeId) throw new NotFoundException('Employee ID is required');

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const userId = employee.userId;
    if (!userId) throw new NotFoundException('User not linked with employee');

    const experiences = await this.userWorkExperienceRepo.find({
      where: { userId },
    });

    if (experiences.length === 0) {
      return '0 years';
    }

    const employmentHistory = {
      totalExperience: { years: 0, months: 0 },
      promotions: 5, // you can update this dynamically later
    };

    let totalDays = 0;

    experiences.forEach((exp) => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent
        ? new Date()
        : exp.endDate
          ? new Date(exp.endDate)
          : null;

      if (!end) return;

      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      totalDays += diff;
    });

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);

    employmentHistory.totalExperience.years = years;
    employmentHistory.totalExperience.months = months;

    return employmentHistory;
  }

  async getEmployeeAttendanceAndLeaveSummary(employeeId: number): Promise<any> {
    if (!employeeId) throw new NotFoundException('Employee ID is required');

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      // relations: ['user'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const appUser = await this.appUserRepo.findOne({
      where: { appId: employee.appId ?? undefined },
    });

    if (!appUser) throw new NotFoundException('App User not found');

    const year = new Date().getFullYear();

    // attendance counts
    const attendanceCounts = await this.empAttendanceRepo
      .createQueryBuilder('att')
      .select([
        `SUM(CASE WHEN att.attendanceStatusId = 42 THEN 1 ELSE 0 END) AS present`,
        `SUM(CASE WHEN att.attendanceStatusId = 43 THEN 1 ELSE 0 END) AS absent`,
        `SUM(CASE WHEN att.checkInStatusId = 149 THEN 1 ELSE 0 END) AS late`,
      ])
      .where('att.empId = :empId', { empId: employee.id })
      .andWhere('att.appId = :appId', { appId: employee.appId })
      .andWhere('YEAR(att.attendanceDate) = :year', { year })
      .getRawOne();

    const present = Number(attendanceCounts.present) || 0;
    const absent = Number(attendanceCounts.absent) || 0;
    const late = Number(attendanceCounts.late) || 0;

    // leave calculation
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const leaveResult = await this.empLeaveRequestRepo
      .createQueryBuilder('leave')
      .select(
        'SUM(DATEDIFF(LEAST(leave.end_date, :yearEnd), GREATEST(leave.start_date, :yearStart)) + 1)',
        'totalLeaveDays',
      )
      .where('leave.empId = :empId', { empId: employee.id })
      .andWhere('leave.appId = :appId', { appId: employee.appId })
      .andWhere('leave.approvalStatusId = :approvalStatus', {
        approvalStatus: 52,
      })
      .andWhere(
        'leave.start_date <= :yearEnd AND leave.end_date >= :yearStart',
        {
          yearStart,
          yearEnd,
        },
      )
      .setParameters({ yearStart, yearEnd })
      .getRawOne();

    const totalLeaveTaken = Number(leaveResult.totalLeaveDays) || 0;

    const totalDays = present + absent;
    const attendancePercentage =
      totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    return {
      employeeId: employee.id,
      employeeName: `${employee.user?.firstName} ${employee.user?.lastName}`,
      year,
      present,
      absent,
      late,
      totalLeaveTaken,
      attendancePercentage,
    };
  }

  async getAllEventCalendar(
    queryString: any,
    employeeId?: number,
  ): Promise<any> {
    const start = Date.now();
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException({ message: 'Active company is required' });
    }
    const today = new Date();

    /** 1️⃣ Holidays */
    const holidays = await this.appHolidayRepo
      .createQueryBuilder('appHoliday')
      .leftJoinAndSelect('appHoliday.appHolidayDates', 'holidayDates')
      .leftJoinAndSelect('appHoliday.holidayType', 'holidayType')
      .where('appHoliday.app_id = :appId', { appId })
      .getMany();

    const holidayEvents = holidays.flatMap((h) =>
      h.holidayDates.map((date) => ({
        id: h.id,
        name: h.holidayName || h.holiday?.holidayName,
        date,
        typeId: h.holidayTypeId,
        typeName: h.holidayType?.name,
        code: h.holidayType?.code,
        colorName: h.holidayType?.colorName,
      })),
    );

    console.log(`Holiday Response time : ${Date.now() - start} ms`);

    /** 2️⃣ Employee Leaves */
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    let leaveEvents: any[] = [];

    const leaveQuery = this.empLeaveRequestRepo
      .createQueryBuilder('leave')
      .where('leave.approvalStatusId = :approvalStatusId', {
        approvalStatusId: 52,
      })
      .andWhere('leave.endDate >= :startOfYear', { startOfYear })
      .leftJoinAndSelect('leave.empLeaveType', 'empLeaveType')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('designation.department', 'department')
      .orderBy('leave.startDate', 'ASC');

    if (employeeId) {
      leaveQuery.andWhere('leave.empId = :empId', { empId: employeeId });
    } else {
      leaveQuery.andWhere('leave.appId = :appId', { appId });
    }

    const empLeaves = await leaveQuery.getMany();

    leaveEvents = empLeaves.map((l) => {
      const empName =
        `${l.employee?.user?.firstName || ''} ${l.employee?.user?.lastName || ''}`.trim() ||
        'Employee';
      const typeName = l.empLeaveType?.name || 'Leave';

      return {
        id: l.id,
        title: `${empName} - ${typeName}`,
        employeeName: empName,
        employeeCode: l.employee?.employeeCode || '',
        designation: l.employee?.designation?.name || '',
        department: l.employee?.designation?.department?.name || '',
        startDate: l.startDate,
        endDate: l.endDate,
        description: l.reason,
        typeId: l.empLeaveType?.id,
        typeName: typeName,
      };
    });

    console.log(`leaveEvents Response time : ${Date.now() - start} ms`);

    /** 3️⃣ Employee Birthdays (active company employees only) */
    const birthdayUsers = await this.userProfileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user')
      .innerJoin(
        'employees',
        'employee',
        'employee.user_id = user.id AND employee.app_id = :appId',
        { appId },
      )
      .where('profile.dateOfBirth IS NOT NULL')
      .andWhere('employee.user_id IS NOT NULL')
      .getMany();

    const birthdayEvents = birthdayUsers
      .map((profile) => {
        if (!profile.dateOfBirth) return null;
        const dob = new Date(profile.dateOfBirth);
        return {
          id: profile.user.id,
          type: 'Birthday',
          title: `${profile.user.firstName} ${profile.user.lastName} Birthday`,
          month: dob.getMonth() + 1,
          day: dob.getDate(),
          birthday: dob.toISOString().split('T')[0],
        };
      })
      .filter(Boolean);

    console.log(`birthdayEvents Response time : ${Date.now() - start} ms`);

    let currentEmp: Employee | null = null;
    if (userId && appId) {
      currentEmp = await this.employeeRepo.findOne({
        where: { userId, appId },
      });
    }

    const weekendQuery = this.officeWeekendRepo
      .createQueryBuilder('weekend')
      .leftJoinAndSelect('weekend.office', 'office')
      .where('weekend.appId = :appId', { appId });

    if (currentEmp?.officeId) {
      weekendQuery.andWhere('weekend.officeId = :officeId', {
        officeId: currentEmp.officeId,
      });
    }

    const officeWeekends = await weekendQuery.getMany();

    const weekendEvents = officeWeekends.map((w) => ({
      id: w.id,
      officeId: w.officeId,
      officeName: w.office?.name,
      saturday: Boolean(w.saturday),
      sunday: Boolean(w.sunday),
      monday: Boolean(w.monday),
      tuesday: Boolean(w.tuesday),
      wednesday: Boolean(w.wednesday),
      thursday: Boolean(w.thursday),
      friday: Boolean(w.friday),
    }));

    const end = Date.now();

    console.log(`weekendEvents Response time : ${end - start} ms`);

    console.log(`Total Response time : ${end - start} ms`);

    return {
      data: {
        holidays: holidayEvents,
        leaves: leaveEvents,
        birthdays: birthdayEvents,
        weekends: weekendEvents,
      },
    };
  }

  // create or update for employee income tax tiers

  async createOrUpdateEmpIncomeTaxTier(
    dto: CreateEmpIncomeTaxTierDto,
  ): Promise<EmpIncomeTaxTier> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let empIncomeTaxTier: EmpIncomeTaxTier;

    if (dto.id) {
      const found = await this.empIncomeTaxTierRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(
          `EmpIncomeTaxTier with ID ${dto.id} not found`,
        );
      }
      empIncomeTaxTier = found;
      this.empIncomeTaxTierRepo.merge(empIncomeTaxTier, dto);
    } else {
      empIncomeTaxTier = this.empIncomeTaxTierRepo.create({
        ...dto,
      });
    }
    return await this.empIncomeTaxTierRepo.save(empIncomeTaxTier);
  }

  //get all employee income tax tiers
  async findAllEmpIncomeTaxTiers(): Promise<EmpIncomeTaxTier[]> {
    return await this.empIncomeTaxTierRepo.find();
  }

  //get employee income tax tier by id
  async findEmpIncomeTaxTierById(id: number): Promise<EmpIncomeTaxTier> {
    const empIncomeTaxTier = await this.empIncomeTaxTierRepo.findOne({
      where: { id },
    });
    if (!empIncomeTaxTier) {
      throw new NotFoundException(`EmpIncomeTaxTier with ID ${id} not found`);
    }
    return empIncomeTaxTier;
  }

  //delet employee income tax tier
  async deleteEmpIncomeTaxTier(id: number): Promise<EmpIncomeTaxTier> {
    const empIncomeTaxTier = await this.findEmpIncomeTaxTierById(id);
    return await this.empIncomeTaxTierRepo.remove(empIncomeTaxTier);
  }

  //change active status

  async changeActiveStatus(id: number): Promise<EmpIncomeTaxTier> {
    const empIncomeTaxTier = await this.findEmpIncomeTaxTierById(id);
    empIncomeTaxTier.isActive = !empIncomeTaxTier.isActive;
    return await this.empIncomeTaxTierRepo.save(empIncomeTaxTier);
  }

  // Employee Salary Change Type Methods

  async createOrUpdateEmpSalaryChangeType(
    dto: CreateEmpSalaryChangeTypeDto,
  ): Promise<EmpSalaryChangeType> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let empSalaryChangeType: EmpSalaryChangeType;

    if (dto.id) {
      const found = await this.empSalaryChangeTypeRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(
          `EmpIncomeTaxTier with ID ${dto.id} not found`,
        );
      }
      empSalaryChangeType = found;
      this.empSalaryChangeTypeRepo.merge(empSalaryChangeType, dto);
    } else {
      empSalaryChangeType = this.empSalaryChangeTypeRepo.create({
        ...dto,
      });
    }
    return await this.empSalaryChangeTypeRepo.save(empSalaryChangeType);
  }

  async findAllEmpSalaryChangeTypes(): Promise<EmpSalaryChangeType[]> {
    return await this.empSalaryChangeTypeRepo.find();
  }

  async findEmpSalaryChangeTypeById(id: number): Promise<EmpSalaryChangeType> {
    const empSalaryChangeType = await this.empSalaryChangeTypeRepo.findOne({
      where: { id },
    });
    if (!empSalaryChangeType) {
      throw new NotFoundException(
        `EmpSalaryChangeType with ID ${id} not found`,
      );
    }
    return empSalaryChangeType;
  }

  async deleteEmpSalaryChangeType(id: number): Promise<EmpSalaryChangeType> {
    const empSalaryChangeType = await this.findEmpSalaryChangeTypeById(id);
    return await this.empSalaryChangeTypeRepo.remove(empSalaryChangeType);
  }

  async changeEmpSalaryChangeTypeActiveStatus(
    id: number,
  ): Promise<EmpSalaryChangeType> {
    const empSalaryChangeType = await this.findEmpSalaryChangeTypeById(id);
    empSalaryChangeType.isActive = !empSalaryChangeType.isActive;
    return await this.empSalaryChangeTypeRepo.save(empSalaryChangeType);
  }

  //  create or update late attendance rules

  async createOrUpdateLateAttendanceRule(
    dto: CreateLateAttendanceRuleDto,
  ): Promise<LateAttendanceRule> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let lateAttendanceRule: LateAttendanceRule;

    if (dto.id) {
      const found = await this.lateAttendanceRuleRepo.findOne({
        where: { id: dto.id },
      });
      if (!found) {
        throw new NotFoundException(
          `LateAttendanceRule with ID ${dto.id} not found`,
        );
      }
      lateAttendanceRule = found;
      this.lateAttendanceRuleRepo.merge(lateAttendanceRule, dto);
    } else {
      lateAttendanceRule = this.lateAttendanceRuleRepo.create({
        ...dto,
      });
    }
    return await this.lateAttendanceRuleRepo.save(lateAttendanceRule);
  }

  async findAllLateAttendanceRules(
    queryString: any,
  ): Promise<{ data: LateAttendanceRule[]; total: number }> {
    const query =
      this.lateAttendanceRuleRepo.createQueryBuilder('lateAttendanceRule');

    query.leftJoin('lateAttendanceRule.office', 'office');

    query.addSelect(['office.id', 'office.name']);

    const features = new APIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.officeId) {
      query.andWhere('lateAttendanceRule.officeId = :officeId', {
        officeId: params.officeId,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async getLateAttendanceRuleById(id: number): Promise<LateAttendanceRule> {
    const lateAttendanceRule = await this.lateAttendanceRuleRepo.findOne({
      where: { id },
    });
    if (!lateAttendanceRule) {
      throw new NotFoundException(`LateAttendanceRule with ID ${id} not found`);
    }
    return lateAttendanceRule;
  }

  async deleteLateAttendanceRule(id: number): Promise<LateAttendanceRule> {
    const lateAttendanceRule = await this.getLateAttendanceRuleById(id);
    return await this.lateAttendanceRuleRepo.remove(lateAttendanceRule);
  }

  //active toogle

  async toggleLateAttendanceRuleActiveStatus(
    id: number,
  ): Promise<LateAttendanceRule> {
    const lateAttendanceRule = await this.getLateAttendanceRuleById(id);
    lateAttendanceRule.isActive = !lateAttendanceRule.isActive;

    return await this.lateAttendanceRuleRepo.save(lateAttendanceRule);
  }

  async toggleLateAttendanceRuleAbsentStatus(
    id: number,
  ): Promise<LateAttendanceRule> {
    const lateAttendanceRule = await this.getLateAttendanceRuleById(id);
    lateAttendanceRule.isAbsent = !lateAttendanceRule.isAbsent;

    return await this.lateAttendanceRuleRepo.save(lateAttendanceRule);
  }

  async generateEmployeeCode(): Promise<{ employeeCode: string }> {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const application = await this.applicationRepo.findOne({
      where: { id: appId },
    });

    const rawPrefix = (
      Helpers.avatarText(application?.name || '') || 'EMP'
    ).toUpperCase();
    const prefix = rawPrefix.replace(/[^A-Z0-9]/g, '') || 'EMP';
    const year = new Date().getFullYear();

    const count = await this.employeeRepo.count({
      where: { appId },
    });

    let serial = count + 1;
    let candidateCode = `${prefix}-${year}-${serial.toString().padStart(4, '0')}`;

    while (
      await this.employeeRepo.findOne({
        where: { appId, employeeCode: candidateCode },
      })
    ) {
      serial++;
      candidateCode = `${prefix}-${year}-${serial.toString().padStart(4, '0')}`;
    }

    return { employeeCode: candidateCode };
  }

  async addNewEmployee(
    dto: CreateNewEmployeeDto,
    inputEmployeeCode?: string,
  ): Promise<Employee> {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('Active company (app) is required');
    }
    dto.appId = appId;

    let user: User | null = null;
    let employee: Employee;

    if (dto.id) {
      // ----------------------------------------------------
      // UPDATE EXISTING EMPLOYEE
      // ----------------------------------------------------
      const existingEmployee = await this.employeeRepo.findOne({
        where: { id: dto.id, appId },
        relations: ['user', 'user.profile'],
      });

      if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${dto.id} not found`);
      }

      if (!existingEmployee.user) {
        throw new NotFoundException(
          'Associated user not found for this employee',
        );
      }

      const employeeUser = existingEmployee.user;

      // Check email uniqueness if email changed
      if (dto.email && dto.email !== employeeUser.email) {
        const emailConflict = await this.userRepo.findOne({
          where: { email: dto.email },
        });
        if (emailConflict && emailConflict.id !== employeeUser.id) {
          throw new BadRequestException('Email already in use by another user');
        }
      }

      // Check employeeCode uniqueness within this company if code changed
      if (
        dto.employeeCode &&
        dto.employeeCode !== existingEmployee.employeeCode
      ) {
        const codeConflict = await this.employeeRepo.findOne({
          where: { appId, employeeCode: dto.employeeCode },
        });
        if (codeConflict && codeConflict.id !== existingEmployee.id) {
          throw new BadRequestException(
            `Employee code "${dto.employeeCode}" is already in use in this company`,
          );
        }
      }

      employee = await this.dataSource.transaction(async (manager) => {
        const u = employeeUser;
        if (dto.firstName) u.firstName = dto.firstName;
        if (dto.lastName) u.lastName = dto.lastName;
        if (dto.email) u.email = dto.email;
        if (dto.password) {
          u.password = await bcrypt.hash(dto.password, 10);
        }
        if (dto.isActive !== undefined) {
          u.isActive = dto.isActive;
        }
        if (dto.resetFirstPassword !== undefined) {
          u.resetFirstPassword = dto.resetFirstPassword;
        }
        u.activeAppId = appId;
        if (dto.emailVerifiedAt) u.emailVerifiedAt = dto.emailVerifiedAt;
        if (dto.lastTimezone) u.lastTimezone = dto.lastTimezone;
        u.appUseCase = UseCase.COMPANY;

        user = await manager.save(u);

        // Update profile
        let userProfile = u.profile;
        if (!userProfile) {
          userProfile = manager.create(UserProfile, { userId: u.id });
        }
        userProfile.profilePictureId =
          dto.profilePictureId ?? userProfile.profilePictureId;
        userProfile.countryId = dto.countryId ?? userProfile.countryId;
        userProfile.phoneCountryId =
          dto.phoneCountryId ?? userProfile.phoneCountryId;
        userProfile.phone = dto.phone ?? userProfile.phone;
        userProfile.presentAddressId =
          dto.presentAddressId ?? userProfile.presentAddressId;
        userProfile.permanentAddressId =
          dto.permanentAddressId ?? userProfile.permanentAddressId;
        userProfile.gender = dto.gender ?? userProfile.gender;
        userProfile.bloodGroupId =
          dto.bloodGroupId ?? userProfile.bloodGroupId;
        userProfile.linkedinUrl = dto.linkedinUrl ?? userProfile.linkedinUrl;
        userProfile.portfolioUrl =
          dto.portfolioUrl ?? userProfile.portfolioUrl;
        userProfile.githubUrl = dto.githubUrl ?? userProfile.githubUrl;
        userProfile.willingToRelocate =
          dto.willingToRelocate ?? userProfile.willingToRelocate;
        userProfile.remoteOnly = dto.remoteOnly ?? userProfile.remoteOnly;
        userProfile.isPublic = dto.isPublic ?? userProfile.isPublic;
        userProfile.passportNumber =
          dto.passportNumber ?? userProfile.passportNumber;
        userProfile.nidNumber = dto.nidNumber ?? userProfile.nidNumber;
        userProfile.fathersName = dto.fathersName ?? userProfile.fathersName;
        userProfile.mothersName = dto.mothersName ?? userProfile.mothersName;
        userProfile.maritalStatusId =
          dto.maritalStatusId ?? userProfile.maritalStatusId;
        userProfile.religionId = dto.religionId ?? userProfile.religionId;
        if (dto.dateOfBirth) {
          userProfile.dateOfBirth = new Date(dto.dateOfBirth);
        }
        await manager.save(userProfile);

        // Update employee
        existingEmployee.designationId =
          dto.designationId ?? existingEmployee.designationId;
        existingEmployee.officeId = dto.officeId ?? existingEmployee.officeId;
        existingEmployee.officeShiftId =
          dto.officeShiftId ?? existingEmployee.officeShiftId;
        if (dto.employmentStatusId)
          existingEmployee.employmentStatusId = dto.employmentStatusId;
        if (dto.employeeStatusId)
          existingEmployee.employeeStatusId = dto.employeeStatusId;
        if (dto.currentGradeId !== undefined)
          existingEmployee.currentGradeId = dto.currentGradeId;
        if (dto.currentBasicSalary !== undefined)
          existingEmployee.currentBasicSalary = dto.currentBasicSalary;
        if (dto.joiningDate)
          existingEmployee.joiningDate = new Date(dto.joiningDate);
        if (dto.resignationDate !== undefined) {
          existingEmployee.resignationDate = dto.resignationDate
            ? new Date(dto.resignationDate)
            : null;
        }
        if (dto.remarks !== undefined) existingEmployee.remarks = dto.remarks;
        if (dto.employeeCode)
          existingEmployee.employeeCode = dto.employeeCode;

        const updatedEmployee = await manager.save(existingEmployee);

        // Ensure AppUser exists
        const existingAppUser = await manager.getRepository(AppUser).findOne({
          where: { appId, userId: u.id },
        });
        if (!existingAppUser) {
          const status = await this.commonDao.findStatusByIdOrCode(
            'app_user_type_employee',
          );
          const appUserInstance = manager.create(AppUser, {
            appId,
            userId: u.id,
            userTypeId: status?.id ?? 18,
            joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
            isActive: true,
          });
          await manager.save(appUserInstance);
        }

        return updatedEmployee;
      });

      const finalUser = user ?? employeeUser;

      // Role assignment & invitation handling
      const roleIds = dto.roleIds ?? (dto.roleId ? [dto.roleId] : []);
      if (dto.resetFirstPassword) {
        if (roleIds.length > 0) {
          await this.rolePermissionService.assignRolesToUser(finalUser.id, roleIds);
        }

        const sessionId = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await this.dataSource.getRepository(PasswordReset).save({
          userId: finalUser.id,
          sessionId,
          expiredDateTime: expiresAt,
        });

        let officeName: string | null = null;
        let officeShiftName: string | null = null;
        if (dto.officeId) {
          const office = await this.officeRepo.findOne({
            where: { id: dto.officeId, appId },
            select: ['id', 'name'],
          });
          officeName = office?.name ?? null;
        }
        if (dto.officeShiftId) {
          const shift = await this.officeShiftRepo.findOne({
            where: { id: dto.officeShiftId },
            select: ['id', 'name'],
          });
          officeShiftName = shift?.name ?? null;
        }

        try {
          await this.mailService.sendMail(
            finalUser.email,
            'Congratulations! Welcome to the Company 🎉',
            'employee-welcome',
            {
              name: `${finalUser.firstName} ${finalUser.lastName}`,
              email: finalUser.email,
              officeName,
              officeShiftName,
              resetLink: `${process.env.FRONTEND_URL}/reset-first-password?email=${finalUser.email}&resetFirstPassword=${dto.resetFirstPassword}&token=${sessionId}`,
              sessionId,
            },
          );
          finalUser.invitationCount = (finalUser.invitationCount || 0) + 1;
          await this.userRepo.save(finalUser);
        } catch (error) {}
      } else {
        if (roleIds.length === 0) {
          await this.rolePermissionService.assignRolesToUser(finalUser.id, []);
        }
      }

      return employee;
    }

    // ----------------------------------------------------
    // CREATE NEW EMPLOYEE
    // ----------------------------------------------------
    let hashedPassword;

    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    } else {
      hashedPassword = await bcrypt.hash('12345678', 10);
      dto.isActive = false;
    }
    const application = await this.applicationRepo.findOne({
      where: { id: appId },
    });

    if (!application) {
      throw new BadRequestException('Failed to create User Profile');
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      const existingEmployee = await this.employeeRepo.findOne({
        where: { userId: existingUser.id, appId },
      });
      if (existingEmployee) {
        throw new BadRequestException(
          'An employee with this email already exists in this company',
        );
      }
      throw new BadRequestException('A user with this email already exists');
    }

    let employeeCode = inputEmployeeCode ?? dto.employeeCode;
    if (employeeCode) {
      const codeConflict = await this.employeeRepo.findOne({
        where: { appId, employeeCode },
      });
      if (codeConflict) {
        throw new BadRequestException(
          `Employee code "${employeeCode}" is already in use in this company`,
        );
      }
    } else {
      const generated = await this.generateEmployeeCode();
      employeeCode = generated.employeeCode;
    }

    employee = await this.dataSource.transaction(async (manager) => {
      const userInstance = manager.create(User);
      userInstance.firstName = dto.firstName;
      userInstance.lastName = dto.lastName;
      userInstance.email = dto.email;
      userInstance.password = hashedPassword;
      userInstance.isActive = dto.isActive ?? true;
      userInstance.resetFirstPassword = dto.resetFirstPassword;
      userInstance.activeAppId = appId;
      userInstance.emailVerifiedAt = dto.emailVerifiedAt ?? new Date();
      userInstance.lastTimezone = dto.lastTimezone ?? null;
      userInstance.appUseCase = UseCase.COMPANY;

      user = await manager.save(userInstance);

      if (!user) {
        throw new BadRequestException('Failed to create User');
      }

      const userProfileInstance = manager.create(UserProfile);
      userProfileInstance.userId = user.id;
      userProfileInstance.profilePictureId = dto.profilePictureId ?? null;
      userProfileInstance.countryId = dto.countryId ?? null;
      userProfileInstance.phoneCountryId = dto.phoneCountryId ?? null;
      userProfileInstance.phone = dto.phone ?? null;
      userProfileInstance.presentAddressId = dto.presentAddressId ?? null;
      userProfileInstance.permanentAddressId = dto.permanentAddressId ?? null;
      userProfileInstance.gender = dto.gender ?? null;
      userProfileInstance.bloodGroupId = dto.bloodGroupId ?? null;
      userProfileInstance.linkedinUrl = dto.linkedinUrl ?? null;
      userProfileInstance.portfolioUrl = dto.portfolioUrl ?? null;
      userProfileInstance.githubUrl = dto.githubUrl ?? null;
      userProfileInstance.willingToRelocate = dto.willingToRelocate ?? false;
      userProfileInstance.remoteOnly = dto.remoteOnly ?? false;
      userProfileInstance.isPublic = dto.isPublic ?? false;
      userProfileInstance.passportNumber = dto.passportNumber ?? null;
      userProfileInstance.nidNumber = dto.nidNumber ?? null;
      userProfileInstance.fathersName = dto.fathersName ?? null;
      userProfileInstance.mothersName = dto.mothersName ?? null;
      userProfileInstance.maritalStatusId = dto.maritalStatusId ?? null;
      userProfileInstance.religionId = dto.religionId ?? null;
      userProfileInstance.dateOfBirth = dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : null;

      const userProfile = await manager.save(userProfileInstance);

      if (!userProfile) {
        throw new BadRequestException('Failed to create User Profile');
      }

      const employeeInstance = manager.create(Employee);
      employeeInstance.employeeCode = employeeCode;
      employeeInstance.userId = user.id;
      employeeInstance.appId = appId;
      employeeInstance.designationId = dto.designationId ?? null;
      employeeInstance.officeId = dto.officeId ?? null;
      employeeInstance.officeShiftId = dto.officeShiftId ?? null;
      employeeInstance.employmentStatusId = dto.employmentStatusId ?? 92;
      employeeInstance.employeeStatusId = dto.employeeStatusId ?? 132;
      employeeInstance.currentGradeId = dto.currentGradeId ?? null;
      employeeInstance.currentBasicSalary = dto.currentBasicSalary ?? null;
      employeeInstance.joiningDate = dto.joiningDate
        ? new Date(dto.joiningDate)
        : null;
      employeeInstance.resignationDate = dto.resignationDate
        ? new Date(dto.resignationDate)
        : null;
      employeeInstance.remarks = dto.remarks ?? null;

      const savedEmployee = await manager.save(employeeInstance);

      if (!savedEmployee) {
        throw new BadRequestException('Failed to create New Employee');
      }

      // AppUser creation for company association
      const status = await this.commonDao.findStatusByIdOrCode(
        'app_user_type_employee',
      );
      const appUserInstance = manager.create(AppUser, {
        appId,
        userId: user.id,
        userTypeId: status?.id ?? 18,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
        isActive: true,
      });
      await manager.save(appUserInstance);

      let officeName: string | null = null;
      let officeShiftName: string | null = null;

      if (dto.officeId) {
        const office = await this.officeRepo.findOne({
          where: { id: dto.officeId, appId },
          select: ['id', 'name'],
        });
        officeName = office?.name ?? null;
      }

      if (dto.officeShiftId) {
        const shift = await this.officeShiftRepo.findOne({
          where: { id: dto.officeShiftId },
          select: ['id', 'name'],
        });
        officeShiftName = shift?.name ?? null;
      }

      if (dto.resetFirstPassword) {
        // Create Reset password
        const sessionId = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        await manager.getRepository(PasswordReset).save({
          userId: user.id,
          sessionId,
          expiredDateTime: expiresAt,
        });

        try {
          await this.mailService.sendMail(
            dto.email,
            'Congratulations! Welcome to the Company 🎉',
            'employee-welcome',
            {
              name: `${dto.firstName} ${dto.lastName}`,
              email: dto.email,
              officeName,
              officeShiftName,
              resetLink: `${process.env.FRONTEND_URL}/reset-first-password?email=${dto.email}&resetFirstPassword=${dto.resetFirstPassword}&token=${sessionId}`,
              sessionId,
            },
          );
          user.invitationCount = (user.invitationCount || 0) + 1;
          await manager.save(user);
        } catch (error) {}
      }

      return savedEmployee;
    });

    // Assign company role if invite is true and role is specified
    const roleIds = dto.roleIds ?? (dto.roleId ? [dto.roleId] : []);
    const targetUserId: number | null = (user as any)?.id ?? employee.userId ?? null;
    if (dto.resetFirstPassword && roleIds.length > 0 && targetUserId) {
      await this.rolePermissionService.assignRolesToUser(targetUserId, roleIds);
    }

    return employee;
  }

  async createOrUpdateMasterDocument(
    dto: CreateMasterDocumentDto,
  ): Promise<MasterDocument> {
    let masterDocument: MasterDocument;

    if (dto.id) {
      const found = await this.masterDocumentRepo.findOne({
        where: { id: dto.id },
      });

      if (!found) {
        throw new NotFoundException(
          `MasterDocument with ID ${dto.id} not found`,
        );
      }

      masterDocument = found;
      this.masterDocumentRepo.merge(masterDocument, dto);
    } else {
      masterDocument = this.masterDocumentRepo.create({
        ...dto,
      });
    }

    return await this.masterDocumentRepo.save(masterDocument);
  }

  async findAllMasterDocuments(
    queryString: any,
  ): Promise<{ data: MasterDocument[]; total: number }> {
    const query = this.masterDocumentRepo.createQueryBuilder('masterDocument');

    query.leftJoin('masterDocument.documentType', 'documentType');
    query.addSelect([
      'documentType.id',
      'documentType.name',
      'documentType.code',
      'documentType.colorName',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('masterDocument.documentName LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.documentTypeId) {
      query.andWhere('masterDocument.documentTypeId = :documentTypeId', {
        documentTypeId: params.documentTypeId,
      });
    }

    if (params.isActive !== undefined) {
      query.andWhere('masterDocument.isActive = :isActive', {
        isActive: params.isActive === 'true',
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async getMasterDocumentById(id: number): Promise<MasterDocument> {
    const masterDocument = await this.masterDocumentRepo.findOne({
      where: { id },
    });

    if (!masterDocument) {
      throw new NotFoundException(`MasterDocument with ID ${id} not found`);
    }

    return masterDocument;
  }

  async deleteMasterDocument(id: number): Promise<MasterDocument> {
    const masterDocument = await this.getMasterDocumentById(id);
    return await this.masterDocumentRepo.remove(masterDocument);
  }

  //active toogle

  async toggleMasterDocumentActiveStatus(id: number): Promise<MasterDocument> {
    const masterDocument = await this.getMasterDocumentById(id);
    masterDocument.isActive = !masterDocument.isActive;
    return await this.masterDocumentRepo.save(masterDocument);
  }

  async findAllMasterDocumentsWithoutPagination(): Promise<MasterDocument[]> {
    return await this.masterDocumentRepo.find();
  }

  async findAllCompanyDocumentRecords(queryString: any): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    const query = this.companyDocumentRecordsRepo.createQueryBuilder('cdr');

    query.leftJoinAndSelect('cdr.companyDocument', 'companyDocument');
    query.leftJoinAndSelect('companyDocument.documentType', 'documentType');
    query.leftJoinAndSelect('cdr.media', 'media');

    query.addSelect([
      'companyDocument.id',
      'companyDocument.documentName',
      'companyDocument.documentTypeId',
      'documentType.name',
      'documentType.code',
      'documentType.colorName',
      'media.id',
      'media.fileName',
    ]);

    query.where('cdr.appId = :appId', { appId });
    query.where('companyDocument.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.entity) {
      query.andWhere('cdr.entity = :entity', { entity: params.entity });
    }

    if (params.entityId) {
      query.andWhere('cdr.entityId = :entityId', { entityId: params.entityId });
    }

    return await query.getMany();
  }

  // company documents methods

  async createOrUpdateCompanyDocument(
    dto: CreateCompanyDocumentDto,
  ): Promise<CompanyDocument> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;

    let companyDocument: CompanyDocument;

    if (dto.id) {
      const found = await this.companyDocumentRepo.findOne({
        where: { id: dto.id },
      });

      if (!found) {
        throw new NotFoundException(
          `CompanyDocument with ID ${dto.id} not found`,
        );
      }

      companyDocument = found;
      this.companyDocumentRepo.merge(companyDocument, dto);
    } else {
      companyDocument = this.companyDocumentRepo.create({
        ...dto,
      });
    }

    return await this.companyDocumentRepo.save(companyDocument);
  }

  async findAllCompanyDocuments(
    queryString: any,
  ): Promise<{ data: CompanyDocument[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query =
      this.companyDocumentRepo.createQueryBuilder('companyDocument');

    query.leftJoinAndSelect('companyDocument.documentType', 'documentType');
    query.leftJoinAndSelect(
      'companyDocument.documentRecords',
      'documentRecords',
    );
    query.leftJoinAndSelect('documentRecords.media', 'media');

    query.where('companyDocument.appId = :appId', { appId });
    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    if (params.search) {
      query.andWhere('companyDocument.documentName LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.documentTypeId) {
      query.andWhere('companyDocument.documentTypeId = :documentTypeId', {
        documentTypeId: params.documentTypeId,
      });
    }
    if (params.isActive !== undefined) {
      query.andWhere('companyDocument.isActive = :isActive', {
        isActive: params.isActive === 'true',
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  // find all documents without pagination

  async findAllCompanyDocumentsWithoutPagination(): Promise<CompanyDocument[]> {
    return await this.companyDocumentRepo.find();
  }

  async getCompanyDocumentById(id: number): Promise<CompanyDocument> {
    const companyDocument = await this.companyDocumentRepo.findOne({
      where: { id },
    });
    if (!companyDocument) {
      throw new NotFoundException(`CompanyDocument with ID ${id} not found`);
    }
    return companyDocument;
  }
  async deleteCompanyDocument(id: number): Promise<CompanyDocument> {
    const companyDocument = await this.getCompanyDocumentById(id);
    return await this.companyDocumentRepo.remove(companyDocument);
  }

  //active toogle

  async toggleCompanyDocumentActiveStatus(
    id: number,
  ): Promise<CompanyDocument> {
    const companyDocument = await this.getCompanyDocumentById(id);
    companyDocument.isActive = !companyDocument.isActive;
    return await this.companyDocumentRepo.save(companyDocument);
  }

  async importAllMasterDocumentsToCompanyDocuments(): Promise<number> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('Active App not found');
    }

    const masterDocs = await this.masterDocumentRepo.find({
      where: { isActive: true },
    });

    if (!masterDocs.length) return 0;

    const existingDocs = await this.companyDocumentRepo.find({
      where: { appId },
    });

    const existingNames = existingDocs.map((d) =>
      d.documentName?.toLowerCase(),
    );

    const newDocs = masterDocs
      .filter((m) => !existingNames.includes(m.documentName?.toLowerCase()))
      .map((m) =>
        this.companyDocumentRepo.create({
          appId,
          documentName: m.documentName,
          documentTypeId: m.documentTypeId,
          isActive: true,
        }),
      );

    if (newDocs.length) {
      await this.companyDocumentRepo.save(newDocs);
    }

    return newDocs.length;
  }

  async importSelectedMasterDocuments(
    dto: ImportMasterDocumentsDto,
  ): Promise<{ importedCount: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) throw new NotFoundException('App not found');

    const masterDocs = await this.masterDocumentRepo.findByIds(dto.ids);

    if (!masterDocs.length) return { importedCount: 0 };

    const existingDocs = await this.companyDocumentRepo.find({
      where: { appId },
    });

    const existingNames = existingDocs
      .filter((d) => d.isActive)
      .map((d) => d.documentName);

    const toInsert = masterDocs
      .filter((md) => !existingNames.includes(md.documentName))
      .map((md) =>
        this.companyDocumentRepo.create({
          appId,
          documentName: md.documentName,
          documentTypeId: md.documentTypeId,
          isActive: md.isActive,
        }),
      );

    if (!toInsert.length) return { importedCount: 0 };

    await this.companyDocumentRepo.save(toInsert);

    return { importedCount: toInsert.length };
  }

  async createCompanyDocumentRecords(
    dto: CreateCompanyDocRecordDto,
  ): Promise<CompanyDocumentRecords> {
    const appId = RequestContext.get('activeAppId');
    dto.appId = appId;
    const record = this.companyDocumentRecordsRepo.create(dto);
    return this.companyDocumentRecordsRepo.save(record);
  }

  async createOrUpdateUserCompanyDocumentRecords(
    dto: CreateCompanyDocRecordDto,
  ): Promise<CompanyDocumentRecords> {
    const userId = RequestContext.get('userId');
    dto.entityId = userId;
    dto.entity = 'users';

    if (dto.id) {
      await this.deleteCompanyDocumentRecord(dto.id);

      if (dto.documentFile) {
        const newMedia = await this.mediaService.uploadFile(dto.documentFile);
        dto.mediaId = newMedia.id;
      } else {
        throw new BadRequestException('No profile picture file uploaded');
      }

      return this.createCompanyDocumentRecords(dto);
    } else {
      if (dto.documentFile) {
        const newMedia = await this.mediaService.uploadFile(dto.documentFile);
        dto.mediaId = newMedia.id;
      } else {
        throw new BadRequestException('No document file uploaded');
      }

      return this.createCompanyDocumentRecords(dto);
    }
  }

  async updateUserCompanyDocumentRecords(
    dto: CreateCompanyDocRecordMultipleFilesDto,
  ): Promise<CompanyDocumentRecords[]> {
    const userId = RequestContext.get('userId');

    dto.entityId = userId;
    dto.entity = 'users';

    if (dto.companyDocumentId && dto.documentTypeId) {
      await this.companyDocumentRepo.update(
        { id: dto.companyDocumentId },
        {
          documentTypeId: dto.documentTypeId,
          issueDate: dto.issueDate,
          expiredDate: dto.expiredDate,
        },
      );
    }

    if (!dto.documentFiles?.length) {
      throw new BadRequestException('No document files uploaded');
    }

    const results: CompanyDocumentRecords[] = [];

    for (const file of dto.documentFiles) {
      const newMedia = await this.mediaService.uploadFile(file);

      const recordDto = {
        entity: dto.entity,
        entityId: dto.entityId,
        companyDocumentId: dto.companyDocumentId,
        mediaId: newMedia.id,
        appId: dto.appId,
      };

      const saved = await this.createCompanyDocumentRecords(recordDto);
      results.push(saved);
    }

    return results;
  }

  async createOrUpdateUserCompanyDocumentRecordsWithEmpId(
    dto: CreateCompanyDocRecordDto,
    empId: string,
  ): Promise<CompanyDocumentRecords> {
    // const userId = RequestContext.get('userId');

    const user = await this.employeeRepo.findOne({
      where: { id: Number(empId) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }
    if (user.userId) {
      dto.entityId = Number(user.userId);
      dto.entity = 'users';
    } else {
      dto.entityId = Number(user.id);
      dto.entity = 'employees';
    }

    if (dto.id) {
      await this.deleteCompanyDocumentRecord(dto.id);

      if (dto.documentFile) {
        const newMedia = await this.mediaService.uploadFile(dto.documentFile);
        dto.mediaId = newMedia.id;
      } else {
        throw new BadRequestException('No profile picture file uploaded');
      }

      return this.createCompanyDocumentRecords(dto);
    } else {
      if (dto.documentFile) {
        const newMedia = await this.mediaService.uploadFile(dto.documentFile);
        dto.mediaId = newMedia.id;
      } else {
        throw new BadRequestException('No document file uploaded');
      }

      return this.createCompanyDocumentRecords(dto);
    }
  }

  async findUserAllCompanyDocumentRecords(queryString: any): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    const findEmployee = await this.employeeRepo.findOne({
      where: { userId },
    });

    const query = this.companyDocumentRecordsRepo.createQueryBuilder('cdr');

    query.leftJoinAndSelect('cdr.companyDocument', 'companyDocument');
    query.leftJoinAndSelect('companyDocument.documentType', 'documentType');
    query.leftJoinAndSelect('cdr.media', 'media');

    if (findEmployee?.id) {
      query.where(
        '((cdr.entity = :userEntity AND cdr.entityId = :userId) OR (cdr.entity = :empEntity AND cdr.entityId = :employeeId))',
        {
          userEntity: 'users',
          userId: userId,
          empEntity: 'employees',
          employeeId: findEmployee.id,
        },
      );
    } else {
      query.where('(cdr.entity = :userEntity AND cdr.entityId = :userId)', {
        userEntity: 'users',
        userId: userId,
      });
    }

    if (appId) {
      query.andWhere('cdr.appId = :appId', { appId });
    }

    return await query.getMany();
  }

  async getEmployeeAllCompanyDocumentRecords(
    employeeId: number,
  ): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    const findEmployee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!findEmployee) return [];

    const query = this.companyDocumentRecordsRepo.createQueryBuilder('cdr');

    query.leftJoinAndSelect('cdr.companyDocument', 'companyDocument');
    query.leftJoinAndSelect('companyDocument.documentType', 'documentType');
    query.leftJoinAndSelect('cdr.media', 'media');

    if (findEmployee?.userId) {
      query.where(
        '((cdr.entity = :userEntity AND cdr.entityId = :userId) OR (cdr.entity = :empEntity AND cdr.entityId = :employeeId))',
        {
          userEntity: 'users',
          userId: findEmployee.userId,
          empEntity: 'employees',
          employeeId: employeeId,
        },
      );
    } else {
      query.where(
        '(cdr.entity = :empEntity AND cdr.entityId = :employeeId)',
        {
          empEntity: 'employees',
          employeeId: employeeId,
        },
      );
    }

    if (appId) {
      query.andWhere('cdr.appId = :appId', { appId });
    }

    return await query.getMany();
  }

  async deleteCompanyDocumentRecord(id: number): Promise<void> {
    const findItem = await this.companyDocumentRecordsRepo.findOne({
      where: { id },
    });

    if (!findItem) {
      throw new BadRequestException('Company document record not found');
    }

    if (findItem.mediaId) {
      await this.mediaService.deleteFile(findItem.mediaId);
    }

    const result = await this.companyDocumentRecordsRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Company document record not found');
    }
  }

  async updateEmployeeOfficeInfo(
    empId: number,
    dto: UpdateEmployeeOfficeInfoDto,
  ): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    if (dto.officeId === undefined && dto.officeShiftId === undefined) {
      throw new BadRequestException('No fields provided to update');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (dto.officeId !== undefined) {
      const office = await this.officeRepo.findOne({
        where: { id: dto.officeId, appId },
      });

      if (!office) {
        throw new NotFoundException(`Office with ID ${dto.officeId} not found`);
      }

      employee.officeId = dto.officeId;
    }

    if (dto.officeShiftId !== undefined) {
      const shift = await this.officeShiftRepo.findOne({
        where: { id: dto.officeShiftId },
      });

      if (!shift) {
        throw new NotFoundException(
          `Office Shift with ID ${dto.officeShiftId} not found`,
        );
      }

      employee.officeShiftId = dto.officeShiftId;
    }

    const saved = await this.employeeRepo.save(employee);

    return {
      id: saved.id,
      officeId: saved.officeId,
      officeShiftId: saved.officeShiftId,
    };
  }

  async getEmployeeAssets(employeeId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');
    const normalizedEmployeeId = Number(employeeId);

    if (!Number.isFinite(normalizedEmployeeId) || normalizedEmployeeId <= 0) {
      throw new BadRequestException('Valid employee id is required');
    }

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: normalizedEmployeeId, appId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${normalizedEmployeeId} not found`,
      );
    }

    const assets = await this.employeeAssetRepo
      .createQueryBuilder('asset')
      .leftJoin('asset.assetType', 'assetType')
      .leftJoin('asset.assetStatus', 'assetStatus')
      .addSelect([
        'assetType.id',
        'assetType.name',

        'assetStatus.id',
        'assetStatus.name',
        'assetStatus.code',
        'assetStatus.colorName',
      ])
      .where('asset.employee_id = :employeeId', {
        employeeId: normalizedEmployeeId,
      })
      .andWhere('asset.app_id = :appId', { appId })
      .orderBy('asset.created_at', 'DESC')
      .getMany();

    return assets;
  }

  async getMyAssets(): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    if (!userId) {
      throw new BadRequestException('user id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    const assets = await this.employeeAssetRepo
      .createQueryBuilder('asset')
      .leftJoin('asset.assetType', 'assetType')
      .leftJoin('asset.assetStatus', 'assetStatus')
      .addSelect([
        'assetType.id',
        'assetType.name',

        'assetStatus.id',
        'assetStatus.name',
        'assetStatus.code',
        'assetStatus.colorName',
      ])
      .where('asset.employeeId = :employeeId', { employeeId: employee.id })
      .andWhere('asset.appId = :appId', { appId })
      .orderBy('asset.createdAt', 'DESC')
      .getMany();

    return assets.map((a) => ({
      ...a,
      isRefundable: Boolean(a.isRefundable),
      refundable: Boolean(a.isRefundable),
    }));
  }

  async getEmployeeWorkExperiences(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const workExperiences = await this.userWorkExperienceRepo
      .createQueryBuilder('uwe')
      .leftJoin('uwe.address', 'address')
      .addSelect([
        'uwe.id',
        'uwe.userId',
        'uwe.jobTitle',
        'uwe.companyName',
        'uwe.responsibility',
        'uwe.startDate',
        'uwe.endDate',
        'uwe.isCurrent',
        'uwe.createdAt',

        'address.id',
        'address.module',
        'address.addressType',
        'address.phone',
        'address.email',
        'address.city',
        'address.postalCode',
        'address.timezone',
      ])
      .where('uwe.userId = :userId', { userId: employee.userId })
      .orderBy('uwe.isCurrent', 'DESC')
      .addOrderBy('uwe.startDate', 'DESC')
      .getMany();

    return workExperiences;
  }

  async getEmployeeEducations(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const educations = await this.userEducationRepo
      .createQueryBuilder('edu')
      .leftJoin('edu.instituteCountry', 'country')
      .leftJoin('edu.educationLevel', 'educationLevel')
      .leftJoin('edu.group', 'group')
      .leftJoin('edu.resultType', 'resultType')
      .addSelect([
        'edu.id',
        'edu.userId',
        'edu.instituteName',
        'edu.isForeignInstitute',
        'edu.instituteCountryId',

        'country.id',
        'country.capital',
        'country.citizenship',
        'country.countryCode',
        'country.currency',
        'country.currencySubUnit',
        'country.name',
        'country.fullName',

        'edu.educationLevelId',
        'educationLevel.id',
        'educationLevel.name',
        'educationLevel.code',
        'educationLevel.colorName',
        'edu.groupId',
        'group.id',
        'group.name',
        'group.code',
        'group.colorName',
        'edu.duration',
        'edu.isCurrent',
        'edu.yearOfPassing',
        'edu.resultTypeId',
        'resultType.id',
        'resultType.name',
        'resultType.code',
        'resultType.colorName',
        'edu.result',
        'edu.serial',
        'edu.createdAt',
      ])
      .where('edu.userId = :userId', { userId: employee.userId })
      .orderBy('edu.serial', 'ASC')
      .addOrderBy('edu.createdAt', 'DESC')
      .getMany();

    return educations;
  }

  // async getEmployeeCertifications(empId: number): Promise<any[]> {
  //   const appId = RequestContext.get('activeAppId');
  //
  //   if (!appId) {
  //     throw new BadRequestException('app id not found');
  //   }
  //
  //   const employee = await this.employeeRepo.findOne({
  //     where: { id: empId, appId },
  //     select: ['id', 'userId', 'appId'],
  //   });
  //
  //   if (!employee) {
  //     throw new NotFoundException(`Employee with ID ${empId} not found`);
  //   }
  //
  //   if (!employee.userId) {
  //     throw new NotFoundException(`No user with employee ID ${empId}`);
  //   }
  //
  //   // const certifications = await this.certificationRepo
  //   //   .createQueryBuilder('certificate')
  //   //   .leftJoin('certificate.attachmentMedia', 'attachmentMedia')
  //   //   .where('certificate.userId = :userId', { userId: employee.userId })
  //   //   .orderBy('certificate.name', 'ASC')
  //   //   .getMany();
  //
  //   const certifications = await this.certificationRepo.query(
  //     `
  //       SELECT uc.*, am.*
  //       FROM user_certifications AS uc
  //              LEFT JOIN aws_media am
  //                        ON am.id = uc.attachment_id
  //       WHERE uc.user_id = ?
  //       ORDER BY uc.name ASC
  //     `,
  //     [employee.userId],
  //   );
  //
  //   const result = certifications.map((item: any) => ({
  //     ...item,
  //     fileUrl: item.filename
  //       ? `${process.env.ASSETS_URL}/static/${item.folder_path}/${item.filename}`
  //       : null,
  //   }));
  //   return result;
  // }

  async getEmployeeCertifications(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const rows = await this.certificationRepo
      .createQueryBuilder('uc')
      .innerJoin('employees', 'e', 'e.user_id = uc.user_id')
      .leftJoin('aws_media', 'am', 'am.id = uc.attachment_id')
      .select([
        'uc.id AS id',
        'uc.name AS name',
        'uc.issuing_organization AS issuingOrganization',
        'uc.issue_date AS issueDate',
        'uc.expiration_date AS expirationDate',
        'am.filename AS filename',
        'am.folder_path AS folderPath',
      ])
      .where('e.id = :empId', { empId })
      .andWhere('e.app_id = :appId', { appId })
      .orderBy('uc.name', 'ASC')
      .getRawMany();

    if (!rows.length) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    const baseUrl = process.env.ASSETS_URL;

    for (const item of rows) {
      item.issueDate = item.issueDate
        ? item.issueDate.toISOString().split('T')[0]
        : null;
      item.expirationDate = item.expirationDate
        ? item.expirationDate.toISOString().split('T')[0]
        : null;

      item.fileUrl =
        item.filename && item.folderPath
          ? `${baseUrl}/static/${item.folderPath}/${item.filename}`
          : null;
    }

    return rows;
  }

  async getEmployeeSkills(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const skills = await this.userSkillRepo
      .createQueryBuilder('skill')
      .where('skill.userId = :userId', { userId: employee.userId })
      .orderBy('skill.skillName', 'ASC')
      .getMany();

    return skills;
  }

  async getEmployeeProjects(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const projects = await this.userProjectRepo
      .createQueryBuilder('project')
      .where('project.userId = :userId', { userId: employee.userId })
      .orderBy('project.projectName', 'ASC')
      .getMany();

    return projects;
  }

  async getEmployeeTraining(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const trainings = await this.userTrainingRepo
      .createQueryBuilder('training')
      .where('training.userId = :userId', { userId: employee.userId })
      .andWhere('training.statusId IS NULL')
      .orderBy('training.name', 'ASC')
      .getMany();

    return trainings;
  }

  async getEmployeeReferences(empId: number): Promise<any[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const references = await this.userReferenceRepo
      .createQueryBuilder('reference')
      .where('reference.userId = :userId', { userId: employee.userId })
      .orderBy('reference.name', 'ASC')
      .getMany();

    return references;
  }

  async getEmployeeDetails(empId: number): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const qb = this.employeeRepo.createQueryBuilder('employee');

    qb.leftJoin('employee.office', 'office');
    qb.leftJoin('employee.designation', 'designation');
    qb.leftJoin('designation.department', 'department');

    qb.leftJoin('employee.user', 'user');
    qb.leftJoin('user.profile', 'profile');

    qb.leftJoin('user.userLanguageProficiencies', 'langProf');

    qb.leftJoin('countries', 'lang', 'lang.id = langProf.language_id');
    qb.leftJoin('statuses', 'speak', 'speak.id = langProf.speaking_level_id');
    qb.leftJoin('statuses', 'read', 'read.id = langProf.reading_level_id');
    qb.leftJoin('statuses', 'write', 'write.id = langProf.writing_level_id');

    qb.leftJoin('profile.phoneCountry', 'phoneCountry');
    qb.leftJoin('profile.country', 'nationalityCountry');

    qb.leftJoin(
      'user_contact_infos',
      'contactInfo',
      'contactInfo.user_id = user.id',
    );

    qb.leftJoin(
      'statuses',
      'bloodGroup',
      'bloodGroup.id = profile.bloodGroupId',
    );
    qb.leftJoin(
      'statuses',
      'maritalStatus',
      'maritalStatus.id = profile.maritalStatusId',
    );
    qb.leftJoin('statuses', 'religion', 'religion.id = profile.religionId');

    qb.addSelect([
      'employee.id',
      'employee.employeeCode',
      'employee.joiningDate',

      'office.id',
      'office.name',

      'designation.id',
      'designation.name',
      'department.id',
      'department.name',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',

      'profile.id',
      'profile.userId',
      'profile.fathersName',
      'profile.mothersName',
      'profile.dateOfBirth',
      'profile.nidNumber',
      'profile.passportNumber',
      'profile.gender',
      'profile.phone',
      'profile.countryId',
      'profile.bloodGroupId',
      'profile.maritalStatusId',
      'profile.religionId',

      'phoneCountry.id',
      'phoneCountry.callingCode',

      'nationalityCountry.id',
      'nationalityCountry.name',
      'nationalityCountry.citizenship',

      'contactInfo.id',
      'contactInfo.mobilePersonal',
      'contactInfo.mobileWork',
      'contactInfo.telephone',
      'contactInfo.emailPersonal',
      'contactInfo.emailOfficial',
      'contactInfo.emergencyContactPerson',
      'contactInfo.emergencyContactNumber',
      'contactInfo.presentAddress',
      'contactInfo.permanentAddress',

      'bloodGroup.id',
      'bloodGroup.name',
      'bloodGroup.code',
      'bloodGroup.colorName',

      'maritalStatus.id',
      'maritalStatus.name',
      'maritalStatus.code',
      'maritalStatus.colorName',

      'religion.id',
      'religion.name',
      'religion.code',
      'religion.colorName',

      'langProf.id',
      'lang.id',
      'lang.language',
      'speak.id',
      'speak.name',
      'read.id',
      'read.name',
      'write.id',
      'write.name',
    ]);

    qb.where('employee.id = :empId', { empId });
    qb.andWhere('employee.appId = :appId', { appId });

    const employee = await qb.getOne();
    const rawRows = await qb.getRawMany();
    const row = rawRows[0];

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    const profs = employee.user?.userLanguageProficiencies ?? [];

    const languageTable = (rawRows ?? [])
      .filter((r) => r.langProf_id) // only rows having a proficiency
      .map((r, idx) => ({
        sl: idx + 1,
        languageId: r.lang_id ?? null,
        language: r.lang_language ?? null,
        speakingLevelId: r.speak_id ?? null,
        speaking: r.speak_name ?? null,
        readingLevelId: r.read_id ?? null,
        reading: r.read_name ?? null,
        writingLevelId: r.write_id ?? null,
        writing: r.write_name ?? null,
      }));

    return {
      employeeSummary: {
        employeeCode: employee.employeeCode ?? null,
        branch: employee.office?.name ?? null,
        department: employee.designation?.department?.name ?? null,
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split('T')[0]
          : null,
      },

      personalInformation: {
        firstName: employee.user?.firstName ?? null,
        lastName: employee.user?.lastName ?? null,
        name: employee.user
          ? `${employee.user.firstName} ${employee.user.lastName}`
          : null,
        fathersName: employee.user?.profile?.fathersName ?? null,
        mothersName: employee.user?.profile?.mothersName ?? null,
        dateOfBirth: employee.user?.profile?.dateOfBirth
          ? new Date(employee.user.profile.dateOfBirth)
              .toISOString()
              .split('T')[0]
          : null,
        nidNumber: employee.user?.profile?.nidNumber ?? null,
        passportNumber: employee.user?.profile?.passportNumber ?? null,
        countryId: employee.user?.profile?.countryId ?? null,
        nationality: row.nationalityCountry_citizenship ?? null,
        gender: employee.user?.profile?.gender ?? null,
        bloodGroupId: row.bloodGroup_id ?? null,
        bloodGroup: row.bloodGroup_name ?? null,
        maritalStatusId: row.maritalStatus_id ?? null,
        maritalStatus: row.maritalStatus_name ?? null,
        religionId: row.religion_id ?? null,
        religion: row.religion_name ?? null,
      },

      contactInformation: {
        mobileNumberPersonal: row.contactInfo_mobile_personal ?? null,
        mobileWork: row.contactInfo_mobile_work ?? null,
        telephone: row.contactInfo_telephone ?? null,
        emailPersonal: row.contactInfo_email_personal ?? null,
        emailOfficial: row.contactInfo_email_official ?? row.user_email ?? null,
        emergencyContactPerson:
          row.contactInfo_emergency_contact_person ?? null,
        emergencyContactNumber:
          row.contactInfo_emergency_contact_number ?? null,
        presentAddress: row.contactInfo_present_address ?? null,
        permanentAddress: row.contactInfo_permanent_address ?? null,
      },

      languageTable,
    };
  }

  async updateEmployeeDetails(
    empId: number,
    dto: UpdateEmployeeDetailsDto,
  ): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: [
        'id',
        'appId',
        'userId',
        'officeId',
        'designationId',
        'joiningDate',
      ],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(
        `Employee with ID ${empId} has no linked user`,
      );
    }

    const userId = employee.userId;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.personalInformation?.firstName !== undefined) {
      user.firstName = dto.personalInformation.firstName;
    }
    if (dto.personalInformation?.lastName !== undefined) {
      user.lastName = dto.personalInformation.lastName;
    }
    await this.userRepository.save(user);

    if (dto.employeeSummary?.branchId !== undefined) {
      employee.officeId = dto.employeeSummary.branchId;
    }
    if (dto.employeeSummary?.designationId !== undefined) {
      employee.designationId = dto.employeeSummary.designationId;
    }
    if (dto.employeeSummary?.joiningDate !== undefined) {
      employee.joiningDate = dto.employeeSummary.joiningDate
        ? new Date(dto.employeeSummary.joiningDate)
        : null;
    }
    await this.employeeRepo.save(employee);

    let profile = await this.userProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = await this.userProfileRepo.save({ userId });
    }

    const p = dto.personalInformation;

    if (p) {
      if (p.fathersName !== undefined)
        profile.fathersName = p.fathersName ?? null;
      if (p.mothersName !== undefined)
        profile.mothersName = p.mothersName ?? null;
      if (p.dateOfBirth !== undefined)
        profile.dateOfBirth = p.dateOfBirth ? new Date(p.dateOfBirth) : null;

      if (p.nidNumber !== undefined) profile.nidNumber = p.nidNumber ?? null;
      if (p.passportNumber !== undefined)
        profile.passportNumber = p.passportNumber ?? null;

      if (p.gender !== undefined) profile.gender = p.gender ?? null;

      if (p.countryId !== undefined) profile.countryId = p.countryId ?? null;

      if (p.bloodGroupId !== undefined)
        profile.bloodGroupId = p.bloodGroupId ?? null;
      if (p.maritalStatusId !== undefined)
        profile.maritalStatusId = p.maritalStatusId ?? null;
      if (p.religionId !== undefined) profile.religionId = p.religionId ?? null;

      if (p.phoneCountryId !== undefined)
        profile.phoneCountryId = p.phoneCountryId ?? null;
      if (p.phone !== undefined) profile.phone = p.phone ?? null;
    }

    await this.userProfileRepo.save(profile);

    let contactInfo = await this.userContactInfoRepo.findOne({
      where: { userId },
    });

    if (!contactInfo) {
      contactInfo = this.userContactInfoRepo.create({ userId });
    }

    const c = dto.contactInformation;
    if (c) {
      if (c.mobileNumberPersonal !== undefined)
        contactInfo.mobilePersonal = c.mobileNumberPersonal ?? null;
      if (c.mobileWork !== undefined)
        contactInfo.mobileWork = c.mobileWork ?? null;
      if (c.telephone !== undefined)
        contactInfo.telephone = c.telephone ?? null;
      if (c.emailPersonal !== undefined)
        contactInfo.emailPersonal = c.emailPersonal ?? null;
      if (c.emailOfficial !== undefined)
        contactInfo.emailOfficial = c.emailOfficial ?? null;
      if (c.emergencyContactPerson !== undefined)
        contactInfo.emergencyContactPerson = c.emergencyContactPerson ?? null;
      if (c.emergencyContactNumber !== undefined)
        contactInfo.emergencyContactNumber = c.emergencyContactNumber ?? null;
      if (c.presentAddress !== undefined)
        contactInfo.presentAddress = c.presentAddress ?? null;
      if (c.permanentAddress !== undefined)
        contactInfo.permanentAddress = c.permanentAddress ?? null;
    }

    await this.userContactInfoRepo.save(contactInfo);

    if (dto.languageTable) {
      const existing = await this.userLanguageProficiencyRepo.find({
        where: { userId },
      });
      if (existing.length > 0) {
        await this.userLanguageProficiencyRepo.remove(existing);
      }

      if (dto.languageTable.length > 0) {
        for (const prof of dto.languageTable ?? []) {
          if (
            typeof prof.languageId !== 'number' ||
            typeof prof.speakingLevelId !== 'number' ||
            typeof prof.readingLevelId !== 'number' ||
            typeof prof.writingLevelId !== 'number'
          ) {
            throw new BadRequestException(
              'Invalid languageTable entry: languageId, speakingLevelId, readingLevelId and writingLevelId are required and must be numbers.',
            );
          }

          const lp = new UserLanguageProficiency();
          lp.userId = userId;
          lp.languageId = prof.languageId;
          lp.speakingLevelId = prof.speakingLevelId;
          lp.readingLevelId = prof.readingLevelId;
          lp.writingLevelId = prof.writingLevelId;
          await this.userLanguageProficiencyRepo.save(lp);
        }
      }
    }

    return this.getEmployeeDetails(empId);
  }

  async updateEmployeePersonalInformation(
    employeeId: number,
    userBasicInfoDto: UpdateUserPersonalInfoDto,
  ) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      select: ['id', 'userId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} has no linked user`,
      );
    }

    const userId = employee.userId;

    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (userBasicInfoDto.firstName !== undefined) {
      existingUser.firstName = userBasicInfoDto.firstName;
    }
    if (userBasicInfoDto.lastName !== undefined) {
      existingUser.lastName = userBasicInfoDto.lastName;
    }
    await this.userRepository.save(existingUser);

    let existingUserProfile = await this.userProfileRepo.findOne({
      where: { userId: userId },
    });

    if (!existingUserProfile) {
      existingUserProfile = await this.userProfileRepo.save({
        userId: userId,
      });
    }

    const existingUserLanguageProficiencies =
      await this.userLanguageProficiencyRepo.find({
        where: { userId: userId },
      });

    if (existingUserLanguageProficiencies.length > 0) {
      await this.userLanguageProficiencyRepo.remove(
        existingUserLanguageProficiencies,
      );
    }

    if (
      userBasicInfoDto.userLanguageProficiencies &&
      userBasicInfoDto.userLanguageProficiencies.length > 0
    ) {
      for (const proficiency of userBasicInfoDto.userLanguageProficiencies) {
        const userLanguageProficiency = new UserLanguageProficiency();

        userLanguageProficiency.userId = userId;
        userLanguageProficiency.languageId = proficiency.languageId;
        userLanguageProficiency.speakingLevelId = proficiency.speakingLevelId;
        userLanguageProficiency.readingLevelId = proficiency.readingLevelId;
        userLanguageProficiency.writingLevelId = proficiency.writingLevelId;

        await this.userLanguageProficiencyRepo.save(userLanguageProficiency);
      }
    }

    existingUserProfile.bloodGroupId = userBasicInfoDto.bloodGroupId
      ? userBasicInfoDto.bloodGroupId
      : null;

    existingUserProfile.countryId = userBasicInfoDto.countryId
      ? userBasicInfoDto.countryId
      : null;

    existingUserProfile.fathersName = userBasicInfoDto.fathersName
      ? userBasicInfoDto.fathersName
      : null;

    existingUserProfile.mothersName = userBasicInfoDto.mothersName
      ? userBasicInfoDto.mothersName
      : null;

    existingUserProfile.gender = userBasicInfoDto.gender
      ? userBasicInfoDto.gender
      : null;

    existingUserProfile.nidNumber = userBasicInfoDto.nidNumber
      ? userBasicInfoDto.nidNumber
      : null;

    existingUserProfile.passportNumber = userBasicInfoDto.passportNumber
      ? userBasicInfoDto.passportNumber
      : null;

    existingUserProfile.dateOfBirth = userBasicInfoDto.dateOfBirth
      ? new Date(userBasicInfoDto.dateOfBirth)
      : null;

    existingUserProfile.phoneCountryId = userBasicInfoDto.phoneCountryId
      ? userBasicInfoDto.phoneCountryId
      : null;

    existingUserProfile.phone = userBasicInfoDto.phone ?? null;

    existingUserProfile.presentAddressId =
      userBasicInfoDto.presentAddressId ?? null;

    existingUserProfile.permanentAddressId =
      userBasicInfoDto.permanentAddressId ?? null;

    if (userBasicInfoDto.religionId) {
      existingUserProfile.religionId = userBasicInfoDto.religionId;
    }

    if (userBasicInfoDto.maritalStatusId) {
      existingUserProfile.maritalStatusId = userBasicInfoDto.maritalStatusId;
    }

    return this.userProfileRepo.save(existingUserProfile);
  }

  async updateMyPersonalInformation(
    userId: number,
    userBasicInfoDto: UpdateUserPersonalInfoDto,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User not found`);
    }

    if (userBasicInfoDto.firstName !== undefined) {
      existingUser.firstName = userBasicInfoDto.firstName;
    }
    if (userBasicInfoDto.lastName !== undefined) {
      existingUser.lastName = userBasicInfoDto.lastName;
    }
    await this.userRepository.save(existingUser);

    let existingUserProfile = await this.userProfileRepo.findOne({
      where: { userId: userId },
    });

    if (!existingUserProfile) {
      existingUserProfile = await this.userProfileRepo.save({
        userId: userId,
      });
    }

    const existingUserLanguageProficiencies =
      await this.userLanguageProficiencyRepo.find({
        where: { userId: userId },
      });

    if (existingUserLanguageProficiencies.length > 0) {
      await this.userLanguageProficiencyRepo.remove(
        existingUserLanguageProficiencies,
      );
    }

    if (
      userBasicInfoDto.userLanguageProficiencies &&
      userBasicInfoDto.userLanguageProficiencies.length > 0
    ) {
      for (const proficiency of userBasicInfoDto.userLanguageProficiencies) {
        await this.userLanguageProficiencyRepo.save({
          userId: userId,
          languageId: proficiency.languageId,
          speakingLevelId: proficiency.speakingLevelId,
          readingLevelId: proficiency.readingLevelId,
          writingLevelId: proficiency.writingLevelId,
        });
      }
    }

    existingUserProfile.bloodGroupId = userBasicInfoDto.bloodGroupId ?? null;
    existingUserProfile.countryId = userBasicInfoDto.countryId ?? null;
    existingUserProfile.fathersName = userBasicInfoDto.fathersName ?? null;
    existingUserProfile.mothersName = userBasicInfoDto.mothersName ?? null;
    existingUserProfile.gender = userBasicInfoDto.gender ?? null;
    existingUserProfile.nidNumber = userBasicInfoDto.nidNumber ?? null;
    existingUserProfile.passportNumber =
      userBasicInfoDto.passportNumber ?? null;
    existingUserProfile.dateOfBirth = userBasicInfoDto.dateOfBirth
      ? new Date(userBasicInfoDto.dateOfBirth)
      : null;
    existingUserProfile.phoneCountryId =
      userBasicInfoDto.phoneCountryId ?? null;
    existingUserProfile.phone = userBasicInfoDto.phone ?? null;
    existingUserProfile.presentAddressId =
      userBasicInfoDto.presentAddressId ?? null;
    existingUserProfile.permanentAddressId =
      userBasicInfoDto.permanentAddressId ?? null;
    existingUserProfile.religionId = userBasicInfoDto.religionId ?? null;
    existingUserProfile.maritalStatusId =
      userBasicInfoDto.maritalStatusId ?? null;

    return this.userProfileRepo.save(existingUserProfile);
  }

  async updateEmployeeProfilePicture(
    employeeId: number,
    profilePic: Express.Multer.File,
  ) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      select: ['id', 'userId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} has no linked user`,
      );
    }

    let existingUserProfile = await this.userProfileRepo.findOne({
      where: { userId: employee.userId },
    });

    if (!existingUserProfile) {
      existingUserProfile = await this.userProfileRepo.save({
        userId: employee.userId,
      });
    }

    if (profilePic) {
      const newMedia = await this.mediaService.uploadFile(profilePic);

      if (existingUserProfile.profilePictureId) {
        await this.mediaService.deleteFile(
          existingUserProfile.profilePictureId,
        );
      }

      existingUserProfile.profilePicture = newMedia;

      return this.userProfileRepo.save(existingUserProfile);
    } else {
      throw new BadRequestException('No profile picture file uploaded');
    }
  }

  async getLoggedInEmployeeSummary(): Promise<any> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId) throw new BadRequestException('app id not found');
    if (!userId) throw new BadRequestException('user id not found');

    const qb = this.employeeRepo.createQueryBuilder('employee');

    qb.leftJoin('employee.user', 'user');
    qb.leftJoin('employee.office', 'office');
    qb.leftJoin('employee.designation', 'designation');
    qb.leftJoin('designation.department', 'department');
    qb.leftJoin('employee.officeShift', 'officeShift');
    qb.leftJoin('employee.currentGrade', 'currentGrade');

    qb.select([
      'employee.id',
      'employee.employeeCode',
      'employee.joiningDate',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',

      'office.id',
      'office.name',

      'designation.id',
      'department.id',
      'department.name',

      'officeShift.id',
      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',

      'currentGrade.id',
      'currentGrade.gradeName',
      'currentGrade.gradeCode',
    ]);

    qb.where('employee.userId = :userId', { userId });
    qb.andWhere('employee.appId = :appId', { appId });

    const employee = await qb.getOne();

    if (!employee) throw new NotFoundException('Employee not found');

    return {
      id: employee.id,
      employeeId: employee.id,
      employeeSummary: {
        id: employee.id,
        employeeCode: employee.employeeCode ?? null,
        name: employee.user
          ? `${employee.user.firstName} ${employee.user.lastName}`
          : null,
        email: employee.user?.email ?? null,
        branch: employee.office?.name ?? null,
        department: employee.designation?.department?.name ?? null,
        currentGrade: employee.currentGrade
          ? {
              id: employee.currentGrade.id,
              gradeName: employee.currentGrade.gradeName,
              gradeCode: employee.currentGrade.gradeCode,
            }
          : null,
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split('T')[0]
          : null,
      },

      officeShift: {
        id: employee.officeShift?.id ?? null,
        name: employee.officeShift?.name ?? null,
        startTime: employee.officeShift?.startTime ?? null,
        endTime: employee.officeShift?.endTime ?? null,
      },
    };
  }

  async findAllEmployeeHierarchiesWithSubordinates(): Promise<{
    supervisors: EmployeeHierarchy[];
    subordinates: EmployeeHierarchy[];
  }> {
    const userId = RequestContext.get('userId');
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
      select: ['id'],
    });

    if (!employee) {
      return {
        supervisors: [],
        subordinates: [],
      };
    }

    const query = this.employeeHierarchyRepo
      .createQueryBuilder('employeeHierarchy')
      .leftJoin('employeeHierarchy.employee', 'employee')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('designation.department', 'department')
      .leftJoin('employeeHierarchy.supervisor', 'supervisor')
      .leftJoin('supervisor.designation', 'supervisorDesignation')
      .leftJoin('supervisorDesignation.department', 'supervisorDepartment')
      .leftJoin('supervisor.user', 'supervisorUser')
      .leftJoin('supervisorUser.profile', 'supervisorProfile')
      .leftJoin('supervisorProfile.profilePicture', 'supervisorProfilePicture')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .addSelect([
        'employeeHierarchy.startDate',
        'employeeHierarchy.endDate',
        'employee.id',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isActive',

        'profile.id',
        'profile.phoneCountryId',
        'profile.phone',
        'profile.gender',
        'profilePicture.id',
        'profilePicture.filename',

        'designation.id',
        'designation.name',
        'designation.level',

        'department.id',
        'department.name',
        'department.description',

        'supervisor.id',
        'supervisorUser.id',
        'supervisorUser.firstName',
        'supervisorUser.lastName',
        'supervisorUser.email',
        'supervisorUser.isActive',
        'supervisorProfile.id',
        'supervisorProfile.phoneCountryId',
        'supervisorProfile.phone',
        'supervisorProfile.gender',
        'supervisorProfilePicture.id',
        'supervisorProfilePicture.filename',

        'supervisorDesignation.id',
        'supervisorDesignation.name',
        'supervisorDesignation.level',

        'supervisorDepartment.id',
        'supervisorDepartment.name',
        'supervisorDepartment.description',
      ])
      .orderBy('employeeHierarchy.startDate', 'DESC')
      .addOrderBy('employeeHierarchy.endDate', 'DESC');

    const supervisors = await query
      .clone()
      .andWhere('employeeHierarchy.empId = :empId', { empId: employee.id })
      .getMany();

    const subordinates = await query
      .clone()
      .andWhere('employeeHierarchy.supervisorId = :supervisorId', {
        supervisorId: employee.id,
      })
      .getMany();

    return {
      supervisors,
      subordinates,
    };
  }

  async deleteCompanyDocumentRecords(id: number): Promise<any> {
    const userId = RequestContext.get('userId');

    const record = await this.companyDocumentRecordsRepo.findOne({
      where: {
        id,
      },
    });

    if (!record) {
      throw new NotFoundException('Company document record not found');
    }

    if (record.mediaId) {
      await this.mediaService.deleteFile(record.mediaId);
    }

    await this.companyDocumentRecordsRepo.delete({ id });

    return { id };
  }

  async deleteByCompanyDocument(companyDocumentId: number): Promise<any> {
    const userId = RequestContext.get('userId');

    const records = await this.companyDocumentRecordsRepo.find({
      where: {
        companyDocumentId,
      },
    });

    if (!records.length) {
      throw new NotFoundException('No records found');
    }

    for (const record of records) {
      if (record.mediaId) {
        await this.mediaService.deleteFile(record.mediaId);
      }
    }

    await this.companyDocumentRecordsRepo.delete({
      companyDocumentId,
    });

    return { deletedCount: records.length };
  }
}
