import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminSettingsStatusesMenu1791445000000
  implements MigrationInterface
{
  name = 'AddAdminSettingsStatusesMenu1791445000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const leftSidebarMenuPositionId = 264;

    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path, icon,
        sort_order, is_active, is_required, is_system, access_panel, created_at, updated_at
      )
      SELECT
        sm.id, ${leftSidebarMenuPositionId}, 'page', 'Statuses', 'settings.statuses',
        'Manage status groups and statuses',
        '/admin/settings/statuses', '<i class="bx bx-list-check"></i>',
        13, 1, 1, 1, 'Admin', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
      FROM permissions sm
      WHERE sm.code = 'settings' AND sm.type = 'module' AND sm.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM permissions p
          WHERE p.code = 'settings.statuses' AND p.deleted_at IS NULL
        )
      LIMIT 1
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        parent_id = (SELECT id FROM (SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1) AS t),
        name = 'Statuses',
        path = '/admin/settings/statuses',
        access_panel = 'Admin',
        menu_position_id = ${leftSidebarMenuPositionId},
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP(6)
      WHERE code = 'settings.statuses' AND deleted_at IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP(6)
      FROM roles r
      CROSS JOIN permissions p
      WHERE (r.code IN ('super_admin', 'admin') OR r.id IN (1, 3, 14))
        AND r.deleted_at IS NULL
        AND p.code = 'settings.statuses'
        AND p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE p.code = 'settings.statuses'
    `);
    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'settings.statuses'
    `);
  }
}
