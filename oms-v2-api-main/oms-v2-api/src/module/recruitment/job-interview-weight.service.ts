import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobInterviewWeight } from '@module/recruitment/entitities/job-interview-weights.entity';
import { In, Repository } from 'typeorm';
import { JobInterviewSchedule } from '@module/recruitment/entitities/job-interview-schedules.entity';
import { JobApplicantInterviewer } from '@module/recruitment/entitities/job-applicant-interviewers.entity';
import { RequestContext } from '@common/request-context';
import {
  SubmitInterviewMarksDto,
  WeightMarkingDto,
} from '@module/recruitment/dto/job-weight.dto';
import { JobInterviewer } from '@module/recruitment/entitities/job-interviewers.entity';
import { JobApplicant } from '@module/recruitment/entitities/job-applicants.entity';
import { Remark } from '@module/recruitment/entitities/remarks.entity';
import { CreateApplicantRemarkDto } from '@module/recruitment/dto/remarks.dto';

@Injectable()
export class JobInterviewWeightService {
  constructor(
    @InjectRepository(JobInterviewWeight)
    private readonly interviewWeightRepo: Repository<JobInterviewWeight>,

    @InjectRepository(JobInterviewSchedule)
    private readonly scheduleRepo: Repository<JobInterviewSchedule>,

    @InjectRepository(JobApplicantInterviewer)
    private readonly applicantInterviewerRepo: Repository<JobApplicantInterviewer>,

    @InjectRepository(JobInterviewer)
    private readonly jobInterviewerRepo: Repository<JobInterviewer>,

    @InjectRepository(JobApplicant)
    private readonly jobApplicantRepo: Repository<JobApplicant>,

    @InjectRepository(Remark)
    private readonly remarkRepo: Repository<Remark>,
  ) {}

  private getAppId(): number {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('App id not found');
    }
    return appId;
  }

  async addApplicantRemark(dto: CreateApplicantRemarkDto): Promise<Remark> {
    const userId = RequestContext.get('userId');

    if (!userId) {
      throw new BadRequestException('User ID not found in context');
    }

    if (dto.id) {
      const existing = await this.remarkRepo.findOne({
        where: { id: dto.id },
      });

      if (!existing) {
        throw new NotFoundException('Remark not found');
      }

      if (existing.creatorId !== userId) {
        throw new ForbiddenException(
          'You are not allowed to update this remark',
        );
      }

      existing.description = dto.description;
      return await this.remarkRepo.save(existing);
    }

    const newRemark = this.remarkRepo.create({
      entity: 'applicants',
      entityId: dto.applicantId,
      description: dto.description,
      creatorId: userId,
    });

    return await this.remarkRepo.save(newRemark);
  }

  async submitInterviewMarks(dto: SubmitInterviewMarksDto): Promise<any> {
    const appId = this.getAppId();

    const weightIds = dto.markings.map((m) => m.jobInterviewWeightId);

    const existingWeights = await this.interviewWeightRepo.find({
      where: {
        id: In(weightIds),
        jobInterviewScheduleId: dto.jobInterviewScheduleId,
        jobInterviewerId: dto.jobInterviewerId,
        appId,
      },
      relations: ['jobWeight'],
    });

    const existingWeightsMap = new Map(existingWeights.map((w) => [w.id, w]));

    for (const mark of dto.markings) {
      const existing = existingWeightsMap.get(mark.jobInterviewWeightId);

      if (!existing) {
        throw new NotFoundException(
          `Interview weight record ${mark.jobInterviewWeightId} not found or doesn't belong to this schedule.`,
        );
      }

      const maxWeightValue = existing.jobWeight?.weightValue || 0;

      if (mark.weightMarking > maxWeightValue) {
        throw new BadRequestException(
          `Validation failed: Given score (${mark.weightMarking}) exceeds the maximum allowed score (${maxWeightValue}) for criteria '${existing.jobWeight?.weightName}'.`,
        );
      }
    }

    const updatePromises = dto.markings.map((mark) =>
      this.interviewWeightRepo.update(
        { id: mark.jobInterviewWeightId },
        { weightMarking: mark.weightMarking },
      ),
    );
    await Promise.all(updatePromises);

    const interviewer = await this.jobInterviewerRepo.findOne({
      where: { id: dto.jobInterviewerId },
      select: ['employeeId'],
    });

    if (!interviewer) {
      throw new Error('Interviewer not found');
    }

    await this.applicantInterviewerRepo.update(
      {
        jobInterviewScheduleId: dto.jobInterviewScheduleId,
        employeeId: interviewer.employeeId,
        appId,
      },
      { interviewStatus: 'Completed' },
    );

    await this.recalculateScheduleAverage(dto.jobInterviewScheduleId, appId);

    return { success: true, message: 'Interview marks submitted successfully' };
  }

  private async recalculateScheduleAverage(scheduleId: number, appId: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId, appId },
    });

    if (!schedule) return;

    const allWeights = await this.interviewWeightRepo.find({
      where: { jobInterviewScheduleId: scheduleId, appId },
    });

    const interviewerTotals: Record<number, number> = {};
    for (const weight of allWeights) {
      if (weight.jobInterviewerId == null) continue;

      if (!interviewerTotals[weight.jobInterviewerId]) {
        interviewerTotals[weight.jobInterviewerId] = 0;
      }
      interviewerTotals[weight.jobInterviewerId] += weight.weightMarking || 0;
    }

    const totalInterviewers = Object.keys(interviewerTotals).length;
    let sumOfAllTotals = 0;

    for (const interviewerId in interviewerTotals) {
      sumOfAllTotals += interviewerTotals[interviewerId];
    }

    const averageScore =
      totalInterviewers > 0
        ? Math.round(sumOfAllTotals / totalInterviewers)
        : 0;

    const applicantInterviewers = await this.applicantInterviewerRepo.find({
      where: { jobInterviewScheduleId: scheduleId, appId },
    });

    const allCompleted = applicantInterviewers.every(
      (ai) => ai.interviewStatus === 'Completed',
    );

    await this.scheduleRepo.update(
      { id: scheduleId, appId },
      {
        totalWeightMark: averageScore,
        interviewCompleted: allCompleted,
      },
    );

    // if (schedule.jobApplicantId) {
    //   await this.jobApplicantRepo.update(
    //     { id: schedule.jobApplicantId, appId },
    //     { interviewRating: averageScore },
    //   );
    // }
  }

  async getWeightDistribution(scheduleId: number): Promise<any> {
    const appId = this.getAppId();

    const schedule = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.jobApplicant', 'jobApplicant')
      .leftJoinAndSelect('schedule.jobVacancy', 'jobVacancy')
      .where('schedule.id = :scheduleId', { scheduleId })
      .andWhere('schedule.appId = :appId', { appId })
      .getOne();

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const weights = await this.interviewWeightRepo
      .createQueryBuilder('iw')
      .leftJoinAndSelect('iw.jobWeight', 'jw')
      .leftJoinAndSelect('iw.jobInterviewer', 'ji')
      .where('iw.jobInterviewScheduleId = :scheduleId', { scheduleId })
      .andWhere('iw.appId = :appId', { appId })
      .getMany();

    const empToJobInterviewerIdMap = new Map<number, number>();
    for (const w of weights) {
      if (w.jobInterviewer && w.jobInterviewer.employeeId) {
        if (w.jobInterviewerId != null) {
          empToJobInterviewerIdMap.set(
            w.jobInterviewer.employeeId,
            w.jobInterviewerId,
          );
        }
      }
    }

    const assignedInterviewers = await this.applicantInterviewerRepo
      .createQueryBuilder('ai')
      .leftJoinAndSelect('ai.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .where('ai.jobInterviewScheduleId = :scheduleId', { scheduleId })
      .andWhere('ai.appId = :appId', { appId })
      .getMany();

    const formattedInterviewers = assignedInterviewers.map((ai) => {
      const user = ai.employee?.user;
      const profile = user?.profile;

      return {
        jobInterviewerId: empToJobInterviewerIdMap.get(ai.employeeId) || 0,
        employeeId: ai.employeeId,
        userId: user?.id || null,
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        status: ai.interviewStatus || 'Pending',
        profilePicture: profile?.profilePicture?.fileUrl || null,
      };
    });

    const distribution = {
      scheduleDetails: {
        applicantName:
          `${schedule.jobApplicant?.firstName || ''} ${schedule.jobApplicant?.lastName || ''}`.trim(),
        designation: schedule.jobVacancy?.jobTitle,
        interviewDatetime: schedule.scheduleDatetime,
        averageScore: schedule.totalWeightMark,
        totalMaxWeight: schedule.totalWeight,
      },
      matrix: this.formatMatrixForFrontend(weights),
      interviewers: formattedInterviewers,
    };

    return distribution;
  }

  private formatMatrixForFrontend(weights: JobInterviewWeight[]) {
    const groupedWeights: Record<string, any> = {};

    for (const w of weights) {
      const weightName = w.jobWeight?.weightName || 'Unknown';
      const weightValue = w.jobWeight?.weightValue || 0;

      if (!groupedWeights[weightName]) {
        groupedWeights[weightName] = {
          weightName: weightName,
          weightValue: weightValue,
          weightAverage: 0,
          scores: {},
        };
      }

      if (w.jobInterviewerId !== undefined) {
        groupedWeights[weightName].scores[w.jobInterviewerId] = {
          jobInterviewWeightId: w.id,
          weightMarking: w.weightMarking,
        };
      }
    }

    const matrix = Object.values(groupedWeights).map((row: any) => {
      const scoreObjects = Object.values(row.scores || {}) as any[];
      const totalScore = scoreObjects.reduce(
        (sum: number, scoreObj: any) => sum + (Number(scoreObj?.weightMarking) || 0),
        0,
      );
      const interviewerCount = scoreObjects.length;

      row.weightAverage =
        interviewerCount > 0 ? Math.round(totalScore / interviewerCount) : 0;

      return row;
    });

    return matrix;
  }

  async getTopApplicantsByVacancy(
    jobVacancyId: number,
    limit: number = 10,
  ): Promise<any> {
    const appId = this.getAppId();

    const applicants = await this.jobApplicantRepo
      .createQueryBuilder('applicant')
      .leftJoinAndSelect('applicant.jobInterviewSchedule', 'schedule')
      .where('applicant.jobVacancyId = :jobVacancyId', { jobVacancyId })
      .andWhere('applicant.appId = :appId', { appId })
      .andWhere('schedule.totalWeightMark > 0')
      .orderBy('schedule.totalWeightMark', 'DESC')
      .take(limit)
      .getMany();

    if (applicants.length === 0) return [];

    const applicantIds = applicants.map((a) => a.id);

    const remarks = await this.remarkRepo
      .createQueryBuilder('remark')
      .leftJoinAndSelect('remark.creator', 'creator')
      .leftJoinAndSelect('creator.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .where('remark.entity = :entity', { entity: 'applicants' })
      .andWhere('remark.entityId IN (:...applicantIds)', { applicantIds })
      .orderBy('remark.createdAt', 'DESC')
      .getMany();

    const remarksMap = new Map();
    for (const remark of remarks) {
      if (!remarksMap.has(remark.entityId)) {
        remarksMap.set(remark.entityId, []);
      }
      remarksMap.get(remark.entityId).push({
        id: remark.id,
        description: remark.description,
        createdAt: remark.createdAt,
        creator: {
          id: remark.creator?.id,
          name: `${remark.creator?.firstName || ''} ${remark.creator?.lastName || ''}`.trim(),
          profilePicture: remark.creator?.profile?.profilePicture
            ? {
                id: remark.creator.profile.profilePicture.id,
                fileUrl: remark.creator.profile.profilePicture.fileUrl,
              }
            : null,
        },
      });
    }

    return applicants.map((applicant, index) => ({
      sl: index + 1,
      id: applicant.id,
      name: `${applicant.firstName} ${applicant.lastName}`.trim(),
      email: applicant.email,
      phone: applicant.phone,
      expectedSalary: applicant.expectedSalary,
      averageScore: applicant.jobInterviewSchedule?.totalWeightMark || 0 || 0,
      scheduleId: applicant.jobInterviewScheduleId || null,
      employeeId: applicant.employeeId || null,
      remarks: remarksMap.get(applicant.id) || [],
    }));
  }
}
