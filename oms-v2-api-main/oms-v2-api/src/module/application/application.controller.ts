import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import {
  ApplicationResponseDto,
  CreateApplicationDto,
  UpdateCompanyLogoDto,
} from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/departments.dto';

import { Designation } from './entities/designations.entity';
import {
  CreateDesignationDto,
  UpdateDesignationDto,
  ReorderDesignationsDto,
} from './dto/designations.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Application } from './entities/application.entity';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/service.dto';
import { User } from '@module/users/entities/user.entity';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { Helpers } from '@core/utils/helpers';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_LOGO_IMAGE_TYPES,
  MAX_LOGO_FILE_SIZE,
} from '@common/constants/file-constants';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Application')
@Controller('api/v1/application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  // @Post()
  // @ApiBody({ type: CreateApplicationDto })
  // @ApiOkResponse({ type: [Application], description: 'Store application' })
  // create(@Body() body: any) {
  //   // return body;
  //   return this.applicationService.create(body);
  // }

  @Post('/add-application')
  @ApiOperation({ summary: 'Add Application' })
  async addApplication(@Body() dto: CreateApplicationDto, @Req() req) {
    const application = await this.applicationService.CreateCompanyInfo(dto);

    return {
      status: 'success',
      message: `Application added successfully`,
      data: application,
    };
  }

  @Post('/update-company-profile/:id')
  @ApiOperation({ summary: 'Update copnany profile information' })
  async updateApplication(
    @Param('id') id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    const application = await this.applicationService.updateCompanyInfo(
      id,
      dto,
    );

    return {
      status: 'success',
      message: `Application updated successfully`,
      data: application,
    };
  }

  @Get('/get-company-profile')
  @ApiOperation({ summary: 'Get Company Profile' })
  async getCompanyProfile(@Req() req) {
    const application = await this.applicationService.getCompanyInfo();
    return {
      status: 'success',
      message: `Company profile retrieved successfully`,
      data: application,
    };
  }

  @Post('/update-company-logo')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'companyLogo', maxCount: 1 },
      { name: 'originalLogo', maxCount: 1 },
      { name: 'invoiceLogo', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update company logo (supports original, square profile, and rectangular invoice logos)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyLogo: {
          type: 'string',
          format: 'binary',
        },
        originalLogo: {
          type: 'string',
          format: 'binary',
        },
        invoiceLogo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiStandardResponses('Profile picture updated successfully', 200)
  async updateCompanyLogoFile(
    @UploadedFiles()
    files: {
      companyLogo?: Express.Multer.File[];
      originalLogo?: Express.Multer.File[];
      invoiceLogo?: Express.Multer.File[];
    },
    @Req() req,
  ) {
    const companyLogo = files?.companyLogo?.[0];
    const originalLogo = files?.originalLogo?.[0];
    const invoiceLogo = files?.invoiceLogo?.[0];

    if (!companyLogo && !originalLogo && !invoiceLogo) {
      throw new BadRequestException('Company logo file is required');
    }

    if (companyLogo) {
      Helpers.validateFile(
        companyLogo,
        ALLOWED_LOGO_IMAGE_TYPES,
        MAX_LOGO_FILE_SIZE,
      );
    }

    if (originalLogo) {
      Helpers.validateFile(
        originalLogo,
        ALLOWED_LOGO_IMAGE_TYPES,
        MAX_LOGO_FILE_SIZE,
      );
    }

    if (invoiceLogo) {
      Helpers.validateFile(
        invoiceLogo,
        ALLOWED_LOGO_IMAGE_TYPES,
        MAX_LOGO_FILE_SIZE,
      );
    }

    const updated = await this.applicationService.updateCompanyLogo(
      companyLogo,
      originalLogo,
      invoiceLogo,
    );

    return {
      message: `Company profile updated successfully`,
      data: updated,
    };
  }

  @Post('/update-company-original-logo')
  @UseInterceptors(FileInterceptor('originalLogo'))
  @ApiOperation({ summary: 'Update company original logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        originalLogo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiStandardResponses('Original logo updated successfully', 200)
  async updateCompanyOriginalLogoFile(
    @UploadedFile() originalLogo: Express.Multer.File,
    @Req() req,
  ) {
    if (!originalLogo) {
      throw new BadRequestException('Original logo file is required');
    }

    Helpers.validateFile(
      originalLogo,
      ALLOWED_LOGO_IMAGE_TYPES,
      MAX_LOGO_FILE_SIZE,
    );

    const updated =
      await this.applicationService.updateCompanyOriginalLogo(originalLogo);

    return {
      message: `Original logo updated successfully`,
      data: updated,
    };
  }

  @Post('/update-company-invoice-logo')
  @UseInterceptors(FileInterceptor('invoiceLogo'))
  @ApiOperation({ summary: 'Update company invoice logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceLogo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiStandardResponses('Invoice logo updated successfully', 200)
  async updateCompanyInvoiceLogoFile(
    @UploadedFile() invoiceLogo: Express.Multer.File,
    @Req() req,
  ) {
    if (!invoiceLogo) {
      throw new BadRequestException('Invoice logo file is required');
    }

    Helpers.validateFile(
      invoiceLogo,
      ALLOWED_LOGO_IMAGE_TYPES,
      MAX_LOGO_FILE_SIZE,
    );

    const updated =
      await this.applicationService.updateCompanyInvoiceLogo(invoiceLogo);

    return {
      message: `Invoice logo updated successfully`,
      data: updated,
    };
  }

  @Get()
  findAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get('/get-app-services')
  @ApiOperation({ summary: 'Get all Services' })
  async getAllAppServices(@Req() req) {
    const services = await this.applicationService.getAllAppServices(req.user);
    return {
      status: 'success',
      message: 'Services retrieved successfully',
      data: services,
    };
  }

  @Get('/check-service-duplicate')
  @ApiOperation({ summary: 'Check for an existing service name and type' })
  async checkServiceDuplicate(
    @Query('name') name: string,
    @Query('typeId') typeId: string,
    @Query('id') id?: string,
  ) {
    const isDuplicate = await this.applicationService.isDuplicateService(
      name,
      Number(typeId),
      id ? Number(id) : undefined,
    );
    return {
      status: 'success',
      message: 'Service duplicate check completed',
      data: { isDuplicate },
    };
  }

  @Get('/get-app-services-with-pagination')
  @ApiOperation({ summary: 'Get all Services with pagination' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Hosting", "typeId": 2 }',
    example: '{ "search": "Hosting", "typeId": 2 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Limit fields returned, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
  })
  async getAllServices(@Req() req, @Query() query: any) {
    const services = await this.applicationService.getAllServicesWithPagination(
      req.user,
      query,
    );

    return {
      status: 'success',
      message: 'Services retrieved successfully',
      data: services.data,
      pagination: Helpers.makePaginationData(query, services),
    };
  }

  @Get('/get-departments')
  async getAllDepartments() {
    const departments = await this.applicationService.findAllDepartments();
    return {
      status: 'success',
      message: 'Departments retrieved successfully',
      data: departments,
    };
  }

  @Get('/get-departments-with-pagination')
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search/filter parameters as JSON string, e.g., { "search": "HR", "isActive": "true" }',
    example: '{ "search": "HR", "isActive": "true", "parentId": 2 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort by field, e.g., name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Select specific fields, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  async getAllDepartmentsWithPagination(@Req() req, @Query() query: any) {
    const departments =
      await this.applicationService.getAllDepartmentsWithPagination(query);

    return {
      status: 'success',
      message: 'Departments retrieved successfully',
      data: departments.data,
      pagination: Helpers.makePaginationData(query, departments),
    };
  }

  @Get('/get-parent-departments')
  async getParentDepartments() {
    const data = await this.applicationService.getParentDepartments();

    return {
      statusCode: 200,
      message: 'Parent departments retrieved successfully',
      data,
    };
  }

  // Get all designations
  @Get('/get-designations')
  @ApiOperation({ summary: 'Get all designations' })
  @ApiOkResponse({
    description: 'Designations retrieved successfully',
    type: [Designation],
  })
  async getAllDesignations() {
    const designations = await this.applicationService.findAllDesignations();
    return {
      status: 'success',
      message: 'Designations retrieved successfully',
      data: designations,
    };
  }

  @Get('/get-designations-with-pagination')
  @ApiOperation({ summary: 'Get all designations with pagination' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Filter parameters as JSON string, e.g., { "search": "Manager", "departmentId": 2, "isActive": "true" }',
    example:
      '{ "search": "Manager", "departmentId": 2, "isActive": "true", "level": 3 }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort by field, e.g., name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Select specific fields, separate by comma',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  async getAllDesignationsWithPagination(@Req() req, @Query() query: any) {
    const designations =
      await this.applicationService.getAllDesignationsWithPagination(query);
    return {
      status: 'success',
      message: 'Designations retrieved successfully',
      data: designations.data,
      pagination: Helpers.makePaginationData(query, designations),
    };
  }

  @Get('/designation/list')
  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all designations' })
  @ApiOkResponse({
    description: 'Designations retrieved successfully',
    type: [CommonResponseDto],
  })
  async getAllActiveDesignations() {
    return await this.applicationService.getAllActiveDesignations();
  }

  @Get('/department/list')
  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiOkResponse({
    description: 'Departments retrieved successfully',
    type: [CommonResponseDto],
  })
  async getAllActiveDepartments() {
    return await this.applicationService.getAllActiveDepartments();
  }

  @Get('/service/list')
  // @Permissions('permission.view')
  @ApiOperation({ summary: 'Get all services' })
  @ApiOkResponse({
    description: 'Services retrieved successfully',
    type: [CommonResponseDto],
  })
  async getAllActiveServices() {
    return await this.applicationService.getAllActiveServices();
  }

  // @Get('/get-app-services')
  // @ApiOperation({ summary: 'Get App Services' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'App Services retrieved successfully',
  //   // type: [Status], // Indicate this will return an array of Contract objects
  // })
  // async getAppServices(@Query() query: any) {
  //   // const queryResult = await this.statusService.findAll(query);

  //   return {
  //     status: 'success',
  //     message: 'Statuss retrieved successfully',
  //     // data: queryResult.data,
  //     // meta: Helpers.makePaginationData(query, queryResult),
  //   };
  // }

  @Get(':id')
  // @Get(':id{\\d+}') // matches only numbers
  @ApiOperation({ summary: 'Get a application by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application found',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string): Promise<Application> {
    return this.applicationService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Permanently delete a company (application) and all associate data',
  })
  remove(@Param('id') id: string): Promise<{ message: string | void }> {
    return this.applicationService.remove(+id);
  }

  @Post('/add-or-update-service')
  @ApiOperation({ summary: 'Add or Update Service' })
  async addOrUpdateReference(@Body() createDto: CreateServiceDto, @Req() req) {
    const user: User = req.user;

    createDto.creatorId = user?.id; // Assuming the user ID is in the request object
    const queryResult =
      await this.applicationService.createOrUpdateService(createDto);
    return {
      status: 'success',
      message: `Service ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-service/:id')
  @ApiOperation({ summary: 'Delete Service' })
  async deleteService(@Param('id') id: string) {
    const queryResult = await this.applicationService.deleteService(+id);

    return {
      status: 'success',
      message: 'Service deleted successfully',
      data: queryResult,
    };
  }

  @Patch('/change-service-active-status/:id')
  @ApiOperation({ summary: 'Change Service Active Status' })
  async changeServiceActiveStatus(@Param('id') id: string) {
    const queryResult =
      await this.applicationService.changeServiceActiveStatus(+id);

    return {
      status: 'success',
      message: 'Service active status changed successfully',
      data: queryResult,
    };
  }

  //  Departments
  @Post('/add-or-update-department')
  @ApiOperation({ summary: 'Add or Update Department' })
  async addOrUpdateDepartment(@Body() dto: CreateDepartmentDto, @Req() req) {
    const user: User = req.user;

    if (dto.id !== undefined && dto.id !== null && dto.id !== 0) {
      dto.updaterId = user?.id;
    } else {
      dto.creatorId = user?.id;
    }

    const department =
      await this.applicationService.createOrUpdateDepartment(dto);

    return {
      status: 'success',
      message: `Department ${dto.id !== undefined ? 'updated' : 'added'} successfully`,
      data: department,
    };
  }

  @Patch('/change-department-active-status/:id')
  @ApiOperation({ summary: 'Change Department Active Status' })
  async changeDepartmentActiveStatus(@Param('id') id: string) {
    const queryResult =
      await this.applicationService.changeDepartmentActiveStatus(+id);

    return {
      status: 'success',
      message: 'Department active status changed successfully',
      data: queryResult,
    };
  }

  @Delete('/delete-department/:id')
  async deleteDepartment(@Param('id') id: string) {
    await this.applicationService.deleteDepartment(+id);
    return {
      status: 'success',
      message: 'Department deleted successfully',
    };
  }

  // Add or update designation
  @Post('/add-or-update-designation')
  @ApiOperation({ summary: 'Add or Update Designation' })
  async addOrUpdateDesignation(@Body() dto: CreateDesignationDto, @Req() req) {
    const user: User = req.user; // Logged-in user
    const designation = await this.applicationService.createOrUpdateDesignation(
      dto,
      user,
    );

    return {
      status: 'success',
      message: `Designation ${dto.id ? 'updated' : 'added'} successfully`,
      data: designation,
    };
  }

  // Delete designation
  @Delete('/delete-designation/:id')
  async deleteDesignation(@Param('id') id: string) {
    await this.applicationService.deleteDesignation(+id);
    return {
      status: 'success',
      message: 'Designation deleted successfully',
    };
  }

  // Change designation active status
  @Patch('/change-designation-active-status/:id')
  @ApiOperation({ summary: 'Change Designation Active Status' })
  async changeDesignationActiveStatus(@Param('id') id: string) {
    const result =
      await this.applicationService.changeDesignationActiveStatus(+id);
    return {
      status: 'success',
      message: 'Designation active status changed successfully',
      data: result,
    };
  }

  // Reorder designations
  @Post('/reorder-designations')
  @ApiOperation({ summary: 'Reorder designations by level' })
  async reorderDesignations(
    @Body() dto: ReorderDesignationsDto,
    @Req() req,
  ) {
    const user: User = req.user;
    await this.applicationService.reorderDesignations(dto, user);
    return {
      status: 'success',
      message: 'Designations reordered successfully',
    };
  }
}
