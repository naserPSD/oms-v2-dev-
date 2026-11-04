import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMasterCategoryManageAction1790770000000 implements MigrationInterface {
  name = 'AddMasterCategoryManageAction1790770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert the 'master.category.manage' action permission under 'accounts.master_categories' page
    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path, icon,
        sort_order, is_active, is_required, is_system, created_at, updated_at
      )
      SELECT
        p.id, 264, 'action', 'Manage Master Categories', 'master.category.manage',
        'Can view, create, update and delete master categories',
        '/accounts/master-categories', '',
        1, 1, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'accounts.master_categories' AND p.type = 'page'
        AND NOT EXISTS (
          SELECT 1 FROM permissions existing WHERE existing.code = 'master.category.manage'
        )
      LIMIT 1
    `);

    // Assign to Super Admin (role_id = 3)
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, 3, p.id, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'master.category.manage'
      AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp WHERE rp.role_id = 3 AND rp.permission_id = p.id
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (SELECT id FROM permissions WHERE code = 'master.category.manage')
    `);

    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'master.category.manage'
    `);
  }
}
