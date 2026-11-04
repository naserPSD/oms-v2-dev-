import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  CreateApplicationDto,
  UpdateCompanyLogoDto,
} from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { APIFeatures } from '@core/utils/apiFeatures';

import { UserContextService } from '@module/auth/user-context.service';
import { Status } from '@module/status/entities/status.entity';

import { HelperService } from '@common/helpers/helper.service';
import { AppUser } from '@module/users/entities/app-user.entity';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/service.dto';
import { User } from '@module/users/entities/user.entity';
import { Department } from './entities/departments.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/departments.dto';
import { Designation } from './entities/designations.entity';
import { CacheService } from '../../redis/cache.service';
import {
  CreateDesignationDto,
  UpdateDesignationDto,
  ReorderDesignationsDto,
} from './dto/designations.dto';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { RequestContext } from '@common/request-context';
import { MediaService } from '@module/media/media.service';
import { Office } from '@module/hr-management/entities/office.entity';

@Injectable()
export class ApplicationService implements OnModuleInit {
  async onModuleInit() {
    try {
      const originalColExists: Array<any> = await this.dataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'applications' 
          AND COLUMN_NAME = 'original_logo_media_id'
      `);
      if (!originalColExists || originalColExists.length === 0) {
        await this.dataSource.query(`
          ALTER TABLE \`applications\` 
          ADD COLUMN \`original_logo_media_id\` bigint unsigned NULL DEFAULT NULL AFTER \`address\`
        `);
      }

      const columnExists: Array<any> = await this.dataSource.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'applications' 
          AND COLUMN_NAME = 'invoice_logo_media_id'
      `);
      if (!columnExists || columnExists.length === 0) {
        await this.dataSource.query(`
          ALTER TABLE \`applications\` 
          ADD COLUMN \`invoice_logo_media_id\` bigint unsigned NULL DEFAULT NULL AFTER \`logo_media_id\`
        `);
      }
    } catch (err) {
      console.warn('Could not auto-verify logo_media_id columns:', err);
    }

    try {
      // 1. Drop any legacy unique index on departments that only indexes 'name' (and does not include 'app_id')
      const legacyUniqueIndexes: Array<{ INDEX_NAME: string }> =
        await this.dataSource.query(`
          SELECT DISTINCT s1.INDEX_NAME
          FROM INFORMATION_SCHEMA.STATISTICS s1
          WHERE s1.TABLE_SCHEMA = DATABASE()
            AND s1.TABLE_NAME = 'departments'
            AND s1.COLUMN_NAME = 'name'
            AND s1.NON_UNIQUE = 0
            AND s1.INDEX_NAME != 'PRIMARY'
            AND NOT EXISTS (
              SELECT 1
              FROM INFORMATION_SCHEMA.STATISTICS s2
              WHERE s2.TABLE_SCHEMA = s1.TABLE_SCHEMA
                AND s2.TABLE_NAME = s1.TABLE_NAME
                AND s2.INDEX_NAME = s1.INDEX_NAME
                AND s2.COLUMN_NAME = 'app_id'
            )
        `);

      for (const idx of legacyUniqueIndexes) {
        try {
          await this.dataSource.query(
            `ALTER TABLE \`departments\` DROP INDEX \`${idx.INDEX_NAME}\``,
          );
          console.log(
            `Dropped legacy global unique index '${idx.INDEX_NAME}' on departments(name)`,
          );
        } catch (dropErr: any) {
          console.warn(
            `Could not drop legacy unique index ${idx.INDEX_NAME}:`,
            dropErr?.message,
          );
        }
      }

      // Also explicitly drop legacy IDX_8681da666ad9699d568b3e9106 if present
      try {
        const legacyIdx: Array<any> = await this.dataSource.query(`
          SELECT 1
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'departments'
            AND INDEX_NAME = 'IDX_8681da666ad9699d568b3e9106'
          LIMIT 1
        `);
        if (legacyIdx && legacyIdx.length > 0) {
          await this.dataSource.query(
            'ALTER TABLE `departments` DROP INDEX `IDX_8681da666ad9699d568b3e9106`',
          );
          console.log(
            'Dropped legacy unique index IDX_8681da666ad9699d568b3e9106 on departments',
          );
        }
      } catch (err: any) {
        // ignore if not present
      }

      // 2. Ensure composite unique index UQ_DEPARTMENTS_APP_NAME on (app_id, name)
      const existingComposite: Array<any> = await this.dataSource.query(`
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'departments'
          AND INDEX_NAME = 'UQ_DEPARTMENTS_APP_NAME'
        LIMIT 1
      `);

      if (!existingComposite || existingComposite.length === 0) {
        // Clean up any duplicate (app_id, name) among soft-deleted records before creating unique index
        try {
          await this.dataSource.query(`
            DELETE d1 FROM departments d1
            INNER JOIN departments d2 
              ON d1.app_id = d2.app_id 
              AND LOWER(TRIM(d1.name)) = LOWER(TRIM(d2.name))
              AND (
                (d1.deleted_at IS NOT NULL AND d2.deleted_at IS NULL)
                OR (d1.deleted_at IS NOT NULL AND d2.deleted_at IS NOT NULL AND d1.id < d2.id)
                OR (d1.deleted_at IS NULL AND d2.deleted_at IS NULL AND d1.id < d2.id)
              )
          `);
        } catch (cleanupErr: any) {
          console.warn('Could not cleanup soft-deleted duplicates:', cleanupErr?.message);
        }

        await this.dataSource.query(`
          CREATE UNIQUE INDEX \`UQ_DEPARTMENTS_APP_NAME\`
          ON \`departments\` (\`app_id\`, \`name\`)
        `);
        console.log(
          'Created composite unique index UQ_DEPARTMENTS_APP_NAME on departments(app_id, name)',
        );
      }
    } catch (err: any) {
      console.warn('Could not auto-verify departments unique index:', err?.message);
    }
  }
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepo: Repository<AppUser>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,

    private readonly userContextService: UserContextService,
    private readonly commonDao: HelperService,

    private readonly cacheService: CacheService,
    private readonly mediaService: MediaService,
    private readonly dataSource: DataSource,

    @InjectRepository(Office)
    private readonly officeRepo: Repository<Office>,
  ) {}

  async CreateCompanyInfo(dto: CreateApplicationDto): Promise<Application> {
    const application = this.applicationRepo.create({
      ...dto,
    });

    return await this.applicationRepo.save(application);
  }

  // UPDATE COMPANY INFO
  async updateCompanyInfo(
    id: number,
    dto: UpdateApplicationDto,
  ): Promise<Application> {
    const activeAppId = Number(RequestContext.get('activeAppId'));
    if (!activeAppId || activeAppId !== Number(id)) {
      throw new ForbiddenException(
        'You can only update your active company profile',
      );
    }

    const application = await this.applicationRepo.findOne({
      where: { id: activeAppId },
    });

    if (!application) {
      throw new NotFoundException('Company information not found');
    }

    Object.assign(application, dto);

    return await this.applicationRepo.save(application);
  }

  async getCompanyInfo(): Promise<Application> {
    const rawAppId = RequestContext.get('activeAppId');
    const appId = Number(rawAppId);

    if (!appId) {
      throw new NotFoundException('Company information not found');
    }

    const application = await this.applicationRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.originalLogoMedia', 'originalLogoMedia')
      .leftJoinAndSelect('application.logoMedia', 'logoMedia')
      .leftJoinAndSelect('application.invoiceLogoMedia', 'invoiceLogoMedia')
      .leftJoinAndSelect('application.size', 'size')
      .leftJoinAndSelect('application.type', 'type')
      .where('application.id = :appId', { appId })
      .getOne();

    if (!application) {
      throw new NotFoundException('Company information not found');
    }

    if (application.originalLogoMedia) {
      try {
        await this.mediaService.downloadFileFromAwsByFileNameIfMissing(
          application.originalLogoMedia,
        );
      } catch (e) {
        console.warn(
          'Could not ensure local copy of original company logo from AWS:',
          e?.message,
        );
      }
    }

    if (application.logoMedia) {
      try {
        await this.mediaService.downloadFileFromAwsByFileNameIfMissing(
          application.logoMedia,
        );
      } catch (e) {
        console.warn(
          'Could not ensure local copy of company logo from AWS:',
          e?.message,
        );
      }
    }

    if (application.invoiceLogoMedia) {
      try {
        await this.mediaService.downloadFileFromAwsByFileNameIfMissing(
          application.invoiceLogoMedia,
        );
      } catch (e) {
        console.warn(
          'Could not ensure local copy of invoice logo from AWS:',
          e?.message,
        );
      }
    }

    const headOffice = await this.officeRepo
      .createQueryBuilder('office')
      .leftJoin('office.address', 'address')
      .leftJoin('office.officeType', 'officeType')
      .where('office.appId = :appId', { appId })
      .andWhere('officeType.code = :officeTypeCode', {
        officeTypeCode: 'office_type_head_office',
      })
      .select([
        'office.id',
        'office.appId',
        'office.typeId',
        'office.name',
        'office.addressId',
        'address.id',
        'address.module',
        'address.addressType',
        'address.phone',
        'address.email',
        'address.city',
        'address.postalCode',
        'address.address',
      ])
      .getOne();

    if (!application.address && (headOffice as any)?.address) {
      const addr = (headOffice as any).address;
      const parts = [addr.address, addr.city, addr.postalCode].filter(Boolean);
      if (parts.length > 0) {
        application.address = parts.join(', ');
      }
    }

    (application as any).headOffice = headOffice;

    return application;
  }

  async findAll(): Promise<Application[]> {
    return await this.applicationRepo.find();
  }

  findOne(id: number): Promise<Application> {
    return this.applicationRepo
      .findOne({ where: { id } })
      .then((application) => {
        if (application) {
          return application;
        } else throw new Error('Application not found');
      });
  }

  async updateCompanyLogo(
    companyLogo?: Express.Multer.File,
    originalLogo?: Express.Multer.File,
    invoiceLogo?: Express.Multer.File,
  ): Promise<Application | null> {
    const appId = RequestContext.get('activeAppId');

    const application = await this.applicationRepo.findOne({
      where: { id: appId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!companyLogo && !originalLogo && !invoiceLogo) {
      throw new BadRequestException('No company logo file uploaded');
    }

    const updatePayload: Partial<Application> = {};
    const oldMediaIdsToDelete: number[] = [];

    if (originalLogo) {
      const newOriginalMedia = await this.mediaService.uploadFile(originalLogo);
      if (!newOriginalMedia?.id) {
        throw new InternalServerErrorException('Original logo upload failed');
      }
      if (application.originalLogoMediaId) {
        oldMediaIdsToDelete.push(application.originalLogoMediaId);
      }
      updatePayload.originalLogoMediaId = newOriginalMedia.id;
    }

    if (companyLogo) {
      const newMedia = await this.mediaService.uploadFile(companyLogo);
      if (!newMedia?.id) {
        throw new InternalServerErrorException('Media upload failed');
      }
      if (application.logoMediaId) {
        oldMediaIdsToDelete.push(application.logoMediaId);
      }
      updatePayload.logoMediaId = newMedia.id;
    }

    if (invoiceLogo) {
      const newInvoiceMedia = await this.mediaService.uploadFile(invoiceLogo);
      if (!newInvoiceMedia?.id) {
        throw new InternalServerErrorException('Invoice logo upload failed');
      }
      if (application.invoiceLogoMediaId) {
        oldMediaIdsToDelete.push(application.invoiceLogoMediaId);
      }
      updatePayload.invoiceLogoMediaId = newInvoiceMedia.id;
    }

    await this.applicationRepo.update(appId, updatePayload);

    for (const oldMediaId of oldMediaIdsToDelete) {
      try {
        await this.mediaService.deleteFile(oldMediaId);
      } catch (err) {
        console.warn(`Old media already deleted or not found: ${oldMediaId}`);
      }
    }

    return this.applicationRepo.findOne({
      where: { id: appId },
      relations: ['originalLogoMedia', 'logoMedia', 'invoiceLogoMedia'],
    });
  }

  async updateCompanyOriginalLogo(
    originalLogo: Express.Multer.File,
  ): Promise<Application | null> {
    return this.updateCompanyLogo(undefined, originalLogo, undefined);
  }

  async updateCompanyInvoiceLogo(
    invoiceLogo: Express.Multer.File,
  ): Promise<Application | null> {
    return this.updateCompanyLogo(undefined, undefined, invoiceLogo);
  }

  // async update(
  //   id: number,
  //   updateApplicationDto: UpdateApplicationDto,
  // ): Promise<Application> {
  //   const company = await this.applicationRepo.preload({
  //     id, // must include ID
  //     ...updateApplicationDto,
  //   });

  //   if (!company) {
  //     throw new NotFoundException(`Application with ID ${id} not found`);
  //   }

  //   return this.applicationRepo.save(company);
  // }

  /**
   * Permanently delete a company (application) and all associate data.
   * Uses DB procedure sp_hard_delete_application when available; otherwise
   * runs an equivalent purge with FOREIGN_KEY_CHECKS disabled.
   */
  async remove(id: number): Promise<{ message: string | void }> {
    const application = await this.applicationRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    await this.hardDeleteCompany(id);

    return {
      message: `Company with ID ${id} and all associate data have been permanently deleted.`,
    };
  }

  async hardDeleteCompany(appId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const procedures: Array<{ name: string }> = await queryRunner.query(
        `SELECT ROUTINE_NAME AS name
         FROM information_schema.ROUTINES
         WHERE ROUTINE_SCHEMA = DATABASE()
           AND ROUTINE_TYPE = 'PROCEDURE'
           AND ROUTINE_NAME = 'sp_hard_delete_application'`,
      );

      if (procedures.length > 0) {
        await queryRunner.query(`CALL sp_hard_delete_application(?)`, [appId]);
      } else {
        await this.purgeCompanyData(queryRunner, appId);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      try {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch {
        // connection may already be closed
      }
      await queryRunner.release();
    }
  }

  private async purgeCompanyData(
    queryRunner: {
      query: (sql: string, params?: unknown[]) => Promise<unknown>;
    },
    appId: number,
  ): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    await queryRunner.query(`DROP TEMPORARY TABLE IF EXISTS tmp_app_user_ids`);
    await queryRunner.query(`
      CREATE TEMPORARY TABLE tmp_app_user_ids (
        user_id INT UNSIGNED NOT NULL PRIMARY KEY
      )
    `);
    await queryRunner.query(
      `INSERT INTO tmp_app_user_ids (user_id)
       SELECT DISTINCT user_id
       FROM app_users
       WHERE app_id = ?
         AND user_id IS NOT NULL`,
      [appId],
    );

    await queryRunner.query(
      `DELETE d FROM app_holiday_dates d
         INNER JOIN app_holidays h ON h.id = d.app_holiday_id
       WHERE h.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE r FROM batch_email_recipients r
         INNER JOIN batch_emails b ON b.id = r.batch_email_id
       WHERE b.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE a FROM event_attendees a
         INNER JOIN events e ON e.id = a.event_id
       WHERE e.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE s FROM job_recruitment_steps s
         INNER JOIN job_vacancies v ON v.id = s.job_vacancy_id
       WHERE v.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE si FROM subscription_invoices si
         INNER JOIN subscriptions sub ON sub.id = si.subscription_id
       WHERE sub.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE ai FROM hr_meeting_agenda_items ai
         INNER JOIN hr_meetings m ON m.id = ai.meeting_id
       WHERE m.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `DELETE at FROM hr_meeting_attendees at
         INNER JOIN hr_meetings m ON m.id = at.meeting_id
       WHERE m.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `UPDATE payment_transactions pt
         INNER JOIN invoices i ON i.id = pt.invoice_id
         SET pt.invoice_id = NULL
       WHERE i.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `UPDATE payment_transactions pt
         INNER JOIN subscriptions sub ON sub.id = pt.subscription_id
         SET pt.subscription_id = NULL
       WHERE sub.app_id = ?`,
      [appId],
    );
    await queryRunner.query(
      `UPDATE users SET active_app_id = NULL WHERE active_app_id = ?`,
      [appId],
    );

    const tables = (await queryRunner.query(
      `SELECT TABLE_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND COLUMN_NAME = 'app_id'
         AND TABLE_NAME <> 'applications'
       ORDER BY TABLE_NAME`,
    )) as Array<{ TABLE_NAME: string }>;

    for (const { TABLE_NAME } of tables) {
      await queryRunner.query(
        `DELETE FROM \`${TABLE_NAME}\` WHERE app_id = ?`,
        [appId],
      );
    }

    await queryRunner.query(`DELETE FROM applications WHERE id = ?`, [appId]);

    // Permanently delete users that belonged only to this company
    await queryRunner.query(`DROP TEMPORARY TABLE IF EXISTS tmp_users_to_delete`);
    await queryRunner.query(`
      CREATE TEMPORARY TABLE tmp_users_to_delete (
        user_id INT UNSIGNED NOT NULL PRIMARY KEY
      )
    `);
    await queryRunner.query(`
      INSERT INTO tmp_users_to_delete (user_id)
      SELECT t.user_id
      FROM tmp_app_user_ids t
      WHERE NOT EXISTS (
        SELECT 1 FROM app_users au WHERE au.user_id = t.user_id
      )
    `);

    const usersToDelete = (await queryRunner.query(`
      SELECT d.user_id AS userId
      FROM tmp_users_to_delete d
        INNER JOIN users u ON u.id = d.user_id
      WHERE IFNULL(u.app_use_case, '') <> 'Admin'
    `)) as Array<{ userId: number }>;

    for (const { userId } of usersToDelete) {
      await queryRunner.query(`CALL sp_hard_delete_user(?)`, [userId]);
    }

    await queryRunner.query(`DROP TEMPORARY TABLE IF EXISTS tmp_users_to_delete`);
    await queryRunner.query(`DROP TEMPORARY TABLE IF EXISTS tmp_app_user_ids`);
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  private async findDuplicateService(
    appId: number,
    name: string,
    typeId: number,
    excludeId?: number,
  ): Promise<Service | null> {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const parsedTypeId = Number(typeId);

    if (!appId || !normalizedName || !Number.isInteger(parsedTypeId) || parsedTypeId < 1) {
      return null;
    }

    const query = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.appId = :appId', { appId })
      .andWhere('service.typeId = :typeId', { typeId: parsedTypeId })
      .andWhere(`LOWER(TRIM(COALESCE(service.name, ''))) = :name`, {
        name: normalizedName.toLowerCase(),
      })
      

    if (excludeId) {
      query.andWhere('service.id != :excludeId', { excludeId });
    }

    return query.getOne();
  }

  async isDuplicateService(
    name: string,
    typeId: number,
    excludeId?: number,
  ): Promise<boolean> {
    const appId = Number(RequestContext.get('activeAppId'));
    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const parsedTypeId = Number(typeId);

    if (!normalizedName || !Number.isInteger(parsedTypeId) || parsedTypeId < 1) {
      throw new BadRequestException('Service name and type are required');
    }

    return Boolean(
      await this.findDuplicateService(appId, normalizedName, parsedTypeId, excludeId),
    );
  }

  async createOrUpdateService(createDto: CreateServiceDto) {
    const appId = Number(RequestContext.get('activeAppId'));
    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const normalizedName = typeof createDto.name === 'string' ? createDto.name.trim() : '';
    const parsedTypeId = Number(createDto.typeId);

    if (!normalizedName || !Number.isInteger(parsedTypeId) || parsedTypeId < 1) {
      throw new BadRequestException('Service name and type are required');
    }

    let existing: Service | null = null;
    if (createDto.id) {
      existing = await this.serviceRepo.findOne({
        where: { id: createDto.id, appId },
      });
      if (!existing) {
        throw new NotFoundException('Service not found');
      }
    }

    if (await this.findDuplicateService(appId, normalizedName, parsedTypeId, createDto.id)) {
      throw new ConflictException(
        'A product or service with this name and type already exists',
      );
    }

    const serviceType = await this.commonDao.findStatusById(parsedTypeId);
    const dataToSave = {
      ...createDto,
      name: normalizedName,
      typeId: parsedTypeId,
      appId,
      type: serviceType,
    };

    try {
      const saved = await this.serviceRepo.save(
        existing
          ? this.serviceRepo.merge(existing, dataToSave)
          : dataToSave,
      );
      await this.cacheService.del(`appServices:${appId}`);
      await this.cacheService.del(`active-services:${appId}`);
      return saved;
    } catch (error: any) {
      if (
        error?.code === 'ER_DUP_ENTRY' ||
        error?.driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'A product or service with this name and type already exists',
        );
      }
      throw error;
    }
  }

  async deleteService(id: number): Promise<void> {
    const appId = Number(RequestContext.get('activeAppId'));
    const result = await this.serviceRepo.findOne({
      where: { id, appId },
    });

    if (!result) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const cacheKey = `appServices:${result.appId}`;
    await this.cacheService.del(cacheKey);
    await this.cacheService.del(`active-services:${result.appId}`);

    await this.serviceRepo.softDelete(id);
  }

  async changeServiceActiveStatus(id: number) {
    const appId = Number(RequestContext.get('activeAppId'));
    const service = await this.serviceRepo.findOne({ where: { id, appId } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    service.isActive = !service.isActive;
    const result = await this.serviceRepo.update({ id }, service);

    const cacheKey = `appServices:${service.appId}`;
    await this.cacheService.del(cacheKey);
    await this.cacheService.del(`active-services:${service.appId}`);

    return result;
  }

  async getAllAppServices(user: User) {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      // throw new NotFoundException('App User not found');
      return [];
    }

    const cacheKey = `appServices:${appId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const application = await this.applicationRepo.findOne({
      where: { id: appId },
    });
    if (!application) {
      // throw new NotFoundException('Application not found');
      return [];
    }

    const newData = await this.serviceRepo.find({
      where: { appId: application.id },
    });
    await this.cacheService.set(cacheKey, newData);
    return newData;
  }

  async getAllServicesWithPagination(
    user: User,
    queryString: any,
  ): Promise<{ data: Service[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoin('service.type', 'type')
      .addSelect(['type.id', 'type.name', 'type.code', 'type.colorName'])
      .where('service.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere('service.name LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.typeId) {
      query.andWhere('service.typeId = :typeId', { typeId: params.typeId });
    }

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    if (!queryString?.sort) {
      query.addOrderBy('service.name', 'ASC');
    }

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async getAllActiveServices(): Promise<CommonResponseDto[]> {
    // const appUser = await this.appUserRepo.findOne({
    //   where: { userId: this.userContextService.getUserId() },
    // });

    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const cacheKey = `active-services:${appId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const services = await this.departmentRepo.find({
      where: { isActive: true, appId: appId },
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });

    const mappedServices = services.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    await this.cacheService.set(cacheKey, mappedServices);

    return mappedServices;
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const appId = Number(RequestContext.get('activeAppId'));
    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const name = dto.name.trim();
    await this.ensureDepartmentNameAvailable(appId, name);

    // If there is an existing soft-deleted department with this name in this company,
    // restore and update it to avoid composite unique key collisions
    const softDeleted = await this.departmentRepo
      .createQueryBuilder('department')
      .withDeleted()
      .where('department.appId = :appId', { appId })
      .andWhere('LOWER(TRIM(department.name)) = :name', {
        name: name.toLowerCase(),
      })
      .andWhere('department.deletedAt IS NOT NULL')
      .getOne();

    let saved: Department;
    if (softDeleted) {
      await this.departmentRepo.restore(softDeleted.id);
      softDeleted.description = dto.description ?? null;
      softDeleted.parentId = dto.parentId ?? null;
      softDeleted.isActive = dto.isActive !== undefined ? dto.isActive : true;
      softDeleted.creatorId = dto.creatorId ?? null;
      softDeleted.updaterId = dto.creatorId ?? null;
      softDeleted.deletedAt = null as any;
      saved = await this.saveDepartmentOrConflict(softDeleted);
    } else {
      const department = this.departmentRepo.create({
        name,
        description: dto.description,
        parentId: dto.parentId,
        isActive: dto.isActive,
        creatorId: dto.creatorId,
        appId,
      });
      saved = await this.saveDepartmentOrConflict(department);
    }

    await this.cacheService.del(`appDepartments:${appId}`);
    await this.cacheService.del(`active-departments:${appId}`);
    return saved;
  }

  async findAllDepartments(): Promise<Department[]> {
    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      return [];
    }

    const cacheKey = `appDepartments:${appId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const application = await this.applicationRepo.findOne({
      where: { id: appId },
    });

    if (!application) {
      // throw new NotFoundException('Application not found');
      return [];
    }

    const departments = await this.departmentRepo.find({
      where: { appId: application.id },
      order: { name: 'ASC' },
    });

    for (const dept of departments) {
      if (dept.parentId) {
        const parentDept = await this.departmentRepo.findOne({
          where: { id: dept.parentId },
        });
        if (parentDept) {
          dept['parent'] = {
            name: parentDept.name,
            description: parentDept.description,
          };
        }
      }
    }

    await this.cacheService.set(cacheKey, departments);

    return departments;
  }

  async getAllDepartmentsWithPagination(
    queryString: any,
  ): Promise<{ data: any; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const query = this.departmentRepo
      .createQueryBuilder('department')
      .where('department.appId = :appId', { appId });

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      query.andWhere(
        'department.name LIKE :search OR department.description LIKE :search',
        { search: `%${params.search.trim()}%` },
      );
    }

    if (params.isActive !== undefined) {
      query.andWhere('department.isActive = :isActive', {
        isActive: params.isActive === 'true',
      });
    }

    if (params.parentId) {
      query.andWhere('department.parentId = :parentId', {
        parentId: params.parentId,
      });
    }
    query.addOrderBy('department.name', 'ASC');
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data, total };
  }

  async findDepartmentById(id: number): Promise<Department> {
    const department = await this.departmentRepo.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async updateDepartment(
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const appId = Number(RequestContext.get('activeAppId'));
    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const department = await this.departmentRepo.findOne({
      where: { id, appId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const name = (dto.name ?? department.name ?? '').trim();
    await this.ensureDepartmentNameAvailable(appId, name, id);

    // If there is any soft-deleted department with this new name in this company (other than id),
    // delete it permanently to avoid composite unique key conflicts
    const conflictingDeleted = await this.departmentRepo
      .createQueryBuilder('department')
      .withDeleted()
      .where('department.appId = :appId', { appId })
      .andWhere('LOWER(TRIM(department.name)) = :name', {
        name: name.toLowerCase(),
      })
      .andWhere('department.id != :id', { id })
      .andWhere('department.deletedAt IS NOT NULL')
      .getOne();

    if (conflictingDeleted) {
      await this.departmentRepo.delete(conflictingDeleted.id);
    }

    this.departmentRepo.merge(department, {
      name,
      description: dto.description,
      parentId: dto.parentId,
      isActive: dto.isActive,
      updaterId: dto.updaterId,
      appId,
    });
    const saved = await this.saveDepartmentOrConflict(department);
    const targetAppId = department.appId || appId;
    if (targetAppId) {
      await this.cacheService.del(`appDepartments:${targetAppId}`);
      await this.cacheService.del(`active-departments:${targetAppId}`);
    }
    return saved;
  }

  async deleteDepartment(id: number): Promise<void> {
    const department = await this.departmentRepo.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const activeAppId = RequestContext.get('activeAppId');
    const targetAppId = department.appId || activeAppId;

    // Clear Cache
    if (targetAppId) {
      await this.cacheService.del(`appDepartments:${targetAppId}`);
      await this.cacheService.del(`active-departments:${targetAppId}`);
    }

    const result = await this.departmentRepo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async createOrUpdateDepartment(
    dto: CreateDepartmentDto,
  ): Promise<Department> {
    if (dto.id !== undefined && dto.id !== null) {
      if (!Number.isInteger(dto.id) || dto.id < 1) {
        throw new BadRequestException('Department id must be a positive integer');
      }

      const { id, name, description, parentId, isActive, updaterId } = dto;
      return this.updateDepartment(id, {
        name,
        description,
        parentId,
        isActive,
        updaterId: updaterId ?? dto.creatorId,
      });
    }

    return this.createDepartment(dto);
  }

  private async ensureDepartmentNameAvailable(
    appId: number,
    name: string,
    exceptId?: number,
  ): Promise<void> {
    const query = this.departmentRepo
      .createQueryBuilder('department')
      .where('department.appId = :appId', { appId })
      .andWhere('LOWER(TRIM(department.name)) = :name', {
        name: name.toLowerCase(),
      });

    if (exceptId !== undefined) {
      query.andWhere('department.id != :exceptId', { exceptId });
    }

    const exists = await query.getOne();
    if (exists) {
      throw new ConflictException({
        name: 'Department name already exists in this company',
      });
    }
  }

  private async saveDepartmentOrConflict(
    department: Department,
  ): Promise<Department> {
    try {
      return await this.departmentRepo.save(department);
    } catch (error: any) {
      if (
        error?.code === 'ER_DUP_ENTRY' ||
        error?.driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException({
          name: 'Department name already exists in this company',
        });
      }
      throw error;
    }
  }

  async changeDepartmentActiveStatus(id: number) {
    const department = await this.departmentRepo.findOne({ where: { id } });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    department.isActive = !department.isActive;
    const saved = await this.departmentRepo.save(department);

    const activeAppId = RequestContext.get('activeAppId');
    const targetAppId = department.appId || activeAppId;
    if (targetAppId) {
      await this.cacheService.del(`appDepartments:${targetAppId}`);
      await this.cacheService.del(`active-departments:${targetAppId}`);
    }

    return saved;
  }

  async getParentDepartments(): Promise<Department[]> {
    const appId = RequestContext.get('activeAppId');
    const query = this.departmentRepo.createQueryBuilder('department');

    query.andWhere('department.appId = :appId', { appId });
    query.andWhere('department.parentId IS NULL');
    query.orderBy('department.name', 'ASC');
    return await query.getMany();
  }

  // Create or update a designation
  async createOrUpdateDesignation(
    dto: CreateDesignationDto,
    user: User,
  ): Promise<Designation> {
    const appId = Number(
      RequestContext.get('activeAppId') || user?.activeAppId,
    );

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    dto.appId = appId;

    dto.name = dto.name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const normalizedName = dto.name.toLowerCase().trim();

    if (dto.id) {
      const designation = await this.designationRepo.findOne({
        where: { id: dto.id, appId },
      });
      if (!designation) throw new NotFoundException('Designation not found');

      const activeExists = await this.designationRepo
        .createQueryBuilder('designation')
        .where('designation.appId = :appId', { appId })
        .andWhere('LOWER(TRIM(designation.name)) = :name', {
          name: normalizedName,
        })
        .andWhere('designation.id != :id', { id: dto.id })
        .getOne();

      if (activeExists) {
        throw new ConflictException('Designation name already exists');
      }

      // If there is any soft-deleted designation with this name in this company (other than id),
      // delete it permanently to avoid duplicate rows
      const conflictingDeleted = await this.designationRepo
        .createQueryBuilder('designation')
        .withDeleted()
        .where('designation.appId = :appId', { appId })
        .andWhere('LOWER(TRIM(designation.name)) = :name', {
          name: normalizedName,
        })
        .andWhere('designation.id != :id', { id: dto.id })
        .andWhere('designation.deletedAt IS NOT NULL')
        .getOne();

      if (conflictingDeleted) {
        await this.designationRepo.delete(conflictingDeleted.id);
      }

      dto.updaterId = user.id;
      this.designationRepo.merge(designation, dto);
      const saved = await this.saveDesignationOrConflict(designation);

      await this.cacheService.del(`appDesignations:${appId}`);
      const cacheKey = `active-designations:${appId}`;
      await this.cacheService.del(cacheKey);

      return saved;
    } else {
      dto.creatorId = user.id;

      // Check for active duplicate within this company
      const activeExists = await this.designationRepo
        .createQueryBuilder('designation')
        .where('designation.appId = :appId', { appId })
        .andWhere('LOWER(TRIM(designation.name)) = :name', {
          name: normalizedName,
        })
        .getOne();

      if (activeExists) {
        throw new ConflictException('Designation name already exists');
      }

      // If a soft-deleted designation with this name exists in this company, restore and update it
      const softDeleted = await this.designationRepo
        .createQueryBuilder('designation')
        .withDeleted()
        .where('designation.appId = :appId', { appId })
        .andWhere('LOWER(TRIM(designation.name)) = :name', {
          name: normalizedName,
        })
        .andWhere('designation.deletedAt IS NOT NULL')
        .getOne();

      if (softDeleted) {
        await this.designationRepo.restore(softDeleted.id);

        if (!dto.level) {
          const maxLevelRow = await this.designationRepo
            .createQueryBuilder('designation')
            .select('MAX(designation.level)', 'maxLevel')
            .where('designation.appId = :appId', { appId })
            .getRawOne();
          dto.level = (Number(maxLevelRow?.maxLevel) || 0) + 1;
        }

        this.designationRepo.merge(softDeleted, {
          name: dto.name,
          departmentId: dto.departmentId ?? null,
          level: dto.level,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          creatorId: user.id,
          updaterId: user.id,
          deletedAt: null as any,
        });

        const saved = await this.saveDesignationOrConflict(softDeleted);
        await this.cacheService.del(`appDesignations:${appId}`);
        const cacheKey = `active-designations:${appId}`;
        await this.cacheService.del(cacheKey);
        return saved;
      }

      if (!dto.level) {
        const maxLevelRow = await this.designationRepo
          .createQueryBuilder('designation')
          .select('MAX(designation.level)', 'maxLevel')
          .where('designation.appId = :appId', { appId })
          .getRawOne();
        dto.level = (Number(maxLevelRow?.maxLevel) || 0) + 1;
      }

      const designation = this.designationRepo.create(dto);
      const saved = await this.saveDesignationOrConflict(designation);
      await this.cacheService.del(`appDesignations:${appId}`);
      const cacheKey = `active-designations:${appId}`;
      await this.cacheService.del(cacheKey);
      return saved;
    }
  }

  private async saveDesignationOrConflict(
    designation: Designation,
  ): Promise<Designation> {
    try {
      return await this.designationRepo.save(designation);
    } catch (error: any) {
      if (
        error?.code === 'ER_DUP_ENTRY' ||
        error?.driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Designation name already exists');
      }
      throw error;
    }
  }

  // Get all designations
  async findAllDesignations(): Promise<Designation[]> {
    const appId = RequestContext.get('activeAppId');
    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const cacheKey = `appDesignations:${appId}`;
    await this.cacheService.del(cacheKey);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const designations = await this.designationRepo.find({
      where: { appId: appId },
      order: { level: 'ASC' },
      relations: ['department'],
    });

    await this.cacheService.set(cacheKey, designations);
    return designations;
  }

  async reorderDesignations(
    dto: ReorderDesignationsDto,
    user?: User,
  ): Promise<void> {
    const appId = RequestContext.get('activeAppId') || user?.activeAppId;
    if (!dto?.items?.length) return;

    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.items) {
        const whereCondition: any = { id: item.id };
        if (appId) {
          whereCondition.appId = appId;
        }
        await manager.update(
          Designation,
          whereCondition,
          {
            level: item.level,
            updaterId: user?.id || null,
            updatedAt: new Date(),
          },
        );
      }
    });

    if (appId) {
      await this.cacheService.del(`appDesignations:${appId}`);
      const cacheKey = `active-designations:${appId}`;
      await this.cacheService.del(cacheKey);
    }
  }

  async getAllDesignationsWithPagination(
    queryString: any,
  ): Promise<{ data: Designation[]; total: number }> {
    const appId = RequestContext.get('activeAppId');
    const query = this.designationRepo.createQueryBuilder('designation');

    query.leftJoin('designation.department', 'department');
    query.addSelect(['department.id', 'department.name']);
    query.andWhere('designation.appId = :appId', { appId });
    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    delete params.sort;

    if (params.search) {
      query.andWhere('designation.name LIKE :search', {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.isActive !== undefined) {
      query.andWhere('designation.isActive = :isActive', {
        isActive: params.isActive === 'true',
      });
    }

    if (!queryString?.sort) {
      queryString = { ...queryString, sort: 'level:asc,id:asc' };
    }

    const total = await query.getCount();
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.getQuery().getMany();

    return { data, total };
  }

  async getAllActiveDesignations(): Promise<CommonResponseDto[]> {
    // const appUser = await this.appUserRepo.findOne({
    //   where: { userId: this.userContextService.getUserId() },
    // });

    // if (!appUser) {
    //   throw new NotFoundException('App User not found');
    // }

    const appId = RequestContext.get('activeAppId');

    const cacheKey = `active-designations:${appId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const designations = await this.designationRepo.find({
      where: { isActive: true, appId: appId },
      order: { name: 'ASC' },
      select: ['id', 'name', 'departmentId'],
    });

    const mappedDesignations = designations.map((item) => ({
      value: item.id,
      label: item.name,
      departmentId: item.departmentId,
    }));

    await this.cacheService.set(cacheKey, mappedDesignations);

    return mappedDesignations;
  }

  async getAllActiveDepartments(): Promise<CommonResponseDto[]> {
    // const appUser = await this.appUserRepo.findOne({
    //   where: { userId: this.userContextService.getUserId() },
    // });

    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const cacheKey = `active-departments:${appId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const departments = await this.departmentRepo.find({
      where: { isActive: true, appId: appId },
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });

    const mappedDepartments = departments.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    await this.cacheService.set(cacheKey, mappedDepartments);

    return mappedDepartments;
  }

  // Get designation by ID
  async findDesignationById(id: number): Promise<Designation> {
    const designation = await this.designationRepo.findOne({ where: { id } });
    if (!designation)
      throw new NotFoundException(`Designation with ID ${id} not found`);
    return designation;
  }

  // Delete a designation
  async deleteDesignation(id: number): Promise<void> {
    const activeAppId = Number(RequestContext.get('activeAppId'));
    const designation = await this.designationRepo.findOne({
      where: activeAppId ? { id, appId: activeAppId } : { id },
    });

    if (!designation) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    const result = await this.designationRepo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    const targetAppId = designation.appId || activeAppId;

    // Clear cache
    if (targetAppId) {
      await this.cacheService.del(`appDesignations:${targetAppId}`);
      await this.cacheService.del(`active-designations:${targetAppId}`);
    }
  }

  // Change active status
  async changeDesignationActiveStatus(id: number) {
    // const appUser = await this.appUserRepo.findOne({
    //   where: { userId: this.userContextService.getUserId() },
    // });

    const appId = RequestContext.get('activeAppId');

    if (!appId) {
      throw new NotFoundException('App User not found');
    }

    const designation = await this.designationRepo.findOne({
      where: { id, appId: appId },
    });
    if (!designation)
      throw new NotFoundException(`Designation with ID ${id} not found`);

    designation.isActive = !designation.isActive;
    const saved = await this.designationRepo.save(designation);

    const targetAppId = designation.appId || appId;
    // Clear cache
    if (targetAppId) {
      await this.cacheService.del(`appDesignations:${targetAppId}`);
      await this.cacheService.del(`active-designations:${targetAppId}`);
    }

    return saved;
  }
}
