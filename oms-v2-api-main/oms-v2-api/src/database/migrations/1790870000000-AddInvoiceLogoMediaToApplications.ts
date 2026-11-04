import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceLogoMediaToApplications1790870000000
  implements MigrationInterface
{
  name = 'AddInvoiceLogoMediaToApplications1790870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns: { COLUMN_NAME: string }[] = await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'applications'
        AND COLUMN_NAME = 'invoice_logo_media_id'
    `);

    if (columns.length > 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE applications
        ADD COLUMN invoice_logo_media_id int unsigned NULL DEFAULT NULL AFTER logo_media_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns: { COLUMN_NAME: string }[] = await queryRunner.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'applications'
        AND COLUMN_NAME = 'invoice_logo_media_id'
    `);

    if (columns.length === 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE applications
        DROP COLUMN invoice_logo_media_id
    `);
  }
}
