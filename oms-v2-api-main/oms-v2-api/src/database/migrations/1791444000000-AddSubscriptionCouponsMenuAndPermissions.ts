import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionCouponsMenuAndPermissions1791444000000 implements MigrationInterface {
  name = 'AddSubscriptionCouponsMenuAndPermissions1791444000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const leftSidebarMenuPositionId = 264;

    // 1. Ensure Subscription module exists as Admin module
    await queryRunner.query(`
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

    await queryRunner.query(`
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
    await queryRunner.query(`
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
    await queryRunner.query(`
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

    await queryRunner.query(`
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
    await queryRunner.query(`
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

    await queryRunner.query(`
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

    await queryRunner.query(`
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

    // 5. Grant permissions to Admin & Super Admin roles
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP
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
            'subscription.coupons_delete'
          )
        )
        AND p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT id FROM permissions
        WHERE code IN (
          'subscription.coupons',
          'subscription.coupons_add',
          'subscription.coupons_edit',
          'subscription.coupons_delete'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM permissions
      WHERE code IN (
        'subscription.coupons_add',
        'subscription.coupons_edit',
        'subscription.coupons_delete',
        'subscription.coupons'
      )
    `);
  }
}
