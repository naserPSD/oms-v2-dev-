import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExposeAccountPermissionsInSettings1790000002000 implements MigrationInterface {
  name = 'ExposeAccountPermissionsInSettings1790000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE permissions SET is_system = 0, updated_at = CURRENT_TIMESTAMP WHERE code LIKE 'accounts%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE permissions SET is_system = 1, updated_at = CURRENT_TIMESTAMP WHERE code LIKE 'accounts%'`,
    );
  }
}
