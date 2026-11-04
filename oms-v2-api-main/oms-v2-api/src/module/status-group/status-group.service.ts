import { APIFeatures } from '@core/utils/apiFeatures';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStatusGroupDto } from './dto/create-status-group.dto';
import { SearchStatusGroupDto } from './dto/search-status-group.dto';
import { UpdateStatusGroupDto } from './dto/update-status-group.dto';
import { StatusGroup } from './entities/status-group.entity';

@Injectable()
export class StatusGroupService {
  constructor(
    @InjectRepository(StatusGroup)
    private statusGroupRepository: Repository<StatusGroup>,
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

  async create(createStatusGroupDto: CreateStatusGroupDto) {
    return this.statusGroupRepository.save(createStatusGroupDto);
  }

  async findAll(
    queryString: any,
  ): Promise<{ data: StatusGroup[]; total: number }> {
    const params = this.parseParams(queryString);
    const query = this.statusGroupRepository.createQueryBuilder('rg');
    query.where('rg.deletedAt IS NULL');

    if (params.name?.trim?.()) {
      query.andWhere('rg.name LIKE :name', {
        name: `%${String(params.name).trim()}%`,
      });
      delete params.name;
    }
    if (params.code?.trim?.()) {
      query.andWhere('rg.code LIKE :code', {
        code: `%${String(params.code).trim()}%`,
      });
      delete params.code;
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

  async findOne(idOrCode: any) {
    if (typeof idOrCode == 'string') {
      return this.statusGroupRepository.findOne({
        where: { code: idOrCode },
        relations: ['statuss'],
      });
    } else {
      return this.statusGroupRepository.findOne({
        where: { id: idOrCode },
        relations: ['statuses'],
      });
    }
  }

  async update(id: number, updateStatusGroupDto: UpdateStatusGroupDto) {
    // return this.statusGroupRepository.update(id, updateStatusGroupDto);
    const findItem = await this.statusGroupRepository.findOne({
      where: { id: id },
    });

    if (!findItem) {
      throw new Error('Status group not found');
    }

    return this.statusGroupRepository.save({
      ...findItem,
      ...updateStatusGroupDto,
    });
  }

  async remove(id: number) {
    const result = await this.statusGroupRepository.softDelete(id);

    if (result.affected === 0) {
      throw new Error('Status group not found');
    }
    return null;
  }

  async search(queryString: SearchStatusGroupDto): Promise<StatusGroup[]> {
    const query = this.statusGroupRepository.createQueryBuilder('rg'); // 'rg' is alias of the table name 'cm_status_groups'

    if (queryString.name?.trim()) {
      query.andWhere('rg.name LIKE :name', { name: `%${queryString.name}%` });
    }

    if (queryString.code?.trim()) {
      query.andWhere('rg.code = :code', { code: queryString.code });
    }

    // if (queryString.is_active !== undefined) {
    //   query.andWhere('rg.is_active = :is_active', {
    //     is_active: queryString.is_active,
    //   });
    // }

    return query.getMany();
  }
}
