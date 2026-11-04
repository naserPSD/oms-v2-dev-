import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmpInvitation } from '../entities/employee-invitations.entity';

export class CreateEmpInvitationDto {
  // @ApiProperty({ required: true, example: 0 })
  // @IsInt()
  id: number = 0;

  //@ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  appId?: number;

  @ApiProperty({ required: true, example: 1 })
  @IsInt()
  officeId: number;

  //@ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  shiftId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 11 })
  @IsOptional()
  @IsInt()
  designationId?: number;

  // @ApiProperty({ required: false, example: 90 })
  @IsOptional()
  @IsInt()
  invitationStatusId?: number = 90;

  @IsOptional()
  @IsString()
  code?: string;
}

//@ApiProperty({ required: false, example: '2025-09-03T10:00:00Z' })
// @IsOptional()
// @IsDateString()
// sentAt?: string;

// //@ApiProperty({ required: false, example: '2025-09-04T10:00:00Z' })
// @IsOptional()
// @IsDateString()
// confirmedAt?: string;

//@ApiProperty({ required: false, })
// @IsOptional()
// @IsInt()
// empId: number;

export class AcceptInvitationDto {
  @ApiProperty({ example: 1, description: 'Invitation ID' })
  id: string;
}

export class UpdateEmpInvitationStatusDto {
  @ApiProperty({ required: true, example: 91 })
  @IsInt()
  invitationStatusId: number;
}

export class UpdateEmpInvitationDto extends CreateEmpInvitationDto {}

export class EmpInvitationResponseDto {
  id: number;
  officeId: number;
  shiftId?: number | null;
  userId?: number | null;
  email: string;
  designationId?: number | null;
  invitationStatusId: number;
  code: string;
  sentAt?: Date | null;
  confirmedAt?: Date | null;
  empId?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  static fromEntity(entity: EmpInvitation): EmpInvitationResponseDto {
    const dto = new EmpInvitationResponseDto();
    dto.id = entity.id;
    dto.officeId = entity.officeId;
    dto.shiftId = entity.shiftId ?? null;
    dto.userId = entity.userId ?? null;
    dto.email = entity.email;
    dto.designationId = entity.designationId ?? null;
    dto.invitationStatusId = entity.invitationStatusId;
    dto.code = entity.code;
    dto.sentAt = entity.sentAt ?? null;
    dto.confirmedAt = entity.confirmedAt ?? null;
    dto.empId = entity.empId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt ?? null;
    return dto;
  }
}
