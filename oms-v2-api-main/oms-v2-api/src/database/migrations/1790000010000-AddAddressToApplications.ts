import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToApplications1790000010000
  implements MigrationInterface
{
  name = 'AddAddressToApplications1790000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns: { COLUMN_NAME: string }[] = await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'applications'
        AND COLUMN_NAME = 'address'
    `);

    if (columns.length > 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE applications
        ADD COLUMN address text NULL AFTER website_url
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns: { COLUMN_NAME: string }[] = await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'applications'
        AND COLUMN_NAME = 'address'
    `);

    if (columns.length === 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE applications
        DROP COLUMN address
    `);
  }
}
