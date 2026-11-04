import { MigrationInterface, QueryRunner } from 'typeorm';
import { runSqlFile } from '../utils/run-sql-file';

/**
 * Initial schema captured from local MySQL `revinr_oms_new` (119 tables + views).
 * Intended for fresh databases. Existing DBs already matching this schema can mark
 * this migration as run without re-executing.
 */
export class InitialSchema1741210000000 implements MigrationInterface {
  name = 'InitialSchema1741210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await queryRunner.query(`SHOW TABLES LIKE 'users'`);
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(
        '[InitialSchema] Tables already exist — skipping destructive schema SQL. Migration marked as applied.',
      );
      return;
    }

    await runSqlFile(queryRunner, 'sql/schema/001_full_schema.sql');
    await runSqlFile(queryRunner, 'sql/schema/002_views.sql');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Destructive full rollback is intentionally not automated.
    // Drop the database manually if you need a clean slate.
    await queryRunner.query(
      `SELECT 'InitialSchema down() is a no-op. Drop DB manually if needed.' AS message`,
    );
  }
}
