import { RequestContext } from '@common/request-context';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JobInterviewSchedule } from './entitities/job-interview-schedules.entity';
import { JobApplicantInterviewer } from './entitities/job-applicant-interviewers.entity';
import { JobWeight } from './entitities/job-weights.entity';
import { JobInterviewer } from './entitities/job-interviewers.entity';
import { JobInterviewWeight } from '@module/recruitment/entitities/job-interview-weights.entity';
import { MailService } from '../../mail/mail.service';
import { CreateJobInterviewScheduleDto } from '@module/recruitment/dto/job-interview-schedule.dto';
import { APIFeatures } from '@core/utils/apiFeatures';
import { JobApplicant } from '@module/recruitment/entitities/job-applicants.entity';

@Injectable()
export class JobInterviewScheduleService {
  constructor(
    @InjectRepository(JobInterviewSchedule)
    private readonly scheduleRepo: Repository<JobInterviewSchedule>,

    @InjectRepository(JobApplicantInterviewer)
    private readonly applicantInterviewerRepo: Repository<JobApplicantInterviewer>,

    @InjectRepository(JobInterviewWeight)
    private readonly interviewWeightRepo: Repository<JobInterviewWeight>,

    @InjectRepository(JobWeight)
    private readonly jobWeightRepo: Repository<JobWeight>,

    @InjectRepository(JobInterviewer)
    private readonly jobInterviewerRepo: Repository<JobInterviewer>,

    @InjectRepository(JobApplicant)
    private readonly jobApplicantRepo: Repository<JobApplicant>,

    private readonly mailService: MailService,
  ) {}

  private getAppId(): number {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('App id not found');
    }
    return appId;
  }

  private getUserId(): number {
    const userId = RequestContext.get('userId');
    if (!userId) {
      throw new BadRequestException('User id not found in context');
    }
    return userId;
  }

  async createOrUpdateInterviewSchedule(
    dto: CreateJobInterviewScheduleDto,
  ): Promise<JobInterviewSchedule> {
    const appId = this.getAppId();
    const creatorId = this.getUserId();

    const [jobWeights, generalInterviewers] = await Promise.all([
      this.jobWeightRepo.find({
        where: { jobVacancyId: dto.jobVacancyId, appId },
      }),
      this.jobInterviewerRepo.find({
        where: {
          id: In(dto.interviewerIds),
          jobVacancyId: dto.jobVacancyId,
          appId,
        },
        relations: ['employee', 'employee.user'],
      }),
    ]);

    const weightSubjects = jobWeights.length;
    const totalWeight = jobWeights.reduce(
      (sum, weight) => sum + (weight.weightValue || 0),
      0,
    );
    const totalInterviewer = dto.interviewerIds.length;

    if (generalInterviewers.length !== dto.interviewerIds.length) {
      throw new BadRequestException(
        'One or more selected interviewer IDs are invalid or not assigned to this vacancy.',
      );
    }

    let savedSchedule: JobInterviewSchedule;

    if (dto.id) {
      const schedule = await this.scheduleRepo.findOne({
        where: { id: dto.id, appId },
      });

      if (!schedule) {
        throw new NotFoundException(
          `Job Interview Schedule with ID ${dto.id} not found.`,
        );
      }

      const existingWeights = await this.interviewWeightRepo.find({
        where: { jobInterviewScheduleId: schedule.id, appId },
      });

      const totalMarkings = existingWeights.reduce(
        (sum, w) => sum + (w.weightMarking || 0),
        0,
      );
      const avgTotalWeightMark =
        totalInterviewer > 0 ? Math.round(totalMarkings / totalInterviewer) : 0;

      schedule.scheduleDatetime = dto.scheduleDatetime
        ? new Date(dto.scheduleDatetime)
        : null;
      schedule.locationType = dto.locationType ?? null;
      schedule.officeId = dto.officeId ?? null;
      schedule.url = dto.url ?? null;
      schedule.weightSubjects = weightSubjects;
      schedule.totalWeight = totalWeight;
      schedule.totalInterviewer = totalInterviewer;
      schedule.totalWeightMark = avgTotalWeightMark;

      if (dto.interviewCompleted !== undefined) {
        schedule.interviewCompleted = dto.interviewCompleted;
      }

      savedSchedule = await this.scheduleRepo.save(schedule);

      const newlyAddedInterviewers =
        await this.syncApplicantInterviewersAndWeights(
          appId,
          creatorId,
          savedSchedule.id,
          dto.jobApplicantId,
          dto.jobVacancyId,
          generalInterviewers,
          jobWeights,
        );
      this.notifyInterviewers(newlyAddedInterviewers, dto);
    } else {
      const newSchedule = this.scheduleRepo.create({
        appId,
        creatorId,
        jobVacancyId: dto.jobVacancyId,
        jobApplicantId: dto.jobApplicantId,
        scheduleDatetime: dto.scheduleDatetime
          ? new Date(dto.scheduleDatetime)
          : null,
        locationType: dto.locationType,
        officeId: dto.officeId,
        url: dto.url,
        weightSubjects: weightSubjects,
        totalWeight: totalWeight,
        totalInterviewer: totalInterviewer,
        totalWeightMark: 0,
        interviewCompleted: false,
      });

      savedSchedule = await this.scheduleRepo.save(newSchedule);

      await this.syncApplicantInterviewersAndWeights(
        appId,
        creatorId,
        savedSchedule.id,
        dto.jobApplicantId,
        dto.jobVacancyId,
        generalInterviewers,
        jobWeights,
      );

      this.notifyInterviewers(generalInterviewers, dto);
    }

    await this.jobApplicantRepo.update(
      { id: dto.jobApplicantId, appId },
      { jobInterviewScheduleId: savedSchedule.id },
    );

    return savedSchedule;
  }

  private async syncApplicantInterviewersAndWeights(
    appId: number,
    creatorId: number,
    scheduleId: number,
    applicantId: number,
    vacancyId: number,
    generalInterviewers: JobInterviewer[],
    jobWeights: JobWeight[],
  ): Promise<JobInterviewer[]> {
    const currentAppInterviewers = await this.applicantInterviewerRepo.find({
      where: { jobInterviewScheduleId: scheduleId, appId },
    });

    const incomingEmployeeIds = generalInterviewers.map((gi) => gi.employeeId);
    const incomingInterviewerIds = generalInterviewers.map((gi) => gi.id);

    const interviewersToRemove = currentAppInterviewers.filter(
      (cai) => !incomingEmployeeIds.includes(cai.employeeId),
    );

    if (interviewersToRemove.length > 0) {
      await this.applicantInterviewerRepo.remove(interviewersToRemove);

      const currentWeights = await this.interviewWeightRepo.find({
        where: { jobInterviewScheduleId: scheduleId, appId },
      });

      const weightsToDelete = currentWeights.filter(
        (w) =>
          w.jobInterviewerId !== undefined &&
          !incomingInterviewerIds.includes(w.jobInterviewerId),
      );

      if (weightsToDelete.length > 0) {
        await this.interviewWeightRepo.remove(weightsToDelete);
      }
    }

    const newInterviewers: any[] = [];
    const newWeightsToSave: any[] = [];
    const newlyAddedGeneralInterviewers: JobInterviewer[] = [];

    for (const interviewer of generalInterviewers) {
      const exists = currentAppInterviewers.find(
        (cai) => cai.employeeId === interviewer.employeeId,
      );

      if (!exists) {
        newlyAddedGeneralInterviewers.push(interviewer);

        newInterviewers.push(
          this.applicantInterviewerRepo.create({
            appId,
            creatorId,
            jobInterviewScheduleId: scheduleId,
            jobApplicantId: applicantId,
            jobVacancyId: vacancyId,
            employeeId: interviewer.employeeId,
            interviewStatus: 'Pending',
          }),
        );

        const weights = jobWeights.map((weight) =>
          this.interviewWeightRepo.create({
            appId,
            creatorId,
            jobVacancyId: vacancyId,
            jobApplicantId: applicantId,
            jobInterviewerId: interviewer.id,
            jobInterviewScheduleId: scheduleId,
            jobWeightId: weight.id,
            weightMarking: 0,
          }),
        );
        newWeightsToSave.push(...weights);
      }
    }

    if (newInterviewers.length > 0) {
      await this.applicantInterviewerRepo.save(newInterviewers);
    }
    if (newWeightsToSave.length > 0) {
      await this.interviewWeightRepo.save(newWeightsToSave);
    }

    return newlyAddedGeneralInterviewers;
  }

  private notifyInterviewers(
    interviewers: JobInterviewer[],
    dto: CreateJobInterviewScheduleDto,
  ) {
    for (const interviewer of interviewers) {
      if (interviewer.employee?.user?.email) {
        const user = interviewer.employee.user;
        this.mailService
          .sendMail(
            user.email,
            'New Interview Schedule Assigned 📅',
            'interviewer-assignment',
            {
              name: user.firstName
                ? `${user.firstName} ${user.lastName}`
                : 'Interviewer',
              email: user.email,
              scheduleDatetime: dto.scheduleDatetime,
              interviewLocation: dto.url || 'Office',
              isUrl: !!dto.url,
            },
          )
          .catch((err) => console.error('Failed to send schedule email:', err));
      }
    }
  }

  async findAllJobInterviewSchedules(
    queryString: any,
  ): Promise<{ data: JobInterviewSchedule[]; total: number }> {
    const appId = this.getAppId();

    const query = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.jobVacancy', 'jobVacancy')
      .leftJoinAndSelect('schedule.jobApplicant', 'jobApplicant')
      .leftJoinAndSelect('schedule.office', 'office')
      .leftJoinAndSelect('schedule.creator', 'creator');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('schedule.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.jobVacancyId) {
      query.andWhere('schedule.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    if (params.jobApplicantId) {
      query.andWhere('schedule.jobApplicantId = :jobApplicantId', {
        jobApplicantId: Number(params.jobApplicantId),
      });
    }

    if (params.locationType) {
      query.andWhere('schedule.locationType = :locationType', {
        locationType: params.locationType,
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findJobInterviewScheduleById(id: number) {
    const appId = this.getAppId();

    const schedule = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoin('schedule.jobVacancy', 'jobVacancy')
      .leftJoin('schedule.jobApplicant', 'jobApplicant')
      .where('schedule.id = :id', { id })
      .andWhere('schedule.appId = :appId', { appId })
      .select([
        'schedule.id',
        'schedule.scheduleDatetime',
        'schedule.locationType',
        'schedule.officeId',
        'schedule.url',
        'schedule.interviewCompleted',
        'schedule.weightSubjects',
        'schedule.totalWeight',
        'schedule.totalInterviewer',
        'schedule.totalWeightMark',

        'jobVacancy.id',
        'jobVacancy.jobTitle',

        'jobApplicant.id',
        'jobApplicant.firstName',
        'jobApplicant.lastName',
      ])
      .getOne();

    if (!schedule) {
      throw new NotFoundException();
    }

    const [interviewers, weights] = await Promise.all([
      this.applicantInterviewerRepo
        .createQueryBuilder('jai')
        .leftJoin('jai.employee', 'employee')
        .leftJoin('employee.user', 'user')
        .select([
          'jai.id',
          'jai.employeeId',

          'employee.id',
          'employee.employeeCode',

          'user.id',
          'user.firstName',
          'user.lastName',
        ])
        .where('jai.jobInterviewScheduleId = :id', { id })
        .andWhere('jai.appId = :appId', { appId })
        .getMany(),

      this.interviewWeightRepo.find({
        where: { jobInterviewScheduleId: id, appId },
        relations: ['jobWeight', 'jobInterviewer.employee'],
        select: [
          'id',
          'jobWeightId',
          'jobWeight',
          'jobInterviewer',
          'weightMarking',
        ],
      }),
    ]);

    return {
      ...schedule,
      jobApplicantInterviewers: interviewers,
      jobInterviewWeights: weights,
    };
  }

  async deleteJobInterviewSchedule(id: number): Promise<void> {
    const appId = this.getAppId();

    const schedule = await this.scheduleRepo.findOne({
      where: { id, appId },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Job Interview Schedule with ID ${id} not found`,
      );
    }

    await this.scheduleRepo.delete(id);
  }
}
