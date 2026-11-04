import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository, TreeRepository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from '@module/users/entities/user.entity';
import {
  CreatePermissionDto,
  PermissionResponseDto,
} from './dto/permission.dto';
import { CreateRoleDto } from './dto/role.dto';
import { RolePermission } from './entities/role-permission.entity';
import { APIFeatures } from '@core/utils/apiFeatures';
import { CommonResponseDto } from '@core/utils/common-response-dto';
import { UserRole } from './entities/user-role.entity';
import { RequestContext } from '@common/request-context';

@Injectable()
export class RolePermissionService implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.permissionRepository.query(`
        UPDATE permissions
        SET path = '/settings/company-user-list',
            updated_at = CURRENT_TIMESTAMP
        WHERE path = '/settings/company-settings/user-list'
           OR (code = 'settings.company_user_list' AND (path IS NULL OR path != '/settings/company-user-list'))
      `);
    } catch (err) {
      console.warn('Could not auto-update company user list permission path:', err);
    }

    try {
      const leftSidebarMenuPositionId = 264;

      // 0. Ensure duplicate standalone module 'admin_subscription_plans' is deleted
      await this.permissionRepository.query(`
        DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE code = 'admin_subscription_plans')
      `);
      await this.permissionRepository.query(`
        DELETE FROM permissions WHERE code = 'admin_subscription_plans'
      `);

      // 1. Ensure Subscription module exists as Admin module
      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          NULL, ${leftSidebarMenuPositionId}, 'module', 'Subscription Plans', 'subscription',
          'Subscription plan and coupon management for platform admin',
          '', '<i class="bx bx-group"></i>',
          2, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription' AND type = 'module'
        )
      `);

      await this.permissionRepository.query(`
        UPDATE permissions
        SET
          name = 'Subscription Plans',
          type = 'module',
          menu_position_id = ${leftSidebarMenuPositionId},
          access_panel = 'Admin',
          is_active = 1,
          is_required = 1,
          is_system = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = 'subscription' AND type = 'module'
      `);

      // 2. Ensure Subscription Plan List page exists under module 'subscription'
      await this.permissionRepository.query(`
        UPDATE permissions
        SET
          parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription' AND type = 'module' LIMIT 1) AS t),
          name = 'Subscription Plan List',
          type = 'page',
          menu_position_id = ${leftSidebarMenuPositionId},
          path = '/admin/subscription/subscription-list',
          access_panel = 'Admin',
          is_active = 1,
          is_required = 1,
          is_system = 0,
          sort_order = 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = 'subscription.subscription_plans'
      `);

      // 3. Ensure Subscription Coupons page exists under module 'subscription'
      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription' AND type = 'module' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'page', 'Subscription Coupons', 'subscription.coupons',
          'Manage coupons and subscription offer discounts',
          '/admin/subscription/coupons', '<i class="fa fa-ticket"></i>',
          2, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.coupons'
        )
      `);

      await this.permissionRepository.query(`
        UPDATE permissions
        SET
          parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription' AND type = 'module' LIMIT 1) AS t),
          name = 'Subscription Coupons',
          type = 'page',
          menu_position_id = ${leftSidebarMenuPositionId},
          path = '/admin/subscription/coupons',
          access_panel = 'Admin',
          is_active = 1,
          is_required = 1,
          is_system = 0,
          sort_order = 2,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = 'subscription.coupons'
      `);

      // 4. Action permissions for coupons
      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription.coupons' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'action', 'Add Subscription Coupon', 'subscription.coupons_add',
          'Add new subscription coupon', '', '',
          1, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.coupons_add'
        )
      `);

      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription.coupons' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'action', 'Edit Subscription Coupon', 'subscription.coupons_edit',
          'Edit existing subscription coupon', '', '',
          2, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.coupons_edit'
        )
      `);

      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription.coupons' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'action', 'Delete Subscription Coupon', 'subscription.coupons_delete',
          'Delete subscription coupon', '', '',
          3, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.coupons_delete'
        )
      `);

      // 5. Ensure Subscribers Companies page exists under module 'subscription'
      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription' AND type = 'module' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'page', 'Subscribers Companies', 'subscription.subscriber_companies',
          'Manage registered companies, subscribers, free vs premium plans, and workspace status',
          '/admin/subscriber-companies', '<i class="bx bx-buildings"></i>',
          3, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.subscriber_companies'
        )
      `);

      await this.permissionRepository.query(`
        UPDATE permissions
        SET
          parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription' AND type = 'module' LIMIT 1) AS t),
          name = 'Subscribers Companies',
          type = 'page',
          menu_position_id = ${leftSidebarMenuPositionId},
          path = '/admin/subscriber-companies',
          access_panel = 'Admin',
          is_active = 1,
          is_required = 1,
          is_system = 0,
          sort_order = 3,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = 'subscription.subscriber_companies'
      `);

      // Action permission for toggle company active/deactive
      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          (SELECT id FROM (SELECT id FROM permissions WHERE code = 'subscription.subscriber_companies' LIMIT 1) AS t),
          ${leftSidebarMenuPositionId}, 'action', 'Toggle Company Status', 'subscription.subscriber_companies_toggle',
          'Activate or deactivate subscriber companies', '', '',
          1, 1, 1, 0, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE code = 'subscription.subscriber_companies_toggle'
        )
      `);

      // 6. Grant permissions to Admin & Super Admin roles
      await this.permissionRepository.query(`
        INSERT INTO role_permissions (app_id, role_id, permission_id, access_panel, created_at)
        SELECT NULL, r.id, p.id, 'Admin', CURRENT_TIMESTAMP
        FROM roles r
        CROSS JOIN permissions p
        WHERE (r.code IN ('super_admin', 'admin') OR r.id IN (1, 3, 14))
          AND (
            p.code IN (
              'subscription',
              'subscription.subscription_plans',
              'subscription.coupons',
              'subscription.coupons_add',
              'subscription.coupons_edit',
              'subscription.coupons_delete',
              'subscription.subscriber_companies',
              'subscription.subscriber_companies_toggle'
            )
          )
          AND p.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
          )
      `);
    } catch (err) {
      console.warn('Could not auto-register subscription permissions:', err);
    }

    try {
      const leftSidebarMenuPositionId = 264;

      await this.permissionRepository.query(`
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path, icon,
          sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
        )
        SELECT
          sm.id, ${leftSidebarMenuPositionId}, 'page', 'Statuses', 'settings.statuses',
          'Manage status groups and statuses',
          '/admin/settings/statuses', '<i class="bx bx-list-check"></i>',
          13, 1, 1, 1, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM permissions sm
        WHERE sm.code = 'settings' AND sm.type = 'module' AND sm.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM permissions p
            WHERE p.code = 'settings.statuses' AND p.deleted_at IS NULL
          )
        LIMIT 1
      `);

      await this.permissionRepository.query(`
        UPDATE permissions
        SET
          parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1) AS t),
          name = 'Statuses',
          type = 'page',
          path = '/admin/settings/statuses',
          access_panel = 'Admin',
          menu_position_id = ${leftSidebarMenuPositionId},
          is_active = 1,
          is_required = 1,
          is_system = 1,
          sort_order = 13,
          updated_at = CURRENT_TIMESTAMP
        WHERE code = 'settings.statuses' AND deleted_at IS NULL
      `);

      await this.permissionRepository.query(`
        INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
        SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP
        FROM roles r
        CROSS JOIN permissions p
        WHERE (r.code IN ('super_admin', 'admin') OR r.id IN (1, 3, 14))
          AND p.code = 'settings.statuses'
          AND p.deleted_at IS NULL
          AND r.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
          )
      `);
    } catch (err) {
      console.warn('Could not auto-register settings statuses permission:', err);
    }
  }
  /** Platform-only permission codes company Admins must never delegate. */
  private static readonly COMPANY_PERMISSION_DENYLIST = [
    'settings.permissions',
    'settings.permission_list_add',
    'settings.permission_list_edit',
    'settings.permission_list_delete',
    'settings.roles-and-permissions',
    'settings.role_list_add',
    'settings.role_list_edit',
    'settings.role_list_delete',
    'settings.view_role',
    'settings.master_documents',
  ];

  private static readonly COMPANY_ROLE_ASSIGN_DENYLIST = [
    'super_admin',
  ];

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: TreeRepository<Permission>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private getActiveAppId(): number | null {
    const raw = RequestContext.get('activeAppId');
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private async callerIsSuperAdmin(
    userId?: number | null,
  ): Promise<boolean> {
    const id = userId ?? RequestContext.get('userId');
    if (!id) return false;
    const row = await this.userRoleRepository
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .where('ur.userId = :userId', { userId: id })
      .andWhere('role.code = :code', { code: 'super_admin' })
      .andWhere('role.deletedAt IS NULL')
      .getOne();
    return !!row;
  }

  private isDeniedCompanyPermissionCode(code: string | null | undefined): boolean {
    if (!code) return true;
    return RolePermissionService.COMPANY_PERMISSION_DENYLIST.some(
      (denied) =>
        code === denied ||
        code.startsWith(`${denied}.`) ||
        code.startsWith(`${denied}_`),
    );
  }

  private slugifyRoleCode(name: string, appId: number): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 80);
    return `app_${appId}_${base || 'role'}`;
  }

  async createOrUpdatePermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    if (createPermissionDto.id) {
      const permission = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.id },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      if (permission.isSystem) {
        throw new Error('Cannot modify system permissions');
      }

      const { parentId, ...rest } = createPermissionDto;
      Object.assign(permission, rest);

      if (parentId) {
        const parent = await this.permissionRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) throw new NotFoundException('Parent not found');
        permission.parent = parent;
      } else {
        permission.parent = null;
      }
      return this.permissionRepository.save(permission);
    } else {
      const { parentId, id, ...rest } = createPermissionDto;
      const permission = this.permissionRepository.create(rest);

      if (parentId) {
        const parent = await this.permissionRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) throw new NotFoundException('Parent not found');
        permission.parent = parent;
      } else {
        permission.parent = null;
      }

      const maxSortOder = await this.permissionRepository
        .createQueryBuilder('permission')
        .select('MAX(permission.sortOrder)', 'max')
        .getRawOne();

      if (!permission.sortOrder) {
        permission.sortOrder = maxSortOder.max + 1;
      }

      return this.permissionRepository.save(permission);
    }
  }

  // async getAllPermissions(): Promise<Permission[]> {
  //   return this.permissionRepository.find({
  //     order: { sortOrder: 'ASC', name: 'ASC' },
  //     relations: ['parent'],
  //   });
  // }
  async getAllPermissionsWithPagination(
    queryString: any,
  ): Promise<{ data: PermissionResponseDto[]; total: number }> {
    // Start with a query to filter out soft-deleted records
    const query = this.permissionRepository.createQueryBuilder('al'); // 'al' is alias of the table name 'permissions'
    query.leftJoinAndSelect('al.parent', 'parent');
    query.where('al.deletedAt IS NULL');

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(
        `al.name LIKE :search OR al.code LIKE :search OR al.description LIKE :search OR al.path LIKE :search`,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    // Apply filtering, sorting, field limiting, and pagination using APIFeatures
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    // Get the filtered data
    const featureData = await features.getQuery().getMany();

    // Get the total count of all non-deleted records using the IsNull operator
    const total = await query.getCount();

    // const mappedData = featureData.map((perm) => this.mapToPermissionResponseDto(perm));
    const mappedData = featureData.map(PermissionResponseDto.from);

    return {
      data: mappedData,
      total: total,
    };
  }

  // async getAllPermissions(): Promise<Permission[]> {
  //   return this.permissionRepository.find({
  //     where: { isActive: true },
  //     order: { sortOrder: 'ASC', name: 'ASC' },
  //     relations: ['children'],
  //   });
  // }

  async getAllPermissions(query: any): Promise<Permission[]> {
    const qb = this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.parent', 'parent')
      // .select(['permission.id', 'permission.parent'])
      .where('permission.isActive = :active', { active: true })
      .andWhere('permission.deletedAt IS NULL');

    if (query.name) {
      qb.andWhere('permission.name LIKE :name OR permission.code LIKE :name', {
        name: `%${query.name}%`,
      });
    }

    const results = await qb.getMany();

    const permissionIds = results.map((p) => p.id) || [];
    const parentPermissionIds = results
      .map((p) => p.parent?.id)
      .filter((id) => id !== undefined && id !== null);

    let modules: Permission[] = [];

    if (query.name) {
      // ✅ Only fetch selected parent modules
      modules = await this.permissionRepository.find({
        where: {
          isActive: true,
          id: In(parentPermissionIds),
          type: 'module',
          deletedAt: IsNull(),
        },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });
    } else {
      // ✅ Fallback → all modules
      modules = await this.permissionRepository.find({
        where: {
          isActive: true,
          parent: IsNull(),
          type: 'module',
          deletedAt: IsNull(),
        },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });
    }

    for (const module of modules) {
      module.childIds = (
        await this.permissionRepository.find({
          where: {
            isActive: true,
            parent: { id: module.id },
            deletedAt: IsNull(),
          },
        })
      ).map((permission) => permission.id);

      // ✅ Base children
      const basePages = await this.permissionRepository.find({
        where: {
          isActive: true,
          parent: { id: module.id },
          type: 'page',
          deletedAt: IsNull(),
        },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });

      const baseActions = await this.permissionRepository.find({
        where: {
          isActive: true,
          parent: { id: module.id },
          type: 'action',
          deletedAt: IsNull(),
        },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });

      const baseFeatures = await this.permissionRepository.find({
        where: {
          isActive: true,
          parent: { id: module.id },
          type: 'feature',
          deletedAt: IsNull(),
        },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });

      // ✅ Replace instead of push if filtering by ids
      module.pages = query.name
        ? await this.permissionRepository.find({
            where: {
              isActive: true,
              id: In(permissionIds),
              type: 'page',
              deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', name: 'ASC' },
          })
        : basePages;

      module.actions = query.name
        ? await this.permissionRepository.find({
            where: {
              isActive: true,
              id: In(permissionIds),
              type: 'action',
              deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', name: 'ASC' },
          })
        : baseActions;

      module.features = query.name
        ? await this.permissionRepository.find({
            where: {
              isActive: true,
              id: In(permissionIds),
              type: 'feature',
              deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', name: 'ASC' },
          })
        : baseFeatures;
    }

    return modules;
  }

  async getAllModulePermissions(): Promise<CommonResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      where: { isActive: true, type: 'module' },
      order: { sortOrder: 'ASC', name: 'ASC' },
      select: ['id', 'name', 'code'],
    });

    return permissions.map((perm) => ({
      value: perm.id,
      label: perm.name,
      code: perm.code,
    }));
  }

  async getAllPermissionsTree(): Promise<Permission[]> {
    return this.permissionRepository.findTrees({
      depth: 5,
      relations: ['children'],
    });
  }

  private mapToPermissionResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      parentId: permission?.parent?.id ? permission.parent.id : null,
      parentName: permission?.parent?.name ? permission.parent.name : null,
      type: permission.type,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      path: permission.path,
      icon: permission.icon,
      sortOrder: permission.sortOrder,
      isActive: permission.isActive,
      isSystem: permission.isSystem,
      isRequired: permission.isRequired,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      children: permission.children
        ? permission.children.map((child) =>
            this.mapToPermissionResponseDto(child),
          )
        : undefined,
    };
  }

  async getPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async getPermissionByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async deletePermissionById(id: number): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.isSystem) {
      throw new Error('Cannot delete system permissions');
    }

    await this.permissionRepository.softDelete(id);
  }

  // Change active status
  async changePermissionActiveStatus(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission)
      throw new NotFoundException(`Permission with ID ${id} not found`);

    permission.isActive = !permission.isActive;
    return this.permissionRepository.save(permission);
  }

  // Change system status
  async changePermissionSystemStatus(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission)
      throw new NotFoundException(`Permission with ID ${id} not found`);

    permission.isSystem = !permission.isSystem;
    return this.permissionRepository.save(permission);
  }

  async changePermissionRequiredStatus(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission)
      throw new NotFoundException(`Permission with ID ${id} not found`);

    permission.isRequired = !permission.isRequired;
    return this.permissionRepository.save(permission);
  }

  async findPermissionsByIds(ids: number[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { id: In(ids), isActive: true },
    });
  }

  async addOrUpdateRole(createDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.manager.transaction(
      async (transactionManager) => {
        let role: Role | null;

        const { permissionIds, ...roleData } = createDto;

        if (createDto.id) {
          role = await transactionManager.findOne(Role, {
            where: { id: createDto.id },
          });

          if (!role) {
            throw new NotFoundException('Role not found');
          }
          if (role.isSystem && createDto.isSystem === false) {
            throw new BadRequestException('Cannot modify system role status');
          }

          Object.assign(role, roleData);
        } else {
          const roleExists = await transactionManager.exists(Role, {
            where: { name: createDto.name },
          });

          if (roleExists) {
            throw new BadRequestException({ name: ['Role already exists'] });
          }

          role = transactionManager.create(Role, roleData as Partial<Role>);
        }

        role = await transactionManager.save(Role, role);

        if (permissionIds !== undefined) {
          if (createDto.id) {
            await transactionManager.delete(RolePermission, {
              roleId: role.id,
            });
          }

          if (permissionIds.length > 0) {
            const linkedPermissions = await transactionManager.find(Permission, {
              where: { id: In(permissionIds) },
              select: { id: true, accessPanel: true },
            });
            const panelById = new Map<number, 'Admin' | 'Company'>(
              linkedPermissions.map((permission) => [
                permission.id,
                permission.accessPanel === 'Admin' ? 'Admin' : 'Company',
              ]),
            );

            const rolePermissions = permissionIds.map((pid) => ({
              roleId: role.id,
              permissionId: pid,
              accessPanel: panelById.get(pid) || 'Company',
            }));

            if (rolePermissions && rolePermissions.length > 0) {
              await transactionManager.insert(
                RolePermission,
                rolePermissions as any[],
              );
            }
          }
        }

        return {
          ...role,
          rolePermissions:
            permissionIds?.map((pid) => ({ permissionId: pid })) || [],
        } as Role;
      },
    );
  }

  async getAllActiveRoles(): Promise<CommonResponseDto[]> {
    const isSuper = await this.callerIsSuperAdmin();
    if (!isSuper) {
      return this.getCompanyAssignableActiveRoles();
    }

    const roles = await this.roleRepository.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    return roles.map((role) => {
      const response = new CommonResponseDto();
      response.value = role.id;
      response.label = role.name;
      return response;
    });
  }

  /**
   * Roles a company Admin may assign: global `admin` + this app's custom roles.
   */
  async getCompanyAssignableActiveRoles(
    appId?: number | null,
  ): Promise<CommonResponseDto[]> {
    const activeAppId = appId ?? this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.isActive = :active', { active: true })
      .andWhere('role.deletedAt IS NULL')
      .andWhere(
        '(role.code = :adminCode OR (role.appId = :appId AND role.isSystem = 0))',
        { adminCode: 'admin', appId: activeAppId },
      )
      .orderBy('role.name', 'ASC')
      .getMany();

    return roles.map((role) => {
      const response = new CommonResponseDto();
      response.value = role.id;
      response.label = role.name;
      return response;
    });
  }

  async getCompanyRolesWithPagination(
    queryString: any,
  ): Promise<{ data: Role[]; total: number }> {
    const activeAppId = this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const query = this.roleRepository.createQueryBuilder('al');
    query
      .where('al.appId = :appId', { appId: activeAppId })
      .andWhere('al.isSystem = :isSystem', { isSystem: false })
      .andWhere('al.deletedAt IS NULL');

    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(`(al.name LIKE :search OR al.description LIKE :search)`, {
        search: `%${params.search.trim()}%`,
      });
    }

    if (params.isActive !== undefined && params.isActive !== '') {
      const isActive =
        params.isActive === true ||
        params.isActive === 'true' ||
        params.isActive === '1' ||
        params.isActive === 1;
      query.andWhere('al.isActive = :isActive', { isActive });
    }

    const featureData = await features.getQuery().getMany();
    const total = await query.getCount();

    return { data: featureData, total };
  }

  async getCompanyRoleById(id: number): Promise<Role> {
    const activeAppId = this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const role = await this.roleRepository.findOne({
      where: { id, appId: activeAppId, isSystem: false },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException('Company role not found');
    }

    return role;
  }

  async addOrUpdateCompanyRole(createDto: CreateRoleDto): Promise<Role> {
    const activeAppId = this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const assignableIds = await this.getCompanyAssignablePermissionIds();
    const permissionIds = createDto.permissionIds ?? [];

    if (permissionIds.length === 0) {
      throw new BadRequestException('At least one permission is required');
    }

    const invalid = permissionIds.filter((pid) => !assignableIds.has(pid));
    if (invalid.length > 0) {
      throw new BadRequestException(
        'One or more permissions are not assignable to company roles',
      );
    }

    return await this.roleRepository.manager.transaction(
      async (transactionManager) => {
        let role: Role | null;
        const name = createDto.name?.trim();
        if (!name) {
          throw new BadRequestException({ name: ['Role name is required'] });
        }

        if (createDto.id) {
          role = await transactionManager.findOne(Role, {
            where: { id: createDto.id },
          });

          if (!role) {
            throw new NotFoundException('Role not found');
          }
          if (role.isSystem || role.appId !== activeAppId) {
            throw new ForbiddenException(
              'Cannot edit system or other company roles',
            );
          }

          const duplicate = await transactionManager
            .createQueryBuilder(Role, 'r')
            .where('r.appId = :appId', { appId: activeAppId })
            .andWhere('r.name = :name', { name })
            .andWhere('r.id != :id', { id: role.id })
            .andWhere('r.deletedAt IS NULL')
            .getOne();

          if (duplicate) {
            throw new BadRequestException({ name: ['Role already exists'] });
          }

          role.name = name;
          role.description = createDto.description ?? role.description;
          role.isActive =
            createDto.isActive !== undefined
              ? createDto.isActive
              : role.isActive;
          role.isSystem = false;
          role.appId = activeAppId;
        } else {
          const roleExists = await transactionManager
            .createQueryBuilder(Role, 'r')
            .where('r.appId = :appId', { appId: activeAppId })
            .andWhere('r.name = :name', { name })
            .andWhere('r.deletedAt IS NULL')
            .getOne();

          if (roleExists) {
            throw new BadRequestException({ name: ['Role already exists'] });
          }

          role = transactionManager.create(Role, {
            name,
            description: createDto.description ?? undefined,
            code: this.slugifyRoleCode(name, activeAppId),
            appId: activeAppId,
            isSystem: false,
            isActive:
              createDto.isActive !== undefined ? createDto.isActive : true,
          });
        }

        role = await transactionManager.save(Role, role);

        await transactionManager.delete(RolePermission, { roleId: role.id });

        if (permissionIds.length > 0) {
          await transactionManager.insert(
            RolePermission,
            permissionIds.map((pid) => ({
              roleId: role!.id,
              permissionId: pid,
              appId: activeAppId,
              accessPanel: 'Company' as const,
            })),
          );
        }

        return {
          ...role,
          rolePermissions: permissionIds.map((pid) => ({
            permissionId: pid,
          })),
        } as Role;
      },
    );
  }

  async deleteCompanyRoleById(id: number): Promise<void> {
    const activeAppId = this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const role = await this.roleRepository.findOne({
      where: { id, appId: activeAppId },
    });

    if (!role) {
      throw new NotFoundException('Company role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.roleRepository.softDelete(id);
  }

  async changeCompanyRoleActiveStatus(id: number) {
    const activeAppId = this.getActiveAppId();
    if (!activeAppId) {
      throw new BadRequestException('Active company (app) is required');
    }

    const role = await this.roleRepository.findOne({
      where: { id, appId: activeAppId, isSystem: false },
    });

    if (!role) {
      throw new NotFoundException('Company role not found');
    }

    role.isActive = !role.isActive;
    return this.roleRepository.save(role);
  }

  /**
   * Permission IDs a company Admin may attach to custom roles:
   * Admin role ∩ active catalog − platform denylist.
   */
  async getCompanyAssignablePermissionIds(): Promise<Set<number>> {
    const adminRole = await this.roleRepository.findOne({
      where: { code: 'admin', deletedAt: IsNull() },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role template not found');
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: adminRole.id },
      relations: ['permission'],
    });

    const ids = new Set<number>();
    for (const rp of rolePermissions) {
      const perm = rp.permission;
      if (!perm || !perm.isActive || perm.deletedAt) continue;
      if (perm.accessPanel === 'Admin') continue;
      if (this.isDeniedCompanyPermissionCode(perm.code)) continue;
      ids.add(perm.id);
    }
    return ids;
  }

  async getCompanyAssignablePermissionList(query: any = {}): Promise<any[]> {
    const assignableIds = await this.getCompanyAssignablePermissionIds();
    if (assignableIds.size === 0) {
      return [];
    }

    const all = await this.getAllPermissions(query);

    return all
      .map((module: any) => {
        const pages = (module.pages || []).filter((p: any) =>
          assignableIds.has(p.id),
        );
        const actions = (module.actions || []).filter((p: any) =>
          assignableIds.has(p.id),
        );
        const features = (module.features || []).filter((p: any) =>
          assignableIds.has(p.id),
        );

        if (
          !assignableIds.has(module.id) &&
          pages.length === 0 &&
          actions.length === 0 &&
          features.length === 0
        ) {
          return null;
        }

        return {
          ...module,
          pages,
          actions,
          features,
          childIds: [
            ...pages.map((p: any) => p.id),
            ...actions.map((a: any) => a.id),
            ...features.map((f: any) => f.id),
          ],
        };
      })
      .filter(Boolean);
  }

  async getAllRoles(): Promise<CommonResponseDto[]> {
    const roles = await this.roleRepository.find({
      order: { name: 'ASC' },
    });

    return roles.map((role) => {
      const response = new CommonResponseDto();
      response.value = role.id;
      response.label = role.name;
      return response;
    });
  }

  // async getAllRoles(): Promise<Role[]> {
  //   return this.roleRepository.find({
  //     relations: ['permissions'],
  //     order: { name: 'ASC' },
  //   });
  // }

  // Change active status
  async changeRoleActiveStatus(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

    role.isActive = !role.isActive;

    return this.roleRepository.save(role);
  }

  // Change is system status
  async changeRoleIsSystemStatus(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

    role.isSystem = !role.isSystem;

    return this.roleRepository.save(role);
  }

  async findRolesByIds(ids: number[]): Promise<Role[]> {
    return this.roleRepository.find({
      where: { id: In(ids) },
    });
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      // relations: ['permissionIds'],
      relations: ['rolePermissions', 'rolePermissions.permission'], // 👈 load nested permissions
      // relations: ['rolePermissions'], // 👈 load nested permissions
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissionIds = await this.rolePermissionRepository.find({
      where: { roleId: role.id },
      select: ['permissionId'],
    });

    role.permissionIds;
    // role.permissionIds = permissionIds.map((rp) => rp.permissionId);

    // delete role.rolePermissions;
    // delete role.permissions;
    // delete role.permissionCodes;

    return role;
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async deleteRoleById(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot delete system roles');
    }

    await this.roleRepository.softDelete(id);
  }

  async assignRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.findPermissionsByIds(permissionIds);

    role.rolePermissions = permissions.map((permission) => {
      const rolePermission = new RolePermission();
      rolePermission.role = role;
      rolePermission.permission = permission;
      rolePermission.accessPanel =
        permission.accessPanel === 'Admin' ? 'Admin' : 'Company';
      return rolePermission;
    });

    return this.roleRepository.save(role);
  }

  async getRolePermissions(roleId: number): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    const permissions = new Set<string>();

    role?.rolePermissions.forEach((rolePermission) => {
      permissions.add(rolePermission.permission.name);
    });

    return Array.from(permissions);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
        'userPermissions',
        'userPermissions.permission',
      ],
    });

    if (!user) {
      return [];
    }

    const permissions = new Set<string>();


    // Get permissions from roles (codes + names for backward compatibility)
    user?.userRoles?.forEach((userRole) => {
      userRole.role?.rolePermissions?.forEach((rolePermission) => {
        if (rolePermission.permission?.code) {
          permissions.add(rolePermission.permission.code);
        }
        if (rolePermission.permission?.name) {
          permissions.add(rolePermission.permission.name);
        }

      });
    });

    // Get direct user permissions
    user?.userPermissions?.forEach((userPermission) => {
      if (userPermission.permission?.code) {
        permissions.add(userPermission.permission.code);
      }
      if (userPermission.permission?.name) {
        permissions.add(userPermission.permission.name);
      }
    });

    return Array.from(permissions);
  }

  async getUserPermissionCodes(
    userId: number,
    activeAppId?: number | null,
  ): Promise<string[]> {
    const rolePermissionRows = await this.userRepository
      .createQueryBuilder('user')
      .select('permission.code', 'code')
      .innerJoin('user.userRoles', 'ur')
      .innerJoin('ur.role', 'role', 'role.isActive = :roleActive', {
        roleActive: true,
      })
      .innerJoin('role.rolePermissions', 'rp')
      .innerJoin(
        'rp.permission',
        'permission',
        'permission.isActive = :permissionActive',
        { permissionActive: true },
      )
      .where('user.id = :userId', { userId })
      .andWhere(
        activeAppId == null
          ? '(ur.appId IS NULL OR ur.appId = :activeAppId OR :activeAppId IS NULL)'
          : '(ur.appId IS NULL OR ur.appId = :activeAppId)',
        { activeAppId },
      )
      .getRawMany();

    const permissionCodes = new Set<string>(
      rolePermissionRows.map((row) => row.code).filter(Boolean),
    );

    const userPermissionRows = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'permission.code AS code',
        'up.isGranted AS isGranted',
      ])
      .innerJoin('user.userPermissions', 'up')
      .innerJoin(
        'up.permission',
        'permission',
        'permission.isActive = :permissionActive',
        { permissionActive: true },
      )
      .where('user.id = :userId', { userId })
      .getRawMany();

    userPermissionRows.forEach((row) => {
      const isGranted =
        row.isGranted === true ||
        row.isGranted === 1 ||
        String(row.isGranted) === '1';
      if (isGranted && row.code) {
        permissionCodes.add(row.code);
      } else if (row.code) {
        permissionCodes.delete(row.code);
      }
    });

    return Array.from(permissionCodes);
  }

  async getUserMenu(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
        'userPermissions',
        'userPermissions.permission',
      ],
    });

    if (!user) {
      return [];
    }

    const menuPermissions = new Map<number, any>();

    // Collect menu-relevant permissions (modules and pages)
    user.userRoles.forEach((userRole) => {
      if (userRole.role.isActive) {
        userRole.role.rolePermissions
          .map((rolePermission) => {
            return rolePermission.permission;
          })
          .filter(
            (permission) =>
              permission.isActive &&
              (permission.type === 'module' || permission.type === 'page'),
          )
          .forEach((permission) => {
            menuPermissions.set(permission.id, { ...permission });
          });
      }
    });

    user.userPermissions.forEach((userPermission) => {
      if (
        userPermission.isGranted &&
        userPermission.permission.isActive &&
        (userPermission.permission.type === 'module' ||
          userPermission.permission.type === 'page')
      ) {
        menuPermissions.set(userPermission.permission.id, {
          ...userPermission.permission,
        });
      }
    });

    return this.buildMenuHierarchy(Array.from(menuPermissions.values()));
  }

  private buildMenuHierarchy(permissions: any[]): any[] {
    const permissionMap = new Map<number, any>();
    const roots: any[] = [];

    permissions.forEach((permission) => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    permissions.forEach((permission) => {
      const node = permissionMap.get(permission.id);
      if (permission.parent_id && permissionMap.has(permission.parent_id)) {
        const parent = permissionMap.get(permission.parent_id);
        parent.children.push(node);
        parent.children.sort((a, b) => a.sort_order - b.sort_order);
      } else {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => a.sort_order - b.sort_order);
  }

  async assignRolesToUser(
    userId: number,
    roleIds: number[],
  ): Promise<UserRole[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeAppId = this.getActiveAppId();
    const isSuper = await this.callerIsSuperAdmin();

    const uniqueRoleIds = [...new Set((roleIds || []).map(Number).filter(Boolean))];
    const roles =
      uniqueRoleIds.length > 0
        ? await this.findRolesByIds(uniqueRoleIds)
        : [];

    if (roles.length !== uniqueRoleIds.length) {
      throw new BadRequestException('One or more roles were not found');
    }

    if (!isSuper) {
      if (!activeAppId) {
        throw new BadRequestException('Active company (app) is required');
      }

      for (const role of roles) {
        if (
          RolePermissionService.COMPANY_ROLE_ASSIGN_DENYLIST.includes(role.code)
        ) {
          throw new ForbiddenException(
            `Cannot assign role: ${role.code || role.name}`,
          );
        }

        const isAdmin = role.code === 'admin';
        const isCompanyCustom =
          role.appId === activeAppId && !role.isSystem;

        if (!isAdmin && !isCompanyCustom) {
          throw new ForbiddenException(
            `Cannot assign role: ${role.name}. Only Admin and this company's custom roles are allowed.`,
          );
        }
      }

      // Replace only this app's role rows (preserve other apps / null-app platform rows)
      await this.userRoleRepository.delete({
        userId: user.id,
        appId: activeAppId,
      });
    } else {
      // Super Admin: replace rows for active app when set; otherwise replace all
      if (activeAppId) {
        await this.userRoleRepository.delete({
          userId: user.id,
          appId: activeAppId,
        });
      } else {
        await this.userRoleRepository.delete({ userId: user.id });
      }
    }

    if (roles.length === 0) {
      return [];
    }

    const userRoles = roles.map((role) => {
      const userRole = new UserRole();
      userRole.user = user;
      userRole.userId = user.id;
      userRole.role = role;
      userRole.roleId = role.id;
      userRole.appId = activeAppId;
      return userRole;
    });

    return await this.userRoleRepository.save(userRoles);
  }

  async userHasPermission(
    userId: number,
    permissionCode: string,
    activeAppId?: number | null,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionCodes(userId, activeAppId);
    return permissions.includes(permissionCode);
  }

  async userHasAnyPermission(
    userId: number,
    permissionCodes: string[],
    activeAppId?: number | null,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionCodes(userId, activeAppId);
    return permissionCodes.some((permission) =>
      permissions.includes(permission),
    );
  }

  async userHasAllPermissions(
    userId: number,
    permissionCodes: string[],
    activeAppId?: number | null,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionCodes(userId, activeAppId);
    return permissionCodes.every((permission) =>
      permissions.includes(permission),
    );
  }

  async roleHasAllPermissions(
    roleId: number,
    permissionCodes: string[],
  ): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId);
    return permissionCodes.every((permission) =>
      permissions.includes(permission),
    );
  }

  create(createRolePermissionDto: CreateRolePermissionDto) {
    return 'This action adds a new rolePermission';
  }

  async getRolesWithPagination(
    queryString: any,
  ): Promise<{ data: Role[]; total: number }> {
    // Start with a query to filter out soft-deleted records
    const query = this.roleRepository.createQueryBuilder('al'); // 'al' is alias of the table name 'cm_users'
    // query.leftJoinAndSelect('al.rolePermissions', 'rolePermissions');
    // query.leftJoinAndSelect('al.userRoles', 'userRoles');
    // query.where('al.deletedAt IS NULL');

    // Apply filtering, sorting, field limiting, and pagination using APIFeatures
    const features = new APIFeatures(query, queryString)
      .searching()
      .sort()
      .limitFields()
      .paginate();

    const params = queryString?.params ? JSON.parse(queryString?.params) : {};

    if (params.search) {
      query.andWhere(`(al.name LIKE :search OR al.description LIKE :search)`, {
        search: `%${params.search.trim()}%`,
      });
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

  findAll() {
    return `This action returns all rolePermission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolePermission`;
  }

  update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    return `This action updates a #${id} rolePermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolePermission`;
  }
}
