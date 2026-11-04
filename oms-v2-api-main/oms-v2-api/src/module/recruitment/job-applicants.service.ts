import { RequestContext } from '@common/request-context';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { JobApplicant } from './entitities/job-applicants.entity';
import {
  ChangeJobRecruitmentStepStatusDto,
  ConfirmRecruitmentDto,
  CreateJobApplicantDto,
  UpdateJobApplicantDto,
} from './dto/job-applicants.dto';
import { JobVacancy } from './entitities/job-vacancies.entity';
import { MediaService } from '@module/media/media.service';
import { RecruitmentService } from '@module/recruitment/recruitment.service';
import { HrManagementService } from '@module/hr-management/hr-management.service';
import { CreateNewEmployeeDto } from '@module/hr-management/dto/create-employee.dto';

@Injectable()
export class JobApplicantService {
  constructor(
    @InjectRepository(JobApplicant)
    private readonly jobApplicantRepo: Repository<JobApplicant>,
    private recruitmentService: RecruitmentService,
    private readonly mediaService: MediaService,
    private readonly employeeService: HrManagementService,
  ) {}

  private getAppId(): number {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('App id not found');
    }
    return appId;
  }

  async confirmRecruitment(dto: ConfirmRecruitmentDto): Promise<JobApplicant> {
    const appId = this.getAppId();

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id: dto.applicantId, appId },
    });

    if (!applicant) {
      throw new NotFoundException(
        `Job applicant with ID ${dto.applicantId} not found`,
      );
    }

    if (applicant.employeeId) {
      throw new BadRequestException(
        'This applicant has already been recruited and assigned an Employee ID.',
      );
    }

    const newEmployeeDto = new CreateNewEmployeeDto();
    newEmployeeDto.firstName = applicant.firstName;
    newEmployeeDto.lastName = applicant.lastName;
    newEmployeeDto.email = applicant.email;
    newEmployeeDto.phone = applicant.phone;
    newEmployeeDto.phoneCountryId = applicant.phoneCountryId;

    newEmployeeDto.designationId = dto.designationId;
    newEmployeeDto.officeId = dto.officeId;
    newEmployeeDto.currentBasicSalary = dto.currentBasicSalary;
    newEmployeeDto.joiningDate = dto.joiningDate;
    newEmployeeDto.employeeCode = dto.employeeCode;

    newEmployeeDto.isActive = true;
    newEmployeeDto.resetFirstPassword = true;
    newEmployeeDto.appId = appId;

    const newEmployee = await this.employeeService.addNewEmployee(
      newEmployeeDto,
      newEmployeeDto.employeeCode,
    );

    applicant.employeeId = newEmployee.id;
    return await this.jobApplicantRepo.save(applicant);
  }

  async createOrUpdateJobApplicant(
    dto: CreateJobApplicantDto,
  ): Promise<JobApplicant> {
    const appId = this.getAppId();

    const jobVacancy = await this.recruitmentService.findJobVacancyById(
      dto.jobVacancyId,
      appId,
    );

    if (dto.email) {
      const existingEmailApplicant = await this.jobApplicantRepo.findOne({
        where: {
          appId,
          jobVacancyId: dto.jobVacancyId,
          email: dto.email,
        },
      });

      if (existingEmailApplicant && existingEmailApplicant.id !== dto.id) {
        throw new BadRequestException(
          'An applicant with this email has already applied for this job vacancy.',
        );
      }
    }

    if (jobVacancy.officeId) {
      dto.officeId = jobVacancy.officeId;
    }

    let savedApplicant: JobApplicant;

    if (dto.id) {
      const applicant = await this.jobApplicantRepo.findOne({
        where: { id: dto.id, appId },
      });

      if (!applicant) {
        throw new NotFoundException(
          `Job applicant with ID ${dto.id} not found`,
        );
      }

      if (dto.cvFile) {
        const newMedia = await this.mediaService.uploadFile(dto.cvFile);
        dto.cvMediaId = newMedia.id;
      }

      this.jobApplicantRepo.merge(applicant, dto);
      savedApplicant = await this.jobApplicantRepo.save(applicant);
    } else {
      if (dto.cvFile) {
        const newMedia = await this.mediaService.uploadFile(dto.cvFile);
        dto.cvMediaId = newMedia.id;
      }

      const newApplicant = this.jobApplicantRepo.create({
        ...dto,
        appId,
      });

      savedApplicant = await this.jobApplicantRepo.save(newApplicant);
    }

    return savedApplicant;
  }

  async updateJobApplicant(
    id: number,
    dto: UpdateJobApplicantDto,
  ): Promise<JobApplicant> {
    const appId = this.getAppId();

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id, appId },
    });

    if (!applicant) {
      throw new NotFoundException(`Job applicant with ID ${id} not found`);
    }

    if (dto.jobVacancyId) {
      await this.recruitmentService.findJobVacancyById(dto.jobVacancyId, appId);
    }

    this.jobApplicantRepo.merge(applicant, dto);
    return await this.jobApplicantRepo.save(applicant);
  }

  async findAllJobApplicants(
    queryString: any,
  ): Promise<{ data: JobApplicant[]; total: number }> {
    const appId = this.getAppId();
    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const query = this.jobApplicantRepo
      .createQueryBuilder('jobApplicant')
      .leftJoin('jobApplicant.jobVacancy', 'jobVacancy')
      .addSelect([
        'jobVacancy.id',
        'jobVacancy.appId',
        'jobVacancy.jobTitle',
        'jobVacancy.noOfVacancies',
        'jobVacancy.applicationDeadline',
        'jobVacancy.minSalary',
        'jobVacancy.maxSalary',
        'jobVacancy.showSalaryRange',
        'jobVacancy.jobLevel',
        'jobVacancy.officeId',
      ])
      .leftJoinAndSelect('jobApplicant.office', 'office')

      .leftJoinAndSelect(
        'jobApplicant.jobInterviewSchedule',
        'jobInterviewSchedule',
      )
      .leftJoinAndSelect(
        'jobApplicant.jobRecruitmentStep',
        'jobRecruitmentStep',
      )
      .leftJoinAndSelect('jobApplicant.cv', 'cv')

      .leftJoinAndSelect('jobApplicant.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoin('user.profile', 'userProfile')
      .addSelect([
        'userProfile.id',
        'userProfile.userId',
        'userProfile.gender',
        'userProfile.dateOfBirth',
        'userProfile.profilePictureId',
        'userProfile.phone',
        'userProfile.phoneCountryId',
      ])
      .leftJoinAndSelect('userProfile.profilePicture', 'profilePicture');

    query
      .andWhere('jobApplicant.appId = :appId', { appId })
      .andWhere('jobApplicant.deletedAt IS NULL');

    if (params.search) {
      query.andWhere(
        `(jobApplicant.summary LIKE :search
        OR user.firstName LIKE :search
        OR user.lastName LIKE :search
        OR user.email LIKE :search)`,
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.jobVacancyId) {
      query.andWhere('jobApplicant.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.jobRecruitmentStepNameId) {
      query.andWhere(
        'jobApplicant.jobRecruitmentStepNameId = :jobRecruitmentStepNameId',
        { jobRecruitmentStepNameId: Number(params.jobRecruitmentStepNameId) },
      );
    }

    if (params.employeeId) {
      query.andWhere('jobApplicant.employeeId = :employeeId', {
        employeeId: Number(params.employeeId),
      });
    }

    if (params.officeId) {
      query.andWhere('jobApplicant.officeId = :officeId', {
        officeId: Number(params.officeId),
      });
    }

    if (params.jobInterviewScheduleId) {
      query.andWhere(
        'jobApplicant.jobInterviewScheduleId = :jobInterviewScheduleId',
        { jobInterviewScheduleId: Number(params.jobInterviewScheduleId) },
      );
    }

    if (params.interviewRating != null) {
      query.andWhere('jobApplicant.interviewRating = :interviewRating', {
        interviewRating: Number(params.interviewRating),
      });
    }

    if (params.expectedSalary != null) {
      query.andWhere('jobApplicant.expectedSalary = :expectedSalary', {
        expectedSalary: Number(params.expectedSalary),
      });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields();

    const [data, total] = await Promise.all([
      features.paginate().getQuery().getMany(),
      query.getCount(),
    ]);

    return { data, total };
  }
  async findJobApplicantById(id: number): Promise<JobApplicant> {
    const appId = this.getAppId();

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id, appId },
      relations: [
        'jobVacancy',
        'jobRecruitmentStep',
        'employee',
        'employee.user',
        'cv',
        'jobInterviewSchedule',
        'office',
        'jobApplicantInterviewers',
      ],
    });

    if (!applicant) {
      throw new NotFoundException(`JobApplicant with ID ${id} not found`);
    }

    return applicant;
  }

  async deleteJobApplicant(id: number): Promise<void> {
    const appId = this.getAppId();

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id, appId },
    });

    if (!applicant) {
      throw new NotFoundException(`JobApplicant with ID ${id} not found`);
    }
    await this.jobApplicantRepo.softDelete(id);
  }

  async changeJobRecruitmentStepStatus(
    dto: ChangeJobRecruitmentStepStatusDto,
  ): Promise<JobApplicant> {
    const applicant = await this.jobApplicantRepo.findOne({
      where: { id: dto.id },
    });

    if (!applicant) {
      throw new NotFoundException('Job applicant not found');
    }

    applicant.jobRecruitmentStepNameId = dto.jobRecruitmentStepNameId;

    return await this.jobApplicantRepo.save(applicant);
  }

  async uploadCv(
    applicantId: number,
    cvFile: Express.Multer.File,
  ): Promise<any> {
    const appId = this.getAppId();

    const applicant = await this.jobApplicantRepo.findOne({
      where: { id: applicantId, appId },
    });

    if (!applicant) {
      throw new NotFoundException(
        `Job applicant with ID ${applicantId} not found`,
      );
    }

    if (cvFile) {
      const newMedia = await this.mediaService.uploadFile(cvFile);

      // if (applicant.cvMediaId) {
      //   await this.mediaService.deleteFile(applicant.cvMediaId);
      // }

      applicant.cvMediaId = newMedia?.id;

      const savedApplicant = await this.jobApplicantRepo.save(applicant);
      if (savedApplicant.cvMediaId) {
        const cvMedia = await this.mediaService.getFile(
          savedApplicant.cvMediaId,
        );
        return { cvMediaId: savedApplicant.cvMediaId, cvMedia };
      }
    } else {
      throw new BadRequestException('No CV file uploaded');
    }
  }
}
