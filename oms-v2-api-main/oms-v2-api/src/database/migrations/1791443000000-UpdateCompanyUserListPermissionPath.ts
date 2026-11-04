import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyUserListPermissionPath1791443000000 implements MigrationInterface {
  name = 'UpdateCompanyUserListPermissionPath1791443000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE permissions
      SET path = '/settings/company-user-list',
          updated_at = CURRENT_TIMESTAMP
      WHERE path = '/settings/company-settings/user-list'
         OR (code = 'settings.company_user_list' AND (path IS NULL OR path != '/settings/company-user-list'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE permissions
      SET path = '/settings/company-settings/user-list',
          updated_at = CURRENT_TIMESTAMP
      WHERE path = '/settings/company-user-list'
         OR (code = 'settings.company_user_list' AND path = '/settings/company-user-list')
    `);
  }
}
