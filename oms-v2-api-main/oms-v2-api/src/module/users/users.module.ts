// src/module/users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserContextService } from '@module/auth/user-context.service';
import { Application } from '@module/application/entities/application.entity';
import { AppUser } from './entities/app-user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { Address } from '@module/address/entities/address.entity';
import { AuthModule } from '@module/auth/auth.module';
import { MediaModule } from '@module/media/media.module';
import { UserLanguageProficiency } from './entities/user-language-proficiency.entity';
import { UserContactInfo } from './entities/user-contact-info.entity';
import { UserWorkExperience } from './entities/user-work-experience.entity';
import { UserEducation } from './entities/user-education.entity';
import { UserSkill } from './entities/user-skill.entity';
import { UserCertification } from './entities/user-certification.entity';
import { UserProject } from './entities/user-project.entity';
import { UserTraining } from './entities/user-training.entity';
import { UserReference } from './entities/user-reference.entity';
import { RolePermissionModule } from '@module/role-permission/role-permission.module';
import { NotificationGateway } from '@core/guards/notification.gateway';
import { MailService } from 'src/mail/mail.service';
import { TemplateRendererService } from 'src/mail/template-renderer.service';
import { MailModule } from 'src/mail/mail.module';
import { BatchEmail } from './entities/batch-emails.entity';
import { BatchEmailRecipient } from './entities/batch-email-recipients.entity';
import { BatchEmailSection } from './entities/batch-email-sections.entity';
import { LeadEmail } from './entities/lead-email.entity';
import { SenderEmail } from './entities/sender-email.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { EmpLeaveType } from '@module/hr-management/entities/employee-leaves-type.entity';
import { EmpLeaveRequest } from '@module/hr-management/entities/employee-leave-request.entity';
import { EmpAttendance } from '@module/hr-management/entities/employee-attendance.entity';
import { EmployeeAsset } from '@module/hr-management/entities/employee-assets.entity';
import { VisitApplication } from '@module/hr-management/entities/visit-applications.entity';
import { AppHolidayDate } from '@module/hr-management/entities/app-holiday-dates.entity';
import { Holiday } from '@module/hr-management/entities/holiday.entity';
import { AppHoliday } from '@module/hr-management/entities/app-holidays.entity';
import { HrManagementModule } from '@module/hr-management/hr-management.module';
import {
  NotificationSchema,
  Notification,
} from '@module/users/schema/notification.schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserContextService, NotificationGateway],
  exports: [TypeOrmModule, UsersService, UserContextService],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    TypeOrmModule.forFeature([
      User,
      Application,
      AppUser,
      UserProfile,
      Office,
      Address,
      UserLanguageProficiency,
      UserContactInfo,
      UserWorkExperience,
      UserEducation,
      UserSkill,
      UserCertification,
      UserProject,
      UserTraining,
      UserReference,
      BatchEmail,
      BatchEmailRecipient,
      BatchEmailSection,
      LeadEmail,
      SenderEmail,
      Employee,
      EmpLeaveType,
      EmpLeaveRequest,
      EmpAttendance,
      EmployeeAsset,
      VisitApplication,
      AppHolidayDate,
      AppHoliday,
      Holiday,
    ]),
    forwardRef(() => MediaModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RolePermissionModule),
    forwardRef(() => MailModule),
  ],
})
export class UsersModule {}
