import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitmentService } from '@module/recruitment/recruitment.service';
import { RequestContext } from '@common/request-context';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateJobInterviewerDto,
  SyncJobInterviewersDto,
  UpdateJobInterviewerDto,
} from '@module/recruitment/dto/job-interviewer.dto';
import { APIFeatures } from '@core/utils/apiFeatures';
import { JobInterviewer } from '@module/recruitment/entitities/job-interviewers.entity';
import { MailService } from '../../mail/mail.service';

export class JobInterviewerService {
  constructor(
    @InjectRepository(JobInterviewer)
    private readonly jobInterviewerRepo: Repository<JobInterviewer>,
    private recruitmentService: RecruitmentService,
    private mailService: MailService,
  ) {}

  private getAppId(): number {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('App id not found');
    }
    return appId;
  }

  async createJobInterviewer(
    dto: CreateJobInterviewerDto,
  ): Promise<JobInterviewer> {
    const appId = this.getAppId();

    await this.recruitmentService.findJobVacancyById(dto.jobVacancyId, appId);

    const existingInterviewer = await this.jobInterviewerRepo.findOne({
      where: {
        appId,
        jobVacancyId: dto.jobVacancyId,
        employeeId: dto.employeeId,
      },
    });

    if (existingInterviewer) {
      throw new BadRequestException(
        'This employee is already assigned as an interviewer for this job vacancy.',
      );
    }

    const newInterviewer = this.jobInterviewerRepo.create({
      ...dto,
      appId,
    });

    return await this.jobInterviewerRepo.save(newInterviewer);
  }

  async createBulkJobInterviewers(
    dtos: CreateJobInterviewerDto[],
  ): Promise<JobInterviewer[]> {
    const appId = this.getAppId();

    if (!dtos || dtos.length === 0) {
      throw new BadRequestException('No job interviewers provided');
    }

    const vacancyIds = [...new Set(dtos.map((dto) => dto.jobVacancyId))];

    if (vacancyIds.length > 0) {
      await this.recruitmentService.validateJobVacancyExists(vacancyIds, appId);
    }

    const employeeIds = [...new Set(dtos.map((dto) => dto.employeeId))];
    const existingInterviewers = await this.jobInterviewerRepo.find({
      where: {
        appId,
        jobVacancyId: In(vacancyIds),
        employeeId: In(employeeIds),
      },
    });

    const existingMap = new Set(
      existingInterviewers.map((e) => `${e.jobVacancyId}-${e.employeeId}`),
    );

    const interviewersToSave = dtos
      .filter(
        (dto) => !existingMap.has(`${dto.jobVacancyId}-${dto.employeeId}`),
      )
      .map((dto) =>
        this.jobInterviewerRepo.create({
          ...dto,
          appId,
        }),
      );

    if (interviewersToSave.length === 0) {
      throw new BadRequestException(
        'All provided interviewers are already assigned to these vacancies.',
      );
    }

    const savedInterviewers =
      await this.jobInterviewerRepo.save(interviewersToSave);

    const savedIds = savedInterviewers.map((i) => i.id);
    const newInterviewersDetails = await this.jobInterviewerRepo.find({
      where: { id: In(savedIds), appId },
      relations: ['employee', 'employee.user', 'jobVacancy'],
    });

    for (const details of newInterviewersDetails) {
      if (details.employee?.user?.email) {
        const user = details.employee.user;
        const job = details.jobVacancy;

        await this.mailService
          .sendMail(
            user.email,
            'You have been assigned to a hiring team 🎉',
            'vacancy-interviewer-assignment',
            {
              name: user.firstName
                ? `${user.firstName} ${user.lastName}`
                : 'Interviewer',
              email: user.email,
              jobTitle: job?.jobTitle || 'a job vacancy',
            },
          )
          .catch((err) =>
            console.error(
              'Failed to send bulk interviewer assignment email:',
              err,
            ),
          );
      }
    }

    return savedInterviewers;
  }

  async updateJobInterviewer(
    dto: UpdateJobInterviewerDto,
  ): Promise<JobInterviewer> {
    const appId = this.getAppId();

    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id: dto.id, appId },
    });

    if (!interviewer) {
      throw new NotFoundException(
        `Job interviewer with ID ${dto.id} not found`,
      );
    }

    if (dto.jobVacancyId) {
      await this.recruitmentService.findJobVacancyById(dto.jobVacancyId, appId);
    }

    this.jobInterviewerRepo.merge(interviewer, dto);
    return await this.jobInterviewerRepo.save(interviewer);
  }

  async findAllJobInterviewers(
    queryString: any,
  ): Promise<{ data: JobInterviewer[]; total: number }> {
    const appId = this.getAppId();

    const query = this.jobInterviewerRepo
      .createQueryBuilder('jobInterviewer')
      .leftJoinAndSelect('jobInterviewer.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoin('jobInterviewer.jobVacancy', 'jobVacancy')
      .select([
        'jobInterviewer.id',
        'jobInterviewer.appId',
        'jobInterviewer.jobVacancyId',
        'jobInterviewer.employeeId',
        'jobInterviewer.createdAt',
        'jobInterviewer.updatedAt',
        'employee.id',
        'employee.employeeCode',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'jobVacancy.id',
        'jobVacancy.jobTitle',
        'jobVacancy.noOfVacancies',
        'jobVacancy.applicationDeadline',
        'jobVacancy.workplace',
      ]);

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('jobInterviewer.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('jobInterviewer.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.employeeId) {
      query.andWhere('jobInterviewer.employeeId = :employeeId', {
        employeeId: Number(params.employeeId),
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobInterviewerById(id: number): Promise<JobInterviewer> {
    const appId = this.getAppId();

    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id, appId },
      relations: ['employee', 'employee.user'],
      select: {
        id: true,
        appId: true,
        jobVacancyId: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
        jobVacancy: {
          id: true,
          jobTitle: true,
          noOfVacancies: true,
          applicationDeadline: true,
          workplace: true,
        },
        employee: {
          id: true,
          employeeCode: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!interviewer) {
      throw new NotFoundException(`JobInterviewer with ID ${id} not found`);
    }

    return interviewer;
  }

  async deleteJobInterviewer(id: number): Promise<void> {
    const appId = this.getAppId();

    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id, appId },
    });

    if (!interviewer) {
      throw new NotFoundException(`JobInterviewer with ID ${id} not found`);
    }

    await this.jobInterviewerRepo.delete(id);
  }

  async syncJobInterviewers(
    dto: SyncJobInterviewersDto,
  ): Promise<JobInterviewer[]> {
    const appId = this.getAppId();

    const { jobVacancyId, employeeIds } = dto;

    if (!employeeIds || employeeIds.length === 0) {
      throw new BadRequestException('Employee IDs array is required');
    }

    const vacancy = await this.recruitmentService.findJobVacancyById(
      jobVacancyId,
      appId,
    );

    const existingInterviewers = await this.jobInterviewerRepo.find({
      where: { appId, jobVacancyId },
    });

    const existingEmployeeIds = existingInterviewers.map((i) => i.employeeId);

    const interviewersToRemove = existingInterviewers.filter(
      (i) => !employeeIds.includes(i.employeeId),
    );

    const newEmployeeIdsToAdd = employeeIds.filter(
      (id) => !existingEmployeeIds.includes(id),
    );

    if (interviewersToRemove.length > 0) {
      await this.jobInterviewerRepo.remove(interviewersToRemove);
    }

    if (newEmployeeIdsToAdd.length > 0) {
      const interviewersToSave = newEmployeeIdsToAdd.map((employeeId) =>
        this.jobInterviewerRepo.create({
          appId,
          jobVacancyId,
          employeeId,
        }),
      );

      const savedInterviewers =
        await this.jobInterviewerRepo.save(interviewersToSave);

      const savedIds = savedInterviewers.map((i) => i.id);
      const newlyAddedDetails = await this.jobInterviewerRepo.find({
        where: { id: In(savedIds), appId },
        relations: ['employee', 'employee.user'],
      });

      for (const interviewer of newlyAddedDetails) {
        if (interviewer.employee?.user?.email) {
          const user = interviewer.employee.user;
          this.mailService
            .sendMail(
              user.email,
              'You have been assigned to a hiring team 🎉',
              'vacancy-interviewer-assignment',
              {
                name: user.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Interviewer',
                email: user.email,
                jobTitle: vacancy?.jobTitle || 'a job vacancy',
              },
            )
            .catch((err) =>
              console.error(
                'Failed to send sync interviewer assignment email:',
                err,
              ),
            );
        }
      }
    }

    return this.jobInterviewerRepo.find({
      where: { appId, jobVacancyId },
      relations: ['employee', 'employee.user'],
    });
  }
}
