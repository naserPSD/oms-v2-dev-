import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMasterCategoriesMenu1790750000000 implements MigrationInterface {
  name = 'AddMasterCategoriesMenu1790750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path, icon,
        sort_order, is_active, is_required, is_system, created_at, updated_at
      )
      SELECT
        p.id, 264, 'page', 'Master Categories', 'accounts.master_categories',
        'Master Categories Management',
        '/accounts/master-categories', '<i class="fa fa-list"></i>',
        45, 1, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'accounts' AND p.type = 'module'
        AND NOT EXISTS (
          SELECT 1 FROM permissions existing WHERE existing.code = 'accounts.master_categories'
        )
      LIMIT 1
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.id IN (3, 14)
        AND p.code = 'accounts.master_categories'
        AND NOT EXISTS (
          SELECT 1
          FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (SELECT id FROM permissions WHERE code = 'accounts.master_categories')
    `);

    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'accounts.master_categories'
    `);
  }
}
