//src/module/audit-log/audit-log.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Like, Repository } from 'typeorm';
import { RequestContext } from '@common/request-context';
import { CreateUserSessionDto } from './dto/user-sessions.dto';
import { UAParser } from 'ua-parser-js';
import { APIFeatures } from '@core/utils/apiFeatures';
import { Employee } from '@module/hr-management/entities/employees.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuditLog } from '@module/audit-log/schema/audit-log.schema';
import { UserActivity } from '@module/audit-log/schema/user-activity.schema';
import { UserSession } from '@module/audit-log/schema/user-sessions.schema';
import { User } from '@module/users/entities/user.entity';
import { MongoAPIFeatures } from '@core/utils/mongo-api-features';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLog>,

    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivity>,

    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSession>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async createUserActivity(data: Partial<UserActivity>): Promise<void> {
    try {
      await this.userActivityModel.create(data);
    } catch (err) {
      console.error('Failed to log user activity:', err.message);
    }
  }

  async saveLog(
    action: string,
    entity: string,
    entityId: number | null,
    oldData: any,
    newData: any,
  ): Promise<AuditLog> {
    const auditData: Partial<AuditLog> = {};

    if (action) {
      auditData.action = action;
    }

    if (entityId) {
      auditData.entityId = entityId;
    }

    if (entity) {
      auditData.entity = entity;
    }

    if (oldData || newData) {
      auditData.details = {
        before: oldData,
        after: newData,
      };
    }

    return this.createLog(auditData);
  }

  async createLog(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    try {
      auditLog.userId = auditLog.userId ?? RequestContext.get<number>('userId');
    } catch {}

    try {
      auditLog.ipAddress =
        auditLog.ipAddress ?? RequestContext.get<string>('ipAddress');
    } catch {}

    return this.auditModel.create(auditLog);
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditModel.find().exec();
  }

  async getLogById(id: number): Promise<AuditLog | null> {
    return this.auditModel.findById(id).exec();
  }

  async getLogsByUserId(userId: number): Promise<AuditLog[]> {
    return this.auditModel.find({ userId }).exec();
  }

  async getLogsByAction(action: string): Promise<AuditLog[]> {
    return this.auditModel.find({ action }).exec();
  }

  async updateLog(
    id: number,
    updatedLog: Partial<AuditLog>,
  ): Promise<AuditLog> {
    const ip = '423432';
    // this.httpUtils.getClientIpAddress(
    //   this.requestContext.getRequest(),
    // );
    const existingLog = await this.auditModel.findById(id);

    if (!existingLog) {
      throw new Error('AuditLog not found');
    }

    existingLog.userId = 1;
    existingLog.action = updatedLog.action ?? existingLog.action;
    existingLog.entity = updatedLog.entity ?? existingLog.entity;
    existingLog.details = updatedLog.details ?? existingLog.details;
    existingLog.ipAddress = ip ?? existingLog.ipAddress;

    return existingLog.save();
  }

  async deleteLog(id: number): Promise<void> {
    await this.auditModel.findByIdAndDelete(id);
  }

  async log(
    userId: number,
    action: string,
    details: any,
    ipAddress: string,
    entity?: string,
  ) {
    await this.auditModel.create({
      userId,
      action,
      details,
      ipAddress,
      entity,
    });
  }

  findByUserId(id: number) {
    return this.auditModel
      .find({
        userId: id,
      })
      .exec();
  }

  findByEntity(entity: string) {
    return this.auditModel
      .find({
        entity: entity,
      })
      .exec();
  }

  async addOrUpdateUserSession(
    dto: CreateUserSessionDto,
  ): Promise<UserSession> {
    const userId = RequestContext.get('userId');

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayStart.getUTCDate() + 1);

    const existingSession = await this.userSessionModel.findOne({
      userId,
      startDateTime: { $gte: todayStart, $lt: todayEnd },
    });

    if (existingSession) {
      existingSession.endDateTime = new Date();
      Object.assign(existingSession, dto);
      return existingSession.save();
    } else {
      return this.userSessionModel.create({ ...dto, userId });
    }
  }

  async updateUserSession(): Promise<any> {
    const userId = RequestContext.get('userId');

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayStart.getUTCDate() + 1);

    const existingSession = await this.userSessionModel.findOne({
      userId,
      startDateTime: { $gte: todayStart, $lt: todayEnd },
    });

    if (existingSession) {
      existingSession.endDateTime = new Date();
      return existingSession.save();
    }
  }

  async getUserSessions(queryString: any): Promise<UserSession[]> {
    const userId = RequestContext.get('userId');
    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    const filterQuery: any = { userId: userId };

    if (params.userId) {
      filterQuery.userId = params.userId;
    }

    if (params.startDate) {
      const startDate = new Date(params.startDate);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);

      filterQuery.startDateTime = { $gte: startDate, $lt: endDate };
    }

    if (params.search) {
      const search = `%${params.search.trim()}%`;
      const matchingUsers = await this.userRepo.find({
        where: [
          {
            firstName: Like(search),
            lastName: Like(search),
            email: Like(search),
          },
        ],
        select: ['id'],
      });

      const matchingUserIds = matchingUsers.map((u) => u.id);
      filterQuery.userId = { $in: matchingUserIds };
    }

    const sessions = await this.userSessionModel
      .find(filterQuery)
      .lean()
      .exec();

    const sessionUserIds = [
      ...new Set(sessions.map((s) => s.userId).filter((id) => id != null)),
    ];

    let users: any = [];
    if (sessionUserIds.length > 0) {
      users = await this.userRepo.find({
        where: { id: In(sessionUserIds) },
        select: ['id', 'firstName', 'lastName', 'email'],
      });
    }

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return sessions.map((session) => ({
      ...session,
      user: session.userId ? usersMap.get(session.userId) : null,
    }));
  }

  private formatActionMessage(doc: any): string {
    const entityMap: Record<string, string> = {
      employees: 'Employee Profile',
      users: 'User Account',
      user_profiles: 'Profile Details',
      user_trainings: 'Training Details',
      user_certifications: 'Certification',
      user_educations: 'Education Details',
      user_skills: 'Skills',
      user_projects: 'Projects',
      user_references: 'References',
      user_work_experiences: 'Work Experience',
      emp_attendances: 'Attendance',
      emp_leave_requests: 'Leave Request',
      attendance_reconciliations: 'Attendance Reconciliation',
      employee_shifts: 'Shift',
      employee_leave_balances: 'Leave Balance',
    };
    const entityName =
      entityMap[doc.entity] ||
      (doc.entity
        ? doc.entity.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        : 'Record');
    const actionMap: Record<string, string> = {
      INSERT: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
      REMOVE: 'Removed',
    };
    const actionName = actionMap[doc.action] || doc.action;
    return `${actionName} ${entityName}`;
  }

  async getRecentLogs(
    queryString: any,
  ): Promise<{ data: any[]; total: number }> {
    const userId = RequestContext.get('userId');

    let employee = await this.employeeRepo.query(
      `SELECT id FROM employees WHERE user_id = ?`,
      [userId],
    );

    employee = employee?.[0];

    const personalEntities = [
      'user_profiles',
      'user_trainings',
      'user_certifications',
      'user_educations',
      'user_skills',
      'user_projects',
      'user_references',
      'user_work_experiences',
    ];

    const employeeSpecificEntities = [
      'emp_attendances',
      'emp_leave_requests',
      'attendance_reconciliations',
      'employee_shifts',
      'employee_leave_balances',
    ];

    const orConditions: any[] = [
      // 1. Direct user record changes
      { entity: 'users', entityId: userId },
      // 2. User profile details
      {
        entity: { $in: personalEntities },
        $or: [
          { userId: userId },
          { 'details.after.userId': userId },
          { 'details.before.userId': userId },
          { 'details.after.user_id': userId },
          { 'details.before.user_id': userId },
        ],
      },
    ];

    if (employee?.id) {
      // 3. Direct employee record changes
      orConditions.push({ entity: 'employees', entityId: employee.id });

      // 4. Attendance, Leave, etc. for this employee
      orConditions.push({
        entity: { $in: employeeSpecificEntities },
        $or: [
          { 'details.after.empId': employee.id },
          { 'details.before.empId': employee.id },
          { 'details.after.emp_id': employee.id },
          { 'details.before.emp_id': employee.id },
          { 'details.after.employeeId': employee.id },
          { 'details.before.employeeId': employee.id },
          { userId: userId },
        ],
      });
    }

    const filter: any = {
      $or: orConditions,
    };

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const searchStr = params.search.trim();
      const sqlSearchStr = `%${searchStr}%`;
      const matchingUsers = await this.userRepo.find({
        where: [
          { firstName: Like(sqlSearchStr) },
          { lastName: Like(sqlSearchStr) },
          { email: Like(sqlSearchStr) },
        ],
        select: ['id'],
      });

      const matchingUserIds = matchingUsers.map((u) => u.id);
      filter.$and = [
        {
          $or: [
            { userId: { $in: matchingUserIds } },
            { action: { $regex: searchStr, $options: 'i' } },
            { entity: { $regex: searchStr, $options: 'i' } },
          ],
        },
      ];
    }

    const query = this.auditModel.find(filter);
    const total = await this.auditModel.countDocuments(filter);

    const features = new MongoAPIFeatures(query, queryString)
      .sort()
      .limitFields()
      .paginate();

    features.getQuery().select('action entity details ipAddress createdAt');

    const rawData = await features.getQuery().lean().exec();

    const data = rawData.map((doc: any) => ({
      id: doc._id.toString(),
      action: this.formatActionMessage(doc),
      rawAction: doc.action,
      entity: doc.entity,
      details: doc.details,
      ipAddress: doc.ipAddress,
      createdAt: doc.createdAt,
    }));

    return { data, total };
  }

  async getRecentLogsByEmployeeId(
    employeeId: number,
    queryString: any,
  ): Promise<{ data: any[]; total: number }> {
    const appId = RequestContext.get('activeAppId');

    const employee = await this.employeeRepo.findOne({
      where: appId ? { id: employeeId, appId } : { id: employeeId },
      select: ['id', 'userId'],
    });

    if (!employee)
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);

    const personalEntities = [
      'user_profiles',
      'user_trainings',
      'user_certifications',
      'user_educations',
      'user_skills',
      'user_projects',
      'user_references',
      'user_work_experiences',
    ];

    const employeeSpecificEntities = [
      'emp_attendances',
      'emp_leave_requests',
      'attendance_reconciliations',
      'employee_shifts',
      'employee_leave_balances',
    ];

    const orConditions: any[] = [
      { entity: 'employees', entityId: employee.id },
      {
        entity: { $in: employeeSpecificEntities },
        $or: [
          { 'details.after.empId': employee.id },
          { 'details.before.empId': employee.id },
          { 'details.after.emp_id': employee.id },
          { 'details.before.emp_id': employee.id },
          { 'details.after.employeeId': employee.id },
          { 'details.before.employeeId': employee.id },
        ],
      },
    ];

    if (employee.userId) {
      orConditions.push({ entity: 'users', entityId: employee.userId });
      orConditions.push({
        entity: { $in: personalEntities },
        $or: [
          { userId: employee.userId },
          { 'details.after.userId': employee.userId },
          { 'details.before.userId': employee.userId },
          { 'details.after.user_id': employee.userId },
          { 'details.before.user_id': employee.userId },
        ],
      });
    }

    const filter: any = {
      $or: orConditions,
    };

    const params = queryString?.params ? JSON.parse(queryString.params) : {};

    if (params.search) {
      const searchStr = params.search.trim();
      const sqlSearchStr = `%${searchStr}%`;

      const matchingUsers = await this.userRepo.find({
        where: [
          { firstName: Like(sqlSearchStr) },
          { lastName: Like(sqlSearchStr) },
          { email: Like(sqlSearchStr) },
        ],
        select: ['id'],
      });

      const matchingUserIds = matchingUsers.map((u) => u.id);

      filter.$and = [
        {
          $or: [
            { userId: { $in: matchingUserIds } },
            { action: { $regex: searchStr, $options: 'i' } },
            { entity: { $regex: searchStr, $options: 'i' } },
          ],
        },
      ];
    }

    const query = this.auditModel.find(filter);
    const total = await this.auditModel.countDocuments(filter);

    const features = new MongoAPIFeatures(query, queryString)
      // .searching()
      .sort()
      .limitFields()
      .paginate();

    features.getQuery().select('action entity details ipAddress createdAt');

    const rawData = await features.getQuery().lean().exec();

    const data = rawData.map((doc: any) => ({
      id: doc._id.toString(),
      action: this.formatActionMessage(doc),
      rawAction: doc.action,
      entity: doc.entity,
      details: doc.details,
      ipAddress: doc.ipAddress,
      createdAt: doc.createdAt,
    }));

    return { data, total };
  }
}
