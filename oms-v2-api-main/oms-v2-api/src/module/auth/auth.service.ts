// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, ILike, In, IsNull, LessThan, MoreThan, Repository } from 'typeorm';

import {
  UserRegisterSchema,
  UserRegisterRequestDto,
  UserRegisterRequestSwagger,
} from './dto/user-register-request.dto';
import { LoginSchema, LoginRequestDto } from './dto/login-request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
} from './dto/forgot-password.dto';

import { AuthOtp, OtpChannel, OtpType } from './entites/auth_otp.entity';
import {
  ChangePasswordDoc,
  ChangePasswordDto,
  ChangePasswordSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
  VerifyOtpDto,
} from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { PasswordReset } from './entites/password_reset.entity';
import { User } from '@module/users/entities/user.entity';
import { UserContextService } from './user-context.service';
import { HelperService } from '@common/helpers/helper.service';
import { LoginResponseDto } from './dto/login-response-dto';
import { Helpers } from '@core/utils/helpers';
import { DbConfigsService } from '@module/db-configs/db-configs.service';
import { DbConfig } from '@module/db-configs/entities/db-config.entity';
import { join } from 'path';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { Status } from '@module/status/entities/status.entity';
import { Country } from '@module/country/entities/country.entity';
import { instanceToPlain } from 'class-transformer';
import { UserLanguageProficiency } from '@module/users/entities/user-language-proficiency.entity';
import { UserContactInfo } from '@module/users/entities/user-contact-info.entity';
import { UserWorkExperience } from '@module/users/entities/user-work-experience.entity';
import { UserEducation } from '@module/users/entities/user-education.entity';
import { UserSkill } from '@module/users/entities/user-skill.entity';
import { UserCertification } from '@module/users/entities/user-certification.entity';
import { UserProject } from '@module/users/entities/user-project.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UserReference } from '@module/users/entities/user-reference.entity';
import { CacheService } from 'src/redis/cache.service';
import { v4 as uuid } from 'uuid';
import { RequestContext } from '@common/request-context';
import { HybridQueueService } from 'src/queue/hybrid-queue.service';
import { EmpInvitation } from '@module/hr-management/entities/employee-invitations.entity';
import { UsersService } from '@module/users/users.service';
import { UAParser } from 'ua-parser-js';
import { AuditLogService } from '@module/audit-log/audit-log.service';
import { CreateUserSessionDto } from '@module/audit-log/dto/user-sessions.dto';
import { Permission } from '@module/role-permission/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,

    @InjectRepository(UserLanguageProficiency)
    private readonly userLanguageProficiencyRepo: Repository<UserLanguageProficiency>,

    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    private readonly userContextService: UserContextService,

    private readonly jwtService: JwtService,

    @InjectRepository(AuthOtp)
    private readonly authOtpRepo: Repository<AuthOtp>,
    private readonly mailService: MailService,

    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,

    @InjectRepository(DbConfig)
    private readonly dbConfigRepo: Repository<DbConfig>,

    @InjectRepository(UserContactInfo)
    private readonly userContactInfoRepo: Repository<UserContactInfo>,

    @InjectRepository(UserWorkExperience)
    private readonly userWorkExperienceRepo: Repository<UserWorkExperience>,

    @InjectRepository(UserSkill)
    private readonly userSkillRepo: Repository<UserSkill>,

    @InjectRepository(UserEducation)
    private readonly userEducationRepo: Repository<UserEducation>,

    @InjectRepository(UserCertification)
    private readonly certificationRepo: Repository<UserCertification>,

    @InjectRepository(UserProject)
    private readonly userProjectRepo: Repository<UserProject>,

    @InjectRepository(UserTraining)
    private readonly userTrainingRepo: Repository<UserTraining>,

    @InjectRepository(UserReference)
    private readonly userReferenceRepo: Repository<UserReference>,

    @InjectRepository(EmpInvitation)
    private readonly empInvitationRepo: Repository<EmpInvitation>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

    private readonly helperService: HelperService,
    private readonly cacheService: CacheService,
    private readonly requestContext: RequestContext,
    private readonly hybridQueue: HybridQueueService,
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async checkEmailExists(email: string): Promise<{ exists: boolean; message: string }> {
    if (!email || typeof email !== 'string') {
      return { exists: false, message: 'Email is required' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { exists: false, message: 'Email is required' };
    }

    const exists = await this.userRepo.findOne({
      where: { email: ILike(cleanEmail) },
      select: ['id'],
    });

    return {
      exists: !!exists,
      message: exists ? 'Email already registered' : 'Email is available',
    };
  }

  async register(input: UserRegisterRequestSwagger): Promise<LoginResponseDto> {
    const parsed = UserRegisterSchema.safeParse(input);
    // const { lastTimezone } = parsed.data;
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const exists = await this.userRepo.findOne({
      where: { email: input.email },
    });

    if (exists) {
      throw new BadRequestException({
        email: ['Email already registered'],
      });
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = this.userRepo.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
      lastTimezone: input.lastTimezone,
    });

    const newUser = await this.userRepo.save(user);

    const empInvitation = await this.empInvitationRepo.findOne({
      where: { code: input.invitationCode },
    });

    if (empInvitation) {
      await this.empInvitationRepo.update(empInvitation.id, {
        userId: newUser.id,
      });

      if (newUser) {
        await this.usersService.createUserNotification(
          newUser.id,
          `You have been invited to join as an employee. Please accept the invitation and complete your profile. Link: <a href="${process.env.FRONTEND_URL}/my-employee-invitations/${input.invitationCode}" class="btn btn-primary btn-xs">Accept Invitation</a>`,
        );
      }
    }

    if (newUser) {
      await this.usersService.createUserNotification(
        newUser.id,
        `Your account has been successfully registered.`,
      );

      // Immediately send verification email with link upon registration
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const sessionId = crypto.randomUUID();
        const dbConfig = await this.dbConfigRepo.findOne({
          where: { key: 'otp_expiry_minutes' },
        });
        const otpExpiryMinutes = dbConfig ? Number(dbConfig.value) : 10;
        const newOtpData: DeepPartial<AuthOtp> = {
          otpType: OtpType.EMAIL_VERIFICATION,
          otpChannel: OtpChannel.EMAIL,
          otp,
          user: newUser,
          sessionId,
          expiredAt: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
        };
        await this.authOtpRepo.delete({
          user: newUser,
          otpType: OtpType.EMAIL_VERIFICATION,
        });
        const otpResult = await this.authOtpRepo.save(newOtpData);
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
        const verificationUrl = `${frontendUrl}/email-verification?sessionId=${sessionId}&otp=${otp}`;

        await this.mailService.sendMail(
          newUser.email,
          'Please Verify Your Email',
          'email-verify',
          {
            name: newUser.firstName + ' ' + newUser.lastName,
            otp,
            sessionId,
            verificationUrl,
            expiredAt: Helpers.minutesUntil(otpResult.expiredAt) + 1,
          },
        );
      } catch (emailErr) {
        console.error('Registration verification email sending error:', emailErr);
      }
    }

    const loginResponse = await this.getLoginResponse(newUser);

    return loginResponse;
  }

  async extractRolesAndPermissions(
    userId: number,
    activeAppId?: number,
  ): Promise<{
    roles: string[];
    permissions: string[];
    LeftSidebarMenu: any[];
    NavbarMenu: any[];
    // PublicPermissions: any[];
  }> {
    const publicPermissionIds: number[] = [];
    const roledUserPermissionIds: number[] = [];

    const userCaseRows: Array<{ id: number; appUseCase: string }> =
      await this.userRepo.manager.query(
        'SELECT id, app_use_case as appUseCase FROM users WHERE id = ? LIMIT 1',
        [userId],
      );
    const accessPanel =
      userCaseRows[0]?.appUseCase === 'Admin' ? 'Admin' : 'Company';

    const publicPermissions: Array<{ id: number }> =
      await this.userRepo.manager.query(
        'SELECT id FROM permissions WHERE is_required = 0 AND is_active = 1 AND access_panel = ?',
        [accessPanel],
      );

    publicPermissions?.forEach((p) => publicPermissionIds.push(p.id));

    const rolesParams: any[] = [userId];
    let rolesAppClause = '';
    if (activeAppId) {
      rolesAppClause = 'AND (ur.app_id IS NULL OR ur.app_id = ?)';
      rolesParams.push(activeAppId);
    }

    const rolesData: Array<{ roleName: string; roleCode: string }> =
      await this.userRepo.manager.query(
        `SELECT r.name AS roleName, r.code AS roleCode
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.id
         INNER JOIN roles r ON r.id = ur.role_id
         WHERE u.id = ? ${rolesAppClause}`,
        rolesParams,
      );

    const userRoleNames = Array.from(new Set(rolesData.map((r) => r.roleName)));
    const userRoleCodes = Array.from(new Set(rolesData.map((r) => r.roleCode)));

    const rolePermParams: any[] = [userId, accessPanel, accessPanel];
    let rolePermAppClause = '';
    if (activeAppId) {
      rolePermAppClause = 'AND (ur.app_id IS NULL OR ur.app_id = ?)';
      rolePermParams.push(activeAppId);
    }

    const userRolesPermData: Array<{ code: string; id: number }> =
      await this.userRepo.manager.query(
        `SELECT p.code AS code, p.id AS id
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.id
         INNER JOIN roles r ON r.id = ur.role_id
         INNER JOIN role_permissions rp ON rp.role_id = r.id
         INNER JOIN permissions p ON p.id = rp.permission_id
         WHERE u.id = ?
           AND p.access_panel = ?
           AND rp.access_panel = ?
           ${rolePermAppClause}`,
        rolePermParams,
      );

    const grantedPermissions = new Set<string>(
      userRolesPermData.map((p) => p.code),
    );

    const userPermissionsData: Array<{ code: string; id: number; isGranted: any }> =
      await this.userRepo.manager.query(
        `SELECT p.code AS code, p.id AS id, up.is_granted AS isGranted
         FROM users u
         INNER JOIN user_permissions up ON up.user_id = u.id
         INNER JOIN permissions p ON p.id = up.permission_id
         WHERE u.id = ? AND p.access_panel = ?`,
        [userId, accessPanel],
      );

    const revokedPermissions = new Set<string>();

    userPermissionsData?.forEach((up) => {
      const isGranted =
        up.isGranted === true ||
        up.isGranted === 1 ||
        String(up.isGranted) === '1';
      if (isGranted) {
        grantedPermissions.add(up.code);
        if (up.id) roledUserPermissionIds.push(up.id);
      } else {
        revokedPermissions.add(up.code);
      }
    });

    userRolesPermData?.forEach((up) => {
      roledUserPermissionIds.push(up.id);
    });

    const mergePermissionIds = Array.from(
      new Set([...publicPermissionIds, ...roledUserPermissionIds]),
    );

    // console.log('publicPermissionIds=======', publicPermissionIds);
    // console.log('roledUserPermissionIds=======', roledUserPermissionIds);
    // console.log('mergePermissionIds=======', mergePermissionIds);

    const finalPermissionCodes = [...grantedPermissions].filter(
      (code) => !revokedPermissions.has(code),
    );
    
    if (userRoleCodes.includes('super_admin')) {
      finalPermissionCodes.push('super_admin');
      finalPermissionCodes.push('*');
    }
    // console.log('finalPermissionCodes=======', finalPermissionCodes);

    const leftSidebarMenu: any[] = [];
    const navbarMenu: any[] = [];

    if (!mergePermissionIds.length && accessPanel !== 'Admin') {
      return {
        roles: userRoleNames,
        permissions: finalPermissionCodes,
        LeftSidebarMenu: leftSidebarMenu,
        NavbarMenu: navbarMenu,
      };
    }

    // Admin sidebar is every active menu whose access_panel is Admin.
    // Company sidebar stays limited to permissions granted to that user.
    const menuParams: Array<string | number[]> = [accessPanel];
    let grantedOnly = '';
    if (accessPanel !== 'Admin') {
      grantedOnly = 'AND p.id IN (?)';
      menuParams.push(mergePermissionIds);
    }
    const menuData = await this.userRepo.manager.query(
      `SELECT
     p.id as id,
     p.name as name,
     p.code as code,
     p.type as type,
     p.path as path,
     p.icon as icon,
     p.sort_order as sortOrder,
     p.parent_id as parentId,
     p.is_required as isRequired,
     p.access_panel as accessPanel,
     st.code as positionCode
   FROM status_groups AS sg
          INNER JOIN statuses AS st ON st.status_group_id = sg.id
          INNER JOIN permissions AS p ON p.menu_position_id = st.id
   WHERE sg.code = 'menu_positions'
     AND sg.is_active = 1
     AND st.is_active = 1
     AND p.is_active = 1
     AND (p.deleted_at IS NULL)
     AND p.type IN ('module', 'page')
     AND p.access_panel = ?
     ${grantedOnly}
   ORDER BY p.sort_order ASC`,
      menuParams,
    );

    const modulesMap = new Map();

    menuData?.forEach((row) => {
      if (row.type === 'module' && !row.parentId) {
        // accessPanel is an ENUM — raw MySQL queries may return it as a Buffer
        const accessPanel = row.accessPanel
          ? (Buffer.isBuffer(row.accessPanel)
            ? row.accessPanel.toString()
            : String(row.accessPanel)
          ).trim()
          : 'Company';
        modulesMap.set(row.id, {
          position: row.positionCode,
          obj: {
            id: row.id,
            name: row.name,
            code: row.code,
            path: row.path,
            icon: row.icon,
            accessPanel,
            isRequired: row.isRequired,
            pages: [],
          },
        });
      }
    });

    // Fetch action/feature permissions to nest inside pages
    const actionData = mergePermissionIds.length
      ? await this.userRepo.manager.query(
          `SELECT
         p.id as id,
         p.code as code,
         p.parent_id as parentId
       FROM permissions p
       WHERE p.type IN ('action', 'feature')
         AND p.is_active = 1
         AND p.access_panel = ?
         AND p.id IN (?)`,
          [accessPanel, mergePermissionIds],
        )
      : [];

    const actionsMap = new Map<number, string[]>();
    actionData?.forEach((row) => {
      if (!actionsMap.has(row.parentId)) {
        actionsMap.set(row.parentId, []);
      }
      actionsMap.get(row.parentId)!.push(row.code);
    });

    const missingParentIds = [
      ...new Set(
        (menuData || [])
          .filter((row) => row.parentId && !modulesMap.has(row.parentId))
          .map((row) => row.parentId),
      ),
    ];

    if (missingParentIds.length) {
      const parentRows: Array<{
        id: number;
        name: string;
        code: string;
        path: string;
        icon: string;
        isRequired: number;
      }> = await this.userRepo.manager.query(
        `SELECT p.id as id, p.name as name, p.code as code, p.path as path,
                p.icon as icon, p.is_required as isRequired
         FROM permissions p
         WHERE p.id IN (?)
           AND p.is_active = 1
           AND p.deleted_at IS NULL`,
        [missingParentIds],
      );
      const parentById = new Map(
        parentRows.map((row) => [Number(row.id), row]),
      );
      menuData.forEach((row) => {
        if (!row.parentId || modulesMap.has(row.parentId)) return;
        const parent = parentById.get(Number(row.parentId));
        if (!parent) return;
        const pagePanel = (
          row.accessPanel
            ? Buffer.isBuffer(row.accessPanel)
              ? row.accessPanel.toString()
              : String(row.accessPanel)
            : accessPanel
        ).trim();
        modulesMap.set(row.parentId, {
          position: row.positionCode,
          obj: {
            id: parent.id,
            name: parent.name,
            code: parent.code,
            path: parent.path,
            icon: parent.icon,
            accessPanel: pagePanel,
            isRequired: parent.isRequired,
            pages: [],
          },
        });
      });
    }

    menuData?.forEach((row) => {
      if ((row.type === 'page' || row.type === 'module') && row.parentId) {
        const parentModule = modulesMap.get(row.parentId);
        if (parentModule) {
          const pageAccessPanel = (
            row.accessPanel
              ? Buffer.isBuffer(row.accessPanel)
                ? row.accessPanel.toString()
                : String(row.accessPanel)
              : 'Company'
          ).trim();
          parentModule.obj.pages.push({
            id: row.id,
            name: row.name,
            code: row.code,
            path: row.path,
            icon: row.icon,
            accessPanel: pageAccessPanel,
            isRequired: row.isRequired,
            permissions: actionsMap.get(row.id) || [],
          });
        }
      }
    });

    // Third pass: Push fully constructed modules to their respective arrays
    modulesMap?.forEach((value) => {
      if (value.position === 'left_sidebar_menu') {
        leftSidebarMenu.push(value.obj);
      } else if (value.position === 'navbar_menu') {
        navbarMenu.push(value.obj);
      }
    });
    // }

    return {
      roles: userRoleNames,
      permissions: finalPermissionCodes,
      LeftSidebarMenu: leftSidebarMenu,
      NavbarMenu: navbarMenu,
    };
  }
  async getLoginResponse(
    user: any,
    sessionId?: string,
    fPermission?: boolean,
  ): Promise<LoginResponseDto> {
    // Generate tokens
    if (!process.env.JWT_SECRET) {
      throw new BadRequestException({
        message: [
          'JWT_SECRET is not configured. Please set it in your environment variables.',
        ],
      });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new BadRequestException({
        message: [
          'JWT_REFRESH_SECRET is not configured. Please set it in your environment variables.',
        ],
      });
    }

    const accessToken = await this.jwtService.signAsync(
      { id: user.id, email: user.email, activeAppId: user.activeAppId },
      {
        expiresIn: (process.env.JWT_EXPIRATION ||
          '1h') as JwtSignOptions['expiresIn'],
      }, // short-lived
    );

    // Generate refresh token
    const refreshToken = await this.jwtService.signAsync(
      { id: user.id, email: user.email, activeAppId: user.activeAppId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION ||
          '7d') as JwtSignOptions['expiresIn'],
      }, // long-lived
    );

    // Generate and save sessionId
    if (!sessionId) {
      const sId = uuid();
      await this.cacheService.set(
        `session:${sId}`,
        JSON.stringify({ userId: user.id }),
        60 * 60 * 24 * 7, // 7 days
      );
      sessionId = sId;
    }

    let permissions: string[] = [];
    let roles: string[] = [];
    let tempLeftSidebar: any;
    let tempNavbar: any;
    let PublicPermissions: any;

    if (fPermission) {
      const extracted = await this.extractRolesAndPermissions(
        user.id,
        user.activeAppId,
      );
      permissions = extracted.permissions;
      roles = extracted.roles;
      tempLeftSidebar = extracted.LeftSidebarMenu;
      tempNavbar = extracted.NavbarMenu;
      // PublicPermissions = extracted.PublicPermissions;
    }

    delete user.userRoles;
    delete user.userPermissions;

    user.userRole = roles;

    const loginResponse = new LoginResponseDto();
    loginResponse.accessToken = accessToken;
    loginResponse.refreshToken = refreshToken;
    loginResponse.sessionId = sessionId;
    loginResponse.tokenType = 'Bearer';
    loginResponse.user = user;
    loginResponse.permissions = permissions;
    loginResponse.leftSidebarMenu = tempLeftSidebar;
    loginResponse.navbarMenu = tempNavbar;
    loginResponse.publicPermissions = PublicPermissions;

    return loginResponse;
  }

  async registerWithSocialData(
    input: UserRegisterRequestSwagger,
  ): Promise<LoginResponseDto> {
    const userExist = await this.userRepo.findOne({
      where: { email: input.email },
    });

    const loginResponse = new LoginResponseDto();

    if (userExist) {
      loginResponse.accessToken = await this.jwtService.signAsync({
        id: userExist.id,
        email: userExist.email,
      });

      loginResponse.user = userExist;
    } else {
      const hashedPassword = await bcrypt.hash('12345678', 10);

      const user = this.userRepo.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: hashedPassword,
        lastTimezone: input.lastTimezone,
      });

      loginResponse.accessToken = await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
      });
    }

    if (loginResponse.user) {
      loginResponse.user.lastTimezone = input.lastTimezone ?? null;
      await this.userRepo.save(loginResponse.user);
    }

    loginResponse.tokenType = 'Bearer';
    loginResponse.permissions = [];

    return loginResponse;
  }

  async login(input: LoginRequestDto): Promise<LoginResponseDto> {
    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const { email, password, lastTimezone } = parsed.data;

    const userQuery = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.activeApp', 'activeApp')
      .leftJoinAndSelect('activeApp.logoMedia', 'logoMedia')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('user.appUsers', 'appUsers')
      .leftJoinAndSelect('appUsers.application', 'application')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = true');

    const user = await userQuery.getOne();

    if (!user) {
      // throw new UnauthorizedException('Invalid email or password');
      throw new BadRequestException({
        email: ['User not found with this email'],
      });
    }

    if (user?.appUsers && user?.appUsers.length === 1 && !user.activeAppId) {
      const defaultAppId = user.appUsers[0]?.application?.id;
      if (defaultAppId != null) {
        user.activeAppId = defaultAppId;
        await this.userRepo.save(user);
      }
    }

    await this.cacheService.set(`appId:${user.id}`, user?.activeAppId);

    const isValid: boolean = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // throw new UnauthorizedException('Invalid email or password');
      throw new BadRequestException({
        password: ['Password does not match'],
      });
    }

    RequestContext.set('userId', user.id);
    RequestContext.set('activeAppId', user.activeAppId);

    if (lastTimezone) {
      await this.userRepo.update(user.id, { lastTimezone: lastTimezone });
    }

    const parser = new UAParser(input.userAgent);
    const deviceInfo = parser.getDevice();

    const userSession: CreateUserSessionDto = {
      userId: user.id,
      device: input.device,
      location: input.location,
      city: input.city,
      countryName: input.countryName,
      browser: parser.getBrowser().name,
      ipAddress: input.ipAddress,
      startDateTime: new Date(),
    };
    // Save user session
    const session: any =
      await this.auditLogService.addOrUpdateUserSession(userSession);
    const sessionId = session?._id.toString();

    console.debug('User session saved:', sessionId);

    // Generate tokens
    const loginResponse = await this.getLoginResponse(user, sessionId, true);
    await this.cacheService.del(`user:${user.id}`);

    return loginResponse;
  }

  async setActiveAppUser(reqUser: User, activeAppId: number): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email: reqUser.email },
    });

    if (!user) {
      // throw new UnauthorizedException('Invalid email or password');
      throw new BadRequestException({
        email: ['User not found with this email'],
      });
    }

    user.activeAppId = Number(activeAppId);
    await this.userRepo.save(user);

    await this.cacheService.set(`appId:${user.id}`, user?.activeAppId);
    RequestContext.set('activeAppId', user.activeAppId);

    // await this.cacheService.del(`session:${sessionId}`);
    // await this.cacheService.del(`appId:${user.id}`);

    return { message: 'Set active app successfully', user };
  }

  async refreshToken(oldRefreshToken: string, sessionId: string) {
    try {
      // Verify refresh token with refresh secret
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const decode = await this.jwtService.decode(oldRefreshToken);

      if (!payload) throw new UnauthorizedException('Invalid refresh token');

      // Check session from Redis/Cache
      const session = await this.cacheService.get(`session:${sessionId}`);
      if (!session) throw new UnauthorizedException('Session expired');

      // Issue new tokens
      const accessToken = await this.jwtService.signAsync(
        {
          id: payload.id,
          email: payload.email,
          activeAppId: payload.activeAppId,
        },
        {
          expiresIn: process.env.JWT_EXPIRATION as JwtSignOptions['expiresIn'],
        }, // access token
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          id: payload.id,
          email: payload.email,
          activeAppId: payload.activeAppId,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env
            .JWT_REFRESH_EXPIRATION as JwtSignOptions['expiresIn'],
        }, // long-lived refresh token
      );

      return { accessToken, refreshToken, sessionId };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async userLogout(
    reqUser: User,
    sessionId: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { email: reqUser.email },
    });

    if (!user) {
      // throw new UnauthorizedException('Invalid email or password');
      throw new BadRequestException({
        email: ['User not found with this email'],
      });
    }

    await this.auditLogService.updateUserSession();
    await this.cacheService.del(`appId:${user.id}`);

    return { message: 'Logout successfully' };
  }

  async authUserInfo(reqUser: User, incomingSessionId?: string) {
    const cacheKey = `user:${reqUser.id}`;

    console.log(cacheKey);

    // const cached = await this.cacheService.get(cacheKey);
    // if (cached) return cached;

    console.time('-');
    const user: any = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('user.appUsers', 'appUsers')
      .leftJoinAndSelect('appUsers.application', 'application')
      .leftJoinAndSelect('user.activeApp', 'activeApp')
      .leftJoinAndSelect('activeApp.logoMedia', 'logoMedia')
      .leftJoinAndSelect('activeApp.invoiceLogoMedia', 'invoiceLogoMedia')
      .leftJoinAndSelect('user.employee', 'employee')
      .where('user.email = :email', { email: reqUser.email })
      .getOne();
    console.timeEnd('-');

    if (!user) {
      throw new BadRequestException({
        email: ['User not found with this email'],
      });
    }

    if (user?.appUsers?.length === 1 && !user.activeAppId) {
      user.activeAppId = user.appUsers[0]?.application?.id;
      await this.userRepo.save(user);
    }

    await this.cacheService.set(`appId:${user.id}`, user?.activeAppId);

    // Load profile relations sequentially to avoid exhausting the MySQL pool
    // (parallel Promise.all here opened ~9 connections per request).
    const userContactInfo = await this.userContactInfoRepo.findOne({
      where: { userId: user.id },
    });
    const userWorkExperiences = await this.userWorkExperienceRepo.find({
      where: { userId: user.id },
    });
    const skills = await this.userSkillRepo.find({ where: { userId: user.id } });
    const certifications = await this.certificationRepo.find({
      where: { userId: user.id },
    });
    const projects = await this.userProjectRepo.find({
      where: { userId: user.id },
    });
    const trainings = await this.userTrainingRepo.find({
      where: { userId: user.id, statusId: IsNull() },
    });
    const references = await this.userReferenceRepo.find({
      where: { userId: user.id },
    });
    const educations = await this.userEducationRepo.find({
      where: { userId: user.id },
      order: { serial: 'ASC', yearOfPassing: 'DESC' },
    });
    const languageProficiencies = await this.userLanguageProficiencyRepo.find({
      where: { userId: user.id },
    });

    user.userContactInfos = userContactInfo;
    user.userWorkExperiences = userWorkExperiences;
    user.userSkills = skills;
    user.userCertifications = certifications;
    user.userProjects = projects;
    user.userTrainings = trainings;
    user.userReferences = references;

    const profile = await user.profile;

    const statusIdsNeeded = new Set<number>();
    for (const edu of educations) {
      if (edu.educationLevelId) statusIdsNeeded.add(edu.educationLevelId);
      if (edu.groupId) statusIdsNeeded.add(edu.groupId);
      if (edu.resultTypeId) statusIdsNeeded.add(edu.resultTypeId);
    }
    for (const lang of languageProficiencies) {
      if (lang.speakingLevelId) statusIdsNeeded.add(lang.speakingLevelId);
      if (lang.readingLevelId) statusIdsNeeded.add(lang.readingLevelId);
      if (lang.writingLevelId) statusIdsNeeded.add(lang.writingLevelId);
    }
    if (profile?.bloodGroupId) statusIdsNeeded.add(profile.bloodGroupId);
    if (profile?.maritalStatusId) statusIdsNeeded.add(profile.maritalStatusId);
    if (profile?.religionId) statusIdsNeeded.add(profile.religionId);

    const countryIdsNeeded = new Set<number>();
    for (const edu of educations) {
      if (edu.instituteCountryId) countryIdsNeeded.add(edu.instituteCountryId);
    }
    for (const lang of languageProficiencies) {
      if (lang.languageId) countryIdsNeeded.add(lang.languageId);
    }
    if (profile?.countryId) countryIdsNeeded.add(profile.countryId);

    const [statuses, countries] = await Promise.all([
      statusIdsNeeded.size > 0
        ? this.statusRepo.findBy({ id: In([...statusIdsNeeded]) })
        : Promise.resolve([]),
      countryIdsNeeded.size > 0
        ? this.countryRepo.findBy({ id: In([...countryIdsNeeded]) })
        : Promise.resolve([]),
    ]);

    const statusMap = new Map(statuses.map((s) => [s.id, s]));
    const countryMap = new Map(countries.map((c) => [c.id, c]));

    // Use EXACT entity names here to prevent duplicates
    user.userEducations = educations.map((education) => {
      education.instituteCountryName = education.instituteCountryId
        ? (countryMap.get(education.instituteCountryId)?.name ?? null)
        : null;
      education.educationLevelName = education.educationLevelId
        ? (statusMap.get(education.educationLevelId)?.name ?? null)
        : null;
      education.groupName = education.groupId
        ? (statusMap.get(education.groupId)?.name ?? null)
        : null;
      education.resultTypeName = education.resultTypeId
        ? (statusMap.get(education.resultTypeId)?.name ?? null)
        : null;
      return education;
    });

    user.userLanguageProficiencies = languageProficiencies.map(
      (proficiency) => {
        proficiency.languageName =
          countryMap.get(proficiency.languageId)?.language ?? null;
        proficiency.speakingLevelName =
          statusMap.get(proficiency.speakingLevelId)?.name ?? null;
        proficiency.readingLevelName =
          statusMap.get(proficiency.readingLevelId)?.name ?? null;
        proficiency.writingLevelName =
          statusMap.get(proficiency.writingLevelId)?.name ?? null;
        return proficiency;
      },
    );

    if (profile) {
      profile.bloodGroupName = profile.bloodGroupId
        ? (statusMap.get(profile.bloodGroupId)?.name ?? null)
        : null;
      profile.maritalStatusName = profile.maritalStatusId
        ? (statusMap.get(profile.maritalStatusId)?.name ?? null)
        : null;
      profile.religionName = profile.religionId
        ? (statusMap.get(profile.religionId)?.name ?? null)
        : null;
      profile.country = profile.countryId
        ? (countryMap.get(profile.countryId) ?? null)
        : null;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: user.id, email: user.email, activeAppId: user.activeAppId },
        {
          expiresIn: process.env.JWT_EXPIRATION as JwtSignOptions['expiresIn'],
        },
      ),
      this.jwtService.signAsync(
        { id: user.id, email: user.email, activeAppId: user.activeAppId },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env
            .JWT_REFRESH_EXPIRATION as JwtSignOptions['expiresIn'],
        },
      ),
    ]);

    console.time('Fetch user relations ==');
    // Re-use our hyper-fast extraction method
    const extracted = await this.extractRolesAndPermissions(
      user.id,
      user.activeAppId,
    );
    user.userRole = extracted.roles; // Injects the flat array

    const loginResponse = new LoginResponseDto();
    loginResponse.accessToken = accessToken;
    loginResponse.refreshToken = refreshToken;
    loginResponse.tokenType = 'Bearer';
    loginResponse.permissions = extracted.permissions;

    // Always return a real sessionId (auth-user-info previously omitted it → FE stored "undefined")
    let sessionId =
      incomingSessionId &&
      incomingSessionId !== 'undefined' &&
      incomingSessionId !== 'null'
        ? String(incomingSessionId).trim()
        : '';

    if (!sessionId) {
      sessionId = uuid();
      await this.cacheService.set(
        `session:${sessionId}`,
        JSON.stringify({ userId: user.id }),
        60 * 60 * 24 * 7,
      );
    } else {
      const existing = await this.cacheService.get(`session:${sessionId}`);
      if (!existing) {
        await this.cacheService.set(
          `session:${sessionId}`,
          JSON.stringify({ userId: user.id }),
          60 * 60 * 24 * 7,
        );
      }
    }
    loginResponse.sessionId = sessionId;

    if (user.UserWorkExperiences) {
      delete user?.UserWorkExperiences;
    }

    loginResponse.user = user;

    // Serialize cleanly
    const newData = instanceToPlain(loginResponse);

    if (newData.user) {
      // The only cleanup necessary now is stripping the empty relation arrays
      delete newData.user.userRoles;
      delete newData.user.userPermissions;
    }

    newData.leftSidebarMenu = extracted.LeftSidebarMenu;
    newData.navbarMenu = extracted.NavbarMenu;
    // newData.publicPermissions = extracted.PublicPermissions;

    // await this.cacheService.set(cacheKey, newData);
    console.log('Login response cached with key:', cacheKey);
    return newData;
  }

  async forgotPassword(input: ForgotPasswordDto) {
    const parsed = ForgotPasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const user = await this.userRepo.findOne({ where: { email: input.email } });
    if (!user) {
      // throw new NotFoundException('Email not found');
      throw new BadRequestException({
        email: ['User not found with this email'],
      });
    }
    // return user;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const sessionId = crypto.randomUUID(); // Unique session identifier

    const dbConfig = await this.dbConfigRepo.findOne({
      where: { key: 'otp_expiry_minutes' },
    });
    const otpExpiryMinutes = dbConfig ? Number(dbConfig.value) : 10;

    const reset: DeepPartial<AuthOtp> = {
      otpType: OtpType.RESET_PASSWORD,
      otpChannel: OtpChannel.EMAIL,
      otp,
      user: user,
      sessionId,
      expiredAt: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
    };

    await this.authOtpRepo.delete({
      user: user,
      otpType: OtpType.RESET_PASSWORD,
    });

    const result = await this.authOtpRepo.save(reset);

    // try {
    //   await this.mailService.sendMail(
    //     user.email,
    //     'Password Reset Request',
    //     'reset-password',
    //     {
    //       name: user.firstName + ' ' + user.lastName,
    //       otp: otp,
    //       sessionId: sessionId,
    //       expiredAt: Helpers.minutesUntil(result.expiredAt) + 1, // Add 1 minute for buffer
    //       // dbConfigs,
    //     },
    //   );
    // } catch (error) {
    //   console.error('Email sending error:', error);
    // }

    await this.hybridQueue.publishEmailJob({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        name: user.firstName + ' ' + user.lastName,
        otp,
        sessionId,
        expiredAt: Helpers.minutesUntil(result.expiredAt) + 1, // Add 1 minute for buffer
      },
    });

    const resendDbConfig = await this.dbConfigRepo.findOne({
      where: { key: 'resend_otp_minutes' },
    });
    const resendOtpMinutes = resendDbConfig ? Number(resendDbConfig.value) : 2;

    return {
      message: 'Password reset OTP sent to email',
      data: { sessionId, resendOtpMinutes, otpExpiryMinutes },
    };
  }

  async resetPassword(input: ResetPasswordDto) {
    const parsed = ResetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const reset = await this.passwordResetRepo.findOne({
      where: { sessionId: input.token },
      relations: ['user'],
    });

    if (!reset) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepo.findOne({ where: { id: reset.user.id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const password = await bcrypt.hash(input.password, 10);
    await this.userRepo.update({ id: user.id }, { password });
    await this.passwordResetRepo.delete({ sessionId: input.token });

    return { message: 'Password successfully reset' };
  }

  async resetFirstPassword(input: ResetPasswordDto) {
    const parsed = ResetPasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    // find Password Reset item by token and expiredDateTime > now
    const now = new Date();
    const passwordReset = await this.passwordResetRepo.findOne({
      where: { sessionId: input.token, expiredDateTime: MoreThan(now) },
      relations: ['user'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired token');
    }

    const reset = await this.passwordResetRepo.findOne({
      where: { sessionId: input.token },
      relations: ['user'],
    });

    if (!reset) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepo.findOne({ where: { id: reset.user.id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const password = await bcrypt.hash(input.password, 10);
    await this.userRepo.update(
      { id: user.id },
      {
        password,
        isActive: true,
        resetFirstPassword: true,
        emailVerifiedAt: new Date(),
      },
    );
    await this.passwordResetRepo.delete({ sessionId: input.token });

    return { message: 'Password was reset successfully!' };
  }

  async changePassword(dto: ChangePasswordDto) {
    const parsed = ChangePasswordSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }
    const userId = RequestContext.get('userId');

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid: boolean = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new BadRequestException({
        currentPassword: ['Password does not match'],
      });
    }

    const password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update({ id: user.id }, { password });

    try {
      await this.mailService.sendMail(
        user.email,
        'Password Changed Successfully',
        'password-changed',
        {
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          forgetPasswordUrl: `${process.env.FRONTEND_URL}/forget-password`,
        },
      );
    } catch (error) {
      console.error('Email sending error:', error);
    }

    return { message: 'Password changed successfully' };
  }

  //Verify User

  async sendVerifyEmail() {
    // const user = this.userContextService.getUser();
    const userId = RequestContext.get('userId');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt != null) {
      return {
        message: 'Email is already verified',
        data: { alreadyVerified: true },
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const sessionId = crypto.randomUUID(); // Unique session identifier

    const dbConfig = await this.dbConfigRepo.findOne({
      where: { key: 'otp_expiry_minutes' },
    });
    const otpExpiryMinutes = dbConfig ? Number(dbConfig.value) : 10;

    const newOtpData: DeepPartial<AuthOtp> = {
      otpType: OtpType.EMAIL_VERIFICATION,
      otpChannel: OtpChannel.EMAIL,
      otp,
      user: user,
      sessionId,
      expiredAt: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
    };

    await this.authOtpRepo.delete({
      user: user,
      otpType: OtpType.EMAIL_VERIFICATION,
    });

    const result = await this.authOtpRepo.save(newOtpData);

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const verificationUrl = `${frontendUrl}/email-verification?sessionId=${sessionId}&otp=${otp}`;

    try {
      await this.mailService.sendMail(
        user.email,
        'Please Verify Your Email',
        'email-verify',
        {
          name: user.firstName + ' ' + user.lastName,
          otp: otp,
          sessionId: sessionId,
          verificationUrl: verificationUrl,
          expiredAt: Helpers.minutesUntil(result.expiredAt) + 1, // Add 1 minute for buffer
        },
      );
    } catch (error) {
      console.error('Email sending error:', error);
    }

    const resendDbConfig = await this.dbConfigRepo.findOne({
      where: { key: 'resend_otp_minutes' },
    });
    const resendOtpMinutes = resendDbConfig ? Number(resendDbConfig.value) : 2;

    return {
      message: 'Verification link sent to your email',
      data: { sessionId, resendOtpMinutes, otpExpiryMinutes },
    };
  }

  async verifyOtpForEmailVerification(input: VerifyOtpDto) {
    const matchOtp = await this.findAndValidateOtp(
      input,
      OtpType.EMAIL_VERIFICATION,
    );

    if (!matchOtp.user.emailVerifiedAt) {
      matchOtp.user.emailVerifiedAt = new Date();
      await this.userRepo.update({ id: matchOtp.user.id }, matchOtp.user);
    }

    const loginResponse = await this.getLoginResponse(matchOtp.user);

    return {
      message: 'Email verified successfully',
      data: loginResponse,
    };
  }

  async verifyOtp(input: VerifyOtpDto) {
    const matchOtp = await this.findAndValidateOtp(
      input,
      OtpType.RESET_PASSWORD,
    );

    const resetToken = this.passwordResetRepo.create({
      user: matchOtp.user,
      sessionId: crypto.randomUUID(),
    });

    await this.passwordResetRepo.save(resetToken);

    // const matchOtp = await this.authOtpRepo.findOne({
    //   where: { sessionId, otp, otpType: type },
    // });
    const deleteResult = await this.authOtpRepo.delete({
      sessionId: input.sessionId,
    });

    return {
      message: 'OTP verified successfully',
      data: { token: resetToken.sessionId },
    };
  }

  async verifyEmailOTP(input: VerifyOtpDto) {
    const matchOtp = await this.findAndValidateOtp(
      input,
      OtpType.EMAIL_VERIFICATION,
    );

    const user = matchOtp.user;
    user.emailVerifiedAt = new Date();

    await this.userRepo.update({ id: user.id }, user); // Update the user(user);
    await this.authOtpRepo.delete({ sessionId: input.sessionId });

    return {
      message: 'Email verified successfully',
      data: user,
    };
  }

  private async findAndValidateOtp(input: VerifyOtpDto, type: OtpType) {
    const { sessionId, otp } = input;

    const matchOtp = await this.authOtpRepo
      .createQueryBuilder('otp')
      .leftJoinAndSelect('otp.user', 'user')
      .where('otp.sessionId = :sessionId', { sessionId })
      .andWhere('otp.otp = :otp', { otp })
      .andWhere('otp.otpType = :type', { type })
      .getOne();

    if (
      !matchOtp ||
      (matchOtp.expiredAt && new Date(matchOtp.expiredAt).getTime() < Date.now())
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return matchOtp;
  }

  async validatedGoogleUser() {
    // const findUser = await this.helperService.findUserByEmail(googleUser.email)
    // if (findUser) return findUser;

    // const hashedPassword = await bcrypt.hash('12345678', 10);

    // const user = this.userRepo.create({
    //   firstName: googleUser.firstName,
    //   lastName: googleUser.lastName,
    //   email: googleUser.email,
    //   password: hashedPassword,
    // });

    return 'hello';
  }
}
