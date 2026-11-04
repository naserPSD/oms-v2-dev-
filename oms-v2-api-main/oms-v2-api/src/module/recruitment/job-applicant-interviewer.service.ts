import { RequestContext } from '@common/request-context';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';
import { JobApplicantInterviewer } from './entitities/job-applicant-interviewers.entity';
import {
  CreateJobApplicantInterviewerDto,
  UpdateJobApplicantInterviewerDto,
} from '@module/recruitment/dto/job-applicant-interviewer.dto';

@Injectable()
export class JobApplicantInterviewerService {
  constructor(
    @InjectRepository(JobApplicantInterviewer)
    private readonly jobApplicantInterviewerRepo: Repository<JobApplicantInterviewer>,
  ) {}

  async createJobApplicantInterviewer(
    dto: CreateJobApplicantInterviewerDto,
  ): Promise<JobApplicantInterviewer> {
    const appId = RequestContext.get('activeAppId');
    const userId = RequestContext.get('userId');

    if (!appId) {
      throw new BadRequestException('App id not found');
    }

    if (!userId) {
      throw new BadRequestException(
        'User id not found in request context for creatorId',
      );
    }

    const existingRecord = await this.jobApplicantInterviewerRepo.findOne({
      where: {
        appId,
        jobApplicantId: dto.jobApplicantId,
        jobVacancyId: dto.jobVacancyId,
        employeeId: dto.employeeId,
      },
    });

    if (existingRecord) {
      throw new BadRequestException(
        'This employee is already assigned to interview this applicant for this vacancy.',
      );
    }

    const newInterviewer = this.jobApplicantInterviewerRepo.create({
      ...dto,
      creatorId: userId,
    });

    return await this.jobApplicantInterviewerRepo.save(newInterviewer);
  }

  async updateJobApplicantInterviewer(
    id: number,
    dto: UpdateJobApplicantInterviewerDto,
  ): Promise<JobApplicantInterviewer> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('App id not found');
    }

    const interviewer = await this.jobApplicantInterviewerRepo.findOne({
      where: { id, appId },
    });

    if (!interviewer) {
      throw new NotFoundException(
        `JobApplicantInterviewer with ID ${id} not found`,
      );
    }

    this.jobApplicantInterviewerRepo.merge(interviewer, dto);
    return await this.jobApplicantInterviewerRepo.save(interviewer);
  }

  async findAllJobApplicantInterviewers(
    queryString: any,
  ): Promise<{ data: JobApplicantInterviewer[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App id not found');
    }

    const query = this.jobApplicantInterviewerRepo
      .createQueryBuilder('interviewer')
      .leftJoinAndSelect('interviewer.jobApplicant', 'jobApplicant')
      .leftJoinAndSelect('interviewer.jobVacancy', 'jobVacancy')
      .leftJoinAndSelect('interviewer.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('interviewer.jobInterviewSchedule', 'schedule')
      .leftJoinAndSelect('interviewer.creator', 'creator');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('interviewer.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('interviewer.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.jobApplicantId) {
      query.andWhere('interviewer.jobApplicantId = :jobApplicantId', {
        jobApplicantId: Number(params.jobApplicantId),
      });
    }

    if (params.employeeId) {
      query.andWhere('interviewer.employeeId = :employeeId', {
        employeeId: Number(params.employeeId),
      });
    }

    if (params.jobInterviewScheduleId) {
      query.andWhere(
        'interviewer.jobInterviewScheduleId = :jobInterviewScheduleId',
        {
          jobInterviewScheduleId: Number(params.jobInterviewScheduleId),
        },
      );
    }

    if (params.interviewStatus) {
      query.andWhere('interviewer.interviewStatus = :interviewStatus', {
        interviewStatus: params.interviewStatus,
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobApplicantInterviewerById(
    id: number,
  ): Promise<JobApplicantInterviewer> {
    const appId = RequestContext.get('activeAppId');

    const interviewer = await this.jobApplicantInterviewerRepo.findOne({
      where: { id, appId },
      relations: [
        'jobApplicant',
        'jobVacancy',
        'employee',
        'employee.user',
        'jobInterviewSchedule',
        'creator',
      ],
    });

    if (!interviewer) {
      throw new NotFoundException(
        `JobApplicantInterviewer with ID ${id} not found`,
      );
    }

    return interviewer;
  }

  async deleteJobApplicantInterviewer(id: number): Promise<void> {
    const appId = RequestContext.get('activeAppId');

    const interviewer = await this.jobApplicantInterviewerRepo.findOne({
      where: { id, appId },
    });

    if (!interviewer) {
      throw new NotFoundException(
        `JobApplicantInterviewer with ID ${id} not found`,
      );
    }

    await this.jobApplicantInterviewerRepo.delete(id);
  }
}
