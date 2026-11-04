import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureSettingsMenuModule1790000004000 implements MigrationInterface {
  name = 'EnsureSettingsMenuModule1790000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE permissions
      SET
        name = 'Settings',
        code = 'settings',
        type = 'module',
        menu_position_id = 264,
        path = '',
        is_active = 1,
        is_required = 1,
        is_system = 0,
        sort_order = 9,
        updated_at = CURRENT_TIMESTAMP
      WHERE code = 'settings' AND type = 'module'
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        menu_position_id = 264,
        parent_id = (
          SELECT id FROM (
            SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1
          ) AS settings_module
        ),
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE code IN (
        'company-settings',
        'settings.permissions',
        'settings.roles-and-permissions',
        'settings.user-list',
        'settings.master_documents',
        'settings.company_documents',
        'settings.website-settings',
        'settings.blog-settings'
      )
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.id IN (3, 14)
        AND (
          (p.code = 'settings' AND p.type = 'module')
          OR p.parent_id = (
            SELECT id FROM (
              SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1
            ) AS settings_module
          )
        )
        AND p.type IN ('module', 'page')
        AND p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE permissions
      SET is_required = 0, sort_order = 7, updated_at = CURRENT_TIMESTAMP
      WHERE code = 'settings' AND type = 'module'
    `);
  }
}
