import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Helpers } from '@core/utils/helpers';
import { ResponseInterface } from '@interfaces/api-response.interface';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import {
  UpdateEmployeeBasicInfoDto,
  UpdateUserPersonalInfoDto,
} from './dto/update-user-personal-info.dto';
import { CreateUserContactInfoDto } from './dto/create-user-contact-info.dto';
import { CreateUserWorkExperienceDto } from './dto/create-user-work-experience.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CreateUserEducationDto } from './dto/create-user-education.dto';
import { CreateUserSkillDto } from './dto/user-skill.dto';
import { CreateUserCertificationDto } from './dto/user-certification.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiStandardResponses } from '@core/utils/api-standard-responses.decorator';
import { ALLOWED_IMAGE_TYPES } from '@common/constants/file-constants';
import { CreateUserProjectDto } from './dto/user-project.dto';
import { CreateUserTrainingDto } from './dto/user-training.dto';
import { CreateUserReferenceDto } from './dto/user-reference.dto';
import { CreatePermissionDto } from '@module/role-permission/dto/permission.dto';
import {
  CreateNotificationDto,
  NotificationResponseDto,
  UpdateNotificationDto,
} from './dto/notification.dto';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateBatchEmailDto } from './dto/batch-emails.dto';
import { CreateBatchEmailRecipientDto } from './dto/batch_email_recipients.dto';
import { CreateBatchEmailSectionDto } from './dto/batch_email_sections.dto';
import { CreateLeadEmailDto } from './dto/lead-email.dto';
import { CreateSenderEmailDto } from './dto/sender-email.dto';
import { RequestContext } from '@common/request-context';

interface ResponseType {
  message: string;
  data: any;
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
@ApiTags('Users') // Groups this controller under "Users"
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable entity' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      message: `User ${user.id ? 'updated' : 'added'} successfully`,
      data: user,
    };
  }

  @Post('/add-or-update')
  @ApiOperation({ summary: 'Create or update a user' })
  @ApiStandardResponses('User created or updated successfully', 201)
  async createOrUpdateUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.usersService.createOrUpdateUser(createUserDto);

    return {
      message: `User ${user.id ? 'updated' : 'added'} successfully`,
      data: user,
    };
  }

  @Get('/check-company-email')
  @ApiOperation({
    summary: 'Check if email already exists in authenticated user company',
  })
  async checkCompanyEmail(
    @Query('email') email: string,
    @Query('userId') userId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const result = await this.usersService.checkCompanyEmail(
      email,
      userId ? Number(userId) : undefined,
      employeeId ? Number(employeeId) : undefined,
    );

    return {
      message: result.message,
      data: result,
    };
  }

  @Get('/get-all-users-with-pagination')
  @ApiOperation({ summary: 'Get all list of users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [User], // Indicate this will return an array of Contract objects
  })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "name": "Jon Doe", "is_active": "false" }',
    example: '{ "name": "Jon Doe" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, name:asc',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description:
      'Limit the fields returned in the response & fields seperate by comma',
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
  async findAllWithPagination(@Query() query: any, @Req() req) {
    const user: User = req.user;
    const queryResult = await this.usersService.findAllUserWithPagination(
      query,
      user,
    );

    return {
      message: 'Users retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/get-all-users')
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: () => ({ message: String, data: Object }),
    // type: [CommonResponseDto], // Indicate this will return an array of Contract objects
  })
  @ApiOperation({ summary: 'Get all list of users' })
  async getAllActiveUsers() {
    return {
      message: 'Users retrieved successfully',
      data: await this.usersService.getAllActiveUsers(),
    };
  }

  @Patch('/change-active-status/:id')
  @ApiOperation({ summary: 'Change Active Status' })
  async changeUserActiveStatus(@Param('id') id: string) {
    const result = await this.usersService.changeUserActiveStatus(+id);
    return {
      status: 'success',
      message: 'User active status changed successfully',
      data: result,
    };
  }

  //profile completed status
  @Patch('/change-employee-profile-completed-status/:id')
  @ApiOperation({ summary: 'Change Profile Completed Status' })
  async changeProfileCompletedStatus(@Param('id') id: string) {
    const result = await this.usersService.changeProfileCompletedStatus(+id);
    return {
      status: 'success',
      message: 'User profile completed status changed successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get('find-user/:id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findUser(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('/update-profile-picture')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiOperation({ summary: 'Update Profile Picture' })
  @ApiStandardResponses('Profile picture updated successfully', 200)
  async updateProfilePicture(
    @UploadedFile() profilePic: Express.Multer.File,
    @Req() req,
  ) {
    const user: User = req.user;

    Helpers.validateFile(profilePic, ALLOWED_IMAGE_TYPES);
    // if (profilePic) {
    // }

    const queryResult = await this.usersService.updateProfilePicture(
      user?.id,
      profilePic,
    );
    return {
      status: 'success',
      message: `Profile picture updated successfully`,
      data: queryResult,
    };
  }

  @Patch('/update-personal-information/:id')
  @ApiOperation({ summary: 'Update Personal Information' })
  async updatePersonalInformation(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserPersonalInfoDto,
  ) {
    const queryResult = await this.usersService.updatePersonalInformation(
      +id,
      updateUserDto,
    );
    return {
      status: 'success',
      message: 'Status updated successfully',
      data: queryResult,
    };
  }

  @Patch('/update-contact-information/:id')
  @ApiOperation({ summary: 'Update Contact Information' })
  async updateContactInformation(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserContactInfoDto,
  ) {
    const queryResult = await this.usersService.updateContactInformation(
      +id,
      updateUserDto,
    );
    return {
      status: 'success',
      message: 'Status updated successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-work-experience')
  @ApiOperation({ summary: 'Update Work Experience' })
  async updateWorkExperience(
    @Body() userWorkExperienceDto: CreateUserWorkExperienceDto,
    @Req() req,
  ) {
    const user: User = req.user;

    userWorkExperienceDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.updateWorkExperience(
      userWorkExperienceDto,
    );
    return {
      status: 'success',
      message: `Work Experience ${userWorkExperienceDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-work-experience/:employee_id')
  @ApiOperation({ summary: 'Update Work Experience' })
  async updateWorkExperienceEmpId(
    @Body() userWorkExperienceDto: CreateUserWorkExperienceDto,
    @Param('employee_id') employee_id: string,
    @Req()
    req,
  ) {
    // const user: User = req.user;

    // userWorkExperienceDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.updateWorkExperienceEmpId(
      userWorkExperienceDto,
      employee_id,
    );
    return {
      status: 'success',
      message: `Work Experience ${userWorkExperienceDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-work-experience/:id')
  @ApiOperation({ summary: 'Delete Work Experience' })
  async deleteWorkExperience(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteWorkExperience(+id);

    return {
      status: 'success',
      message: 'Work experience deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-education')
  @ApiOperation({ summary: 'Add or Update Education' })
  async addOrUpdateEducation(
    @Body() createDto: CreateUserEducationDto,
    @Req() req,
  ) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateEducation(createDto);
    return {
      status: 'success',
      message: `Education ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-education/:employee_id')
  @ApiOperation({ summary: 'Add or Update Education' })
  async addOrUpdateEducationEmpId(
    @Body() createDto: CreateUserEducationDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    // const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateEducationEmpId(
      createDto,
      employee_id,
    );
    return {
      status: 'success',
      message: `Education ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-education/:id')
  @ApiOperation({ summary: 'Delete Education' })
  async deleteEducation(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteEducation(+id);

    return {
      status: 'success',
      message: 'Education deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-skill')
  @ApiOperation({ summary: 'Add or Update Skill' })
  async addOrUpdateSkill(@Body() createDto: CreateUserSkillDto, @Req() req) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateSkill(createDto);
    return {
      status: 'success',
      message: `Skill ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-skill/:employee_id')
  @ApiOperation({ summary: 'Add or Update Skill' })
  async addOrUpdateSkillWithEmpId(
    @Body() createDto: CreateUserSkillDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateSkillWithEmpId(
      createDto,
      employee_id,
    );
    return {
      status: 'success',
      message: `Skill ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-skill/:id')
  @ApiOperation({ summary: 'Delete Skill' })
  async deleteSkill(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteSkill(+id);

    return {
      status: 'success',
      message: 'Skill deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-certification')
  @UseInterceptors(FileInterceptor('attachmentFile'))
  @ApiOperation({ summary: 'Add or Update certification' })
  @ApiStandardResponses('Certification added or updated successfully')
  async addOrUpdateCertification(
    @UploadedFile() attachmentFile: Express.Multer.File,
    @Body() createDto: CreateUserCertificationDto,
    @Req() req,
  ) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object

    if (attachmentFile) {
      Helpers.validateFile(attachmentFile, [
        'application/pdf',
        'image/jpeg',
        'image/png',
      ]); // Validate file type and size
      createDto.attachmentFile = attachmentFile; // Attach the file to the DTO
    }

    const queryResult =
      await this.usersService.addOrUpdateCertification(createDto);
    return {
      status: 'success',
      message: `Certification ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-certification/:employee_id')
  @UseInterceptors(FileInterceptor('attachmentFile'))
  @ApiOperation({ summary: 'Add or Update certification' })
  @ApiStandardResponses('Certification added or updated successfully')
  async addOrUpdateCertificationWithEmpId(
    @UploadedFile() attachmentFile: Express.Multer.File,
    @Body() createDto: CreateUserCertificationDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object

    if (attachmentFile) {
      Helpers.validateFile(attachmentFile, [
        'application/pdf',
        'image/jpeg',
        'image/png',
      ]); // Validate file type and size
      createDto.attachmentFile = attachmentFile; // Attach the file to the DTO
    }

    const queryResult =
      await this.usersService.addOrUpdateCertificationWithEmpId(
        createDto,
        employee_id,
      );
    return {
      status: 'success',
      message: `Certification ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-certification/:id')
  @ApiOperation({ summary: 'Delete certification' })
  async deleteCertification(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteCertification(+id);

    return {
      status: 'success',
      message: 'Certification deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-project')
  @ApiOperation({ summary: 'Add or Update Project' })
  async addOrUpdateProject(
    @Body() createDto: CreateUserProjectDto,
    @Req() req,
  ) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateProject(createDto);
    return {
      status: 'success',
      message: `Project ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-project/:employee_id')
  @ApiOperation({ summary: 'Add or Update Project' })
  async addOrUpdateProjectWithEmpId(
    @Body() createDto: CreateUserProjectDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateProjectForEmpID(
      createDto,
      employee_id,
    );
    return {
      status: 'success',
      message: `Project ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-project/:id')
  @ApiOperation({ summary: 'Delete Project' })
  async deleteProject(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteProject(+id);

    return {
      status: 'success',
      message: 'Project deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-training')
  @ApiOperation({ summary: 'Add or Update Training' })
  async addOrUpdateTraining(
    @Body() createDto: CreateUserTrainingDto,
    @Req() req,
  ) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object

    const queryResult = await this.usersService.addOrUpdateTraining(createDto);

    return {
      status: 'success',
      message: `Training ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-training/:employee_id')
  @ApiOperation({ summary: 'Add or Update Training' })
  async addOrUpdateTrainingWithEmpId(
    @Body() createDto: CreateUserTrainingDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object

    // console.log('user- ', createDto);

    const queryResult = await this.usersService.addOrUpdateTrainingEmpId(
      createDto,
      employee_id,
    );

    return {
      status: 'success',
      message: `Training ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-training/:id')
  @ApiOperation({ summary: 'Delete Training' })
  async deleteTraining(@Param('id') id: string, @Req() req) {
    const user: User = req.user;
    const queryResult = await this.usersService.deleteTraining(+id, user?.id);

    return {
      status: 'success',
      message: 'Training deleted successfully',
      data: queryResult,
    };
  }

  @Post('/add-or-update-reference')
  @ApiOperation({ summary: 'Add or Update Reference' })
  async addOrUpdateReference(
    @Body() createDto: CreateUserReferenceDto,
    @Req() req,
  ) {
    const user: User = req.user;

    createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateReference(createDto);
    return {
      status: 'success',
      message: `Reference ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Post('/add-or-update-reference/:employee_id')
  @ApiOperation({ summary: 'Add or Update Reference' })
  async addOrUpdateReferenceEmpId(
    @Body() createDto: CreateUserReferenceDto,
    @Param('employee_id') employee_id: string,
    @Req() req,
  ) {
    const user: User = req.user;

    // createDto.userId = user?.id; // Assuming the user ID is in the request object
    const queryResult = await this.usersService.addOrUpdateReferenceEmpId(
      createDto,
      employee_id,
    );
    return {
      status: 'success',
      message: `Reference ${createDto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Delete('/delete-reference/:id')
  @ApiOperation({ summary: 'Delete Training' })
  async deleteReference(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteReference(+id);

    return {
      status: 'success',
      message: 'Reference deleted successfully',
      data: queryResult,
    };
  }

  @Post('/notification/create')
  async createUserNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.usersService.createUserNotification(
      createDto.userId,
      createDto.message,
    );
  }

  @Get('/notification/find-by-auth-user')
  async findNotificationByUserId(
    @Query() query: any,
  ): Promise<NotificationResponseDto[]> {
    return this.usersService.findNotificationByUserId(query);
  }

  @Patch('/notification/mark-read/:id')
  async updateNotificationById(
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.usersService.updateNotificationById(id);
  }

  @Patch('/notification/mark-all-read')
  async updateNotificationByUserId(@Req() req: any) {
    const { id } = req.user;
    return this.usersService.updateNotificationByUserId(id);
  }

  @Delete('/notification/delete/:id')
  async deleteNotificationById(@Param('id') id: string) {
    await this.usersService.deleteNotificationById(id);
    return { message: 'Notification deleted successfully' };
  }

  @Patch('/notification/delete-all')
  async deleteNotificationByUserId(@Req() req: any) {
    const { id } = req.user;
    await this.usersService.deleteNotificationByUserId(id);
    return { message: 'All notifications deleted successfully' };
  }

  @Post('/user/change-password')
  @ApiOperation({ summary: 'Change logged-in user password' })
  async changePassword(@Body() dto: ChangePasswordDto) {
    const { email } = await this.usersService.changePassword(dto);
    // await this.usersService.changePassword(dto);
    return {
      message: `Password changed successfully for ${email}`,
    };
  }

  @Post('/user/add-or-update-batch-email')
  @ApiOperation({ summary: 'Add or Update Batch Email' })
  async addOrUpdateBatchEmail(@Body() dto: CreateBatchEmailDto) {
    const queryResult = await this.usersService.createOrUpdateBatchEmail(dto);
    return {
      status: 'success',
      message: `Batch Email ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Get('/user/get-all-batch-emails')
  @ApiOperation({ summary: 'Get all batch emails' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Email subject" }',
    example: '{ "search": "Monthly Update" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, subject:asc',
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
  async getAllBatchEmails(@Query() query: any) {
    const queryResult = await this.usersService.getAllBatchEmails(query);

    return {
      message: 'Batch Emails retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/user/get-batch-email-by-id/:id')
  @ApiOperation({ summary: 'Get Batch Email by ID' })
  async getBatchEmailsById(@Param('id') id: string) {
    const queryResult = await this.usersService.findBatchEmailById(+id);
    return {
      status: 'success',
      message: 'Batch Email fetched successfully',
      data: queryResult,
    };
  }

  @Delete('/user/delete-batch-email/:id')
  @ApiOperation({ summary: 'Delete Batch Email' })
  async deleteBatchEmail(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteBatchEmailById(+id);
    return {
      status: 'success',
      message: 'Batch Email deleted successfully',
    };
  }

  @Post('/user/add-or-update-batch-email-recipient')
  @ApiOperation({ summary: 'Add or Update Batch Email Recipient' })
  async addOrUpdateBatchEmailRecipient(
    @Body() dto: CreateBatchEmailRecipientDto,
  ) {
    const queryResult =
      await this.usersService.createOrUpdateBatchEmailRecipient(dto);
    return {
      status: 'success',
      message: `Batch Email Recipient ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Get('user/get-all-batch-email-recipients')
  @ApiOperation({ summary: 'Get all batch email recipients' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Email subject or recipient" }',
    example: '{ "search": "john@example.com" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, email:asc',
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
  async getAllBatchEmailRecipients(@Query() query: any) {
    const queryResult =
      await this.usersService.getAllBatchEmailRecipients(query);

    return {
      message: 'Batch Email Recipients retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/user/get-batch-email-recipient-by-id/:id')
  @ApiOperation({ summary: 'Get Batch Email Recipient by ID' })
  async getBatchEmailsRecipientById(@Param('id') id: string) {
    const queryResult =
      await this.usersService.findBatchEmailRecipientById(+id);
    return {
      status: 'success',
      message: 'Batch Email Recipient fetched successfully',
      data: queryResult,
    };
  }

  @Delete('/user/delete-batch-email-recipient/:id')
  @ApiOperation({ summary: 'Delete Batch Email Recipient' })
  async deleteBatchEmailRecipient(@Param('id') id: string) {
    const queryResult =
      await this.usersService.deleteBatchEmailRecipientById(+id);
    return {
      status: 'success',
      message: 'Batch Email Recipient deleted successfully',
    };
  }

  @Post('/user/add-or-update-batch-email-section')
  @ApiOperation({ summary: 'Add or Update Batch Email Section' })
  async addOrUpdateBatchEmailSection(@Body() dto: CreateBatchEmailSectionDto) {
    const queryResult =
      await this.usersService.createOrUpdateBatchEmailSection(dto);
    return {
      status: 'success',
      message: `Batch Email Section ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Get('/user/get-all-batch-email-sections')
  @ApiOperation({ summary: 'Get all batch email sections' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Email subject or recipient" }',
    example: '{ "search": "john@example.com" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, email:asc',
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
  async getAllBatchEmailSections(@Query() query: any) {
    const queryResult = await this.usersService.getAllBatchEmailSections(query);

    return {
      message: 'Batch Email Sections retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/user/get-batch-email-section-by-id/:id')
  @ApiOperation({ summary: 'Get Batch Email Section by ID' })
  async getBatchEmailsSectionById(@Param('id') id: string) {
    const queryResult = await this.usersService.findBatchEmailSectionById(+id);
    return {
      status: 'success',
      message: 'Batch Email Section fetched successfully',
      data: queryResult,
    };
  }

  @Delete('/user/delete-batch-email-section/:id')
  @ApiOperation({ summary: 'Delete Batch Email Section' })
  async deleteBatchEmailSection(@Param('id') id: string) {
    const queryResult =
      await this.usersService.deleteBatchEmailSectionById(+id);
    return {
      status: 'success',
      message: 'Batch Email Section deleted successfully',
    };
  }

  @Post('/user/add-or-update-lead-email')
  @ApiOperation({ summary: 'Add or Update Lead Email' })
  async addOrUpdateLeadEmail(@Body() dto: CreateLeadEmailDto) {
    const queryResult = await this.usersService.createOrUpdateLeadEmail(dto);
    return {
      status: 'success',
      message: `Lead Email ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Get('/user/get-all-lead-emails')
  @ApiOperation({ summary: 'Get all lead emails' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Email subject or recipient" }',
    example: '{ "search": "john@example.com" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, email:asc',
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
  async getAllLeadEmails(@Query() query: any) {
    const queryResult = await this.usersService.getAllLeadEmails(query);

    return {
      message: 'Lead Emails retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/user/get-lead-email-by-id/:id')
  @ApiOperation({ summary: 'Get Lead Email by ID' })
  async getLeadEmailById(@Param('id') id: string) {
    const queryResult = await this.usersService.findLeadEmailById(+id);
    return {
      status: 'success',
      message: 'Lead Email fetched successfully',
      data: queryResult,
    };
  }

  @Delete('/user/delete-lead-email/:id')
  @ApiOperation({ summary: 'Delete Lead Email' })
  async deleteLeadEmail(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteLeadEmailById(+id);
    return {
      status: 'success',
      message: 'Lead Email deleted successfully',
    };
  }

  @Post('/user/add-or-update-sender-email')
  @ApiOperation({ summary: 'Add or Update Sender Email' })
  async addOrUpdateSenderEmail(@Body() dto: CreateSenderEmailDto) {
    const queryResult = await this.usersService.createOrUpdateSenderEmail(dto);
    return {
      status: 'success',
      message: `Sender Email ${dto.id ? 'updated' : 'added'} successfully`,
      data: queryResult,
    };
  }

  @Get('/user/get-all-sender-emails')
  @ApiOperation({ summary: 'Get all sender emails' })
  @ApiQuery({
    name: 'params',
    type: String,
    required: false,
    description:
      'Search parameters to filter results, e.g., { "search": "Email subject or recipient" }',
    example: '{ "search": "john@example.com" }',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort results by field, e.g., id:desc, email:asc',
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
  async getAllSenderEmails(@Query() query: any) {
    const queryResult = await this.usersService.getAllSenderEmails(query);

    return {
      message: 'Sender Emails retrieved successfully',
      data: queryResult.data,
      pagination: Helpers.makePaginationData(query, queryResult),
    };
  }

  @Get('/user/get-sender-email-by-id/:id')
  @ApiOperation({ summary: 'Get Sender Email by ID' })
  async getSenderEmailById(@Param('id') id: string) {
    const queryResult = await this.usersService.findSenderEmailById(+id);
    return {
      status: 'success',
      message: 'Sender Email fetched successfully',
      data: queryResult,
    };
  }

  @Delete('/user/delete-sender-email/:id')
  @ApiOperation({ summary: 'Delete Sender Email' })
  async deleteSenderEmail(@Param('id') id: string) {
    const queryResult = await this.usersService.deleteSenderEmailById(+id);
    return {
      data: queryResult,
      status: 'success',
      message: 'Sender Email deleted successfully',
    };
  }

  @Get('/user/get-dashboard-data/')
  @ApiOperation({ summary: 'Get dashboard overview' })
  async getUserDashboardStatus() {
    const data = await this.usersService.getUserDashboardStatus();

    return {
      data: data,
      status: 'success',
      message: 'User dashboard data retrieved successfully',
    };
  }

  @Get('user/get-employee-event-calendar')
  async getEmployeeHolidays() {
    const holidayEvents = await this.usersService.getUserEventCalendar();

    return {
      data: holidayEvents,
      success: true,
    };
  }

  @Post('/update-employee-info/:employeeId')
  async updateEmployeeBasicInfo(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: UpdateEmployeeBasicInfoDto,
  ) {
    const data = await this.usersService.updateEmployeeBasicInfo(
      employeeId,
      dto,
    );

    return {
      status: 'success',
      message: 'Employee basic info updated successfully',
      data,
    };
  }

  @Get('/support/get-support-data')
  getSupportData() {
    const data = {
      categories: [
        { id: 1, name: 'Getting Started', articleCount: 5 },
        { id: 2, name: 'Billing', articleCount: 10 },
      ],
      faqs: [
        {
          id: 1,
          question: 'How do I create invoice?',
          answer: 'Go to invoice page...',
        },
      ],
    };

    return {
      data,
      message: 'Support data retrieved successfully',
    };
  }

  @Post('/support/chat')
  async supportChat(@Body() body: { message: string }) {
    // 👉 connect OpenAI / your AI
    return {
      reply: `You asked: ${body.message}`,
    };
  }
}
