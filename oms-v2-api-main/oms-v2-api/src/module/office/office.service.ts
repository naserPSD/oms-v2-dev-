import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeShift } from '../hr-management/entities/office-shift.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import {
  CreateOfficeShiftDto,
  OfficeShiftResponseDto,
} from '../hr-management/dto/office-shift.dto';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepo: Repository<Office>,
  ) {}

  // Create or Update Shift
}
