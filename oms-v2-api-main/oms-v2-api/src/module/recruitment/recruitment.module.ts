import { Module, forwardRef } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobCategory } from './entitities/job-categories.entity';
import { JobRecruitmentStepName } from './entitities/job-recruitment-step-names.entity';
import { JobVacancy } from './entitities/job-vacancies.entity';
import { JobApplicant } from './entitities/job-applicants.entity';
import { JobInterviewer } from './entitities/job-interviewers.entity';
import { JobInterviewSchedule } from './entitities/job-interview-schedules.entity';
import { JobApplicantInterviewer } from './entitities/job-applicant-interviewers.entity';
import { JobWeight } from './entitities/job-weights.entity';
import { JobRecruitmentStep } from './entitities/job-recruitment-steps.entity';
import { AuthModule } from '@module/auth/auth.module';
import { AddressModule } from '@module/address/address.module';
import { UsersModule } from '@module/users/users.module';
import { JobWeightService } from '@module/recruitment/job-weight.service';
import { JobInterviewerService } from '@module/recruitment/job-interviewer.service';
import { JobApplicantService } from '@module/recruitment/job-applicants.service';
import { MediaService } from '@module/media/media.service';
import { MediaModule } from '@module/media/media.module';
import { JobApplicantInterviewerController } from '@module/recruitment/job-applicant-interviewer.controller';
import { JobApplicantInterviewerService } from '@module/recruitment/job-applicant-interviewer.service';
import { MailModule } from '../../mail/mail.module';
import { JobInterviewWeight } from '@module/recruitment/entitities/job-interview-weights.entity';
import { JobInterviewScheduleService } from '@module/recruitment/job-interview-schedule.service';
import { JobInterviewScheduleController } from '@module/recruitment/job-interview-schedule.controller';
import { JobInterviewWeightController } from '@module/recruitment/job-interview-weight.controller';
import { JobInterviewWeightService } from '@module/recruitment/job-interview-weight.service';
import { Remark } from '@module/recruitment/entitities/remarks.entity';
import { HrManagementService } from '@module/hr-management/hr-management.service';
import { HrManagementModule } from '@module/hr-management/hr-management.module';

@Module({
  imports: [
    MailModule,
    MediaModule,
    HrManagementModule,
    TypeOrmModule.forFeature([
      JobCategory,
      JobRecruitmentStepName,
      JobVacancy,
      JobApplicant,
      JobInterviewer,
      JobInterviewWeight,
      JobInterviewSchedule,
      JobApplicantInterviewer,
      JobWeight,
      JobRecruitmentStep,
      Remark,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AddressModule),
    UsersModule,
  ],
  controllers: [
    RecruitmentController,
    JobApplicantInterviewerController,
    JobInterviewScheduleController,
    JobInterviewWeightController,
  ],
  providers: [
    RecruitmentService,
    JobWeightService,
    JobInterviewerService,
    JobApplicantService,
    JobApplicantInterviewerService,
    JobInterviewScheduleService,
    JobInterviewWeightService,
  ],
})
export class RecruitmentModule {}
