import { Injectable } from '@nestjs/common';
import { CreateDbConfigDto } from './dto/create-db-config.dto';
import { UpdateDbConfigDto } from './dto/update-db-config.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DbConfig } from './entities/db-config.entity';
import { APIFeatures } from '@core/utils/apiFeatures';

@Injectable()
export class DbConfigsService {
  constructor(
    @InjectRepository(DbConfig)
    private dbConfigRepo: Repository<DbConfig>,
  ) {}

  async create(createDbConfigDto: CreateDbConfigDto) {
    const dbConfig = this.dbConfigRepo.create(createDbConfigDto);
    return this.dbConfigRepo.save(dbConfig).then((savedDbConfig) => {
      return savedDbConfig;
    });
  }

  async findAll(queryString: any) {
    // return this.dbConfigRepo.find();

    const query = this.dbConfigRepo.createQueryBuilder('rg'); // 'rg' is alias of the table name 'cm_status_groups'
    query;

    // Apply filtering, sorting, field limiting, and pagination using APIFeatures
    const features = new APIFeatures(query, queryString)
      .searching()
      .filter()
      .sort()
      .limitFields();

    // Get the filtered data
    const featureData = await features.getQuery().getMany(); // Get the total count of all non-deleted records using the IsNull operator
    // const total = await query.getCount();

    return featureData;
  }

  async findOne(idOrKey: string) {
    let where;
    // Check if the idOrKey is a number (ID) or a string (Key)
    if (!isNaN(Number(idOrKey))) {
      where = { id: Number(idOrKey) };
    } else {
      // Otherwise, search by key
      where = { key: idOrKey };
    }

    const dbConfig = await this.dbConfigRepo.findOne({ where });
    if (dbConfig) {
      return dbConfig;
    } else {
      throw new Error('DbConfig not found');
    }
  }

  async update(id: number, updateDbConfigDto: UpdateDbConfigDto) {
    return this.dbConfigRepo.update(id, updateDbConfigDto).then((result) => {
      if (result.affected === 0) {
        throw new Error('DbConfig not found or no changes made');
      }
      return this.dbConfigRepo.findOne({ where: { id } });
    });
  }

  remove(id: number) {
    this.dbConfigRepo.delete(id).then((result) => {
      if (result.affected === 0) {
        throw new Error('DbConfig not found');
      }
      return null;
    });
  }
}
