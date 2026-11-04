import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Company delete cascades through employees, departments, subscriptions, etc.
 * Any child FK still on NO ACTION/RESTRICT breaks DELETE FROM applications.
 * Convert the whole schema to ON DELETE CASCADE except users.active_app_id → SET NULL.
 */
export class RefreshAllForeignKeysCascade1791448000000
  implements MigrationInterface
{
  name = 'RefreshAllForeignKeysCascade1791448000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fks: Array<{
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }> = await queryRunner.query(`
      SELECT
        k.TABLE_NAME,
        k.COLUMN_NAME,
        k.CONSTRAINT_NAME,
        k.REFERENCED_TABLE_NAME,
        k.REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.REFERENCED_TABLE_NAME IS NOT NULL
        AND NOT (
          k.TABLE_NAME = 'users'
          AND k.COLUMN_NAME = 'active_app_id'
          AND k.REFERENCED_TABLE_NAME = 'applications'
        )
        AND r.DELETE_RULE IN ('NO ACTION', 'RESTRICT')
    `);

    for (const fk of fks) {
      await queryRunner.query(
        `ALTER TABLE \`${fk.TABLE_NAME}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
      );
      await queryRunner.query(`
        ALTER TABLE \`${fk.TABLE_NAME}\`
        ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\`
        FOREIGN KEY (\`${fk.COLUMN_NAME}\`)
        REFERENCES \`${fk.REFERENCED_TABLE_NAME}\` (\`${fk.REFERENCED_COLUMN_NAME}\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  public async down(): Promise<void> {
    // Irreversible in practice — restore from backup if needed.
  }
}
