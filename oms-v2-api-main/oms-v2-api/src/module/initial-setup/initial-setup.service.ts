import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UseCase, User } from '../users/entities/user.entity';

import { HelperService } from '@common/helpers/helper.service';
import { UserContextService } from '@module/auth/user-context.service';
import { Application } from '@module/application/entities/application.entity';
import { UserProfile } from '@module/users/entities/user-profile.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Office } from '@module/hr-management/entities/office.entity';
import { AddressService } from '@module/address/address.service';
import { Address, AddressType } from '@module/address/entities/address.entity';
import { MediaService } from '@module/media/media.service';
import { Media } from '@module/media/entities/media.entity';
import { RequestContext } from '@common/request-context';
import { AuthService } from '@module/auth/auth.service';
import { Role } from '@module/role-permission/entities/role.entity';
import { MasterDocument } from '@module/hr-management/entities/master-documents.entity';
import { CompanyDocument } from '@module/hr-management/entities/company-documents.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { Subscription } from '@module/subscription/entities/subscription.entity';
import { SubscriptionPlan } from '@module/subscription/entities/subscription-plan.entity';
import { Status } from '@module/status/entities/status.entity';
import { UsersService } from '@module/users/users.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class InitialSetupService {
  constructor(
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

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(MasterDocument)
    private readonly masterDocumentRepo: Repository<MasterDocument>,

    @InjectRepository(CompanyDocument)
    private readonly companyDocumentRepo: Repository<CompanyDocument>,

    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    private readonly mediaService: MediaService,
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  private parseCompanySizeRange(sizeStatus?: Status | null): { min: number; max: number | null } {
    if (!sizeStatus) return { min: 1, max: 10 };
    const code = (sizeStatus.code || '').toLowerCase();
    const name = (sizeStatus.name || '').trim();

    if (code === 'company_size_one_to_ten' || name === '1-10') return { min: 1, max: 10 };
    if (code === 'company_size_eleven_to_twenty' || name === '11-20') return { min: 11, max: 20 };
    if (code === 'company_size_twenty_one_to_fourty' || name === '21-40') return { min: 21, max: 40 };
    if (code === 'company_size_fourty_one_to_hundred' || name === '41-100') return { min: 41, max: 100 };
    if (code === 'company_size_hundred_plus' || name === '100+' || name.includes('+')) return { min: 101, max: null };

    const rangeMatch = name.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
      return { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
    }
    const plusMatch = name.match(/(\d+)\s*\+/);
    if (plusMatch) {
      return { min: parseInt(plusMatch[1], 10), max: null };
    }
    return { min: 1, max: 10 };
  }

  async initialSetup(data: any) {
    const userId = RequestContext.get('userId');
    if (!userId) throw new UnauthorizedException('No user in context');

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) throw new BadRequestException('No user in context');

      let initialMedia: Media | null = null;
      let createdAppId: number | null = null;
      let matchedPlanForNotification: SubscriptionPlan | null = null;

      if (data.profilePic) {
        // initialMedia = await this.mediaService.uploadMedia(profilePic);
        initialMedia = await this.mediaService.uploadFile(data.profilePic);

        // return initialMedia;
      }

      if (data.setupType === 'personal') {
        user.appUseCase = UseCase.PERSONAL;
        // Update only scalar columns to avoid QueryBuilder trying to traverse relations
        await queryRunner.manager.update(
          User,
          { id: user.id },
          { appUseCase: user.appUseCase },
        );

        // Prepare profile pic id (assume you already uploaded to AWS and got ID)
        // const profilePicId = data.profilePicId ?? null;

        // Create or update UserProfile
        let profile = await this.userProfileRepo.findOne({
          where: { userId: user.id },
        });

        if (!profile) {
          profile = this.userProfileRepo.create({ userId: user.id });
        }

        if (initialMedia && initialMedia.id) {
          if (profile.profilePictureId) {
            // If profile picture already exists, delete the old media
            await this.mediaService.deleteFile(profile.profilePictureId);
          }
          // profile.profilePictureId = initialMedia.id;
          profile.profilePicture = initialMedia;
        }
        profile.countryId = data.countryId;
        profile.phoneCountryId = data.phoneCountryId;
        profile.phone = data.phoneIdentifier;
        // profile.phone = data.phone;
        // profile.gender = data.gender;
        // profile.dateOfBirth = data.dateOfBirth;

        await queryRunner.manager.save(profile);
      } else if (data.setupType === 'company') {
        // Update user: set app_use_case = 'company'
        user.appUseCase = UseCase.COMPANY;
        // Update only scalar columns to avoid QueryBuilder trying to traverse relations
        await queryRunner.manager.update(User, { id: user.id }, { appUseCase: user.appUseCase });

        const addressParts = [data.address, data.city, data.postalCode].filter(
          Boolean,
        );
        const companyAddress = addressParts.join(', ');

        // Create Application (Company)
        const application = this.applicationRepo.create({
          name: data.name,
          typeId: data.typeId,
          sizeId: data.sizeId,
          address: companyAddress || data.address || null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          createdBy: user.id,
        });
        const savedApplication = await queryRunner.manager.save(application);
        createdAppId = savedApplication.id;

        // Bind request context to the newly created company for the rest of setup
        RequestContext.set('activeAppId', savedApplication.id);

        // Update user: set app_use_case = 'company' and active_app_id
        user.appUseCase = UseCase.COMPANY;
        user.activeAppId = savedApplication.id;
        // Update only scalar columns to avoid QueryBuilder trying to traverse relations
        await queryRunner.manager.update(User, { id: user.id }, {
          appUseCase: user.appUseCase,
          activeAppId: savedApplication.id,
        });

        // Get app_user_type_company_owner ID
        const status = await this.commonDao.findStatusByIdOrCode(
          'app_user_type_company_owner',
        );
        if (!status)
          throw new BadRequestException('Invalid app_user_type_company_owner');

        const appUser = this.appUserRepo.create({
          appId: savedApplication.id,
          userId: user.id,
          userType: status,
          joiningDate: data.joiningDate ?? new Date(),
          isActive: true,
        });
        await queryRunner.manager.save(appUser);

        const address = this.addressRepo.create({
          address: data.address,
          city: data.city,
          countryId: data.countryId,
          postalCode: data.postalCode,
          phone: data.phone,
          addressType: AddressType.COMMERCIAL,
          email: data.email,
          gmapLatitude: data.gmapLatitude,
          gmapLongitude: data.gmapLongitude,
          timezone: data.timezone,
        });
        await queryRunner.manager.save(address);

        // Create head office linked to this company so company-settings can load address
        const officeType = await this.commonDao.findStatusByIdOrCode(
          'office_type_head_office',
        );
        if (!officeType)
          throw new BadRequestException('Invalid Office Type');

        const office = this.officeRepo.create({
          name: data.name,
          appId: savedApplication.id,
          application: savedApplication,
          manager: user,
          creator: user,
          addressId: address.id,
          timezone: data.timezone || null,
          officeType,
          typeId: officeType.id,
        });
        await queryRunner.manager.save(office);

        address.module = 'office';
        address.module_id = office.id;
        await queryRunner.manager.save(address);

        // Assign Admin role for this company only
        const adminRole = await this.roleRepository.findOne({
          where: { code: 'admin', isActive: true },
          select: ['id'],
        });
        if (!adminRole) {
          throw new BadRequestException('Admin role not found');
        }

        const userRolesData = [
          {
            userId: user.id,
            roleId: adminRole.id,
            appId: savedApplication.id,
          },
        ];

        const masterDocuments = await this.masterDocumentRepo.find({
          where: { isActive: true },
        });

        const companyDocumentsData = masterDocuments.map((doc) => ({
          appId: savedApplication.id,
          documentTypeId: doc.documentTypeId,
          documentName: doc.documentName,
        }));

        await Promise.all([
          queryRunner.manager.save(UserRole, userRolesData),
          queryRunner.manager.save(CompanyDocument, companyDocumentsData),
        ]);

        // Lock subscription plan with trial according to company employee size
        try {
          let sizeStatus: Status | null = null;
          if (data.sizeId) {
            sizeStatus = await queryRunner.manager.findOne(Status, {
              where: { id: Number(data.sizeId) },
            });
          }
          const userRange = this.parseCompanySizeRange(sizeStatus);

          const activePlans = await queryRunner.manager.find(SubscriptionPlan, {
            where: { isActive: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
          });

          let matchedPlan: SubscriptionPlan | null = null;
          if (activePlans.length > 0) {
            const targetMin = userRange.min;
            const targetMax = userRange.max !== null ? userRange.max : Infinity;

            // 1. Check plans where company user range overlaps
            matchedPlan =
              activePlans.find((p) => {
                const pMin = p.minUsers != null ? p.minUsers : 1;
                const pMax = p.maxUsers != null ? p.maxUsers : Infinity;
                return targetMin <= pMax && targetMax >= pMin;
              }) || null;

            // 2. Check plan that covers targetMin
            if (!matchedPlan) {
              matchedPlan =
                activePlans.find((p) => {
                  const pMin = p.minUsers != null ? p.minUsers : 1;
                  const pMax = p.maxUsers != null ? p.maxUsers : Infinity;
                  return targetMin >= pMin && targetMin <= pMax;
                }) || null;
            }

            // 3. Fallback to first active plan
            if (!matchedPlan) {
              matchedPlan = activePlans[0];
            }
          }

          if (matchedPlan) {
            matchedPlanForNotification = matchedPlan;
            const trialDays =
              matchedPlan.trialDays && matchedPlan.trialDays > 0
                ? matchedPlan.trialDays
                : 14;
            const startDate = new Date();
            const endDate = new Date(
              startDate.getTime() + trialDays * 24 * 60 * 60 * 1000,
            );

            let trialStatus = await this.commonDao.findStatusByIdOrCode(
              'app_sub_status_trial',
            );
            if (!trialStatus) {
              trialStatus = await this.commonDao.findStatusByIdOrCode(
                'subscription_trial',
              );
            }
            if (!trialStatus) {
              trialStatus = await this.commonDao.findStatusByIdOrCode(
                'subscription_active',
              );
            }

            const trialSubscription = queryRunner.manager.create(Subscription, {
              appId: savedApplication.id,
              userId: user.id,
              planId: matchedPlan.id,
              startDate,
              endDate,
              statusId: trialStatus ? trialStatus.id : 34,
              paymentMethod: 'trial',
              autoRenew: false,
            });
            await queryRunner.manager.save(trialSubscription);
          }
        } catch (subError) {
          console.error('Error locking trial subscription plan during initial setup:', subError);
        }
      } else {
        throw new BadRequestException('Invalid setupType');
      }

      await queryRunner.commitTransaction();

      if (data.setupType === 'company' && createdAppId) {
        try {
          await this.authService.setActiveAppUser(user, createdAppId);
        } catch (authError) {
          console.error('Error setting active app user in auth service:', authError);
        }

        if (matchedPlanForNotification) {
          try {
            const trialDays = matchedPlanForNotification.trialDays || 14;
            await this.usersService.createUserNotification(
              user.id,
              `Welcome! Your ${trialDays}-day free trial for ${matchedPlanForNotification.name} is now active. Please purchase your subscription plan to lock in your company setup and enjoy uninterrupted access.`,
            );
          } catch (notifError) {
            console.error('Error creating trial subscription notification:', notifError);
          }
        }
      }

      return { message: 'Setup completed successfully' };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error('Error during initial setup:', error);
      throw new InternalServerErrorException('Failed to complete setup');
    } finally {
      await queryRunner.release();
    }
  }

  async initialSetup2(data: any) {
    const userId = RequestContext.get('userId');
    if (!userId) throw new UnauthorizedException('No user in context');

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) throw new BadRequestException('No user in context');

      let initialMedia: Media | null = null;

      if (data.profilePic) {
        // initialMedia = await this.mediaService.uploadMedia(profilePic);
        initialMedia = await this.mediaService.uploadFile(data.profilePic);

        // return initialMedia;
      }

      if (data.setupType === 'personal') {
        user.appUseCase = UseCase.PERSONAL;
        // Update only scalar columns to avoid QueryBuilder trying to traverse relations
        await queryRunner.manager.update(
          User,
          { id: user.id },
          { appUseCase: user.appUseCase },
        );

        // Prepare profile pic id (assume you already uploaded to AWS and got ID)
        // const profilePicId = data.profilePicId ?? null;

        // Create or update UserProfile
        let profile = await this.userProfileRepo.findOne({
          where: { userId: user.id },
        });

        if (!profile) {
          profile = this.userProfileRepo.create({ userId: user.id });
        }

        if (initialMedia && initialMedia.id) {
          if (profile.profilePictureId) {
            // If profile picture already exists, delete the old media
            await this.mediaService.deleteFile(profile.profilePictureId);
          }
          // profile.profilePictureId = initialMedia.id;
          profile.profilePicture = initialMedia;
        }
        profile.countryId = data.countryId;
        profile.phoneCountryId = data.phoneCountryId;
        profile.phone = data.phoneIdentifier;
        // profile.phone = data.phone;
        // profile.gender = data.gender;
        // profile.dateOfBirth = data.dateOfBirth;

        await queryRunner.manager.save(profile);
      } else if (data.setupType === 'company') {
        // Update user: set app_use_case = 'company'
        user.appUseCase = UseCase.COMPANY;
        // Update only scalar columns to avoid QueryBuilder trying to traverse relations
        await queryRunner.manager.update(
          User,
          { id: user.id },
          { appUseCase: user.appUseCase },
        );

        const logoMedia: Media | null = null;
        // if (data.logo) {
        //   logoMedia = await this.mediaService.uploadFile(data.logo);
        // }
        // Create Application
        const application = this.applicationRepo.create({
          name: data.name,
          typeId: data.typeId,
          sizeId: data.sizeId,
          createdBy: user.id,
          // logoMedia: logoMedia,
        });
        const savedApplication = await queryRunner.manager.save(application);

        // Get app_user_type_company_owner ID
        const status = await this.commonDao.findStatusByIdOrCode(
          'app_user_type_company_owner',
        );
        if (!status)
          throw new BadRequestException('Invalid app_user_type_company_owner');

        const appUser = this.appUserRepo.create({
          appId: savedApplication.id,
          userId: user.id,
          userType: status,
          joiningDate: data.joiningDate ?? new Date(),
          isActive: true,
        });
        await queryRunner.manager.save(appUser);

        const address = this.addressRepo.create({
          address: data.address,
          city: data.city,
          countryId: data.countryId,
          postalCode: data.postalCode,
          phone: data.phone,
          addressType: AddressType.COMMERCIAL,
          email: data.email,
          gmapLatitude: data.gmapLatitude,
          gmapLongitude: data.gmapLongitude,
          timezone: data.timezone,
        });
        await queryRunner.manager.save(address);

        const office = this.officeRepo.create({
          name: data.name,
          application: savedApplication,
          manager: user,
          creator: user,
          addressId: address.id,
          timezone: data.timezone,
        });

        const OfficeType = await this.commonDao.findStatusByIdOrCode(
          'office_type_head_office',
        );

        if (!OfficeType) throw new BadRequestException('Invalid Office Type');

        office.officeType = OfficeType;
        await queryRunner.manager.save(office);

        address.module = 'office';
        address.module_id = office.id;
        await queryRunner.manager.save(address);
      } else {
        throw new BadRequestException('Invalid setupType');
      }

      await queryRunner.commitTransaction();
      return { message: 'Setup completed successfully' };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error('Error during initial setup:', error);
      throw new InternalServerErrorException('Failed to complete setup');
    } finally {
      await queryRunner.release();
    }
  }
}
