import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Company User Roles:
 * - Settings page + CRUD actions for company Admins
 * - Grant to Admin + Super Admin
 * - Revoke global Roles/Permissions pages from Admin (Super Admin keeps them)
 * - Allow per-app role names: unique (app_id, name) instead of global name unique
 */
export class SeedCompanyUserRoles1790000008000 implements MigrationInterface {
  name = 'SeedCompanyUserRoles1790000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Schema: per-app role name uniqueness ---
    const nameIndexes: Array<{ INDEX_NAME: string }> = await queryRunner.query(`
      SELECT INDEX_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'roles'
        AND COLUMN_NAME = 'name'
        AND NON_UNIQUE = 0
    `);
    for (const row of nameIndexes) {
      await queryRunner.query(
        `ALTER TABLE \`roles\` DROP INDEX \`${row.INDEX_NAME}\``,
      );
    }

    const codeIndexes: Array<{ INDEX_NAME: string }> = await queryRunner.query(`
      SELECT INDEX_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'roles'
        AND COLUMN_NAME = 'code'
        AND NON_UNIQUE = 0
    `);
    for (const row of codeIndexes) {
      await queryRunner.query(
        `ALTER TABLE \`roles\` DROP INDEX \`${row.INDEX_NAME}\``,
      );
    }

    const existingAppNameIdx: Array<{ INDEX_NAME: string }> =
      await queryRunner.query(`
        SELECT INDEX_NAME
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'roles'
          AND INDEX_NAME = 'idx_roles_app_id_name'
        LIMIT 1
      `);
    if (!existingAppNameIdx.length) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX \`idx_roles_app_id_name\`
        ON \`roles\` (\`app_id\`, \`name\`)
      `);
    }

    // --- Permissions: page ---
    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path,
        icon, sort_order, is_active, is_required, is_system, created_at, updated_at
      )
      SELECT
        sm.id, 264, 'page', 'Company User Roles', 'settings.company-user-roles',
        'Manage company-scoped user roles', '/settings/company-user-roles',
        '', 8, 1, 0, 0, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
      FROM permissions sm
      WHERE sm.code = 'settings' AND sm.type = 'module' AND sm.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM permissions p
          WHERE p.code = 'settings.company-user-roles' AND p.deleted_at IS NULL
        )
      LIMIT 1
    `);

    const actionDefs: Array<{
      code: string;
      name: string;
      sort: number;
    }> = [
      {
        code: 'settings.company_user_roles_add',
        name: 'Add Company User Role',
        sort: 1,
      },
      {
        code: 'settings.company_user_roles_edit',
        name: 'Edit Company User Role',
        sort: 2,
      },
      {
        code: 'settings.company_user_roles_delete',
        name: 'Delete Company User Role',
        sort: 3,
      },
    ];

    for (const action of actionDefs) {
      await queryRunner.query(
        `
        INSERT INTO permissions (
          parent_id, menu_position_id, type, name, code, description, path,
          icon, sort_order, is_active, is_required, is_system, created_at, updated_at
        )
        SELECT
          page.id, 0, 'action', ?, ?, ?, '',
          '', ?, 1, 0, 0, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
        FROM permissions page
        WHERE page.code = 'settings.company-user-roles' AND page.type = 'page'
          AND page.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM permissions p
            WHERE p.code = ? AND p.deleted_at IS NULL
          )
        LIMIT 1
      `,
        [action.name, action.code, action.name, action.sort, action.code],
      );
    }

    // Grant page + actions to Admin and Super Admin
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP(6)
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code IN ('admin', 'super_admin')
        AND r.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND (
          p.code = 'settings.company-user-roles'
          OR p.code IN (
            'settings.company_user_roles_add',
            'settings.company_user_roles_edit',
            'settings.company_user_roles_delete'
          )
        )
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    // Hide global Roles/Permissions menus from company Admin
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN roles r ON r.id = rp.role_id
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE r.code = 'admin'
        AND (
          p.code IN (
            'settings.permissions',
            'settings.roles-and-permissions',
            'settings.permission_list_add',
            'settings.permission_list_edit',
            'settings.permission_list_delete',
            'settings.role_list_add',
            'settings.role_list_edit',
            'settings.role_list_delete',
            'settings.view_role'
          )
          OR p.parent_id IN (
            SELECT id FROM (
              SELECT id FROM permissions
              WHERE code IN ('settings.permissions', 'settings.roles-and-permissions')
                AND deleted_at IS NULL
            ) AS pages
          )
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE p.code IN (
        'settings.company-user-roles',
        'settings.company_user_roles_add',
        'settings.company_user_roles_edit',
        'settings.company_user_roles_delete'
      )
    `);

    await queryRunner.query(`
      DELETE FROM permissions
      WHERE code IN (
        'settings.company_user_roles_add',
        'settings.company_user_roles_edit',
        'settings.company_user_roles_delete',
        'settings.company-user-roles'
      )
    `);

    const existingAppNameIdx: Array<{ INDEX_NAME: string }> =
      await queryRunner.query(`
        SELECT INDEX_NAME
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'roles'
          AND INDEX_NAME = 'idx_roles_app_id_name'
        LIMIT 1
      `);
    if (existingAppNameIdx.length) {
      await queryRunner.query(
        `DROP INDEX \`idx_roles_app_id_name\` ON \`roles\``,
      );
    }

    await queryRunner.query(`
      ALTER TABLE \`roles\` ADD UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`)
    `);
  }
}
