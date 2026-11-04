import { RequestContext } from '@common/request-context';
import { HelperService } from '@common/helpers/helper.service';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { UserRole } from '@module/role-permission/entities/user-role.entity';
import { AppUser } from '@module/users/entities/app-user.entity';
import { UserTraining } from '@module/users/entities/user-training.entity';
import { UsersService } from '@module/users/users.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateTrainingRequestDto,
  UpdateTrainingRequestStatusDto,
} from './dto/training-request.dto';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    @InjectRepository(UserTraining)
    private readonly userTrainingRepo: Repository<UserTraining>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    private readonly commonDao: HelperService,
    private readonly usersService: UsersService,
  ) {}

  async createOrUpdateTrainingRequest(
    dto: CreateTrainingRequestDto,
  ): Promise<UserTraining> {
    const userId = Number(RequestContext.get('userId'));
    const appId = Number(RequestContext.get('activeAppId'));
    const employee = await this.employeeRepo.findOne({
      where: { userId, appId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const trainingTypeId =
      dto.trainingType === 'Internal'
        ? 267
        : dto.trainingType === 'External'
          ? 268
          : null;
    if (trainingTypeId === null) {
      throw new BadRequestException(
        'Training type must be Internal or External',
      );
    }
    const expectedTrainingTypeName =
      trainingTypeId === 267 ? 'Internal' : 'External';
    const trainingTypeStatus =
      await this.commonDao.findStatusById(trainingTypeId);
    if (
      !trainingTypeStatus ||
      trainingTypeStatus.name !== expectedTrainingTypeName
    ) {
      throw new BadRequestException(
        'Training type must be Internal (267) or External (268)',
      );
    }

    const pendingStatus = await this.commonDao.findStatusByCode(
      'requisition_status_pending',
    );
    if (!pendingStatus) {
      throw new NotFoundException('Pending training request status not found');
    }

    const values = {
      name: dto.itemDescription.trim(),
      trainingType: trainingTypeId,
      quantity: dto.quantity,
      startDate: dto.startDate 
        ? new Date(dto.startDate)
        : (dto.preferredTrainingDate ? new Date(dto.preferredTrainingDate) : null),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      courseDuration: dto.courseDuration ?? null,
      address: dto.trainingProvider ?? null,
      locationName: dto.locationName ?? null,
      estimatedCost: dto.estimatedCost ?? null,
      reason: dto.reason ?? null,
      additionalNotes: dto.additionalNotes ?? null,
      description: dto.additionalNotes ?? null,
      statusId: pendingStatus.id,
    };

    if (dto.id) {
      const existing = await this.userTrainingRepo.findOne({
        where: { id: dto.id, userId, statusId: pendingStatus.id },
      });
      if (!existing) {
        throw new NotFoundException('Pending training request not found');
      }
      this.userTrainingRepo.merge(existing, values);
      return this.userTrainingRepo.save(existing);
    }

    const request = await this.userTrainingRepo.save(
      this.userTrainingRepo.create({
        ...values,
        userId,
        isCurrent: false,
      }),
    );
    await this.notifyCompanyAdminsOfNewTrainingRequest(
      appId,
      userId,
      employee.employeeCode ?? null,
      request,
    );
    return request;
  }

  private async notifyCompanyAdminsOfNewTrainingRequest(
    appId: number,
    requesterUserId: number,
    employeeCode: string | null,
    request: UserTraining,
  ): Promise<void> {
    try {
      const adminAssignments = await this.userRoleRepo
        .createQueryBuilder('userRole')
        .innerJoin('userRole.role', 'role')
        .select('userRole.userId', 'userId')
        .where('userRole.appId = :appId', { appId })
        .andWhere('role.code IN (:...roleCodes)', { roleCodes: ['admin', 'super_admin'] })
        .andWhere('role.isActive = :isActive', { isActive: true })
        .getRawMany<{ userId: number }>();

      const adminUserIds = [
        ...new Set(
          adminAssignments
            .map(({ userId }) => Number(userId))
            // .filter((adminUserId) => adminUserId !== requesterUserId),
        ),
      ];
      if (adminUserIds.length === 0) {
        this.logger.warn(
          `No company admins found for training request ${request.id} in app ${appId}`,
        );
        return;
      }

      const activeAdmins = await this.appUserRepo.find({
        where: {
          appId,
          isActive: true,
          userId: In(adminUserIds),
        },
        select: ['userId'],
      });
      const message =
        `New training request from employee ${employeeCode || requesterUserId}: ` +
        `${request.name}`;

      for (const admin of activeAdmins) {
        if (!admin.userId) continue;
        try {
          await this.usersService.createUserNotification(admin.userId, message);
        } catch (error) {
          this.logger.error(
            `Could not notify admin ${admin.userId} about training request ${request.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Could not find admins to notify about training request ${request.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async findAllTrainingRequests(
    queryString: any,
    includeHeaders = true,
  ): Promise<{
    data: { list: any[]; headers: any };
    total: number;
  }> {
    const appId = Number(RequestContext.get('activeAppId'));
    const params = queryString?.params ? JSON.parse(queryString.params) : {};
    const page = Math.max(1, Number(queryString?.page) || 1);
    const limit = Math.max(1, Number(queryString?.limit) || 10);

    const query = this.userTrainingRepo
      .createQueryBuilder('training')
      .leftJoinAndSelect('training.user', 'user')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('designation.department', 'department')
      .leftJoinAndSelect('employee.office', 'office')
      .leftJoinAndSelect('office.officeType', 'officeType')
      .leftJoinAndSelect('employee.officeShift', 'officeShift')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('training.status', 'status')
      .leftJoinAndSelect('training.trainingTypeStatus', 'trainingTypeStatus')
      .where('training.statusId IS NOT NULL')
      .andWhere('employee.appId = :appId', { appId });

    if (params.search) {
      query.andWhere(
        `(user.firstName LIKE :search OR user.lastName LIKE :search OR
          user.email LIKE :search OR employee.employeeCode LIKE :search OR
          training.name LIKE :search)`,
        { search: `%${String(params.search).trim()}%` },
      );
    }
    if (params.statusCode) {
      query.andWhere('status.code = :statusCode', {
        statusCode: String(params.statusCode),
      });
    } else if (params.statusId) {
      query.andWhere('training.statusId = :statusId', {
        statusId: Number(params.statusId),
      });
    }
    if (params.employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId: Number(params.employeeId),
      });
    }
    if (params.userId) {
      query.andWhere('user.id = :userId', {
        userId: Number(params.userId),
      });
    }
    if (params.todayOnly) {
      query.andWhere('DATE(training.createdAt) = CURRENT_DATE');
    }
    if (params.departmentId) {
      query.andWhere('designation.departmentId = :departmentId', {
        departmentId: Number(params.departmentId),
      });
    }
    if (params.requisitionDate) {
      query.andWhere('DATE(training.createdAt) = :requestDate', {
        requestDate: params.requisitionDate,
      });
    }
    if (params.approvedDate) {
      query.andWhere('DATE(training.approvedDate) = :approvedDate', {
        approvedDate: params.approvedDate,
      });
    }

    const [records, total] = await query
      .orderBy('training.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const list = records.map((record) => {
      const employee = record.user?.employee;
      const department = employee?.designation?.department ?? null;
      const user = record.user;
      return {
        id: record.id,
        requisitionNo: `TR-${record.id}`,
        itemDescription: record.name,
        trainingType: record.trainingType,
        trainingTypeId: record.trainingType,
        trainingTypeName: record.trainingTypeStatus?.name ?? null,
        trainingTypeCode: record.trainingTypeStatus?.code ?? null,
        quantity: record.quantity,
        preferredTrainingDate: record.startDate,
        startDate: record.startDate,
        endDate: record.endDate,
        courseDuration: record.courseDuration,
        trainingProvider: record.address,
        locationName: record.locationName,
        estimatedCost:
          record.estimatedCost === null ? null : Number(record.estimatedCost),
        reason: record.reason,
        additionalNotes: record.additionalNotes,
        requisitionDate: record.createdAt,
        approvedDate: record.approvedDate,
        approvedBy: record.approvedBy,
        remarks: record.remarks,
        statusId: record.statusId,
        status: record.status,
        employee: employee
          ? {
              id: employee.id,
              employeeCode: employee.employeeCode,
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                profile: user.profile,
              },
              office: employee.office,
              officeShift: employee.officeShift,
              department,
            }
          : null,
        department,
      };
    });

    if (includeHeaders) {
      const statusCodes = [
        ['pending', 'requisition_status_pending'],
        ['approved', 'requisition_status_approved'],
        ['rejected', 'requisition_status_rejected'],
      ] as const;
      const headers: Record<string, { users: any[]; count: number }> = {};
      for (const [key, code] of statusCodes) {
        const status = await this.commonDao.findStatusByCode(code);
        if (status) {
          const records = await this.userTrainingRepo
            .createQueryBuilder('training')
            .leftJoinAndSelect('training.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
            .leftJoin('user.employee', 'employee')
            .where('training.statusId = :statusId', { statusId: status.id })
            .andWhere('employee.appId = :appId', { appId })
            .getMany();
          headers[key] = {
            users: records.map((r) => ({
              name: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim(),
              fileUrl: r.user?.profile?.profilePicture?.fileUrl || '',
            })),
            count: records.length,
          };
        } else {
          headers[key] = { users: [], count: 0 };
        }
      }

      const todayRecords = await this.userTrainingRepo
        .createQueryBuilder('training')
        .leftJoinAndSelect('training.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
        .leftJoin('user.employee', 'employee')
        .where('DATE(training.createdAt) = CURRENT_DATE')
        .andWhere('employee.appId = :appId', { appId })
        .getMany();
      headers.today = {
        users: todayRecords.map((r) => ({
          name: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim(),
          fileUrl: r.user?.profile?.profilePicture?.fileUrl || '',
        })),
        count: todayRecords.length,
      };

      const totalRecords = await this.userTrainingRepo
        .createQueryBuilder('training')
        .leftJoinAndSelect('training.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
        .leftJoin('user.employee', 'employee')
        .where('training.statusId IS NOT NULL')
        .andWhere('employee.appId = :appId', { appId })
        .getMany();
      headers.total = {
        users: totalRecords.map((r) => ({
          name: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim(),
          fileUrl: r.user?.profile?.profilePicture?.fileUrl || '',
        })),
        count: totalRecords.length,
      };

      return { data: { list, headers }, total };
    }

    return { data: { list, headers: {} }, total };
  }

  async findMyTrainingRequests(
    userId: number,
    queryString: any,
  ): Promise<{ data: { list: any[]; headers: any }; total: number }> {
    const authenticatedUserId = Number(userId);
    if (!Number.isInteger(authenticatedUserId) || authenticatedUserId <= 0) {
      throw new UnauthorizedException(
        'Authenticated user could not be identified',
      );
    }

    const requestedParams = queryString?.params
      ? JSON.parse(queryString.params)
      : {};

    return this.findAllTrainingRequests(
      {
        page: queryString?.page,
        limit: queryString?.limit,
        params: JSON.stringify({
          userId: authenticatedUserId,
          ...(requestedParams.search
            ? { search: String(requestedParams.search).trim() }
            : {}),
          ...(requestedParams.statusCode
            ? { statusCode: String(requestedParams.statusCode) }
            : {}),
        }),
      },
      false,
    );
  }

  async findTrainingRequestById(id: number): Promise<any> {
    const appId = Number(RequestContext.get('activeAppId'));
    const record = await this.userTrainingRepo
      .createQueryBuilder('training')
      .leftJoinAndSelect('training.user', 'user')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('designation.department', 'department')
      .leftJoinAndSelect('employee.office', 'office')
      .leftJoinAndSelect('office.officeType', 'officeType')
      .leftJoinAndSelect('employee.officeShift', 'officeShift')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.profilePicture', 'profilePicture')
      .leftJoinAndSelect('training.status', 'status')
      .leftJoinAndSelect('training.trainingTypeStatus', 'trainingTypeStatus')
      .where('training.id = :id', { id })
      .andWhere('employee.appId = :appId', { appId })
      .getOne();

    if (!record) {
      throw new NotFoundException('Training request not found');
    }

    const employee = record.user?.employee;
    const department = employee?.designation?.department ?? null;
    const user = record.user;

    return {
      id: record.id,
      requisitionNo: `TR-${record.id}`,
      itemDescription: record.name,
      trainingType: record.trainingType,
      trainingTypeId: record.trainingType,
      trainingTypeName: record.trainingTypeStatus?.name ?? null,
      trainingTypeCode: record.trainingTypeStatus?.code ?? null,
      quantity: record.quantity,
      preferredTrainingDate: record.startDate,
      startDate: record.startDate,
      endDate: record.endDate,
      courseDuration: record.courseDuration,
      trainingProvider: record.address,
      locationName: record.locationName,
      estimatedCost:
        record.estimatedCost === null ? null : Number(record.estimatedCost),
      reason: record.reason,
      additionalNotes: record.additionalNotes,
      requisitionDate: record.createdAt,
      approvedDate: record.approvedDate,
      approvedBy: record.approvedBy,
      remarks: record.remarks,
      statusId: record.statusId,
      status: record.status,
      employee: employee
        ? {
            id: employee.id,
            employeeCode: employee.employeeCode,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: `${user.firstName} ${user.lastName}`.trim(),
              email: user.email,
              profile: user.profile,
            },
            office: employee.office,
            officeShift: employee.officeShift,
            department,
          }
        : null,
      department,
    };
  }

  async updateTrainingRequestStatus(
    dto: UpdateTrainingRequestStatusDto,
  ): Promise<UserTraining> {
    const appId = Number(RequestContext.get('activeAppId'));
    const userId = Number(RequestContext.get('userId'));
    const request = await this.userTrainingRepo
      .createQueryBuilder('training')
      .leftJoin('training.user', 'user')
      .leftJoin('user.employee', 'employee')
      .where('training.id = :id', { id: dto.id })
      .andWhere('training.statusId IS NOT NULL')
      .andWhere('employee.appId = :appId', { appId })
      .getOne();
    if (!request) {
      throw new NotFoundException('Training request not found');
    }

    const status = await this.commonDao.findStatusById(dto.statusId);
    if (!status) {
      throw new NotFoundException(`Status with ID ${dto.statusId} not found`);
    }

    request.statusId = dto.statusId;
    request.remarks = dto.remarks ?? null;
    if (
      status.code === 'requisition_status_approved' ||
      status.code === 'requisition_status_completed' ||
      status.code === 'requisition_status_rejected'
    ) {
      request.approvedBy = userId;
      request.approvedDate = new Date();
    }
    return this.userTrainingRepo.save(request);
  }

  async deleteTrainingRequest(id: number): Promise<void> {
    const appId = Number(RequestContext.get('activeAppId'));
    const pendingStatus = await this.commonDao.findStatusByCode(
      'requisition_status_pending',
    );
    const result = await this.userTrainingRepo
      .createQueryBuilder()
      .delete()
      .from(UserTraining)
      .where('id = :id', { id })
      .andWhere('status_id = :statusId', {
        statusId: pendingStatus?.id ?? -1,
      })
      .andWhere(
        `user_id IN (
          SELECT employee.user_id FROM employees employee
          WHERE employee.app_id = :appId
        )`,
        { appId },
      )
      .execute();
    if (!result.affected) {
      throw new NotFoundException('Pending training request not found');
    }
  }
}
