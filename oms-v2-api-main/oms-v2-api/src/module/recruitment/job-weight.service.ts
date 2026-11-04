import { InjectRepository } from '@nestjs/typeorm';
import { JobWeight } from '@module/recruitment/entitities/job-weights.entity';
import { In, Repository } from 'typeorm';
import {
  CreateJobWeightDto,
  UpdateJobWeightDto,
} from '@module/recruitment/dto/job-weight.dto';
import { RequestContext } from '@common/request-context';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RecruitmentService } from '@module/recruitment/recruitment.service';
import { APIFeatures } from '@core/utils/apiFeatures';

export class JobWeightService {
  constructor(
    @InjectRepository(JobWeight)
    private readonly jobWeightRepo: Repository<JobWeight>,

    private recruitmentService: RecruitmentService,
  ) {}

  private getAppId(): number {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new BadRequestException('App id not found');
    }
    return appId;
  }

  async createJobWeight(dto: CreateJobWeightDto): Promise<JobWeight> {
    const appId = this.getAppId();

    await this.recruitmentService.findJobVacancyById(dto.jobVacancyId, appId);

    const newJobWeight = this.jobWeightRepo.create({
      ...dto,
      appId,
    });

    return await this.jobWeightRepo.save(newJobWeight);
  }

  async createBulkJobWeights(dtos: CreateJobWeightDto[]): Promise<JobWeight[]> {
    const appId = this.getAppId();

    if (!dtos || dtos.length === 0) {
      throw new BadRequestException('No job weights provided');
    }

    const vacancyIds = [...new Set(dtos.map((dto) => dto.jobVacancyId))];

    if (vacancyIds.length > 0) {
      await this.recruitmentService.validateJobVacancyExists(vacancyIds, appId);
    }

    const jobWeightsToSave = dtos.map((dto) =>
      this.jobWeightRepo.create({
        ...dto,
        appId,
      }),
    );

    return await this.jobWeightRepo.save(jobWeightsToSave);
  }

  async updateJobWeight(dto: UpdateJobWeightDto): Promise<JobWeight> {
    const appId = this.getAppId();

    const jobWeight = await this.jobWeightRepo.findOne({
      where: { id: dto.id, appId },
    });

    if (!jobWeight) {
      throw new NotFoundException(`Job weight with ID ${dto.id} not found`);
    }

    if (dto.jobVacancyId) {
      await this.recruitmentService.findJobVacancyById(dto.jobVacancyId, appId);
    }

    this.jobWeightRepo.merge(jobWeight, dto);
    return await this.jobWeightRepo.save(jobWeight);
  }

  async findAllJobWeights(
    queryString: any,
  ): Promise<{ data: JobWeight[]; total: number }> {
    const appId = this.getAppId();

    const query = this.jobWeightRepo.createQueryBuilder('jobWeight');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    query.andWhere('jobWeight.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(`jobWeight.weightName LIKE :search`, {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.jobVacancyId) {
      query.andWhere('jobWeight.jobVacancyId = :jobVacancyId', {
        jobVacancyId: Number(params.jobVacancyId),
      });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findAllJobWeightsDropdown(): Promise<any> {
    const appId = this.getAppId();

    const featureData = this.jobWeightRepo
      .createQueryBuilder('jobWeight')
      .select(['jobWeight.id', 'jobWeight.weightName', 'jobWeight.weightValue'])
      .andWhere('jobWeight.appId = :appId', { appId })
      .getMany();
    return featureData;
  }
  async findJobWeightById(id: number): Promise<JobWeight> {
    const appId = this.getAppId();

    const jobWeight = await this.jobWeightRepo.findOne({
      where: { id, appId },
    });

    if (!jobWeight) {
      throw new NotFoundException(`JobWeight with ID ${id} not found`);
    }

    return jobWeight;
  }

  async deleteJobWeight(id: number): Promise<void> {
    const appId = this.getAppId();

    const jobWeight = await this.jobWeightRepo.findOne({
      where: { id, appId },
    });

    if (!jobWeight) {
      throw new NotFoundException(`JobWeight with ID ${id} not found`);
    }

    await this.jobWeightRepo.delete(id);
  }
}
