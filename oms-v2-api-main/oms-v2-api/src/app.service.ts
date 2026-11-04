import { StatusGroup } from '@module/status-group/entities/status-group.entity';
import { Status } from '@module/status/entities/status.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Status)
    private statusRepo: Repository<Status>,

    @InjectRepository(StatusGroup)
    private statusGroupRepo: Repository<StatusGroup>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
