import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OfficeService } from './office.service';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@module/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Office')
@Controller('api/v1/Office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}
}
