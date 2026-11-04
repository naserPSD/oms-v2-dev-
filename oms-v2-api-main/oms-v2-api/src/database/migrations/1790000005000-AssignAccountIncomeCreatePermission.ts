import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignAccountIncomeCreatePermission1790000005000 implements MigrationInterface {
  name = 'AssignAccountIncomeCreatePermission1790000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT roles.app_id, roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM roles
      INNER JOIN permissions
        ON permissions.code = 'accounts.income.create'
      WHERE roles.is_system = 1
        AND roles.is_active = 1
        AND roles.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM role_permissions existing
          WHERE existing.role_id = roles.id
            AND existing.permission_id = permissions.id
            AND (existing.app_id = roles.app_id OR (existing.app_id IS NULL AND roles.app_id IS NULL))
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE role_permissions
      FROM role_permissions
      INNER JOIN permissions
        ON permissions.id = role_permissions.permission_id
      INNER JOIN roles
        ON roles.id = role_permissions.role_id
      WHERE permissions.code = 'accounts.income.create'
        AND roles.is_system = 1
    `);
  }
}
