import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CompanySetupDto,
  CreateInitialSetupDoc,
  PersonalSetupDto,
} from './dto/create-initial-setup.dto';
import { InitialSetupService } from './initial-setup.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Helpers } from '@core/utils/helpers';
import { ALLOWED_IMAGE_TYPES } from '@common/constants/file-constants';

function formatValidationErrors(errors: any[]): Record<string, string[]> {
  const result = {};
  for (const err of errors) {
    if (err.constraints) {
      result[err.property] = Object.values(err.constraints);
    }
    if (err.children && err.children.length > 0) {
      result[err.property] = formatValidationErrors(err.children);
    }
  }
  return result;
}

@ApiExtraModels(PersonalSetupDto, CompanySetupDto)
@Controller('api/v1/initial-setup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
export class InitialSetupController {
  constructor(private readonly initialSetupService: InitialSetupService) {}

  @Post()
  // @ApiBody({ type: CreateInitialSetupDoc })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 },
      // { name: 'logo', maxCount: 1 },
    ]),
  )
  // @ApiBody({
  //   schema: {
  //     oneOf: [
  //       { $ref: getSchemaPath(PersonalSetupDto) },
  //       { $ref: getSchemaPath(CompanySetupDto) },
  //     ],
  //   },
  // })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePic: { type: 'string', format: 'binary' },
        // logo: { type: 'string', format: 'binary' },
        setupType: { type: 'string', enum: ['personal', 'company'] },
        // Add other fields as needed for documentation
        // Or use oneOf as above for union DTOs
      },
      oneOf: [
        { $ref: getSchemaPath(PersonalSetupDto) },
        { $ref: getSchemaPath(CompanySetupDto) },
      ],
    },
  })
  async initialSetup(
    @UploadedFiles()
    files: {
      profilePic?: Express.Multer.File[];
      // logo?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    let dto: PersonalSetupDto | CompanySetupDto;

    if (body.setupType === 'personal') {
      const personalDto = plainToInstance(PersonalSetupDto, body);
      if (files.profilePic?.[0]) {
        Helpers.validateFile(files.profilePic[0], ALLOWED_IMAGE_TYPES);
        personalDto.profilePic = files.profilePic[0];
      }
      dto = personalDto;
    } else if (body.setupType === 'company') {
      const companyDto = plainToInstance(CompanySetupDto, body);
      // if (files.logo?.[0]) {
      //   Helpers.validateFile(files.logo[0], ALLOWED_IMAGE_TYPES);
      //   companyDto.logo = files.logo[0];
      // }
      dto = companyDto;
    } else {
      throw new BadRequestException('Invalid setupType');
    }

    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(formatValidationErrors(errors));
    }

    return this.initialSetupService.initialSetup(dto);
  }
}
