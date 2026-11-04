import { APIFeatures } from '@core/utils/apiFeatures';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  private parseParams(queryString: any): Record<string, any> {
    const raw = queryString?.params;
    if (!raw) {
      return {};
    }
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : { ...raw };
    } catch {
      return {};
    }
  }

  private mapStatusPayload(
    dto: CreateStatusDto | UpdateStatusDto,
  ): Partial<Status> {
    const payload: Partial<Status> = {};
    if (dto.name !== undefined) {
      payload.name = dto.name;
    }
    if (dto.code !== undefined) {
      payload.code = dto.code;
    }
    if (dto.serial !== undefined) {
      payload.serial = dto.serial;
    }
    if (dto.data !== undefined) {
      payload.data = dto.data;
    }
    if (dto.color_name !== undefined) {
      payload.colorName = dto.color_name;
    }
    if (dto.is_active !== undefined) {
      payload.isActive = dto.is_active;
    }
    const groupId = (dto as CreateStatusDto).status_group_id;
    if (groupId !== undefined && groupId !== null) {
      payload.statusGroup = { id: groupId } as Status['statusGroup'];
    }
    return payload;
  }

  async create(createStatusDto: CreateStatusDto) {
    return this.statusRepository.save(this.mapStatusPayload(createStatusDto));
  }

  async findAll(queryString: any): Promise<{ data: Status[]; total: number }> {
    const params = this.parseParams(queryString);
    const query = this.statusRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.statusGroup', 'statusGroup')
      .where('s.deletedAt IS NULL');

    if (params.name?.trim?.()) {
      query.andWhere('s.name LIKE :name', {
        name: `%${String(params.name).trim()}%`,
      });
      delete params.name;
    }
    if (params.code?.trim?.()) {
      query.andWhere('s.code LIKE :code', {
        code: `%${String(params.code).trim()}%`,
      });
      delete params.code;
    }
    const statusGroupId =
      params.statusGroupId ?? params.status_group_id ?? params.statusGroup_id;
    if (statusGroupId !== undefined && statusGroupId !== '') {
      query.andWhere('statusGroup.id = :statusGroupId', {
        statusGroupId: Number(statusGroupId),
      });
      delete params.statusGroupId;
      delete params.status_group_id;
      delete params.statusGroup_id;
    }

    const featuresQuery = { ...queryString };
    if (Object.keys(params).length > 0) {
      featuresQuery.params = JSON.stringify(params);
    } else {
      delete featuresQuery.params;
    }

    const features = new APIFeatures(query, featuresQuery)
      .searching()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total: total,
    };
  }

  async findOne(id: number) {
    const status = await this.statusRepository.findOne({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    // return this.statusRepository.update(id, updateStatusDto);
    const findItem = await this.statusRepository.findOne({
      where: { id },
    });

    if (!findItem) {
      throw new Error('Statuss not found');
    }

    return this.statusRepository.save({
      ...findItem,
      ...this.mapStatusPayload(updateStatusDto),
    });
  }

  async remove(id: number) {
    const result = await this.statusRepository.softDelete(id);

    if (result.affected === 0) {
      throw new Error('Statuss not found');
    }
    return null;
  }
}
