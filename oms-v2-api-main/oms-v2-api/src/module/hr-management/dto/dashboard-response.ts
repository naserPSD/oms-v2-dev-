import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { AssetType } from '../entities/asset-types.entity';

export interface RequisitionInfo {
  id: number;
  itemDescription: string;
  employeeName: string;
}

export class DashboardResponseDto {
  @ApiProperty()
  attendanceStatistics: any;

  @ApiProperty()
  accounts: any;

  @ApiProperty()
  requisitions: any;

  @ApiProperty()
  crm: any;

  @ApiProperty()
  calendarOverview: any;

  @ApiProperty()
  timelineSchedules: any;

  static from(permission: any): DashboardResponseDto {
    const dto = plainToInstance(DashboardResponseDto, permission, {
      excludeExtraneousValues: true,
    });
    return dto;
  }
}
