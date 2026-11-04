import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAccountPermissions1790000001000 implements MigrationInterface {
  name = 'SeedAccountPermissions1790000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      {
        name: 'Accounts',
        code: 'accounts',
        type: 'module',
        description: 'Accounting module',
        path: '/accounts',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 1,
      },
      {
        name: 'Income',
        code: 'accounts.income',
        type: 'page',
        description: 'Income management',
        path: '/accounts/incomes',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 10,
      },
      {
        name: 'Expense',
        code: 'accounts.expense',
        type: 'page',
        description: 'Expense management',
        path: '/accounts/expenses',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 20,
      },
      {
        name: 'Invoice',
        code: 'accounts.invoice',
        type: 'page',
        description: 'Invoice management',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 30,
      },
      {
        name: 'Categories',
        code: 'accounts.category',
        type: 'page',
        description: 'Category management',
        path: '/accounts/categories',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 40,
      },
      {
        name: 'Reports',
        code: 'accounts.report',
        type: 'page',
        description: 'Accounting reports',
        path: '/accounts/reports',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 50,
      },
      {
        name: 'View Income',
        code: 'accounts.income.view',
        type: 'action',
        description: 'View income records',
        path: '/accounts/incomes',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 110,
      },
      {
        name: 'Create Income',
        code: 'accounts.income.create',
        type: 'action',
        description: 'Create income records',
        path: '/accounts/incomes',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 111,
      },
      {
        name: 'Update Income',
        code: 'accounts.income.update',
        type: 'action',
        description: 'Update income records',
        path: '/accounts/incomes',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 112,
      },
      {
        name: 'Delete Income',
        code: 'accounts.income.delete',
        type: 'action',
        description: 'Delete income records',
        path: '/accounts/incomes',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 113,
      },
      {
        name: 'View Expense',
        code: 'accounts.expense.view',
        type: 'action',
        description: 'View expense records',
        path: '/accounts/expenses',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 210,
      },
      {
        name: 'Create Expense',
        code: 'accounts.expense.create',
        type: 'action',
        description: 'Create expense records',
        path: '/accounts/expenses',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 211,
      },
      {
        name: 'Update Expense',
        code: 'accounts.expense.update',
        type: 'action',
        description: 'Update expense records',
        path: '/accounts/expenses',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 212,
      },
      {
        name: 'Delete Expense',
        code: 'accounts.expense.delete',
        type: 'action',
        description: 'Delete expense records',
        path: '/accounts/expenses',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 213,
      },
      {
        name: 'View Invoice',
        code: 'accounts.invoice.view',
        type: 'action',
        description: 'View invoice records',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 310,
      },
      {
        name: 'Create Invoice',
        code: 'accounts.invoice.create',
        type: 'action',
        description: 'Create invoice records',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 311,
      },
      {
        name: 'Update Invoice',
        code: 'accounts.invoice.update',
        type: 'action',
        description: 'Update invoice records',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 312,
      },
      {
        name: 'Delete Invoice',
        code: 'accounts.invoice.delete',
        type: 'action',
        description: 'Delete invoice records',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 313,
      },
      {
        name: 'Download Invoice',
        code: 'accounts.invoice.download',
        type: 'action',
        description: 'Download invoice PDF',
        path: '/accounts/invoices',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 314,
      },
      {
        name: 'View Categories',
        code: 'accounts.category.view',
        type: 'action',
        description: 'View categories',
        path: '/accounts/categories',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 410,
      },
      {
        name: 'Create Category',
        code: 'accounts.category.create',
        type: 'action',
        description: 'Create category',
        path: '/accounts/categories',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 411,
      },
      {
        name: 'Update Category',
        code: 'accounts.category.update',
        type: 'action',
        description: 'Update category',
        path: '/accounts/categories',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 412,
      },
      {
        name: 'Delete Category',
        code: 'accounts.category.delete',
        type: 'action',
        description: 'Delete category',
        path: '/accounts/categories',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 413,
      },
      {
        name: 'View Reports',
        code: 'accounts.report.view',
        type: 'action',
        description: 'View accounting reports',
        path: '/accounts/reports',
        is_active: 1,
        is_system: 1,
        is_required: 1,
        sort_order: 510,
      },
    ];

    const sql = `
      INSERT INTO permissions (
        name,
        code,
        type,
        description,
        path,
        sort_order,
        is_active,
        is_system,
        is_required,
        created_at,
        updated_at
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        path = VALUES(path),
        type = VALUES(type),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        is_system = VALUES(is_system),
        is_required = VALUES(is_required),
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = permissions.map((permission) => [
      permission.name,
      permission.code,
      permission.type,
      permission.description,
      permission.path,
      permission.sort_order,
      permission.is_active,
      permission.is_system,
      permission.is_required,
      new Date(),
      new Date(),
    ]);

    await queryRunner.query(sql, [values]);

    const moduleRow = await queryRunner.query(
      `SELECT id FROM permissions WHERE code = 'accounts' LIMIT 1`,
    );

    if (!moduleRow[0]) {
      return;
    }

    const moduleId = moduleRow[0].id;
    const parentRows = await queryRunner.query(
      `SELECT id, code FROM permissions WHERE code IN ('accounts.income','accounts.expense','accounts.invoice','accounts.category','accounts.report')`,
    );

    const parentMap = new Map(parentRows.map((row) => [row.code, row.id]));

    const pagePermissions = [
      'accounts.income',
      'accounts.expense',
      'accounts.invoice',
      'accounts.category',
      'accounts.report',
    ];

    for (const code of pagePermissions) {
      const row = await queryRunner.query(
        `SELECT id FROM permissions WHERE code = ? LIMIT 1`,
        [code],
      );
      if (!row[0]) continue;
      await queryRunner.query(
        `UPDATE permissions SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [moduleId, row[0].id],
      );
    }

    const actionPermissions = [
      'accounts.income.view',
      'accounts.income.create',
      'accounts.income.update',
      'accounts.income.delete',
      'accounts.expense.view',
      'accounts.expense.create',
      'accounts.expense.update',
      'accounts.expense.delete',
      'accounts.invoice.view',
      'accounts.invoice.create',
      'accounts.invoice.update',
      'accounts.invoice.delete',
      'accounts.invoice.download',
      'accounts.category.view',
      'accounts.category.create',
      'accounts.category.update',
      'accounts.category.delete',
      'accounts.report.view',
    ];

    for (const code of actionPermissions) {
      const parentCode = code.split('.').slice(0, 2).join('.');
      const parentId = parentMap.get(parentCode);
      if (!parentId) continue;
      await queryRunner.query(
        `UPDATE permissions SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE code = ?`,
        [parentId, code],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = [
      'accounts',
      'accounts.income',
      'accounts.expense',
      'accounts.invoice',
      'accounts.category',
      'accounts.report',
      'accounts.income.view',
      'accounts.income.create',
      'accounts.income.update',
      'accounts.income.delete',
      'accounts.expense.view',
      'accounts.expense.create',
      'accounts.expense.update',
      'accounts.expense.delete',
      'accounts.invoice.view',
      'accounts.invoice.create',
      'accounts.invoice.update',
      'accounts.invoice.delete',
      'accounts.invoice.download',
      'accounts.category.view',
      'accounts.category.create',
      'accounts.category.update',
      'accounts.category.delete',
      'accounts.report.view',
    ];

    const placeholders = codes.map(() => '?').join(', ');
    await queryRunner.query(`DELETE FROM permissions WHERE code IN (${placeholders})`, codes);
  }
}
