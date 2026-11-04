import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrManagementService } from './hr-management.service';
import { HrManagementController } from './hr-management.controller';
import { Office } from './entities/office.entity';
import { AuthModule } from '@module/auth/auth.module';
import { OfficeShift } from './entities/office-shift.entity';
import { OfficeWeekend } from './entities/office-weekends.entity';
import { JobScreening } from './entities/job-screenings.entity';
import { JobPosting } from './entities/job-posting.entity';
import { JobPosition } from './entities/job-position.entity';
import { JobApplicantScreening } from './entities/job-applicant-screening.entity';
import { JobApplicant } from './entities/job-applicant.entity';
import { JobOffer } from './entities/job-offer.entity';
import { JobScreeningMap } from './entities/job-screenings-map.entity';
import { JobInterview } from './entities/job-interviews.entity';
import { JobInterviewer } from './entities/job-interviewers.entity';
import { JobInterviewFeedback } from './entities/job-interview-feedback.entity';
import { Status } from '@module/status/entities/status.entity';
import { LeadGroups } from './entities/lead-groups.entity';
import { LeadStage } from './entities/lead-stages.entity';
import { PersonalNote } from './entities/personal-notes.entity';
import { Notice } from './entities/notices.entity';
import { Employee } from './entities/employees.entity';
import { EmpLeaveType } from './entities/employee-leaves-type.entity';
import { EmpLeaveRequest } from './entities/employee-leave-request.entity';
import { EmpInvitation } from './entities/employee-invitations.entity';
import { EmpAttendance } from './entities/employee-attendance.entity';
import { AppConstants } from '@common/constants/constants';
import { AppUser } from '@module/users/entities/app-user.entity';
import { AddressModule } from '@module/address/address.module';
import { Requisition } from './entities/requisitions.entity';
import { Department } from '@module/application/entities/departments.entity';
import { Designation } from '@module/application/entities/designations.entity';
import { Address } from '@module/address/entities/address.entity';
import { EmployeeAsset } from './entities/employee-assets.entity';
import { AssetType } from './entities/asset-types.entity';
import { CompanyAssetType } from './entities/company-asset-types.entity';
import { LeadPipeline } from './entities/lead-pipelines.entity';
import { Leads } from './entities/leads.entity';
import { UsersService } from '@module/users/users.service';
import { UsersModule } from '@module/users/users.module';
import { CacheService } from 'src/redis/cache.service';
import Mail from 'nodemailer/lib/mailer';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';
import { HybridQueueModule } from 'src/queue/hybrid-queue.module';
import { MediaModule } from '@module/media/media.module';
import { Holiday } from './entities/holiday.entity';
import { AppHoliday } from './entities/app-holidays.entity';
import { AppHolidayDate } from './entities/app-holiday-dates.entity';
import { Country } from '@module/country/entities/country.entity';
import { EmployeeHierarchy } from './entities/employee-hierarchy.entity';
import { LifeEvent } from './entities/life-events.entity';
import { AttendanceReconciliation } from './entities/Attendance-reconciliation.entity';
import { VisitApplication } from './entities/visit-applications.entity';
import { Event } from './entities/events.entity';
import { EventAttendee } from './entities/event-attendees.entity';
import { EmpSalaryGrade } from '@module/payroll/entities/employee-salary-grades.entity';
import { EmpIncomeTaxTier } from './entities/employee-income-tax-tiers.entity';
import { EmpSalaryChangeType } from './entities/employee-salary-change-types.entity';
import { NotificationGateway } from '@core/guards/notification.gateway';
import { LateAttendanceRule } from './entities/late-attendance-rules.entity';
import { EmpLateCounter } from './entities/employee-late-counters.entity';
import { EmpAttendancePenalty } from './entities/emp-attendance-penalties.entity';
import { MasterDocument } from './entities/master-documents.entity';
import { CompanyDocumentRecords } from './entities/company-document-records.entity';
import { CompanyDocument } from './entities/company-documents.entity';
import { RolePermissionModule } from '@module/role-permission/role-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Office,
      OfficeShift,
      OfficeWeekend,
      JobScreening,
      JobPosting,
      JobPosition,
      JobApplicantScreening,
      JobApplicant,
      JobOffer,
      JobScreeningMap,
      JobInterview,
      JobInterviewer,
      JobInterviewFeedback,
      Status,
      LeadGroups,
      LeadStage,
      LeadPipeline,
      Leads,
      PersonalNote,
      Notice,
      Employee,
      EmpLeaveType,
      EmpLeaveRequest,
      EmpInvitation,
      EmpAttendance,
      AppUser,
      Requisition,
      Department,
      Designation,
      Address,
      AssetType,
      CompanyAssetType,
      EmployeeAsset,
      Holiday,
      AppHoliday,
      AppHolidayDate,
      Country,
      EmployeeHierarchy,
      LifeEvent,
      AttendanceReconciliation,
      VisitApplication,
      Event,
      EventAttendee,
      EmpSalaryGrade,
      EmpIncomeTaxTier,
      EmpSalaryChangeType,
      LateAttendanceRule,
      EmpLateCounter,
      EmpAttendancePenalty,
      MasterDocument,
      CompanyDocument,
      CompanyDocumentRecords,
      CompanyDocument,
      RolePermissionModule,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AddressModule),
    UsersModule,
    forwardRef(() => MailModule),
    forwardRef(() => MediaModule),
    forwardRef(() => HybridQueueModule),
    forwardRef(() => RolePermissionModule),
  ],
  controllers: [HrManagementController],
  providers: [HrManagementService, CacheService, NotificationGateway],
  exports: [HrManagementService],
})
export class HrManagementModule {}
