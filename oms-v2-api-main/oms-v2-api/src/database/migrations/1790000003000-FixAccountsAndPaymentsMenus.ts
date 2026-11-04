import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAccountsAndPaymentsMenus1790000003000 implements MigrationInterface {
  name = 'FixAccountsAndPaymentsMenus1790000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Align Accounts Management module with frontend routes and left sidebar
    await queryRunner.query(`
      UPDATE permissions
      SET
        name = 'Accounts Management',
        path = '/accounts',
        menu_position_id = 264,
        is_active = 1,
        is_required = 1,
        is_system = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE code = 'accounts' AND type = 'module'
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        menu_position_id = 264,
        is_active = 1,
        is_system = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE code IN (
        'accounts.income',
        'accounts.expense',
        'accounts.invoice',
        'accounts.category',
        'accounts.report'
      )
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        path = CASE code
          WHEN 'accounts.income' THEN '/accounts/incomes'
          WHEN 'accounts.expense' THEN '/accounts/expenses'
          WHEN 'accounts.invoice' THEN '/accounts/invoices'
          WHEN 'accounts.category' THEN '/accounts/categories'
          WHEN 'accounts.report' THEN '/accounts/reports'
          ELSE path
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE code IN (
        'accounts.income',
        'accounts.expense',
        'accounts.invoice',
        'accounts.category',
        'accounts.report'
      )
    `);

    // Keep action permissions active (Create Income was toggled off accidentally)
    await queryRunner.query(`
      UPDATE permissions
      SET is_active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE code LIKE 'accounts.%' AND type = 'action'
    `);

    // Normalize Payments module
    await queryRunner.query(`
      UPDATE permissions
      SET
        name = 'Payments',
        path = '',
        menu_position_id = 264,
        is_active = 1,
        is_required = 1,
        is_system = 0,
        sort_order = 10,
        updated_at = CURRENT_TIMESTAMP
      WHERE code = 'payment' AND type = 'module'
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        name = 'Payment Dashboard',
        code = 'payment.dashboard',
        path = '/admin/payment-dashboard',
        menu_position_id = 264,
        parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'payment' AND type = 'module' LIMIT 1) AS t),
        is_active = 1,
        is_required = 1,
        is_system = 0,
        sort_order = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE code IN ('admin.payment_dashboard', 'payment.dashboard') AND type = 'page'
    `);

    // Ensure Payment History page under Payments module
    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path, icon,
        sort_order, is_active, is_required, is_system, created_at, updated_at
      )
      SELECT
        p.id, 264, 'page', 'Payment History', 'payment.history',
        'Subscription payment and transaction history',
        '/subscription/payments/payment-history', '<i class="fa fa-history"></i>',
        2, 1, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'payment' AND p.type = 'module'
        AND NOT EXISTS (
          SELECT 1 FROM permissions existing WHERE existing.code = 'payment.history'
        )
      LIMIT 1
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'payment' AND type = 'module' LIMIT 1) AS t),
        menu_position_id = 264,
        path = '/subscription/payments/payment-history',
        name = 'Payment History',
        is_active = 1,
        is_system = 0,
        sort_order = 2,
        updated_at = CURRENT_TIMESTAMP
      WHERE code = 'payment.history'
    `);

    // Assign missing Accounts + Payments permissions to Super Admin (3) and Admin (14)
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.id IN (3, 14)
        AND (
          p.code = 'accounts'
          OR p.code LIKE 'accounts.%'
          OR p.code = 'payment'
          OR p.code LIKE 'payment.%'
          OR p.code = 'admin.payment_dashboard'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    // Deduplicate Admin role_permissions for accounts/payment ids
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN role_permissions rp2
        ON rp.role_id = rp2.role_id
        AND rp.permission_id = rp2.permission_id
        AND rp.id > rp2.id
      WHERE rp.role_id = 14
        AND rp.permission_id IN (
          SELECT id FROM permissions
          WHERE code = 'accounts'
             OR code LIKE 'accounts.%'
             OR code = 'payment'
             OR code LIKE 'payment.%'
             OR code = 'admin.payment_dashboard'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE permissions
      SET code = 'admin.payment_dashboard', updated_at = CURRENT_TIMESTAMP
      WHERE code = 'payment.dashboard'
    `);

    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (SELECT id FROM permissions WHERE code = 'payment.history')
    `);

    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'payment.history'
    `);
  }
}
