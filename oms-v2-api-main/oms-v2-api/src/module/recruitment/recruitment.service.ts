import { RequestContext } from '@common/request-context';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobCategoryDto } from './dto/job-categories.dto';
import { JobCategory } from './entitities/job-categories.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { JobRecruitmentStepName } from './entitities/job-recruitment-step-names.entity';
import { CreateJobRecruitmentStepNameDto } from './dto/job-recruitment-step-names.dto';
import { JobVacancy } from './entitities/job-vacancies.entity';
import { CreateJobVacancyDto } from './dto/job-vacancies.dto';
import {
  CreateJobRecruitmentStepDto,
  SaveJobRecruitmentStepsDto,
} from './dto/job-recruitment-steps.dto';
import { JobRecruitmentStep } from './entitities/job-recruitment-steps.entity';
import { CreateJobInterviewScheduleDto } from './dto/job-interview-schedules.dto';
import { JobInterviewSchedule } from './entitities/job-interview-schedules.entity';
import { JobInterviewer } from './entitities/job-interviewers.entity';
import { JobApplicant } from './entitities/job-applicants.entity';
import { log } from 'console';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(JobCategory)
    private readonly JobCategoryRepo: Repository<JobCategory>,

    @InjectRepository(JobRecruitmentStepName)
    private readonly jobRecruitmentStepNameRepo: Repository<JobRecruitmentStepName>,

    @InjectRepository(JobVacancy)
    private readonly jobVacancyRepo: Repository<JobVacancy>,

    @InjectRepository(JobRecruitmentStep)
    private readonly jobRecruitmentStepRepo: Repository<JobRecruitmentStep>,

    @InjectRepository(JobInterviewSchedule)
    private readonly jobInterviewScheduleRepo: Repository<JobInterviewSchedule>,

    @InjectRepository(JobInterviewer)
    private readonly jobInterviewerRepo: Repository<JobInterviewer>,

    @InjectRepository(JobApplicant)
    private readonly jobApplicantRepo: Repository<JobApplicant>,
  ) {}

  // add or update job categories

  async createOrUpdateJobCategory(
    dto: CreateJobCategoryDto,
  ): Promise<JobCategory> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new Error('App id not found');
    }
    dto.appId = appId;

    let savedJobCategory: JobCategory;

    if (dto.id) {
      // update
      const jobCategory = await this.JobCategoryRepo.findOne({
        where: { id: dto.id },
      });

      if (!jobCategory) {
        throw new Error('Job category not found');
      }
      this.JobCategoryRepo.merge(jobCategory, dto);
      savedJobCategory = await this.JobCategoryRepo.save(jobCategory);
    } else {
      const newJobCategory = this.JobCategoryRepo.create({
        ...dto,
      });
      savedJobCategory = await this.JobCategoryRepo.save(newJobCategory);
    }

    return savedJobCategory;
  }

  async findAllJobCategories(
    queryString: any,
  ): Promise<{ data: JobCategory[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.JobCategoryRepo.createQueryBuilder('jobCategory');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('jobCategory.appId = :appId', {
      appId,
    });

    query.andWhere('jobCategory.deletedAt IS NULL');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`jobCategory.name LIKE :search`, {
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

  async findAllJobCategoriesNoPagination(
    queryString: any,
  ): Promise<JobCategory[]> {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.JobCategoryRepo.createQueryBuilder('jobCategory');

    // Apply search, sort, limitFields (exclude paginate)
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields();

    query.andWhere('jobCategory.appId = :appId', { appId });
    query.andWhere('jobCategory.deletedAt IS NULL');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`jobCategory.name LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    let data = await features.getQuery().getMany();

    if (data.length === 0 && !params.search) {
      const defaultCategories = [
        'Software Development',
        'DevOps & Cloud',
        'Database Administration',
        'IT Support & Networking',
        'Quality Assurance (QA)',
        'UI/UX & Graphic Design',
        'Project Management',
        'Business Development',
        'Digital Marketing',
        'Human Resources (HR)',
        'Finance & Accounts',
        'Operations & Administration',
      ];

      const toInsert = defaultCategories.map((name) =>
        this.JobCategoryRepo.create({
          appId,
          name,
          isActive: true,
        }),
      );
      await this.JobCategoryRepo.save(toInsert);
      data = await features.getQuery().getMany();
    }

    return data;
  }

  async findJobCategoryById(id: number): Promise<JobCategory> {
    const jobCategory = await this.JobCategoryRepo.findOne({
      where: { id },
    });

    if (!jobCategory) {
      throw new NotFoundException(`JobCategory with ID ${id} not found`);
    }

    return jobCategory;
  }

  async deleteJobCategory(id: number): Promise<void> {
    const result = await this.JobCategoryRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`JobCategory with ID ${id} not found`);
    }
  }

  async changeJobCategoryActiveStatus(id: number): Promise<JobCategory> {
    const jobCategory = await this.findJobCategoryById(id);

    jobCategory.isActive = !jobCategory.isActive;

    return await this.JobCategoryRepo.save(jobCategory);
  }

  async createOrUpdateJobRecruitmentStepName(
    dto: CreateJobRecruitmentStepNameDto,
  ): Promise<JobRecruitmentStepName> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('App id not found');
    }

    dto.appId = appId;

    let savedStepName: JobRecruitmentStepName;

    if (dto.id && Number(dto.id) > 0) {
      const stepName = await this.jobRecruitmentStepNameRepo.findOne({
        where: { id: dto.id, appId },
      });

      if (!stepName) {
        throw new NotFoundException('Job recruitment step name not found');
      }

      const { id: _id, ...updateData } = dto;
      this.jobRecruitmentStepNameRepo.merge(stepName, updateData);
      savedStepName = await this.jobRecruitmentStepNameRepo.save(stepName);
    } else {
      const { id, ...dataWithoutId } = dto;
      const newStepName = this.jobRecruitmentStepNameRepo.create({
        ...dataWithoutId,
        appId,
      });

      savedStepName = await this.jobRecruitmentStepNameRepo.save(newStepName);
    }

    return savedStepName;
  }

  async findAllJobRecruitmentStepNames(
    queryString: any,
  ): Promise<{ data: JobRecruitmentStepName[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobRecruitmentStepNameRepo.createQueryBuilder(
      'jobRecruitmentStepName',
    );

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('jobRecruitmentStepName.appId = :appId', {
      appId,
    });

    query.andWhere('jobRecruitmentStepName.deletedAt IS NULL');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`jobRecruitmentStepName.name LIKE :search`, {
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

  async getAllactiveJobRecruitmentStepNames(
    queryString: any,
  ): Promise<JobRecruitmentStepName[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobRecruitmentStepNameRepo
      .createQueryBuilder('jobRecruitmentStepName')
      .select(['jobRecruitmentStepName.id', 'jobRecruitmentStepName.name']);

    query.andWhere('jobRecruitmentStepName.appId = :appId', { appId });
    query.andWhere('jobRecruitmentStepName.deletedAt IS NULL');

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`jobRecruitmentStepName.name LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    const stepNames = await query.getMany();

    return stepNames;
  }

  async findJobRecruitmentStepNameById(
    id: number,
  ): Promise<JobRecruitmentStepName> {
    const appId = RequestContext.get('activeAppId');

    const stepName = await this.jobRecruitmentStepNameRepo.findOne({
      where: { id, appId },
    });

    if (!stepName) {
      throw new NotFoundException(
        `JobRecruitmentStepName with ID ${id} not found`,
      );
    }

    return stepName;
  }

  async deleteJobRecruitmentStepName(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');

    const stepName = await this.jobRecruitmentStepNameRepo.findOne({
      where: { id, appId },
    });

    if (!stepName) {
      throw new NotFoundException(
        `JobRecruitmentStepName with ID ${id} not found`,
      );
    }

    // 1. Mark soft delete so it's immediately excluded from all active queries
    stepName.deletedAt = new Date();
    await this.jobRecruitmentStepNameRepo.save(stepName);

    // 2. Remove vacancy step associations referencing this step
    await this.jobRecruitmentStepRepo.delete({ stepId: id });

    // 3. Null out any applicant foreign key references
    await this.jobApplicantRepo.update(
      { jobRecruitmentStepNameId: id },
      { jobRecruitmentStepNameId: null as any },
    );

    // 4. Try hard delete; if anything else references it, it's already soft-deleted
    try {
      await this.jobRecruitmentStepNameRepo.delete(id);
    } catch {
      // Soft-deleted successfully
    }
  }

  async createOrUpdateJobVacancy(
    dto: CreateJobVacancyDto,
  ): Promise<JobVacancy> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('App id not found');
    }

    dto.appId = appId;

    let savedJobVacancy: JobVacancy;

    if (dto.id) {
      const jobVacancy = await this.jobVacancyRepo.findOne({
        where: { id: dto.id, appId },
      });

      if (!jobVacancy) {
        throw new NotFoundException('Job vacancy not found');
      }

      this.jobVacancyRepo.merge(jobVacancy, dto);
      savedJobVacancy = await this.jobVacancyRepo.save(jobVacancy);
    } else {
      const newJobVacancy = this.jobVacancyRepo.create({
        ...dto,
        appId,
      });

      savedJobVacancy = await this.jobVacancyRepo.save(newJobVacancy);
    }

    return savedJobVacancy;
  }

  async findAllJobVacancies(
    queryString: any,
  ): Promise<{ data: JobVacancy[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobVacancyRepo.createQueryBuilder('jobVacancy');

    query
      .leftJoinAndSelect('jobVacancy.office', 'office')
      .leftJoinAndSelect('jobVacancy.shift', 'shift')
      .leftJoinAndSelect('jobVacancy.jobCategory', 'jobCategory')
      .leftJoinAndSelect('jobVacancy.employmentStatus', 'employmentStatus')
      .leftJoin('jobVacancy.jobInterviewers', 'interviewer')
      .leftJoin('interviewer.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoin('employee.designation', 'designation')
      .leftJoin('jobVacancy.jobWeights', 'jobWeight')
      .leftJoinAndSelect(
        'jobVacancy.jobRecruitmentSteps',
        'jobRecruitmentStep',
      )
      .leftJoinAndSelect('jobRecruitmentStep.step', 'recruitmentStepName')

      .loadRelationCountAndMap(
        'jobVacancy.totalApplicants',
        'jobVacancy.jobApplicants',
      )

      .addSelect([
        'interviewer.id',
        'interviewer.employeeId',
        'employee.id',
        'employee.employeeCode',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',

        'designation.id',
        'designation.name',

        'profile.id',
        'profilePicture.id',
        'profilePicture.filename',

        'jobWeight.id',
        'jobWeight.weightName',
        'jobWeight.weightValue',
      ]);

    query.andWhere('jobVacancy.appId = :appId', { appId });
    query.andWhere('jobVacancy.deletedAt IS NULL');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        `(jobVacancy.jobTitle LIKE :search OR jobVacancy.skills LIKE :search OR jobVacancy.workplace LIKE :search)`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    if (params.jobCategoryId) {
      query.andWhere('jobVacancy.jobCategoryId = :jobCategoryId', {
        jobCategoryId: Number(params.jobCategoryId),
      });
    }

    if (params.officeId) {
      query.andWhere('jobVacancy.officeId = :officeId', {
        officeId: Number(params.officeId),
      });
    }

    if (params.shiftId) {
      query.andWhere('jobVacancy.shiftId = :shiftId', {
        shiftId: Number(params.shiftId),
      });
    }

    if (params.employmentStatusId) {
      query.andWhere('jobVacancy.employmentStatusId = :employmentStatusId', {
        employmentStatusId: Number(params.employmentStatusId),
      });
    }

    if (params.applicationDeadline) {
      query.andWhere('jobVacancy.applicationDeadline = :applicationDeadline', {
        applicationDeadline: params.applicationDeadline,
      });
    }

    if (params.requiredPhoto !== undefined && params.requiredPhoto !== null) {
      const requiredPhoto =
        params.requiredPhoto === true ||
        params.requiredPhoto === 'true' ||
        params.requiredPhoto === 1 ||
        params.requiredPhoto === '1'
          ? 1
          : 0;

      query.andWhere('jobVacancy.requiredPhoto = :requiredPhoto', {
        requiredPhoto,
      });
    }

    if (
      params.preferVideoResume !== undefined &&
      params.preferVideoResume !== null
    ) {
      const preferVideoResume =
        params.preferVideoResume === true ||
        params.preferVideoResume === 'true' ||
        params.preferVideoResume === 1 ||
        params.preferVideoResume === '1'
          ? 1
          : 0;

      query.andWhere('jobVacancy.preferVideoResume = :preferVideoResume', {
        preferVideoResume,
      });
    }

    if (
      params.showSalaryRange !== undefined &&
      params.showSalaryRange !== null
    ) {
      const showSalaryRange =
        params.showSalaryRange === true ||
        params.showSalaryRange === 'true' ||
        params.showSalaryRange === 1 ||
        params.showSalaryRange === '1'
          ? 1
          : 0;

      query.andWhere('jobVacancy.showSalaryRange = :showSalaryRange', {
        showSalaryRange,
      });
    }

    if (
      params.salaryNegotiable !== undefined &&
      params.salaryNegotiable !== null
    ) {
      const salaryNegotiable =
        params.salaryNegotiable === true ||
        params.salaryNegotiable === 'true' ||
        params.salaryNegotiable === 1 ||
        params.salaryNegotiable === '1'
          ? 1
          : 0;

      query.andWhere('jobVacancy.salaryNegotiable = :salaryNegotiable', {
        salaryNegotiable,
      });
    }

    if (params.gender) {
      query.andWhere('jobVacancy.gender = :gender', {
        gender: params.gender,
      });
    }

    if (params.saveStep) {
      query.andWhere('jobVacancy.saveStep = :saveStep', {
        saveStep: Number(params.saveStep),
      });
    }

    const featureData = await features.getQuery().getMany();

    const total = await query.getCount();

    const dataWithSteps = featureData.map((job: any) => {
      const activeSteps = (job.jobRecruitmentSteps || []).filter(
        (s: any) => !s.step || s.step.deletedAt === null,
      );
      return {
        ...job,
        totalApplicants: job.totalApplicants || 0,
        jobRecruitmentSteps: activeSteps,
        jobRecruitmentStepIds:
          activeSteps.map((s: any) => s.stepId).filter(Boolean) || [],
      };
    });

    return {
      data: dataWithSteps,
      total,
    };
  }

  async validateJobVacancyExists(
    vacancyIds: number[],
    appId: number,
  ): Promise<JobVacancy[]> {
    const vacancies = await this.jobVacancyRepo.find({
      where: { id: In(vacancyIds), appId },
    });

    if (vacancies.length !== vacancyIds.length) {
      throw new NotFoundException(
        'One or more job vacancies not found or do not belong to this app',
      );
    }

    return vacancies;
  }

  async findJobVacancyById(id: number, appId?: number): Promise<JobVacancy> {
    const activeAppId = appId ?? RequestContext.get('activeAppId');

    const jobVacancy = await this.jobVacancyRepo.findOne({
      where: { id, appId: activeAppId },
      relations: [
        'office',
        'shift',
        'jobCategory',
        'employmentStatus',
        'jobRecruitmentSteps',
        'jobRecruitmentSteps.step',
        'jobInterviewers',
        'jobInterviewers.employee',
        'jobInterviewers.employee.user',
        'jobInterviewers.employee.user.profile',
        'jobInterviewers.employee.user.profile.profilePicture',
        'jobInterviewers.employee.designation',
        'jobWeights',
      ],
    });

    if (!jobVacancy) {
      throw new NotFoundException(`JobVacancy with ID ${id} not found`);
    }

    return jobVacancy;
  }

  async deleteJobVacancy(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');

    const jobVacancy = await this.jobVacancyRepo.findOne({
      where: { id, appId },
    });

    if (!jobVacancy) {
      throw new NotFoundException(`JobVacancy with ID ${id} not found`);
    }

    await this.jobVacancyRepo.delete(id);
  }

  async createOrUpdateJobRecruitmentStep(
    dto: CreateJobRecruitmentStepDto,
  ): Promise<JobRecruitmentStep> {
    let savedStep: JobRecruitmentStep;

    if (dto.id) {
      const step = await this.jobRecruitmentStepRepo.findOne({
        where: { id: dto.id },
      });

      if (!step) {
        throw new NotFoundException('Job recruitment step not found');
      }

      this.jobRecruitmentStepRepo.merge(step, dto);
      savedStep = await this.jobRecruitmentStepRepo.save(step);
    } else {
      const newStep = this.jobRecruitmentStepRepo.create(dto);
      savedStep = await this.jobRecruitmentStepRepo.save(newStep);
    }

    return savedStep;
  }

  async findAllJobRecruitmentSteps(
    queryString: any,
  ): Promise<{ data: JobRecruitmentStep[]; total: number }> {
    const query = this.jobRecruitmentStepRepo.createQueryBuilder('step');

    query.leftJoin('step.jobVacancy', 'jobVacancy');
    query.leftJoin('step.step', 'stepName');

    query.addSelect([
      'jobVacancy.id',
      'jobVacancy.jobTitle',

      'stepName.id',
      'stepName.name',
    ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('step.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.stepId) {
      query.andWhere('step.stepId = :stepId', {
        stepId: Number(params.stepId),
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobRecruitmentStepById(id: number): Promise<JobRecruitmentStep> {
    const step = await this.jobRecruitmentStepRepo.findOne({
      where: { id },
    });

    if (!step) {
      throw new NotFoundException(`JobRecruitmentStep with ID ${id} not found`);
    }

    return step;
  }

  async findJobRecruitmentStepIdsByJobVacancyId(id: number): Promise<number[]> {
    const jobRecruitmentSteps = await this.jobRecruitmentStepRepo.find({
      where: { jobVacancyId: id },
    });

    if (!jobRecruitmentSteps || jobRecruitmentSteps.length === 0) {
      return [];
    }

    const stepIds = jobRecruitmentSteps
      .map((step) => step.stepId)
      .filter((id): id is number => id !== undefined);

    return stepIds;
  }

  async deleteJobRecruitmentStep(id: number): Promise<void> {
    const step = await this.jobRecruitmentStepRepo.findOne({
      where: { id },
    });

    if (!step) {
      throw new NotFoundException(`JobRecruitmentStep with ID ${id} not found`);
    }

    await this.jobRecruitmentStepRepo.delete(id);
  }

  async createOrUpdateJobRecruitmentSteps(
    dto: SaveJobRecruitmentStepsDto,
  ): Promise<JobRecruitmentStep[]> {
    const { jobVacancyId, jobRecruitmentStepIds = [] } = dto;

    if (!jobVacancyId) {
      throw new BadRequestException('Job vacancy ID is required');
    }

    await this.jobRecruitmentStepRepo.delete({ jobVacancyId });

    if (!jobRecruitmentStepIds || jobRecruitmentStepIds.length === 0) {
      return [];
    }

    const uniqueStepIds = [...new Set(jobRecruitmentStepIds)];

    const steps = uniqueStepIds.map((stepId) =>
      this.jobRecruitmentStepRepo.create({
        jobVacancyId,
        stepId,
      }),
    );

    return await this.jobRecruitmentStepRepo.save(steps);
  }

  // async createOrUpdateJobInterviewSchedule(
  //   dto: CreateJobInterviewScheduleDto,
  // ): Promise<JobInterviewSchedule> {
  //   const appId = RequestContext.get('activeAppId');
  //   if (!appId) throw new BadRequestException('App id not found');

  //   dto.appId = appId;

  //   let savedSchedule: JobInterviewSchedule;

  //   if (dto.id) {
  //     const schedule = await this.jobInterviewScheduleRepo.findOne({
  //       where: { id: dto.id, appId },
  //     });

  //     if (!schedule)
  //       throw new NotFoundException('Job interview schedule not found');

  //     this.jobInterviewScheduleRepo.merge(schedule, dto);
  //     savedSchedule = await this.jobInterviewScheduleRepo.save(schedule);
  //   } else {
  //     const newSchedule = this.jobInterviewScheduleRepo.create(dto);
  //     savedSchedule = await this.jobInterviewScheduleRepo.save(newSchedule);
  //   }

  //   return savedSchedule;
  // }

  async findAllJobInterviewSchedules(
    jobVacancyId?: number,
    jobApplicantId?: number,
  ): Promise<Partial<JobInterviewSchedule>[]> {
    const appId = RequestContext.get('activeAppId');
    if (!appId) throw new NotFoundException('App id not found');

    const query = this.jobInterviewScheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.office', 'office')
      .leftJoinAndSelect('schedule.jobVacancy', 'jobVacancy')
      //.leftJoinAndSelect('schedule.jobApplicant', 'jobApplicant')

      .select([
        'schedule.id',
        'schedule.jobVacancyId',
        'schedule.jobApplicantId',
        'schedule.scheduleDatetime',
        'schedule.locationType',
        'schedule.officeId',
        'schedule.url',
        'schedule.interviewCompleted',
        'schedule.weightSubjects',
        'schedule.totalWeight',
        'schedule.totalInterviewer',
        'schedule.totalWeightMark',
        'schedule.creatorId',

        'office.id',
        'office.name',

        'jobVacancy.id',
        'jobVacancy.jobTitle',

        // 'jobApplicant.id',
        // 'jobApplicant.summary',
      ])
      .where('schedule.appId = :appId', { appId });

    if (jobVacancyId) {
      query.andWhere('schedule.jobVacancyId = :jobVacancyId', { jobVacancyId });
    }

    if (jobApplicantId) {
      query.andWhere('schedule.jobApplicantId = :jobApplicantId', {
        jobApplicantId,
      });
    }

    query.orderBy('schedule.id', 'DESC');

    return await query.getMany();
  }

  async findJobInterviewScheduleById(
    id: number,
  ): Promise<JobInterviewSchedule> {
    const appId = RequestContext.get('activeAppId');

    const schedule = await this.jobInterviewScheduleRepo.findOne({
      where: { id, appId },
    });

    if (!schedule)
      throw new NotFoundException(
        `JobInterviewSchedule with ID ${id} not found`,
      );

    return schedule;
  }

  async deleteJobInterviewSchedule(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');

    const schedule = await this.jobInterviewScheduleRepo.findOne({
      where: { id, appId },
    });

    if (!schedule)
      throw new NotFoundException(
        `JobInterviewSchedule with ID ${id} not found`,
      );

    await this.jobInterviewScheduleRepo.delete(id);
  }

  async getJobRecruitmentSteps(jobVacancyId: number) {
    if (!jobVacancyId)
      throw new BadRequestException('jobVacancyId is required');

    const appId = RequestContext.get('activeAppId');
    if (!appId) throw new NotFoundException('App id not found');

    const steps = await this.jobRecruitmentStepRepo
      .createQueryBuilder('jobSteps')
      .leftJoinAndSelect('jobSteps.step', 'stepName')
      .where('jobSteps.jobVacancyId = :jobVacancyId', { jobVacancyId })
      .andWhere('stepName.deletedAt IS NULL')
      .orderBy('jobSteps.id', 'ASC')
      .getMany();

    return steps
      .filter((s) => s.step?.id && s.step?.name)
      .map((s) => ({
        id: s.id,
        stepId: s.step!.id,
        stepName: s.step!.name ?? '',
      }));
  }

  async getApplicantsByVacancyAndStepNames(
    queryString: any,
  ): Promise<{ data: JobApplicant[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobApplicantRepo
      .createQueryBuilder('applicant')

      // joins
      .leftJoinAndSelect('applicant.office', 'office')
      // .leftJoinAndSelect('applicant.jobVacancy', 'jobVacancy')
      .leftJoin('applicant.jobRecruitmentStep', 'stepName')
      .leftJoin('applicant.employee', 'employee')
      .leftJoin('applicant.cv', 'cv')
      .leftJoin(
        'applicant.jobApplicantInterviewers',
        'jobApplicantInterviewers',
      )
      .leftJoin('applicant.jobInterviewSchedule', 'jobInterviewSchedule')
      // .leftJoin('employee.user', 'user')
      // .leftJoin('user.profile', 'userProfile')
      // .leftJoin('userProfile.profilePicture', 'profilePicture')
      // .leftJoin('userProfile.phoneCountry', 'phoneCountry')

      .addSelect([
        'stepName.id',
        'stepName.name',

        'jobInterviewSchedule.id',
        'jobInterviewSchedule.scheduleDatetime',
        'jobInterviewSchedule.locationType',
        'jobInterviewSchedule.officeId',
        'jobInterviewSchedule.url',
        'jobInterviewSchedule.totalInterviewer',
        'jobInterviewSchedule.interviewCompleted',

        'jobApplicantInterviewers.id',
        'jobApplicantInterviewers.employeeId',
        'jobApplicantInterviewers.interviewStatus',
        'jobApplicantInterviewers.interviewPanelsUrl',
        'jobApplicantInterviewers.interviewRemarks',

        'cv.id',
        'cv.originalName',
        'cv.filename',

        // 'employee.id',
        // 'employee.employeeCode',
        // 'employee.joiningDate',

        // 'user.firstName',
        // 'user.lastName',
        // 'user.email',
        // 'user.isActive',

        // 'userProfile.id',
        // 'userProfile.phoneCountryId',
        // 'userProfile.phone',
        // 'userProfile.gender',

        // 'phoneCountry.callingCode',

        // 'profilePicture.id',
        // 'profilePicture.filename',
      ])

      .where('applicant.appId = :appId', { appId })
      .andWhere('applicant.deletedAt IS NULL');

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const jobVacancyId = params.jobVacancyId
      ? Number(params.jobVacancyId)
      : null;

    const stepNameId = params.stepNameId ? Number(params.stepNameId) : null;

    if (jobVacancyId) {
      query.andWhere('applicant.jobVacancyId = :jobVacancyId', {
        jobVacancyId,
      });
    }

    if (stepNameId) {
      query.andWhere('applicant.jobRecruitmentStepNameId = :stepNameId', {
        stepNameId,
      });
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    const jobInterviewers = await this.jobInterviewerRepo.find({
      where: { jobVacancyId: params.jobVacancyId, appId },
      relations: ['employee'],
    });

    console.log(jobInterviewers);

    data.forEach((applicant) => {
      if (
        applicant.jobApplicantInterviewers &&
        applicant.jobApplicantInterviewers.length > 0
      ) {
        applicant.jobApplicantInterviewers =
          applicant.jobApplicantInterviewers.map((jai: any) => {
            const matchedInterviewer = jobInterviewers.find(
              (i) => i.employeeId === jai.employeeId,
            );

            return {
              ...jai,
              userId: matchedInterviewer?.employee?.userId ?? null,
              jobInterviewerId: matchedInterviewer
                ? matchedInterviewer.id
                : null,
            };
          });
      }
    });

    return {
      data,
      total,
    };
  }

  async getJobVacancyTitles() {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const data = await this.jobVacancyRepo
      .createQueryBuilder('jobVacancy')
      .select(['jobVacancy.id', 'jobVacancy.jobTitle'])
      .where('jobVacancy.appId = :appId', { appId })
      .andWhere('jobVacancy.deletedAt IS NULL')
      .getMany();

    return data;
  }

  async getJobVacancyInterviewOverview(jobVacancyId: number) {
    const job = await this.jobVacancyRepo
      .createQueryBuilder('jobVacancy')

      .select(['jobVacancy.id', 'jobVacancy.jobTitle'])

      .leftJoin('jobVacancy.jobApplicants', 'applicant')
      .leftJoin('applicant.jobInterviewSchedule', 'jobInterviewSchedule')
      .leftJoin(
        'applicant.jobApplicantInterviewers',
        'jobApplicantInterviewers',
      )
      .leftJoin('jobApplicantInterviewers.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')

      .addSelect([
        'applicant.id',

        'jobInterviewSchedule.id',
        'jobInterviewSchedule.scheduleDatetime',
        'jobInterviewSchedule.locationType',
        'jobInterviewSchedule.officeId',
        'jobInterviewSchedule.url',
        'jobInterviewSchedule.totalInterviewer',
        'jobInterviewSchedule.interviewCompleted',

        'jobApplicantInterviewers.id',
        'jobApplicantInterviewers.employeeId',
        'jobApplicantInterviewers.interviewStatus',
        'jobApplicantInterviewers.interviewPanelsUrl',
        'jobApplicantInterviewers.interviewRemarks',

        'employee.id',
        'employee.employeeCode',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',

        'profile.id',

        'profilePicture.id',
        'profilePicture.filename',
        // 'profilePicture.fileUrl',
      ])

      .where('jobVacancy.id = :id', { id: jobVacancyId })
      .andWhere('jobVacancy.deletedAt IS NULL')
      .getOne();

    if (!job) {
      throw new NotFoundException('Job vacancy not found');
    }
    const interviewers =
      job.jobApplicants?.flatMap(
        (app: any) =>
          app.jobApplicantInterviewers?.map((i: any) => ({
            jobInterviewerId: i.id,
            employeeId: i.employeeId,
            userId: i.employee?.user?.id,
            name: `${i.employee?.user?.firstName || ''} ${i.employee?.user?.lastName || ''}`.trim(),
            email: i.employee?.user?.email || null,
            status: i.interviewStatus,
            profilePicture:
              i.employee?.user?.profile?.profilePicture?.fileUrl || null,

            // ✅ ADD THIS PART
            jobInterviewSchedule: app.jobInterviewSchedule
              ? {
                  id: app.jobInterviewSchedule.id,
                  scheduleDatetime: app.jobInterviewSchedule.scheduleDatetime,
                  locationType: app.jobInterviewSchedule.locationType,
                  officeId: app.jobInterviewSchedule.officeId,
                  url: app.jobInterviewSchedule.url,
                  interviewCompleted:
                    app.jobInterviewSchedule.interviewCompleted,
                  totalInterviewer: app.jobInterviewSchedule.totalInterviewer,
                }
              : null,
          })) || [],
      ) || [];

    return {
      id: job.id,
      jobTitle: job.jobTitle,
      interviewers,
    };
  }

  async getApplicantsByVacancyAndStepWithPagination(
    queryString: any,
  ): Promise<{ data: JobApplicant[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobApplicantRepo.createQueryBuilder('applicant');

    query.leftJoin('applicant.office', 'office');
    query.leftJoin('applicant.jobVacancy', 'jobVacancy');
    query.leftJoin('applicant.jobRecruitmentStep', 'stepName');
    query.leftJoin('applicant.employee', 'employee');
    query.leftJoin('applicant.cv', 'cv');
    query.leftJoin('employee.user', 'user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');

    query.addSelect([
      'office.id',
      'office.name',

      'jobVacancy.id',
      'jobVacancy.jobTitle',

      'stepName.id',
      'stepName.name',

      'cv.id',
      'cv.originalName',
      'cv.filename',

      'employee.id',
      'employee.employeeCode',
      'employee.joiningDate',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.isActive',

      'userProfile.id',
      'userProfile.phoneCountryId',
      'userProfile.phone',
      'userProfile.gender',

      'phoneCountry.callingCode',

      'profilePicture.id',
      'profilePicture.filename',
    ]);

    query.andWhere('applicant.appId = :appId', { appId });
    query.andWhere('applicant.deletedAt IS NULL');

    const features = new APIFeatures(query, queryString)
      //.searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('applicant.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.stepNameId) {
      query.andWhere('applicant.jobRecruitmentStepNameId = :stepNameId', {
        stepNameId: Number(params.stepNameId),
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async getAllJobRecruitmentStepsList(queryString: any) {
    const query = this.jobRecruitmentStepRepo.createQueryBuilder('step');

    query.leftJoin('step.jobVacancy', 'jobVacancy');
    query.leftJoin('step.step', 'stepName');

    query.addSelect([
      'step.id',

      'jobVacancy.id',
      'jobVacancy.jobTitle',

      'stepName.id',
      'stepName.name',
    ]);

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('step.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    const data = await query.getMany();

    return data;
  }

  async findJobInterviewers(id: number): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobInterviewerRepo
      .createQueryBuilder('interviewer')
      .leftJoin('interviewer.jobVacancy', 'jobVacancy')
      .leftJoin('interviewer.employee', 'employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.profilePicture', 'profilePicture')
      .leftJoin('employee.designation', 'designation')
      .select([
        'interviewer.id',
        'interviewer.employeeId',

        'employee.id',
        'employee.employeeCode',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',

        'designation.id',
        'designation.name',

        'profile.id',

        'profilePicture.id',
        'profilePicture.filename',
      ])
      .where('jobVacancy.id = :id', { id })
      .andWhere('jobVacancy.appId = :appId', { appId });

    const data = await query.getMany();

    return {
      data,
    };
  }
}
