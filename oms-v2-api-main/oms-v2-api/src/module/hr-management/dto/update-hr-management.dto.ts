import { PartialType } from '@nestjs/swagger';
import { CreateHrManagementDto } from './create-hr-management.dto';

export class UpdateHrManagementDto extends PartialType(CreateHrManagementDto) {}
