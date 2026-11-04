import { AppHolidayDate } from './../hr-management/entities/app-holiday-dates.entity';
// src/module/users/users.service.ts
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
// import { CreateUserDto, UserResponseDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  DataSource,
  DeepPartial,
  In,
  IsNull,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Status } from '@module/status/entities/status.entity';

import { APIFeatures } from '@core/utils/apiFeatures';
import * as bcrypt from 'bcrypt';
import {
  UpdateEmployeeBasicInfoDto,
  UpdateUserPersonalInfoDto,
} from './dto/update-user-personal-info.dto';
import { UserContextService } from '@module/auth/user-context.service';
import { HelperService } from '@common/helpers/helper.service';
import { AppUser } from './entities/app-user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Application } from '@module/application/entities/application.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { Address } from '@module/address/entities/address.entity';
import { MediaService } from '@module/media/media.service';
import { UserLanguageProficiency } from './entities/user-language-proficiency.entity';
import { UserContactInfo } from './entities/user-contact-info.entity';
import { CreateUserContactInfoDto } from './dto/create-user-contact-info.dto';
import { UserWorkExperience } from './entities/user-work-experience.entity';
import { CreateUserWorkExperienceDto } from './dto/create-user-work-experience.dto';
import { RequestContext } from '@common/request-context';
import { CreateUserEducationDto } from './dto/create-user-education.dto';
import { UserEducationResponseDto } from './dto/user-education-response.dto';
import { UserEducation } from './entities/user-education.entity';
import { CreateUserSkillDto } from './dto/user-skill.dto';
import { UserSkill } from './entities/user-skill.entity';
import { UserCertification } from './entities/user-certification.entity';
import { CreateUserCertificationDto } from './dto/user-certification.dto';
import { UserProject } from './entities/user-project.entity';
import { CreateUserProjectDto } from './dto/user-project.dto';
import { UserTraining } from './entities/user-training.entity';
import { CreateUserTrainingDto } from './dto/user-training.dto';
import { UserReference } from './entities/user-reference.entity';
import { CreateUserReferenceDto } from './dto/user-reference.dto';
import { permission } from 'process';
import { UserResponseDto } from './dto/user-response.dto';
import { RolePermissionService } from '../role-permission/role-permission.service';
import {
  NotificationResponseDto,
  UpdateNotificationDto,
} from './dto/notification.dto';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { NotificationGateway } from '@core/guards/notification.gateway';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from 'src/mail/mail.service';
import {
  BatchEmailResponseDto,
  CreateBatchEmailDto,
} from './dto/batch-emails.dto';
import { BatchEmail } from './entities/batch-emails.entity';
import { CreateBatchEmailRecipientDto } from './dto/batch_email_recipients.dto';
import { BatchEmailRecipient } from './entities/batch-email-recipients.entity';
import { CreateBatchEmailSectionDto } from './dto/batch_email_sections.dto';
import { BatchEmailSection } from './entities/batch-email-sections.entity';
import { CreateLeadEmailDto } from './dto/lead-email.dto';
import { LeadEmail } from './entities/lead-email.entity';
import { CreateSenderEmailDto } from './dto/sender-email.dto';
import { SenderEmail } from './entities/sender-email.entity';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { EmpLeaveType } from '@module/hr-management/entities/employee-leaves-type.entity';
import { EmpLeaveRequest } from '@module/hr-management/entities/employee-leave-request.entity';
import { Holiday } from '@module/hr-management/entities/holiday.entity';
import { EmpAttendance } from '@module/hr-management/entities/employee-attendance.entity';
import { EmployeeAsset } from '@module/hr-management/entities/employee-assets.entity';
import { VisitApplication } from '@module/hr-management/entities/visit-applications.entity';
import { use } from 'passport';
import { Helpers } from '@core/utils/helpers';
import { AppHoliday } from '@module/hr-management/entities/app-holidays.entity';
import { Not } from 'typeorm';
import e from 'express';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  NotificationDocument,
  Notification,
} from '@module/users/schema/notification.schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly userContextService: UserContextService,
    private readonly commonDao: HelperService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Office) private readonly officeRepo: Repository<Office>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(UserLanguageProficiency)
    private readonly userLanguageProficiencyRepo: Repository<UserLanguageProficiency>,

    @InjectRepository(UserContactInfo)
    private readonly userContactInfoRepo: Repository<UserContactInfo>,

    @InjectRepository(UserWorkExperience)
    private readonly userWorkExperienceRepo: Repository<UserWorkExperience>,

    @InjectRepository(UserEducation)
    private readonly userEducationRepo: Repository<UserEducation>,

    @InjectRepository(UserSkill)
    private readonly userSkillRepo: Repository<UserSkill>,

    @InjectRepository(UserCertification)
    private readonly certificationRepo: Repository<UserCertification>,

    @InjectRepository(UserProject)
    private readonly userProjectRepo: Repository<UserProject>,

    @InjectRepository(UserTraining)
    private readonly userTrainingRepo: Repository<UserTraining>,

    @InjectRepository(UserReference)
    private readonly userReferenceRepo: Repository<UserReference>,

    @InjectRepository(BatchEmail)
    private readonly batchEmailRepo: Repository<BatchEmail>,

    @InjectRepository(BatchEmailRecipient)
    private readonly batchEmailRecipientRepo: Repository<BatchEmailRecipient>,

    @InjectRepository(BatchEmailSection)
    private readonly batchEmailSectionRepo: Repository<BatchEmailSection>,

    @InjectRepository(LeadEmail)
    private readonly leadEmailRepo: Repository<LeadEmail>,

    @InjectRepository(SenderEmail)
    private readonly senderEmailRepo: Repository<SenderEmail>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(EmpLeaveType)
    private readonly empLeaveTypeRepo: Repository<EmpLeaveType>,
    @InjectRepository(EmpLeaveRequest)
    private readonly empLeaveRequestRepo: Repository<EmpLeaveRequest>,

    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,

    @InjectRepository(EmployeeAsset)
    private readonly employeeAssetRepo: Repository<EmployeeAsset>,

    @InjectRepository(EmpAttendance)
    private readonly empAttendanceRepo: Repository<EmpAttendance>,

    @InjectRepository(VisitApplication)
    private readonly visitApplicationRepo: Repository<VisitApplication>,

    @InjectRepository(AppHoliday)
    private readonly appHolidayRepo: Repository<AppHoliday>,

    @InjectRepository(AppHolidayDate)
    private readonly appHolidayDateRepo: Repository<AppHolidayDate>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private notificationGateway: NotificationGateway,

    private requestContext: RequestContext,

    private readonly mediaService: MediaService,
    private readonly mailService: MailService,

    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if the email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      // throw new Error('Email already exists');
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    // Check if the username already exists
    // const existingUserByUsername = await this.userRepository.findOne({
    //   where: { username: createUserDto.username },
    // });

    // if (existingUserByUsername) {
    //   throw new HttpException(
    //     'Username already exists',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const user = new User();
    // user.name = createUserDto.name;
    // user.username = createUserDto.username;
    user.email = createUserDto.email;

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    user.password = hashedPassword;
    // user.phone = createUserDto.phone ?? null;

    return this.userRepository.save(user); // Save the user to the database
  }

  async createOrUpdateUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.id) {
      const user = await this.userRepository.findOne({
        where: { id: createUserDto.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { ...rest } = createUserDto;
      Object.assign(user, rest);

      let profile = await this.userProfileRepo.findOne({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = this.userProfileRepo.create({ userId: user.id });
      }

      // profile.countryId = createUserDto.countryId;
      profile.phoneCountryId = createUserDto?.phoneCountryId ?? null;
      profile.phone = createUserDto.phoneIdentifier;
      user.profile = profile;

      if (createUserDto.password) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        user.password = hashedPassword;
      }

      const updateUser = await this.userRepository.save(user);

      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        await this.rolePermissionService.assignRolesToUser(
          user.id,
          createUserDto.roleIds,
        );

        // this.createUserNotification(user.id, 'ROLE_ASSIGNED');
        this.createUserNotification(user.id, 'Role assigned');
      }

      return updateUser;
    } else {
      const activeAppId = RequestContext.get('activeAppId');
      const cleanEmail = createUserDto.email?.trim()?.toLowerCase();

      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: cleanEmail || createUserDto.email },
      });

      if (existingUserByEmail) {
        const inEmployee = activeAppId
          ? await this.employeeRepo.findOne({
              where: { appId: activeAppId, userId: existingUserByEmail.id },
            })
          : null;

        const inAppUser = activeAppId
          ? await this.appUserRepo.findOne({
              where: { appId: activeAppId, userId: existingUserByEmail.id },
            })
          : null;

        const isAlreadyInCompany =
          Boolean(inEmployee) ||
          Boolean(inAppUser) ||
          Boolean(activeAppId && existingUserByEmail.activeAppId === activeAppId);

        if (isAlreadyInCompany) {
          throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        // Email belongs to user from another company: link to this company
        if (activeAppId) {
          let appUser = await this.appUserRepo.findOne({
            where: { appId: activeAppId, userId: existingUserByEmail.id },
          });
          if (!appUser) {
            appUser = this.appUserRepo.create({
              appId: activeAppId,
              userId: existingUserByEmail.id,
            });
            await this.appUserRepo.save(appUser);
          }
        }

        if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
          await this.rolePermissionService.assignRolesToUser(
            existingUserByEmail.id,
            createUserDto.roleIds,
          );
          this.createUserNotification(existingUserByEmail.id, 'Role assigned');
        }

        return existingUserByEmail;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;

      const { id, ...rest } = createUserDto;
      const user = this.userRepository.create({
        ...rest,
        email: cleanEmail || rest.email,
        activeAppId: activeAppId ?? (rest as any).activeAppId,
      });

      let profile = await this.userProfileRepo.findOne({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = this.userProfileRepo.create({ userId: user.id });
      }

      // profile.countryId = createUserDto.countryId;
      profile.phoneCountryId = createUserDto?.phoneCountryId ?? null;
      profile.phone = createUserDto.phoneIdentifier;
      user.profile = profile;

      const newUser = await this.userRepository.save(user);

      if (activeAppId) {
        let appUser = await this.appUserRepo.findOne({
          where: { appId: activeAppId, userId: newUser.id },
        });
        if (!appUser) {
          appUser = this.appUserRepo.create({
            appId: activeAppId,
            userId: newUser.id,
          });
          await this.appUserRepo.save(appUser);
        }
      }

      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        await this.rolePermissionService.assignRolesToUser(
          newUser.id,
          createUserDto.roleIds,
        );

        // this.createUserNotification(user.id, 'ROLE_ASSIGNED');
        this.createUserNotification(newUser.id, 'Role assigned');
      }

      return newUser;
    }
  }

  async checkCompanyEmail(
    email: string,
    currentUserId?: number,
    currentEmployeeId?: number,
  ): Promise<{ exists: boolean; message: string }> {
    if (!email || typeof email !== 'string') {
      return { exists: false, message: 'Email is required' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { exists: false, message: 'Email is required' };
    }

    const activeAppId = RequestContext.get('activeAppId');
    if (!activeAppId) {
      const user = await this.userRepository.findOne({
        where: { email: cleanEmail },
      });
      if (user && currentUserId && user.id === currentUserId) {
        return { exists: false, message: 'Email is available' };
      }
      return {
        exists: !!user,
        message: user ? 'Email already exists' : 'Email is available',
      };
    }

    // 1. Check if an employee exists in this company with this email
    const employeeQuery = this.employeeRepo
      .createQueryBuilder('employee')
      .innerJoin('employee.user', 'user')
      .where('employee.appId = :activeAppId', { activeAppId })
      .andWhere('LOWER(user.email) = :email', { email: cleanEmail });

    if (currentEmployeeId) {
      employeeQuery.andWhere('employee.id != :currentEmployeeId', {
        currentEmployeeId,
      });
    }
    if (currentUserId) {
      employeeQuery.andWhere('user.id != :currentUserId', { currentUserId });
    }

    const existingEmployee = await employeeQuery.getOne();
    if (existingEmployee) {
      return { exists: true, message: 'Email already exists' };
    }

    // 2. Check if an AppUser exists in this company with this email
    const appUserQuery = this.appUserRepo
      .createQueryBuilder('appUser')
      .innerJoin('appUser.user', 'user')
      .where('appUser.appId = :activeAppId', { activeAppId })
      .andWhere('LOWER(user.email) = :email', { email: cleanEmail });

    if (currentUserId) {
      appUserQuery.andWhere('user.id != :currentUserId', { currentUserId });
    }

    const existingAppUser = await appUserQuery.getOne();
    if (existingAppUser) {
      return { exists: true, message: 'Email already exists' };
    }

    // 3. Check if a User has this activeAppId and email
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.activeAppId = :activeAppId', { activeAppId })
      .andWhere('LOWER(user.email) = :email', { email: cleanEmail });

    if (currentUserId) {
      userQuery.andWhere('user.id != :currentUserId', { currentUserId });
    }

    const existingCompanyUser = await userQuery.getOne();
    if (existingCompanyUser) {
      return { exists: true, message: 'Email already exists' };
    }

    return { exists: false, message: 'Email is available' };
  }

  async findAllUserWithPagination(
    queryString: any,
    user: any,
  ): Promise<{ data: any; total: number }> {
    const appId = RequestContext.get('activeAppId');
    let params: Record<string, any> = {};
    if (queryString?.params) {
      try {
        params =
          typeof queryString.params === 'string'
            ? JSON.parse(queryString.params)
            : queryString.params;
      } catch {
        params = {};
      }
    }
    const listScope =
      params.appUseCase === 'Admin'
        ? 'admin'
        : params.appUseCase === 'Company'
          ? 'company'
          : 'default';
    // Company list is everyone in this company, not only the Company use-case flag.
    if (listScope === 'company') {
      delete params.appUseCase;
      queryString = {
        ...queryString,
        params: JSON.stringify(params),
      };
    }
    // Start with a query to filter out soft-deleted records
    const query = this.userRepository.createQueryBuilder('user');
    query.leftJoin('user.profile', 'userProfile');
    query.leftJoin('userProfile.profilePicture', 'profilePicture');
    query.leftJoin('userProfile.phoneCountry', 'phoneCountry');
    query.leftJoin('user.userRoles', 'userRoles');
    query.leftJoin('userRoles.role', 'role');
    query.leftJoin('user.employee', 'employee');
    query.leftJoin('employee.designation', 'designation');
    query.leftJoin('designation.department', 'department');

    query.leftJoin('employee.office', 'office');
    query.leftJoin('office.officeType', 'officeType');
    query.leftJoin('employee.officeShift', 'officeShift');

    query.leftJoin('employee.employmentStatus', 'employmentStatus');
    query.leftJoin('employee.employeeStatus', 'employeeStatus');

    query.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.emailVerifiedAt',
      'user.profileCompleted',
      'user.lastTimezone',
      'user.appUseCase',
      'user.isActive',
      'user.createdAt',
      'user.invitationCount',
      'user.activeAppId',

      'userProfile.id',
      'userProfile.profilePictureId',
      'userProfile.phoneCountryId',
      'phoneCountry.callingCode',
      'userProfile.phone',
      'profilePicture.id',
      'profilePicture.filename',

      'userRoles.userId',
      'userRoles.roleId',
      'userRoles.createdAt',

      'role.id',
      'role.name',
      'role.description',
      'role.isSystem',
      'role.isActive',

      'employee.id',
      'employee.employeeCode',
      'employee.designationId',
      'designation.id',
      'designation.name',
      'designation.departmentId',
      'department.id',
      'department.name',
      'office.name',
      'officeType.id',
      'officeType.name',

      'officeShift.name',
      'officeShift.startTime',
      'officeShift.endTime',

      'employmentStatus.name',
      'employmentStatus.code',
      'employmentStatus.colorName',

      'employeeStatus.name',
      'employeeStatus.code',
      'employeeStatus.colorName',
    ]);
    query.where('user.deletedAt IS NULL');
    if (listScope === 'company' && appId) {
      query
        .andWhere(
          `(user.activeAppId = :appId OR user.id IN (SELECT au.user_id FROM app_users au WHERE au.app_id = :appId))`,
          { appId },
        )
        .andWhere(
          `(user.appUseCase IS NULL OR user.appUseCase <> :adminUseCase)`,
          { adminUseCase: 'Admin' },
        );
    } else if (listScope !== 'admin') {
      query.andWhere('user.activeAppId = :appId', { appId });
    }

    // Apply filtering, sorting, field limiting, and pagination using APIFeatures
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    if (params.search) {
      query.andWhere(
        `(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR userProfile.phone LIKE :search)`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    // Get the filtered data
    const featureData = await features.getQuery().getMany();

    // Get the total count of all non-deleted records using the IsNull operator
    const total = await query.getCount();

    return {
      data: featureData,
      total: total,
    };
  }

  async findOne(id: number) {
    return this.userRepository
      .findOne({
        where: { id },
      })
      .then((user) => {
        if (user) {
          return user;
        } else {
          throw new Error('User not found');
        }
      });
  }

  async getAllActiveUsers(): Promise<CommonResponseDto[]> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({
      where: { userId },
    });

    if (!appUser) return [];

    const appUsers = await this.appUserRepo.find({
      where: { appId: appUser?.appId ?? 0 },
    });

    if (!appUsers) {
      return [];
    }

    const appUserIds = appUsers.map((appUser) => appUser.userId);

    const users = await this.userRepository.find({
      where: {
        isActive: true,
        deletedAt: IsNull(),
        id: In(appUserIds),
      },
    });

    return (
      users &&
      users.map((user) => {
        const response = new CommonResponseDto();
        response.value = user.id;
        response.label = `${user.firstName} ${user.lastName}`;
        return response;
      })
    );
  }

  // Change active status
  async changeUserActiveStatus(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    user.isActive = !user.isActive;

    return this.userRepository.save(user);
  }

  async changeProfileCompletedStatus(employeeId: number) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      select: ['id', 'userId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} has no linked user`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: employee.userId },
      select: ['id', 'profileCompleted'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    user.profileCompleted = !user.profileCompleted;
    return await this.userRepository.save(user);
  }

  async findUser(id: number): Promise<UserResponseDto> {
    return this.userRepository
      .findOne({
        where: { id },
      })
      .then((user) => {
        if (user) {
          // return user;
          return new UserResponseDto(user);
          // userResponseDto.id = user.id;
          // userResponseDto.firstName = user.firstName;
          // userResponseDto.lastName = user.lastName;
          // userResponseDto.email = user.email;
        } else {
          throw new Error('User not found');
        }
      });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Find the existing user
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
    // Update the user properties
    // existingUser.name = updateUserDto.name ?? '';
    // existingUser.phone = updateUserDto.phone ?? null;

    // Handle university user type

    // Save the updated user
    return this.userRepository.save(existingUser); // Return the updated user
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft-delete the user so the login/user account is removed from users list,
    // while the employee record in the employees table is explicitly preserved.
    await this.userRepository.softDelete({ id });

    return {
      message: 'User deleted successfully',
      data: { id },
    };
  }

  async updateProfilePicture(id: number, profilePic: Express.Multer.File) {
    let existingUserProfile = await this.userProfileRepo.findOne({
      where: { userId: id },
    });

    if (!existingUserProfile) {
      // throw new Error('User Profile not found');
      existingUserProfile = await this.userProfileRepo.save({
        userId: id,
      });
    }

    if (profilePic) {
      const previousPictureId = existingUserProfile.profilePictureId;
      const newMedia = await this.mediaService.uploadFile(profilePic);

      existingUserProfile.profilePictureId = newMedia.id;
      existingUserProfile.profilePicture = newMedia;
      const saved = await this.userProfileRepo.save(existingUserProfile);

      if (previousPictureId && previousPictureId !== newMedia.id) {
        try {
          await this.mediaService.deleteFile(previousPictureId);
        } catch {
          // The new picture is already saved. A failed cleanup must not hide it.
        }
      }

      const refreshed = await this.userProfileRepo.findOne({
        where: { id: saved.id },
        relations: ['profilePicture'],
      });
      if (!refreshed?.profilePicture) return refreshed ?? saved;

      return {
        ...refreshed,
        profilePictureId: refreshed.profilePictureId,
        profilePicture: {
          id: refreshed.profilePicture.id,
          filename: refreshed.profilePicture.filename,
          mimeType: refreshed.profilePicture.mimeType,
          fileUrl: refreshed.profilePicture.fileUrl,
        },
      };
    } else {
      throw new BadRequestException('No profile picture file uploaded');
    }
  }

  async updatePersonalInformation(
    id: number,
    userBasicInfoDto: UpdateUserPersonalInfoDto,
  ) {
    // Find the existing user
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (userBasicInfoDto.firstName !== undefined) {
      existingUser.firstName = userBasicInfoDto.firstName;
    }
    if (userBasicInfoDto.lastName !== undefined) {
      existingUser.lastName = userBasicInfoDto.lastName;
    }
    await this.userRepository.save(existingUser);

    let existingUserProfile = await this.userProfileRepo.findOne({
      where: { userId: id },
    });

    if (!existingUserProfile) {
      // throw new Error('User Profile not found');
      existingUserProfile = await this.userProfileRepo.save({
        userId: id,
      });
    }

    const existingUserLanguageProficiencies =
      await this.userLanguageProficiencyRepo.find({
        where: { userId: id },
      });

    //delete existing user language proficiencies
    if (existingUserLanguageProficiencies.length > 0) {
      await this.userLanguageProficiencyRepo.remove(
        existingUserLanguageProficiencies,
      );
    }

    if (
      userBasicInfoDto.userLanguageProficiencies &&
      userBasicInfoDto.userLanguageProficiencies.length > 0
    ) {
      // If language proficiencies are provided, update or create them
      for (const proficiency of userBasicInfoDto.userLanguageProficiencies) {
        const userLanguageProficiency = new UserLanguageProficiency();

        userLanguageProficiency.userId = id;
        userLanguageProficiency.languageId = proficiency.languageId;
        userLanguageProficiency.speakingLevelId = proficiency.speakingLevelId;
        userLanguageProficiency.readingLevelId = proficiency.readingLevelId;
        userLanguageProficiency.writingLevelId = proficiency.writingLevelId;

        await this.userLanguageProficiencyRepo.save(userLanguageProficiency);
      }
    }
    // Update the user profile with the provided basic information
    if (userBasicInfoDto.bloodGroupId !== undefined) {
      existingUserProfile.bloodGroupId = userBasicInfoDto.bloodGroupId
        ? Number(userBasicInfoDto.bloodGroupId)
        : null;
    }
    if (userBasicInfoDto.countryId !== undefined) {
      existingUserProfile.countryId = userBasicInfoDto.countryId
        ? Number(userBasicInfoDto.countryId)
        : null;
    }
    if (userBasicInfoDto.fathersName !== undefined) {
      existingUserProfile.fathersName = userBasicInfoDto.fathersName ?? null;
    }
    if (userBasicInfoDto.mothersName !== undefined) {
      existingUserProfile.mothersName = userBasicInfoDto.mothersName ?? null;
    }
    if (userBasicInfoDto.gender !== undefined) {
      existingUserProfile.gender = userBasicInfoDto.gender ?? null;
    }
    if (userBasicInfoDto.nidNumber !== undefined) {
      existingUserProfile.nidNumber = userBasicInfoDto.nidNumber ?? null;
    }
    if (userBasicInfoDto.passportNumber !== undefined) {
      existingUserProfile.passportNumber =
        userBasicInfoDto.passportNumber ?? null;
    }
    if (userBasicInfoDto.dateOfBirth !== undefined) {
      existingUserProfile.dateOfBirth = userBasicInfoDto.dateOfBirth
        ? new Date(userBasicInfoDto.dateOfBirth)
        : null;
    }
    if (userBasicInfoDto.phoneCountryId !== undefined) {
      existingUserProfile.phoneCountryId = userBasicInfoDto.phoneCountryId
        ? Number(userBasicInfoDto.phoneCountryId)
        : null;
    }
    if (userBasicInfoDto.phone !== undefined) {
      existingUserProfile.phone = userBasicInfoDto.phone ?? null;
    }
    if (userBasicInfoDto.presentAddressId !== undefined) {
      existingUserProfile.presentAddressId =
        userBasicInfoDto.presentAddressId ?? null;
    }
    if (userBasicInfoDto.permanentAddressId !== undefined) {
      existingUserProfile.permanentAddressId =
        userBasicInfoDto.permanentAddressId ?? null;
    }
    if (userBasicInfoDto.religionId !== undefined) {
      existingUserProfile.religionId = userBasicInfoDto.religionId
        ? Number(userBasicInfoDto.religionId)
        : null;
    }
    if (userBasicInfoDto.maritalStatusId !== undefined) {
      existingUserProfile.maritalStatusId = userBasicInfoDto.maritalStatusId
        ? Number(userBasicInfoDto.maritalStatusId)
        : null;
    }

    // Save the updated data and return it
    return this.userProfileRepo.save(existingUserProfile);
  }

  async updateContactInformation(
    id: number,
    userContactInfoDto: CreateUserContactInfoDto,
  ) {
    const existingUserContactInfo = await this.userContactInfoRepo.findOne({
      where: { userId: id },
    });

    // Save the updated data and return it
    return this.userContactInfoRepo.save({
      ...existingUserContactInfo,
      ...userContactInfoDto,
      userId: id, // Ensure userId is set
    } as UserContactInfo);
  }

  async updateWorkExperience(
    userWorkExperienceDto: CreateUserWorkExperienceDto,
  ) {
    userWorkExperienceDto.endDate = !userWorkExperienceDto.endDate
      ? null
      : new Date(userWorkExperienceDto.endDate).toISOString().split('T')[0];

    if (userWorkExperienceDto.id) {
      return this.userWorkExperienceRepo.update(
        { id: userWorkExperienceDto.id }, // condition to update
        { ...userWorkExperienceDto }, // data to update
      );
    } else {
      return this.userWorkExperienceRepo.save(userWorkExperienceDto);
    }
  }

  async updateWorkExperienceEmpId(
    userWorkExperienceDto: CreateUserWorkExperienceDto,
    employee_id: string,
  ) {
    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    userWorkExperienceDto.userId = Number(user.userId);

    userWorkExperienceDto.endDate = !userWorkExperienceDto.endDate
      ? null
      : new Date(userWorkExperienceDto.endDate).toISOString().split('T')[0];

    if (userWorkExperienceDto.id) {
      return this.userWorkExperienceRepo.update(
        { id: userWorkExperienceDto.id }, // condition to update
        { ...userWorkExperienceDto }, // data to update
      );
    } else {
      return this.userWorkExperienceRepo.save(userWorkExperienceDto);
    }
  }

  async deleteWorkExperience(id: number) {
    return this.userWorkExperienceRepo.delete({ id });
  }

  async addOrUpdateEducation(createDto: CreateUserEducationDto) {
    // Prepare the data with null conversion
    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      educationLevelId: createDto.educationLevelId || undefined,
      groupId: createDto.groupId || undefined,
      instituteCountryId: createDto.instituteCountryId || undefined,
      duration: createDto.duration || undefined,
      yearOfPassing: createDto.yearOfPassing || undefined,
      resultTypeId: createDto.resultTypeId || undefined,
      serial: createDto.serial || undefined,
      instituteName: createDto.instituteName || undefined,
      result: createDto.result || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userEducationRepo.update({ id }, updateData);
    } else {
      return this.userEducationRepo.save(dataToSave);
    }
  }

  async addOrUpdateEducationEmpId(
    createDto: CreateUserEducationDto,
    employee_id: string,
  ) {
    // Prepare the data with null conversion

    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    createDto.userId = Number(user.userId);

    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      educationLevelId: createDto.educationLevelId || undefined,
      groupId: createDto.groupId || undefined,
      instituteCountryId: createDto.instituteCountryId || undefined,
      duration: createDto.duration || undefined,
      yearOfPassing: createDto.yearOfPassing || undefined,
      resultTypeId: createDto.resultTypeId || undefined,
      serial: createDto.serial || undefined,
      instituteName: createDto.instituteName || undefined,
      result: createDto.result || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userEducationRepo.update({ id }, updateData);
    } else {
      return this.userEducationRepo.save(dataToSave);
    }
  }

  async deleteEducation(id: number): Promise<void> {
    const result = await this.userEducationRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User education with ID ${id} not found`);
    }
  }

  async addOrUpdateSkill(createDto: CreateUserSkillDto) {
    // Prepare the data with null conversion
    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      skillName: createDto.skillName || undefined,
      skillLevel: createDto.skillLevel || undefined,
      yearsOfExperience: createDto.yearsOfExperience || undefined,
      isTechnical: createDto.isTechnical,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userSkillRepo.update({ id }, updateData);
    } else {
      const existingSkill = await this.userSkillRepo.findOne({
        where: { userId: createDto.userId, skillName: createDto.skillName },
      });

      if (existingSkill) {
        throw new BadRequestException({
          skillName: [`"${createDto.skillName}" already exists in your skill`],
        });
      }
      return this.userSkillRepo.save(dataToSave);
    }
  }

  async addOrUpdateSkillWithEmpId(
    createDto: CreateUserSkillDto,
    employee_id: string,
  ) {
    // Prepare the data with null conversion

    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    createDto.userId = Number(user.userId);

    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      skillName: createDto.skillName || undefined,
      skillLevel: createDto.skillLevel || undefined,
      yearsOfExperience: createDto.yearsOfExperience || undefined,
      isTechnical: createDto.isTechnical,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userSkillRepo.update({ id }, updateData);
    } else {
      const existingSkill = await this.userSkillRepo.findOne({
        where: { userId: createDto.userId, skillName: createDto.skillName },
      });

      if (existingSkill) {
        throw new BadRequestException({
          skillName: [`"${createDto.skillName}" already exists in your skill`],
        });
      }
      return this.userSkillRepo.save(dataToSave);
    }
  }

  async deleteSkill(id: number): Promise<void> {
    const result = await this.userSkillRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User skill with ID ${id} not found`);
    }
  }

  async addOrUpdateCertification(createDto: CreateUserCertificationDto) {
    // Prepare the data with null conversion
    const dataToSave: DeepPartial<UserCertification> = {
      userId: createDto.userId,
      name: createDto.name || undefined,
      issuingOrganization: createDto.issuingOrganization || undefined,
      issueDate: createDto.issueDate || undefined,
      expirationDate: createDto.expirationDate || undefined,
      attachmentId: createDto.attachmentId || undefined,
    };

    if (createDto.attachmentFile) {
      const attachmentMedia = await this.mediaService.uploadFile(
        createDto.attachmentFile,
      );
      if (!attachmentMedia) {
        throw new BadRequestException('Failed to upload attachment file');
      }
      dataToSave.attachmentId = attachmentMedia.id;
    }
    // Convert id to number explicitly
    const numericId =
      typeof createDto.id === 'string'
        ? parseInt(createDto.id, 10)
        : createDto.id;

    if (numericId) {
      // if (isNaN(numericId)) {
      //   throw new BadRequestException('Invalid certification ID');
      // }
      const existingCertification = await this.certificationRepo.findOne({
        where: { id: numericId }, // Use the non-null assertion operator
      });

      if (
        existingCertification &&
        existingCertification.attachmentId &&
        createDto.attachmentFile
      ) {
        await this.mediaService.deleteFile(existingCertification.attachmentId);
      }

      // Remove id from update data to prevent trying to update the primary key
      return this.certificationRepo.update({ id: numericId }, dataToSave);
    } else {
      const existingCertification = await this.certificationRepo.findOne({
        where: { userId: createDto.userId, name: createDto.name },
      });

      if (existingCertification) {
        throw new BadRequestException({
          name: [`"${createDto.name}" already exists in your certifications`],
        });
      }
      return this.certificationRepo.save(dataToSave);
    }
  }

  async addOrUpdateCertificationWithEmpId(
    createDto: CreateUserCertificationDto,
    employee_id: string,
  ) {
    // Prepare the data with null conversion

    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    createDto.userId = Number(user.userId);

    const dataToSave: DeepPartial<UserCertification> = {
      userId: createDto.userId,
      name: createDto.name || undefined,
      issuingOrganization: createDto.issuingOrganization || undefined,
      issueDate: createDto.issueDate || undefined,
      expirationDate: createDto.expirationDate || undefined,
      attachmentId: createDto.attachmentId || undefined,
    };

    if (createDto.attachmentFile) {
      const attachmentMedia = await this.mediaService.uploadFile(
        createDto.attachmentFile,
      );
      if (!attachmentMedia) {
        throw new BadRequestException('Failed to upload attachment file');
      }
      dataToSave.attachmentId = attachmentMedia.id;
    }
    // Convert id to number explicitly
    const numericId =
      typeof createDto.id === 'string'
        ? parseInt(createDto.id, 10)
        : createDto.id;

    if (numericId) {
      // if (isNaN(numericId)) {
      //   throw new BadRequestException('Invalid certification ID');
      // }
      const existingCertification = await this.certificationRepo.findOne({
        where: { id: numericId }, // Use the non-null assertion operator
      });

      if (
        existingCertification &&
        existingCertification.attachmentId &&
        createDto.attachmentFile
      ) {
        await this.mediaService.deleteFile(existingCertification.attachmentId);
      }

      // Remove id from update data to prevent trying to update the primary key
      return this.certificationRepo.update({ id: numericId }, dataToSave);
    } else {
      const existingCertification = await this.certificationRepo.findOne({
        where: { userId: createDto.userId, name: createDto.name },
      });

      if (existingCertification) {
        throw new BadRequestException({
          name: [`"${createDto.name}" already exists in your certifications`],
        });
      }
      return this.certificationRepo.save(dataToSave);
    }
  }

  async deleteCertification(id: number): Promise<void> {
    const existingCertification = await this.certificationRepo.findOne({
      where: { id },
    });

    if (existingCertification && existingCertification.attachmentId) {
      await this.mediaService.deleteFile(existingCertification.attachmentId);
    }

    const result = await this.certificationRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User certification with ID ${id} not found`);
    }
  }

  async addOrUpdateProject(createDto: CreateUserProjectDto) {
    // Prepare the data with null conversion
    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      projectName: createDto.projectName || undefined,
      projectUrl: createDto.projectUrl || undefined,
      startDate: createDto.startDate || undefined,
      endDate: !createDto.endDate
        ? undefined
        : new Date(createDto.endDate).toISOString().split('T')[0],
      isCurrent: createDto.isCurrent,
      description: createDto.description || undefined,
      usedTechnologies: createDto.usedTechnologies || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userProjectRepo.update({ id }, updateData);
    } else {
      return this.userProjectRepo.save(dataToSave);
    }
  }

  async addOrUpdateProjectForEmpID(
    createDto: CreateUserProjectDto,
    employee_id: string,
  ) {
    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }
    createDto.userId = Number(user?.userId);

    console.log(createDto);

    const dataToSave = {
      ...createDto,
      // Convert 0 to null for nullable fields
      projectName: createDto.projectName || undefined,
      projectUrl: createDto.projectUrl || undefined,
      startDate: createDto.startDate || undefined,
      endDate: !createDto.endDate
        ? undefined
        : new Date(createDto.endDate).toISOString().split('T')[0],
      isCurrent: createDto.isCurrent,
      description: createDto.description || undefined,
      usedTechnologies: createDto.usedTechnologies || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userProjectRepo.update({ id }, updateData);
    } else {
      return this.userProjectRepo.save(dataToSave);
    }
  }

  async deleteProject(id: number): Promise<void> {
    const result = await this.userProjectRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User project with ID ${id} not found`);
    }
  }

  async addOrUpdateTraining(createDto: CreateUserTrainingDto) {
    // Prepare the data with null conversion
    const dataToSave = {
      ...createDto,
      trainingYear: createDto.trainingYear || undefined,
      startDate: createDto.startDate || undefined,
      endDate: createDto.endDate || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      const whereCondition: any = { id };
      if (createDto.userId) {
        whereCondition.userId = createDto.userId;
      }
      return this.userTrainingRepo.update(whereCondition, updateData);
    } else {
      return this.userTrainingRepo.save(dataToSave);
    }
  }

  async addOrUpdateTrainingEmpId(
    createDto: CreateUserTrainingDto,
    employee_id: string,
  ) {
    // Prepare the data with null conversion

    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    createDto.userId = Number(user.userId);

    const dataToSave = {
      ...createDto,
      trainingYear: createDto.trainingYear || undefined,
      startDate: createDto.startDate || undefined,
      endDate: createDto.endDate || undefined,
    };

    if (createDto.id) {
      // Remove id from update data to prevent trying to update the primary key
      const { id, ...updateData } = dataToSave;
      return this.userTrainingRepo.update({ id, userId: createDto.userId }, updateData);
    } else {
      return this.userTrainingRepo.save(dataToSave);
    }
  }

  async deleteTraining(id: number, userId?: number): Promise<void> {
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }
    const result = await this.userTrainingRepo.delete(whereCondition);

    if (result.affected === 0) {
      throw new NotFoundException(`User training with ID ${id} not found`);
    }
  }

  async addOrUpdateReference(createDto: CreateUserReferenceDto) {
    // Extract phoneIdentifier and exclude it from the data to save
    const { phoneIdentifier, ...restData } = createDto;

    // Prepare the data with phoneIdentifier converted to phone
    const dataToSave = {
      ...restData,
      phone: phoneIdentifier || restData.phone || undefined,
    };

    if (createDto.id) {
      // Single query that updates and returns the entity
      const result = await this.userReferenceRepo.findOne({
        where: { id: createDto.id },
      });

      if (!result) {
        throw new NotFoundException('Reference not found');
      }

      // Merge and save in one operation
      const updated = this.userReferenceRepo.merge(result, dataToSave);
      return this.userReferenceRepo.save(updated);
    } else {
      return this.userReferenceRepo.save(dataToSave);
    }
  }

  async addOrUpdateReferenceEmpId(
    createDto: CreateUserReferenceDto,
    employee_id: string,
  ) {
    // Extract phoneIdentifier and exclude it from the data to save

    const user = await this.employeeRepo.findOne({
      where: { id: Number(employee_id) },
    });

    if (!user) {
      throw new NotFoundException('employee not found');
    }

    createDto.userId = Number(user.userId);
    const { phoneIdentifier, ...restData } = createDto;

    // Prepare the data with phoneIdentifier converted to phone
    const dataToSave = {
      ...restData,
      phone: phoneIdentifier || restData.phone || undefined,
    };

    if (createDto.id) {
      // Single query that updates and returns the entity
      const result = await this.userReferenceRepo.findOne({
        where: { id: createDto.id },
      });

      if (!result) {
        throw new NotFoundException('Reference not found');
      }

      // Merge and save in one operation
      const updated = this.userReferenceRepo.merge(result, dataToSave);
      return this.userReferenceRepo.save(updated);
    } else {
      return this.userReferenceRepo.save(dataToSave);
    }
  }

  async deleteReference(id: number): Promise<void> {
    const result = await this.userReferenceRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User reference with ID ${id} not found`);
    }
  }

  async createUserNotification(
    userId: number,
    message: string,
  ): Promise<NotificationResponseDto> {
    const saved = await this.notificationModel.create({ userId, message });

    this.notificationGateway.sendNotification(
      userId,
      NotificationResponseDto.from(saved),
    );

    return NotificationResponseDto.from(saved);
  }

  async findNotificationByUserId(
    queryString: any,
  ): Promise<NotificationResponseDto[]> {
    const userId = RequestContext.get('userId');

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};
    const limit = queryString?.limit ? +queryString?.limit : 6;

    const query: any = { userId };

    if (params.search) {
      query.message = { $regex: params.search.trim(), $options: 'i' };
    }

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v ')
      .lean()
      .exec();

    return notifications.map(NotificationResponseDto.from);
  }

  async updateNotificationById(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();

    return NotificationResponseDto.from(notification);
  }

  async updateNotificationByUserId(userId: number): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, isRead: false }, { isRead: true })
      .exec();
  }

  async deleteNotificationById(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).exec();
  }

  async deleteNotificationByUserId(
    id: number,
  ): Promise<mongoose.mongo.DeleteResult> {
    return this.notificationModel.deleteMany({ userId: id }).exec();
  }

  async changePassword(dto: ChangePasswordDto): Promise<{ email: string }> {
    const userId = RequestContext.get('userId');
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compareSync(
      dto.currentPassword,
      user.password,
    );

    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.confirmPassword, 10);

    await this.userRepo.update({ id: userId }, { password: user.password });

    try {
      await this.mailService.sendMail(
        user.email,
        'Password Changed',
        'changed-password',
        {
          name: user.firstName + ' ' + user.lastName,
          resetLink: `${process.env.FRONTEND_URL}/forget-password`,
        },
      );
    } catch (error) {
      console.error('Email sending error:', error);
    }

    // 🔥 instead of calling MailService directly
    // await this.kafkaEventService.publish({
    //   name: 'user.password.changed',
    //   payload: {
    //     email: user.email,
    //     context: {
    //       name: user.firstName + ' ' + user.lastName,
    //       resetLink: `${process.env.FRONTEND_URL}/forget-password`,
    //     },
    //   },
    // });

    return { email: user.email };
  }

  async createOrUpdateBatchEmail(
    dto: CreateBatchEmailDto,
  ): Promise<BatchEmail> {
    const userId = RequestContext.get('userId');

    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId ?? undefined;
    dto.creatorId = userId;

    if (dto.id) {
      const batchEmail = await this.batchEmailRepo.findOne({
        where: { id: dto.id },
      });
      if (!batchEmail) throw new NotFoundException('Batch Email not found');
      dto.editorId = userId;
      const updated = this.batchEmailRepo.merge(batchEmail, dto);
      return this.batchEmailRepo.save(updated);
    } else {
      return this.batchEmailRepo.save(dto);
    }
  }

  async findBatchEmailById(id: number): Promise<BatchEmail> {
    const batchEmail = await this.batchEmailRepo.findOne({ where: { id } });
    if (!batchEmail)
      throw new NotFoundException(`Batch Emails ID ${id} not found`);
    return batchEmail;
  }

  async deleteBatchEmailById(id: number): Promise<void> {
    const result = await this.batchEmailRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Batch Email with ID ${id} not found`);
    }
  }

  async getAllBatchEmails(
    queryString: any,
  ): Promise<{ data: BatchEmail[]; total: number }> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');
    const query = this.batchEmailRepo.createQueryBuilder('batchEmail');

    // query.leftJoinAndSelect('batchEmail.application', 'app');

    // query.addSelect([
    //   'app.name',
    //   'app.id',
    // ])

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    // query.andWhere('batchEmail.appId = :appId', {
    //   appId: appUser.appId,
    // });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        'batchEmail.subject LIKE :search OR batchEmail.message LIKE :search',
        { search },
      );
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async createOrUpdateBatchEmailRecipient(
    dto: CreateBatchEmailRecipientDto,
  ): Promise<BatchEmailRecipient> {
    const userId = RequestContext.get('userId');

    const batchEmail = await this.batchEmailRepo.findOne({
      where: { id: dto.batchEmailId },
    });
    if (!batchEmail) {
      throw new NotFoundException('Batch Email not found');
    }
    dto.batchEmailId = batchEmail.id;
    if (dto.id) {
      const batchEmailRecipient = await this.batchEmailRecipientRepo.findOne({
        where: { id: dto.id },
      });

      if (!batchEmailRecipient)
        throw new NotFoundException('Batch Email Recipient not found');

      const updated = this.batchEmailRecipientRepo.merge(
        batchEmailRecipient,
        dto,
      );
      return this.batchEmailRecipientRepo.save(updated);
    } else {
      return this.batchEmailRecipientRepo.save(dto);
    }
  }

  async getAllBatchEmailRecipients(
    queryString: any,
  ): Promise<{ data: BatchEmailRecipient[]; total: number }> {
    const userId = RequestContext.get('userId');

    const query = this.batchEmailRecipientRepo.createQueryBuilder(
      'batchEmailRecipient',
    );

    query.leftJoinAndSelect('batchEmailRecipient.batchEmail', 'batchEmail');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    // query.andWhere('batchEmail.appId = :appId', {
    //   appId: appUser.appId,
    // });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        '(batchEmailRecipient.email LIKE :search OR batchEmail.subject LIKE :search OR batchEmail.message LIKE :search)',
        { search },
      );
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findBatchEmailRecipientById(id: number): Promise<BatchEmailRecipient> {
    const batchEmailRecipient = await this.batchEmailRecipientRepo.findOne({
      where: { id },
    });
    if (!batchEmailRecipient)
      throw new NotFoundException(`Batch Email Recipient ID ${id} not found`);
    return batchEmailRecipient;
  }

  async deleteBatchEmailRecipientById(id: number): Promise<void> {
    const result = await this.batchEmailRecipientRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Batch Email Recipient with ID ${id} not found`,
      );
    }
  }

  async createOrUpdateBatchEmailSection(
    dto: CreateBatchEmailSectionDto,
  ): Promise<BatchEmailSection> {
    const userId = RequestContext.get('userId');
    const batchEmail = await this.batchEmailRepo.findOne({
      where: { id: dto.batchEmailId },
    });
    if (!batchEmail) {
      throw new NotFoundException('Batch Email not found');
    }
    dto.batchEmailId = batchEmail.id;

    if (dto.id) {
      const batchEmailSection = await this.batchEmailSectionRepo.findOne({
        where: { id: dto.id },
      });

      if (!batchEmailSection)
        throw new NotFoundException('Batch Email Section not found');

      const updated = this.batchEmailSectionRepo.merge(batchEmailSection, dto);
      return this.batchEmailSectionRepo.save(updated);
    } else {
      return this.batchEmailSectionRepo.save(dto);
    }
  }

  async getAllBatchEmailSections(
    queryString: any,
  ): Promise<{ data: BatchEmailSection[]; total: number }> {
    const userId = RequestContext.get('userId');

    const query =
      this.batchEmailSectionRepo.createQueryBuilder('batchEmailSection');

    query.leftJoinAndSelect('batchEmailSection.batchEmail', 'batchEmail');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        '(batchEmailSection.email LIKE :search OR batchEmail.subject LIKE :search OR batchEmail.message LIKE :search)',
        { search },
      );
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findBatchEmailSectionById(id: number): Promise<BatchEmailSection> {
    const batchEmailSection = await this.batchEmailSectionRepo.findOne({
      where: { id },
    });
    if (!batchEmailSection)
      throw new NotFoundException(`Batch Email Section ID ${id} not found`);
    return batchEmailSection;
  }

  async deleteBatchEmailSectionById(id: number): Promise<void> {
    const result = await this.batchEmailSectionRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Batch Email Section with ID ${id} not found`,
      );
    }
  }

  async createOrUpdateLeadEmail(dto: CreateLeadEmailDto): Promise<LeadEmail> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId;
    dto.creatorId = userId;

    if (dto.id) {
      const leadEmail = await this.leadEmailRepo.findOne({
        where: { id: dto.id },
      });

      if (!leadEmail) throw new NotFoundException('Lead Email not found');
      dto.editorId = userId;
      const updated = this.leadEmailRepo.merge(leadEmail, dto);
      return this.leadEmailRepo.save(updated);
    } else {
      return this.leadEmailRepo.save(dto);
    }
  }

  async getAllLeadEmails(
    queryString: any,
  ): Promise<{ data: LeadEmail[]; total: number }> {
    const userId = RequestContext.get('userId');

    const query = this.leadEmailRepo.createQueryBuilder('leadEmail');

    query.leftJoinAndSelect('leadEmail.lead', 'lead');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        '(leadEmail.subject LIKE :search OR leadEmail.message LIKE :search)',
        { search },
      );
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findLeadEmailById(id: number): Promise<LeadEmail> {
    const leadEmail = await this.leadEmailRepo.findOne({ where: { id } });
    if (!leadEmail)
      throw new NotFoundException(`Lead Email ID ${id} not found`);
    return leadEmail;
  }

  async deleteLeadEmailById(id: number): Promise<void> {
    const result = await this.leadEmailRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Lead Email with ID ${id} not found`);
    }
  }

  async createOrUpdateSenderEmail(
    dto: CreateSenderEmailDto,
  ): Promise<SenderEmail> {
    const userId = RequestContext.get('userId');
    const appUser = await this.appUserRepo.findOne({ where: { userId } });
    if (!appUser) throw new NotFoundException('App User not found');

    dto.appId = appUser.appId;

    if (dto.id) {
      const senderEmail = await this.senderEmailRepo.findOne({
        where: { id: dto.id },
      });

      if (!senderEmail) throw new NotFoundException('Sender Email not found');

      const updated = this.senderEmailRepo.merge(senderEmail, dto);
      return this.senderEmailRepo.save(updated);
    } else {
      return this.senderEmailRepo.save(dto);
    }
  }

  async getAllSenderEmails(
    queryString: any,
  ): Promise<{ data: SenderEmail[]; total: number }> {
    const userId = RequestContext.get('userId');

    const query = this.senderEmailRepo.createQueryBuilder('senderEmail');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      query.andWhere(
        '(senderEmail.subject LIKE :search OR senderEmail.message LIKE :search)',
        { search },
      );
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return {
      data: featureData,
      total,
    };
  }

  async findSenderEmailById(id: number): Promise<SenderEmail> {
    const senderEmail = await this.senderEmailRepo.findOne({ where: { id } });
    if (!senderEmail)
      throw new NotFoundException(`Sender Email ID ${id} not found`);
    return senderEmail;
  }

  async deleteSenderEmailById(id: number): Promise<void> {
    const result = await this.senderEmailRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Sender Email with ID ${id} not found`);
    }
  }

  async getUserDashboardStatus(): Promise<any> {
    const userId = RequestContext.get('userId');
    if (!userId) throw new NotFoundException('User not found');

    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });
    if (!appUser) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: { userId, appId: appUser.appId ?? undefined },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const employeeId = employee.id;

    const appId = employee.appId || undefined;

    const leaveTypes = await this.empLeaveTypeRepo.find({
      where: { appId: appId },
    });

    const leaveOverview: Record<
      string,
      { total: number; used: number; remaining: number }
    > = {};

    let totalLeave = 0;
    let totalUsed = 0;

    await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const usedCount = await this.empLeaveRequestRepo.count({
          where: {
            empId: employeeId,
            appId,
            approvalStatusId: 52, // approved
            leaveTypeId: leaveType.id,
          },
        });

        leaveOverview[leaveType.name] = {
          total: leaveType.maxDaysPerYear,
          used: usedCount,
          remaining:
            leaveType.maxDaysPerYear - usedCount >= 0
              ? leaveType.maxDaysPerYear - usedCount
              : 0,
        };

        totalLeave += leaveType.maxDaysPerYear;
        totalUsed += usedCount;
      }),
    );

    //Leave remaining
    const totalRemaining =
      totalLeave - totalUsed >= 0 ? totalLeave - totalUsed : 0;

    //total worked hours
    const totalWorkHours = await this.empAttendanceRepo
      .createQueryBuilder('attendance')
      .select('SUM(attendance.worked_hour)', 'total')
      .where('attendance.emp_id = :empId', { empId: employeeId })
      .andWhere('attendance.app_id = :appId', { appId: employee.appId })
      .andWhere('attendance.attendance_status_id = :status', { status: 42 }) // present
      .getRawOne();

    // Total Asset distributed
    const totalAssets = await this.employeeAssetRepo.count({
      where: { employeeId, appId },
    });

    //Total client visit

    const totalClientVisit = await this.visitApplicationRepo.count({
      where: {
        visitorEmpId: employeeId,
        appId,
        visitStatusId: 157, // approved
      },
    });

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    //Present

    const presentCount = await this.empAttendanceRepo.count({
      where: {
        empId: employeeId,
        appId,
        attendanceStatusId: 42, // Present
      },
    });

    //Absent

    const absentCount = await this.empAttendanceRepo.count({
      where: {
        empId: employeeId,
        appId,
        attendanceStatusId: 43, // Absent
      },
    });

    const delayCount = await this.empAttendanceRepo.count({
      where: {
        empId: employeeId,
        appId,
        attendanceStatusId: 45, // Delay
      },
    });

    //holiday
    const holidayCount = await this.appHolidayDateRepo
      .createQueryBuilder('appHolDate')
      .innerJoin('appHolDate.appHoliday', 'appHoliday')
      .andWhere('appHoliday.appId = :appId', {
        appId: employee.appId,
      })
      .andWhere('MONTH(appHolDate.holidayDate) = :month', {
        month: now.getMonth() + 1,
      })
      .andWhere('YEAR(appHolDate.holidayDate) = :year', {
        year: now.getFullYear(),
      })
      .getCount();

    const attendanceOverview = {
      title: `Attendance Overview - ${month} ${year}`,
      present: presentCount,
      absent: absentCount,
      leave: totalUsed,
      delay: delayCount,
      holiday: holidayCount,
    };

    const employeeOverView = {
      totalWorkHours: totalWorkHours.total,
      totalAssets: totalAssets,
      totalLeaveRemaining: totalRemaining,
      totalClientVisit: totalClientVisit,
    };

    return {
      attendanceOverview,
      employeeOverView,
      leaveOverview,
      total: {
        totalLeave,
        totalUsed,
        totalRemaining,
      },
    };
  }

  async getUserEventCalendar(): Promise<any> {
    const userId = RequestContext.get('userId');
    if (!userId) throw new NotFoundException('User not found');

    const appUser = await this.appUserRepo.findOne({
      where: { userId, isActive: true },
    });

    if (!appUser) throw new NotFoundException('App User not found');

    const employee = await this.employeeRepo.findOne({
      where: {
        userId,
        appId: appUser.appId || 0,
        employmentStatusId: 92, // Accepted
        employeeStatusId: In([131, 132]), // Joined and Rejoined
        joiningDate: Not(IsNull()),
        resignationDate: IsNull(),
      },
      //relations: ['user', 'user.profile'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const today = new Date();

    const holidays = await this.appHolidayRepo
      .createQueryBuilder('appHoliday')
      .leftJoinAndSelect('appHoliday.appHolidayDates', 'holidayDates')
      .leftJoinAndSelect('appHoliday.holidayType', 'holidayType')
      .where('appHoliday.app_id = :appId', { appId: employee.appId })
      .getMany();

    const holidayEvents = holidays.flatMap((h) =>
      h.holidayDates.map((date) => ({
        id: h.id,
        name: h.holidayName || h.holiday?.holidayName,
        date,
        typeId: h.holidayTypeId,
        typeName: h.holidayType?.name,
        code: h.holidayType?.code,
      })),
    );

    //  Employee leaves
    const leaves = await this.empLeaveRequestRepo.find({
      where: {
        empId: employee.id,
        approvalStatusId: 52,
        endDate: MoreThanOrEqual(today),
      },
      relations: ['empLeaveType'],
      order: { startDate: 'ASC' },
    });

    const leaveEvents = leaves.map((l) => ({
      type: 'Leave',
      title: `${employee.user.firstName} ${employee.user.lastName} - ${l.empLeaveType.name}`,
      startDate: l.startDate,
      endDate: l.endDate,
      description: l.reason || null,
    }));

    // 3️ Employee Birthday

    const birthdayUsers = await this.userProfileRepo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('profile.dateOfBirth IS NOT NULL')
      .getMany();

    const birthdayEvents = birthdayUsers.map((profile) => {
      const dobString = profile.dateOfBirth;
      if (!dobString) return null;
      const dob = new Date(dobString);

      return {
        type: 'Birthday',
        title: `${profile.user.firstName} ${profile.user.lastName} Birthday`,
        month: dob.getMonth() + 1,
        day: dob.getDate(),
        birthday: dob.toISOString().split('T')[0],
      };
    });

    return {
      holidayEvents,
      leaveEvents,
      birthdayEvents,
    };
  }

  async updateEmployeeBasicInfo(
    empId: number,
    dto: UpdateEmployeeBasicInfoDto,
  ): Promise<any> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new BadRequestException('app id not found');
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: empId, appId },
      select: ['id', 'userId', 'appId'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empId} not found`);
    }

    if (!employee.userId) {
      throw new NotFoundException(`No user with employee ID ${empId}`);
    }

    const userId = employee.userId;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    await this.userRepo.save(user);

    let profile = await this.userProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.userProfileRepo.create({ userId });
    }

    if (dto.fathersName !== undefined) profile.fathersName = dto.fathersName;
    if (dto.mothersName !== undefined) profile.mothersName = dto.mothersName;

    if (dto.dateOfBirth !== undefined) {
      profile.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    if (dto.nidNumber !== undefined) profile.nidNumber = dto.nidNumber;
    if (dto.passportNumber !== undefined)
      profile.passportNumber = dto.passportNumber;

    if (dto.countryId !== undefined) profile.countryId = dto.countryId;

    if (dto.gender !== undefined) profile.gender = dto.gender;

    if (dto.religionId !== undefined) profile.religionId = dto.religionId;
    if (dto.bloodGroupId !== undefined) profile.bloodGroupId = dto.bloodGroupId;
    if (dto.maritalStatusId !== undefined)
      profile.maritalStatusId = dto.maritalStatusId;

    const savedProfile = await this.userProfileRepo.save(profile);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      profile: {
        id: savedProfile.id,
        userId: savedProfile.userId,
        fathersName: savedProfile.fathersName,
        mothersName: savedProfile.mothersName,
        dateOfBirth: savedProfile.dateOfBirth,
        nidNumber: savedProfile.nidNumber,
        passportNumber: savedProfile.passportNumber,
        countryId: savedProfile.countryId,
        gender: savedProfile.gender,
        religionId: savedProfile.religionId,
        bloodGroupId: savedProfile.bloodGroupId,
        maritalStatusId: savedProfile.maritalStatusId,
      },
    };
  }
}
