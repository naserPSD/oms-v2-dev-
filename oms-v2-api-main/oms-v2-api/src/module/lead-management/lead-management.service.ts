import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DataSource } from 'typeorm';
import { Lead, LeadDocument } from './schemas/lead.schema';
import {
  LeadActivity,
  LeadActivityDocument,
} from './schemas/lead-activity.schema';
import {
  Communication,
  CommunicationDocument,
} from './schemas/communication.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { RequestContext } from '@common/request-context';

@Injectable()
export class LeadManagementService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(LeadActivity.name)
    private leadActivityModel: Model<LeadActivityDocument>,
    @InjectModel(Communication.name)
    private communicationModel: Model<CommunicationDocument>,
    @Optional() private readonly dataSource?: DataSource,
  ) {}

  /** Scope Mongo lead queries to the authenticated active company only. */
  private getActiveAppIdOrThrow(): string {
    const appId = RequestContext.get('activeAppId');
    if (!appId || appId === 'null' || appId === 'undefined') {
      throw new BadRequestException('Active company is required');
    }
    return String(appId);
  }

  private getAppIdFilter(appId?: string | number) {
    let targetAppId = appId;
    if (targetAppId == null) {
      try {
        const id = RequestContext.get('activeAppId');
        if (id && id !== 'null' && id !== 'undefined') {
          targetAppId = id;
        }
      } catch (e) {
        // ignore
      }
    }
    const resolvedAppId = targetAppId != null ? String(targetAppId) : '1';
    return {
      $or: [
        { appId: String(resolvedAppId) },
        { appId: Number(resolvedAppId) },
        { appId: '1' },
        { appId: 1 },
        { appId: { $exists: false } },
        { appId: null },
      ],
    };
  }

  /**
   * Determine user role and lead query scope.
   * Super Admins / Admins / Company Owners see all company leads.
   * Regular users only see leads assigned to them or created by them.
   */
  private async getUserScope(): Promise<{
    isAdmin: boolean;
    userId?: string;
    employeeId?: string;
    scopeFilter?: any;
  }> {
    const rawUserId = RequestContext.get('userId');
    const rawAppId = RequestContext.get('activeAppId');

    if (!rawUserId) {
      return { isAdmin: true };
    }

    const userId = String(rawUserId);
    const appId =
      rawAppId != null && rawAppId !== 'null' && rawAppId !== 'undefined'
        ? String(rawAppId)
        : null;

    let isAdmin = false;
    let employeeId: string | undefined = undefined;

    if (this.dataSource) {
      try {
        // 1. Check if user is application owner/creator in MySQL applications table
        if (appId) {
          const appRows: any[] = await this.dataSource
            .query(
              `SELECT id FROM applications WHERE id = ? AND created_by = ? LIMIT 1`,
              [appId, rawUserId],
            )
            .catch(() => []);
          if (appRows && appRows.length > 0) {
            isAdmin = true;
          }
        }

        // 2. Check if user has an Admin or Super Admin role
        if (!isAdmin) {
          const roleRows: any[] = await this.dataSource
            .query(
              `SELECT r.code, r.name 
               FROM user_roles ur
               INNER JOIN roles r ON r.id = ur.role_id
               WHERE ur.user_id = ? ${appId ? 'AND (ur.app_id = ? OR ur.app_id IS NULL)' : ''}`,
              appId ? [rawUserId, appId] : [rawUserId],
            )
            .catch(() => []);

          const adminKeywords = ['admin', 'super_admin', 'superadmin', 'owner'];
          const hasAdminRole = roleRows.some((r) => {
            const code = String(r.code || '').toLowerCase().trim();
            const name = String(r.name || '').toLowerCase().trim();
            return (
              adminKeywords.includes(code) ||
              adminKeywords.includes(name) ||
              code.includes('admin') ||
              name.includes('admin')
            );
          });

          if (hasAdminRole) {
            isAdmin = true;
          }
        }

        // 3. Resolve employee ID for this user in current active app
        const empRows: any[] = await this.dataSource
          .query(
            `SELECT id FROM employees WHERE user_id = ? ${appId ? 'AND (app_id = ? OR app_id IS NULL)' : ''} LIMIT 1`,
            appId ? [rawUserId, appId] : [rawUserId],
          )
          .catch(() => []);
        if (empRows && empRows.length > 0 && empRows[0].id) {
          employeeId = String(empRows[0].id);
        }
      } catch (err) {
        console.warn('Error resolving user scope from MySQL, falling back:', err);
      }
    }

    // User-scoped leads filter (leads assigned to user by user ID or employee ID, or created by user)
    const orConditions: any[] = [
      { assignedTo: userId },
      { assignedTo: Number(userId) },
      { createdBy: userId },
      { createdBy: Number(userId) },
    ];
    if (employeeId && employeeId !== userId) {
      orConditions.push(
        { assignedTo: employeeId },
        { assignedTo: Number(employeeId) },
      );
    }

    return {
      isAdmin,
      userId,
      employeeId,
      scopeFilter: { $or: orConditions },
    };
  }

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const userId = RequestContext.get('userId');

    // Remove undefined values to avoid MongoDB issues
    const cleanDto: any = {};
    Object.keys(createLeadDto).forEach((key) => {
      if (createLeadDto[key] !== undefined) {
        cleanDto[key] = createLeadDto[key];
      }
    });

    const isClient =
      cleanDto.leadStatus === 'Converted' ||
      ['customer', 'partner', 'vendor'].includes(cleanDto.clientStatus);

    const isFollowup =
      cleanDto.leadStatus === 'In Process' ||
      cleanDto.leadStatus === 'Follow Up';

    let resolvedLeadStatus = cleanDto.leadStatus;
    let resolvedClientStatus = cleanDto.clientStatus;

    if (isClient) {
      resolvedLeadStatus = 'Converted';
      if (
        !resolvedClientStatus ||
        resolvedClientStatus === 'lead' ||
        resolvedClientStatus === 'prospect'
      ) {
        resolvedClientStatus = 'customer';
      }
    } else if (isFollowup) {
      resolvedLeadStatus = cleanDto.leadStatus || 'In Process';
      if (!resolvedClientStatus) {
        resolvedClientStatus = 'prospect';
      }
    } else {
      resolvedLeadStatus = cleanDto.leadStatus || 'Active';
      if (!resolvedClientStatus) {
        resolvedClientStatus = 'lead';
      }
    }

    const leadData: any = {
      ...cleanDto,
      appId: this.getActiveAppIdOrThrow(),
      createdBy: userId ? userId.toString() : undefined,
      lastContact: cleanDto.lastContact || new Date(),
      leadStatus: resolvedLeadStatus,
      clientStatus: resolvedClientStatus,
    };

    // Store assignedTo as string (MySQL user ID)
    if (cleanDto.assignedTo) {
      leadData.assignedTo = cleanDto.assignedTo.toString();
    } else if (userId) {
      // Default assignedTo to the creator if not explicitly assigned
      leadData.assignedTo = userId.toString();
    }

    // Ensure contacts and remarks are arrays if provided
    if (leadData.contacts && !Array.isArray(leadData.contacts)) {
      leadData.contacts = [];
    }
    if (leadData.remarks && !Array.isArray(leadData.remarks)) {
      leadData.remarks = [];
    }

    // Use create() instead of new Model().save() to avoid callback issues
    const savedLead = await this.leadModel.create(leadData);

    // Create activity log
    if (userId) {
      await this.createActivity(
        savedLead._id.toString(),
        userId,
        'Created',
        'Lead created',
      );
    }

    const transformed: any = savedLead.toObject
      ? savedLead.toObject()
      : savedLead;
    if (transformed._id) {
      transformed._id = transformed._id.toString();
      transformed.id = transformed._id;
    }

    return transformed as Lead;
  }

  async findAll(queryDto: LeadQueryDto): Promise<any> {
    try {
      const scope = await this.getUserScope();

      const {
        page = 1,
        limit = 10,
        search,
        leadSource,
        leadStatus,
        assignedTo,
        sort = 'createdAt',
        order = 'DESC',
      } = queryDto;

      const skip = (page - 1) * limit;
      const andConditions: any[] = [
        { isActive: { $ne: false } },
        this.getAppIdFilter(),
      ];

      // User scoping: both users and admins only see their own assigned/created leads
      if (scope.scopeFilter) {
        andConditions.push(scope.scopeFilter);
      }

      // Search filter
      if (search) {
        andConditions.push({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { contactName: { $regex: search, $options: 'i' } },
            { contactEmail: { $regex: search, $options: 'i' } },
            { contactPhone: { $regex: search, $options: 'i' } },
          ],
        });
      }

      // Filters
      if (leadSource) {
        andConditions.push({ leadSource });
      }
      if (leadStatus) {
        if (leadStatus === 'Follow Up' || leadStatus === 'In Process') {
          andConditions.push({
            $or: [{ leadStatus: 'In Process' }, { leadStatus: 'Follow Up' }],
          });
        } else if (leadStatus === 'Converted') {
          andConditions.push({
            $or: [
              { leadStatus: 'Converted' },
              { clientStatus: { $in: ['customer', 'partner', 'vendor'] } },
            ],
          });
        } else if (leadStatus === 'Active') {
          andConditions.push({
            leadStatus: 'Active',
            clientStatus: { $nin: ['customer', 'partner', 'vendor'] },
          });
        } else {
          andConditions.push({ leadStatus });
        }
      }
      if (assignedTo) {
        andConditions.push({
          $or: [
            { assignedTo: String(assignedTo) },
            { assignedTo: Number(assignedTo) },
          ],
        });
      }

      const query: any = { $and: andConditions };

      // Sort - validate sort field to prevent injection
      const validSortFields = [
        'createdAt',
        'updatedAt',
        'name',
        'contactName',
        'leadStatus',
        'leadSource',
        'dealValue',
      ];
      const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
      const sortOrder = order === 'ASC' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sortField] = sortOrder;

      // Execute query
      const [list, total] = await Promise.all([
        this.leadModel
          .find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean()
          .then((leads) =>
            leads.map((lead) => {
              const strId = lead._id ? lead._id.toString() : '';
              return {
                ...lead,
                _id: strId,
                id: strId,
              };
            }),
          ),
        this.leadModel.countDocuments(query),
      ]);

      // Get header counts - pass user scope filter so counts match the logged in user
      let headers;
      try {
        headers = await this.getHeaderCounts(scope.scopeFilter);
      } catch (headerError) {
        console.error('Error getting header counts:', headerError);
        headers = {
          lead: { count: 0, users: [] },
          client: { count: 0, users: [] },
          followup: { count: 0, users: [] },
        };
      }

      return {
        list,
        headers,
        pagination: {
          page,
          limit,
          total,
          lastPage: Math.ceil(total / limit),
          resultRows: list.length,
        },
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Lead> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lead ID');
    }

    const lead = await this.leadModel.findById(id).lean();

    if (!lead || (lead as any).isActive === false) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const scope = await this.getUserScope();
    if (scope.userId) {
      const assigned = String((lead as any).assignedTo || '');
      const created = String((lead as any).createdBy || '');
      const uid = String(scope.userId || '');
      const eid = String(scope.employeeId || '');

      const isAllowed =
        (uid && (assigned === uid || created === uid)) ||
        (eid && assigned === eid);

      if (!isAllowed) {
        throw new ForbiddenException(
          'You do not have permission to view this lead',
        );
      }
    }

    // Ensure assignedTo is always a string (not an object)
    if (lead.assignedTo) {
      if (typeof lead.assignedTo === 'object' && lead.assignedTo !== null) {
        // If it's an object, try to extract the ID
        const assignedToObj = lead.assignedTo as any;
        lead.assignedTo =
          assignedToObj.id?.toString() ||
          assignedToObj._id?.toString() ||
          (assignedToObj.toString &&
          typeof assignedToObj.toString === 'function'
            ? assignedToObj.toString()
            : '') ||
          String(assignedToObj);
      } else {
        lead.assignedTo = String(lead.assignedTo);
      }
    }

    return lead as any;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lead ID');
    }

    // Get existing lead to compare counts and check permissions
    const existingLead = await this.leadModel.findById(id).lean();
    if (!existingLead || (existingLead as any).isActive === false) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const scope = await this.getUserScope();
    if (scope.userId) {
      const assigned = String((existingLead as any).assignedTo || '');
      const created = String((existingLead as any).createdBy || '');
      const uid = String(scope.userId || '');
      const eid = String(scope.employeeId || '');

      const isAllowed =
        (uid && (assigned === uid || created === uid)) ||
        (eid && assigned === eid);

      if (!isAllowed) {
        throw new ForbiddenException(
          'You do not have permission to update this lead',
        );
      }
    }

    const userId = RequestContext.get('userId');

    // Remove undefined values and the id field (not part of update data)
    const cleanDto: any = {};
    Object.keys(updateLeadDto).forEach((key) => {
      if (key !== 'id' && updateLeadDto[key] !== undefined) {
        cleanDto[key] = updateLeadDto[key];
      }
    });

    const updateData: any = { ...cleanDto };

    if (
      updateData.leadStatus !== undefined ||
      updateData.clientStatus !== undefined
    ) {
      const isClient =
        updateData.leadStatus === 'Converted' ||
        ['customer', 'partner', 'vendor'].includes(updateData.clientStatus);

      if (isClient) {
        updateData.leadStatus = 'Converted';
        if (
          !updateData.clientStatus ||
          updateData.clientStatus === 'lead' ||
          updateData.clientStatus === 'prospect'
        ) {
          updateData.clientStatus = 'customer';
        }
      } else if (
        updateData.leadStatus === 'Active' ||
        updateData.leadStatus === 'In Process'
      ) {
        if (
          ['customer', 'partner', 'vendor'].includes(updateData.clientStatus)
        ) {
          updateData.clientStatus = 'lead';
        }
      }
    }

    // Store assignedTo as string (MySQL user ID)
    if (cleanDto.assignedTo !== undefined) {
      if (cleanDto.assignedTo === null || cleanDto.assignedTo === '') {
        updateData.assignedTo = null;
      } else {
        updateData.assignedTo = cleanDto.assignedTo.toString();
      }
    }
    // Count existing contacts that are valid (have name, email, or phone) - same filter as new contacts
    const existingContacts = existingLead?.contacts
      ? Array.isArray(existingLead.contacts)
        ? existingLead.contacts
        : []
      : [];
    const existingContactsCount = existingContacts.filter(
      (contact) => contact && (contact.name || contact.email || contact.phone),
    ).length;
    // Count existing remarks that are valid (have remark text)
    const existingRemarks = existingLead?.remarks
      ? Array.isArray(existingLead.remarks)
        ? existingLead.remarks
        : []
      : [];
    const existingRemarksCount = existingRemarks.filter((remark: any) => {
      const remarkText =
        remark?.remark ||
        remark?.text ||
        remark?.message ||
        remark?.content ||
        '';
      return remark && remarkText && remarkText.trim().length > 0;
    }).length;

    // Ensure contacts and remarks are arrays if provided
    if (updateData.contacts !== undefined) {
      if (!Array.isArray(updateData.contacts)) {
        updateData.contacts = [];
      } else {
        // Validate and clean contacts array - ensure each contact has required fields
        // Count BEFORE filtering to get accurate comparison
        const contactsBeforeFilter = updateData.contacts.length;
        updateData.contacts = updateData.contacts
          .filter(
            (contact) =>
              contact && (contact.name || contact.email || contact.phone),
          )
          .map((contact) => ({
            name: contact.name || '',
            email: contact.email || '',
            department: contact.department || '',
            designation: contact.designation || '',
            phone: contact.phone || '',
            alternativePhone: contact.alternativePhone || '',
            createdAt: contact.createdAt
              ? new Date(contact.createdAt)
              : new Date(),
            createdBy: contact.createdBy || userId?.toString(),
          }));

        // Use the filtered count for comparison
        const newContactsCount = updateData.contacts.length;
        const isContactAdded = newContactsCount > existingContactsCount;
        const isContactDeleted = newContactsCount < existingContactsCount;

        // Store these flags for later use in activity log
        updateData._isContactAdded = isContactAdded;
        updateData._isContactDeleted = isContactDeleted;
      }
    }
    if (updateData.remarks !== undefined) {
      if (!Array.isArray(updateData.remarks)) {
        updateData.remarks = [];
      } else {
        // Validate and clean remarks array - ensure each remark has a 'remark' field
        updateData.remarks = updateData.remarks
          .filter((remark: any) => {
            // Keep remarks that have text content
            const remarkText =
              remark?.remark ||
              remark?.text ||
              remark?.message ||
              remark?.content ||
              '';
            return remark && remarkText && remarkText.trim().length > 0;
          })
          .map((remark: any) => {
            const remarkText =
              remark.remark ||
              remark.text ||
              remark.message ||
              remark.content ||
              '';
            return {
              remark: remarkText.trim(),
              createdAt: remark.createdAt
                ? new Date(remark.createdAt)
                : new Date(),
              createdBy: remark.createdBy || userId?.toString(),
            };
          });
      }
    }

    // Compare remarks count (existingRemarksCount already fetched above)
    const newRemarksCount = updateData.remarks
      ? Array.isArray(updateData.remarks)
        ? updateData.remarks.length
        : 0
      : existingRemarksCount;
    const isRemarkAdded = newRemarksCount > existingRemarksCount;

    // Get contact flags from updateData (set during contact processing above)
    const isContactAdded = updateData._isContactAdded || false;
    const isContactDeleted = updateData._isContactDeleted || false;

    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Create specific activity log based on what was updated
    if (userId) {
      // Determine what was updated
      const updatedFields = Object.keys(updateData);

      // Company info fields
      const companyFields = [
        'leadType',
        'name',
        'companyType',
        'website',
        'priorityStatus',
        'clientStatus',
        'leadSource',
        'dealValue',
        'leadStatus',
      ];
      const hasCompanyUpdate = companyFields.some((field) =>
        updatedFields.includes(field),
      );

      // Key contact info fields
      const contactFields = [
        'contactName',
        'contactEmail',
        'contactDepartment',
        'contactDesignation',
        'contactPhone',
        'contactAlternativePhone',
      ];
      const hasContactUpdate = contactFields.some((field) =>
        updatedFields.includes(field),
      );

      // Contacts array
      const hasContactsUpdate = updatedFields.includes('contacts');

      // Remarks array
      const hasRemarksUpdate = updatedFields.includes('remarks');

      // Assigned user
      const hasAssignedUpdate = updatedFields.includes('assignedTo');

      // Create specific activity messages
      if (
        hasCompanyUpdate &&
        !hasContactUpdate &&
        !hasContactsUpdate &&
        !hasRemarksUpdate &&
        !hasAssignedUpdate
      ) {
        await this.createActivity(
          id,
          userId,
          'Updated',
          'Company Info updated',
        );
      } else if (
        hasContactUpdate &&
        !hasCompanyUpdate &&
        !hasContactsUpdate &&
        !hasRemarksUpdate &&
        !hasAssignedUpdate
      ) {
        await this.createActivity(
          id,
          userId,
          'Updated',
          'Key Contact Information updated',
        );
      } else if (hasContactsUpdate) {
        // Distinguish between adding, updating, and deleting contacts
        if (isContactAdded) {
          await this.createActivity(
            id,
            userId,
            'Added',
            'Other Contacts added',
          );
        } else if (isContactDeleted) {
          await this.createActivity(
            id,
            userId,
            'Deleted',
            'Other Contacts deleted',
          );
        } else {
          await this.createActivity(
            id,
            userId,
            'Updated',
            'Other Contacts updated',
          );
        }
      } else if (hasRemarksUpdate) {
        // Distinguish between adding and updating remarks
        if (isRemarkAdded) {
          await this.createActivity(id, userId, 'Added', 'Remarks added');
        } else {
          // If count is same or less, it's an update or deletion
          await this.createActivity(id, userId, 'Updated', 'Remarks updated');
        }
      } else if (hasAssignedUpdate) {
        await this.createActivity(
          id,
          userId,
          'Updated',
          'Assigned user updated',
        );
      } else if (hasCompanyUpdate || hasContactUpdate) {
        // Multiple sections updated
        await this.createActivity(
          id,
          userId,
          'Updated',
          'Lead information updated',
        );
      } else {
        // Fallback for other updates
        await this.createActivity(id, userId, 'Updated', 'Lead updated');
      }
    }

    const transformed: any = lead.toObject ? lead.toObject() : lead;
    if (transformed._id) {
      transformed._id = transformed._id.toString();
      transformed.id = transformed._id;
    }

    return transformed as Lead;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lead ID');
    }

    const existingLead = await this.leadModel.findById(id).lean();
    if (!existingLead || (existingLead as any).isActive === false) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const scope = await this.getUserScope();
    if (scope.userId) {
      const assigned = String((existingLead as any).assignedTo || '');
      const created = String((existingLead as any).createdBy || '');
      const uid = String(scope.userId || '');
      const eid = String(scope.employeeId || '');

      const isAllowed =
        (uid && (assigned === uid || created === uid)) ||
        (eid && assigned === eid);

      if (!isAllowed) {
        throw new ForbiddenException(
          'You do not have permission to delete this lead',
        );
      }
    }

    const lead = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const userId = RequestContext.get('userId');
    if (userId) {
      await this.createActivity(id, userId, 'Deleted', 'Lead deleted');
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      throw new BadRequestException('No valid lead IDs provided');
    }

    const scope = await this.getUserScope();
    const filter: any = { _id: { $in: objectIds } };
    if (scope.scopeFilter) {
      filter.$and = [scope.scopeFilter];
    }

    await this.leadModel.updateMany(
      filter,
      { $set: { isActive: false } },
    );

    const userId = RequestContext.get('userId');
    if (userId) {
      for (const id of ids) {
        await this.createActivity(id, userId, 'Deleted', 'Lead deleted (bulk)');
      }
    }
  }

  async bulkUpdateStatus(bulkUpdateStatusDto: BulkUpdateStatusDto): Promise<void> {
    const { leadIds, status } = bulkUpdateStatusDto;

    const objectIds = leadIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      throw new BadRequestException('No valid lead IDs provided');
    }

    const scope = await this.getUserScope();
    const filter: any = { _id: { $in: objectIds } };
    if (scope.scopeFilter) {
      filter.$and = [scope.scopeFilter];
    }

    const updateFields: any = { leadStatus: status, lastContact: new Date() };
    if (status === 'Converted') {
      updateFields.clientStatus = 'customer';
    } else if (status === 'Active') {
      updateFields.clientStatus = 'lead';
    }

    await this.leadModel.updateMany(
      filter,
      { $set: updateFields },
    );

    const userId = RequestContext.get('userId');
    if (userId) {
      for (const leadId of leadIds) {
        await this.createActivity(
          leadId,
          userId,
          'Status Changed',
          `Status changed to ${status}`,
        );
      }
    }
  }

  async getHeaderCounts(userScopeFilter?: any) {
    try {
      const appIdFilter = this.getAppIdFilter();
      const baseFilterAnd: any[] = [
        { isActive: { $ne: false } },
        appIdFilter,
      ];

      if (userScopeFilter) {
        baseFilterAnd.push(userScopeFilter);
      } else {
        const scope = await this.getUserScope();
        if (scope.scopeFilter) {
          baseFilterAnd.push(scope.scopeFilter);
        }
      }

      const baseFilter = { $and: baseFilterAnd };

      const clientOrConditions = [
        { leadStatus: 'Converted' },
        { clientStatus: { $in: ['customer', 'partner', 'vendor'] } },
      ];

      const [leadCount, clientCount, followupCount] = await Promise.all([
        this.leadModel.countDocuments(baseFilter),
        this.leadModel.countDocuments({
          $and: [
            baseFilter,
            { $or: clientOrConditions },
          ],
        }),
        this.leadModel.countDocuments({
          $and: [
            baseFilter,
            {
              $or: [
                { leadStatus: 'In Process' },
                { leadStatus: 'Follow Up' },
              ],
            },
          ],
        }),
      ]);

      // Get assigned user IDs and names for each category
      const [leadLeads, clientLeads, followupLeads] = await Promise.all([
        this.leadModel
          .find(baseFilter)
          .select('assignedTo name')
          .lean()
          .catch(() => []),
        this.leadModel
          .find({
            $and: [
              baseFilter,
              { $or: clientOrConditions },
            ],
          })
          .select('assignedTo name')
          .lean()
          .catch(() => []),
        this.leadModel
          .find({
            $and: [
              baseFilter,
              {
                $or: [
                  { leadStatus: 'In Process' },
                  { leadStatus: 'Follow Up' },
                ],
              },
            ],
          })
          .select('assignedTo name')
          .lean()
          .catch(() => []),
      ]);

      const getAssignedUserIds = (leads: any[]) => {
        const ids = leads
          .map((l) => l.assignedTo)
          .filter(
            (id) =>
              id != null &&
              String(id).trim() !== '' &&
              String(id) !== 'string' &&
              String(id) !== 'null' &&
              String(id) !== 'undefined',
          );
        return [...new Set(ids.map((id) => String(id)))];
      };

      const leadUserIds = getAssignedUserIds(leadLeads);
      const clientUserIds = getAssignedUserIds(clientLeads);
      const followupUserIds = getAssignedUserIds(followupLeads);

      return {
        lead: {
          count: leadCount,
          users: leadUserIds.map((id) => ({ id, name: `User ${id}`, fileUrl: null })),
          assignedUserIds: leadUserIds,
        },
        client: {
          count: clientCount,
          users: clientUserIds.map((id) => ({ id, name: `User ${id}`, fileUrl: null })),
          assignedUserIds: clientUserIds,
        },
        followup: {
          count: followupCount,
          users: followupUserIds.map((id) => ({ id, name: `User ${id}`, fileUrl: null })),
          assignedUserIds: followupUserIds,
        },
      };
    } catch (error) {
      console.error('Error in getHeaderCounts:', error);
      return {
        lead: { count: 0, users: [], assignedUserIds: [] },
        client: { count: 0, users: [], assignedUserIds: [] },
        followup: { count: 0, users: [], assignedUserIds: [] },
      };
    }
  }

  private async getUserDetails(userIds: any[]) {
    // This would typically fetch from User model
    // For now, return empty array - you can populate this from MySQL User table
    // TODO: Integrate with MySQL User table to get user details
    return userIds.map((userId) => ({
      name: 'User',
      fileUrl: '',
    }));
  }

  async createActivity(
    leadId: string,
    userId: number | string,
    activityType: string,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<LeadActivity | null> {
    try {
      const appId = RequestContext.get('activeAppId');
      const safeDescription = description || '';
      const descriptionPreview =
        safeDescription.length > 50
          ? safeDescription.substring(0, 50)
          : safeDescription;

      // Use create() instead of new Model().save() to avoid callback issues
      const activityData = {
        leadId: new Types.ObjectId(leadId),
        userId: typeof userId === 'number' ? userId.toString() : userId,
        activityType,
        description: safeDescription,
        title: `${activityType}: ${descriptionPreview}`,
        activityDate: new Date(),
        metadata: metadata || {},
        status: 'pending', // Default status for auto-created activities
        isActive: true,
        appId: appId,
      };

      return await this.leadActivityModel.create(activityData);
    } catch (error) {
      console.error('Error creating lead activity:', error);
      console.error('Activity data:', {
        leadId,
        userId,
        activityType,
        description,
      });
      // Don't throw - activity logging shouldn't break the main operation
      return null;
    }
  }

  async getLeadActivities(leadId: string) {
    if (!Types.ObjectId.isValid(leadId)) {
      throw new BadRequestException('Invalid lead ID');
    }

    // Validates that lead exists and user has permission to view it
    await this.findOne(leadId);

    return this.leadActivityModel
      .find({ leadId: new Types.ObjectId(leadId), isActive: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Simple Communication CRUD using separate Communication table
  async createCommunication(
    leadId: string,
    createDto: CreateCommunicationDto,
  ): Promise<Communication> {
    try {
      if (!Types.ObjectId.isValid(leadId)) {
        throw new BadRequestException('Invalid lead ID');
      }

      // Validates that lead exists and user has permission to view/update it
      await this.findOne(leadId);

      const userId = RequestContext.get('userId');
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      // Validate required fields
      if (!createDto.type) {
        throw new BadRequestException('Communication type is required');
      }
      if (!createDto.description || createDto.description.trim() === '') {
        throw new BadRequestException('Description is required');
      }
      if (!createDto.activityDate) {
        throw new BadRequestException('Activity date is required');
      }

      // Parse date
      const activityDate = new Date(createDto.activityDate);
      if (isNaN(activityDate.getTime())) {
        throw new BadRequestException('Invalid activity date format');
      }

      const communicationData = {
        leadId: new Types.ObjectId(leadId),
        userId: userId.toString(),
        type: createDto.type,
        description: createDto.description.trim(),
        activityDate: activityDate,
        status: createDto.status || 'pending',
        isActive: true,
      };

      if (!this.communicationModel) {
        throw new BadRequestException('Communication model not initialized');
      }

      const saved = await this.communicationModel.create(communicationData);

      // Create activity log for communication creation
      await this.createActivity(
        leadId,
        userId,
        'Communication Added',
        `${createDto.type} communication added: ${createDto.description.substring(0, 100)}`,
        {
          communicationId: saved._id?.toString(),
          type: createDto.type,
          status: createDto.status || 'pending',
        },
      );

      // Convert ObjectIds to plain strings
      const transformed: any = saved.toObject ? saved.toObject() : saved;
      if (transformed._id) {
        transformed._id = transformed._id.toString();
      }
      if (
        transformed.leadId &&
        transformed.leadId.toString &&
        typeof transformed.leadId.toString === 'function'
      ) {
        transformed.leadId = transformed.leadId.toString();
      }

      return transformed as Communication;
    } catch (error) {
      console.error('Error in createCommunication service:', error);
      throw error;
    }
  }

  async getCommunications(leadId: string): Promise<Communication[]> {
    try {
      if (!Types.ObjectId.isValid(leadId)) {
        throw new BadRequestException('Invalid lead ID');
      }

      // Validates that lead exists and user has permission to view it
      await this.findOne(leadId);

      const communications = await this.communicationModel
        .find({ leadId: new Types.ObjectId(leadId), isActive: true })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Convert ObjectIds to plain strings for _id and leadId
      const transformedCommunications = (communications || []).map(
        (comm: any) => {
          const transformed: any = { ...comm };
          // Convert _id to string
          if (transformed._id) {
            transformed._id = transformed._id.toString();
          }
          // Convert leadId to string if it's an ObjectId
          if (
            transformed.leadId &&
            transformed.leadId.toString &&
            typeof transformed.leadId.toString === 'function'
          ) {
            transformed.leadId = transformed.leadId.toString();
          }
          return transformed;
        },
      );

      return transformedCommunications;
    } catch (error) {
      console.error('Error in getCommunications service:', error);
      throw error;
    }
  }

  async updateCommunication(
    communicationId: string,
    updateDto: UpdateCommunicationDto,
  ): Promise<Communication> {
    if (!Types.ObjectId.isValid(communicationId)) {
      throw new BadRequestException('Invalid communication ID');
    }

    const updateData: any = {};
    if (updateDto.type !== undefined) {
      updateData.type = updateDto.type;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description.trim();
    }
    if (updateDto.activityDate !== undefined) {
      const date = new Date(updateDto.activityDate);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid activity date format');
      }
      updateData.activityDate = date;
    }
    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }

    // Get the communication first to get leadId for activity log
    const existingCommunication = await this.communicationModel
      .findById(communicationId)
      .exec();
    if (!existingCommunication) {
      throw new NotFoundException(
        `Communication with ID ${communicationId} not found`,
      );
    }

    const leadId = existingCommunication.leadId?.toString();
    const userId = RequestContext.get('userId');

    const communication = await this.communicationModel
      .findByIdAndUpdate(
        communicationId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .exec();

    if (!communication) {
      throw new NotFoundException(
        `Communication with ID ${communicationId} not found`,
      );
    }

    // Create activity log for communication update
    if (leadId && userId) {
      const updateFields = Object.keys(updateData).join(', ');
      const description = updateDto.description
        ? updateDto.description.substring(0, 100)
        : communication.description?.substring(0, 100) ||
          'Communication updated';

      await this.createActivity(
        leadId,
        userId,
        'Communication Updated',
        `${communication.type} communication updated (${updateFields}): ${description}`,
        {
          communicationId: communicationId,
          type: communication.type,
          status: communication.status,
        },
      );
    }

    // Convert ObjectIds to plain strings
    const transformed: any = communication.toObject
      ? communication.toObject()
      : communication;
    if (transformed._id) {
      transformed._id = transformed._id.toString();
    }
    if (
      transformed.leadId &&
      transformed.leadId.toString &&
      typeof transformed.leadId.toString === 'function'
    ) {
      transformed.leadId = transformed.leadId.toString();
    }

    return transformed as Communication;
  }

  async deleteCommunication(communicationId: string): Promise<void> {
    if (!Types.ObjectId.isValid(communicationId)) {
      throw new BadRequestException('Invalid communication ID');
    }

    // Get the communication first to get leadId and details for activity log
    const existingCommunication = await this.communicationModel
      .findById(communicationId)
      .exec();
    if (!existingCommunication) {
      throw new NotFoundException(
        `Communication with ID ${communicationId} not found`,
      );
    }

    const leadId = existingCommunication.leadId?.toString();
    const userId = RequestContext.get('userId');
    const communicationType = existingCommunication.type;
    const communicationDescription =
      existingCommunication.description?.substring(0, 100) || 'Communication';

    const communication = await this.communicationModel
      .findByIdAndUpdate(
        communicationId,
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();

    if (!communication) {
      throw new NotFoundException(
        `Communication with ID ${communicationId} not found`,
      );
    }

    // Create activity log for communication deletion
    if (leadId && userId) {
      await this.createActivity(
        leadId,
        userId,
        'Communication Deleted',
        `${communicationType} communication deleted: ${communicationDescription}`,
        {
          communicationId: communicationId,
          type: communicationType,
        },
      );
    }
  }

  async getDashboardStats() {
    const scope = await this.getUserScope();
    const now = new Date();

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Previous 30 days (60 to 30 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Last 1 day (24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(now.getDate() - 1);

    // Previous 1 day (48 to 24 hours ago)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);

    const appId = RequestContext.get('activeAppId');
    const targetAppId = (appId && appId !== 'null' && appId !== 'undefined') ? String(appId) : '1';

    const appIdFilter = {
      $or: [
        { appId: String(targetAppId) },
        { appId: Number(targetAppId) },
        { appId: '1' },
        { appId: 1 },
        { appId: { $exists: false } },
        { appId: null },
      ],
    };

    const baseFilterAnd: any[] = [
      appIdFilter,
      { isActive: { $ne: false } },
    ];
    if (scope.scopeFilter) {
      baseFilterAnd.push(scope.scopeFilter);
    }
    const baseFilter = { $and: baseFilterAnd };

    const activeLeadFilter = {
      leadStatus: 'Active',
      clientStatus: { $nin: ['customer', 'partner', 'vendor'] },
    };

    // 1. Active Leads in last 30 days (newLeads.total)
    const currentMonthLeads = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        activeLeadFilter,
        { createdAt: { $gte: thirtyDaysAgo, $lte: now } },
      ],
    });

    // 2. Active Leads in previous 30 days
    const previousMonthLeads = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        activeLeadFilter,
        { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } },
      ],
    });

    const clientOrConditions = [
      { leadStatus: 'Converted' },
      { clientStatus: { $in: ['customer', 'partner', 'vendor'] } },
    ];

    // 3. New Clients in last 30 days (newClients.total)
    const currentMonthClients = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        { $or: clientOrConditions },
        {
          $or: [
            { createdAt: { $gte: thirtyDaysAgo, $lte: now } },
            { updatedAt: { $gte: thirtyDaysAgo, $lte: now } },
          ],
        },
      ],
    });

    // 4. New Clients in previous 30 days (to calculate newClients.percentage)
    const previousMonthClients = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        { $or: clientOrConditions },
        {
          $or: [
            { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } },
            { updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } },
          ],
        },
      ],
    });

    // New Clients in last 24 hours
    const currentClientsLast24Hours = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        { $or: clientOrConditions },
        {
          $or: [
            { createdAt: { $gte: oneDayAgo, $lte: now } },
            { updatedAt: { $gte: oneDayAgo, $lte: now } },
          ],
        },
      ],
    });

    // 5. Total Leads (Active in DB)
    const totalLeads = await this.leadModel.countDocuments(baseFilter);

    // 6. Total Contacts
    const totalContacts = totalLeads;

    // 7. Customers / Won Deals (clientStatus in customer/partner/vendor or leadStatus === 'Converted')
    const wonDealsCount = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        { $or: clientOrConditions },
      ],
    });

    // 8. In Process / Quotes
    const inProcessCount = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        {
          $or: [
            { leadStatus: 'In Process' },
            { leadStatus: { $regex: /negotiat/i } },
            { clientStatus: 'prospect' },
          ],
        },
      ],
    });

    // 9. Active Leads / Invoices
    const activeLeadsCount = await this.leadModel.countDocuments({
      $and: [
        ...baseFilterAnd,
        activeLeadFilter,
      ],
    });

    // 10. Repeat / Existing Clients
    const repeatClientsCount = await this.leadModel.countDocuments({
      ...baseFilter,
      clientStatus: { $in: ['customer', 'partner'] },
    });

    // 11. Total Pipeline Deal Value
    const dealValueAgg = await this.leadModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: null, total: { $sum: '$dealValue' } } },
    ]);
    const totalDealValue = dealValueAgg[0]?.total || 0;

    // Percentage changes
    let percentageChangeLeads = 0;
    if (previousMonthLeads === 0) {
      percentageChangeLeads = currentMonthLeads > 0 ? 100 : 0;
    } else {
      percentageChangeLeads = Math.round(((currentMonthLeads - previousMonthLeads) / previousMonthLeads) * 100);
    }

    let percentageChangeClients = 0;
    if (previousMonthClients === 0) {
      percentageChangeClients = currentMonthClients > 0 ? 100 : 0;
    } else {
      percentageChangeClients = Math.round(((currentMonthClients - previousMonthClients) / previousMonthClients) * 100);
    }

    // Conversion rate
    const conversionRate = totalLeads > 0 
      ? Number(((wonDealsCount / totalLeads) * 100).toFixed(1))
      : 0;

    // 12. Recent 5 Leads from DB
    const recentLeadsRaw = await this.leadModel
      .find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentLeads = recentLeadsRaw.map((lead: any) => ({
      id: lead._id ? lead._id.toString() : '',
      name: lead.name || lead.contactName || 'Unnamed Lead',
      company: lead.companyType || lead.leadType || 'Business',
      dealValue: lead.dealValue ? `$${Number(lead.dealValue).toLocaleString()}` : '$0',
      status: lead.leadStatus || (lead.clientStatus === 'customer' ? 'Converted' : 'Active'),
      phone: lead.contactPhone || lead.contactAlternativePhone || 'No Phone',
      createdAt: lead.createdAt || new Date(),
    }));

    // 13. Recent Activities from DB
    const activityQuery: any = { isActive: { $ne: false } };
    if (scope.userId) {
      const userIds: any[] = [String(scope.userId), Number(scope.userId)];
      if (scope.employeeId) {
        userIds.push(String(scope.employeeId), Number(scope.employeeId));
      }
      activityQuery.userId = { $in: userIds };
    }

    const recentActivitiesRaw = await this.leadActivityModel
      .find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .catch(() => []);

    const recentActivities = recentActivitiesRaw.map((act: any) => ({
      id: act._id ? act._id.toString() : '',
      title: act.title || act.activityType || 'Activity logged',
      time: act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      date: act.createdAt ? new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
      leadId: act.leadId ? act.leadId.toString() : '',
    }));

    // 14. Status Distribution from DB
    const statusAgg = await this.leadModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$leadStatus', count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    statusAgg.forEach((item) => {
      const key = item._id || 'Active';
      statusMap[key] = (statusMap[key] || 0) + item.count;
    });

    // 15. Pipeline Trend (Last 6 Months)
    const months: Array<{ monthName: string; monthStart: Date; monthEnd: Date }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleString('en-US', { month: 'short' });
      months.push({ monthName, monthStart, monthEnd });
    }

    const pipelineTrend = await Promise.all(
      months.map(async ({ monthName, monthStart, monthEnd }) => {
        const [leads, won] = await Promise.all([
          this.leadModel.countDocuments({
            ...baseFilter,
            createdAt: { $gte: monthStart, $lte: monthEnd },
          }),
          this.leadModel.countDocuments({
            ...baseFilter,
            $or: [{ leadStatus: 'Converted' }, { clientStatus: 'customer' }],
            createdAt: { $gte: monthStart, $lte: monthEnd },
          }),
        ]);
        return { name: monthName, leads, conversions: won };
      })
    );

    return {
      totalContacts,
      totalLeads,
      wonDeals: wonDealsCount,
      inProcess: inProcessCount,
      activeLeads: activeLeadsCount,
      repeatClients: repeatClientsCount,
      totalDealValue,
      conversionRate,
      newLeads: {
        total: currentMonthLeads,
        percentage: percentageChangeLeads,
      },
      newClients: {
        total: currentMonthClients,
        percentage: percentageChangeClients,
      },
      newClientsLast24Hours: currentClientsLast24Hours,
      newClientsLastMonth: currentMonthClients,
      recentLeads,
      recentActivities,
      statusDistribution: statusMap,
      pipelineTrend,
    };
  }

}
