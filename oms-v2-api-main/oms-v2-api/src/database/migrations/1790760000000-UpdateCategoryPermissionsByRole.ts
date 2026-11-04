import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCategoryPermissionsByRole1790760000000 implements MigrationInterface {
  name = 'UpdateCategoryPermissionsByRole1790760000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove regular Categories ('accounts.category') from Super Admin (role_id = 3)
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 3 AND p.code = 'accounts.category'
    `);

    // 2. Remove Master Categories ('accounts.master_categories') from Admin (role_id = 14)
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 14 AND p.code = 'accounts.master_categories'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Assign regular Categories back to Super Admin
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, 3, p.id, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'accounts.category'
      AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp WHERE rp.role_id = 3 AND rp.permission_id = p.id
      )
    `);

    // Revert: Assign Master Categories back to Admin
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, 14, p.id, CURRENT_TIMESTAMP
      FROM permissions p
      WHERE p.code = 'accounts.master_categories'
      AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp WHERE rp.role_id = 14 AND rp.permission_id = p.id
      )
    `);
  }
}
