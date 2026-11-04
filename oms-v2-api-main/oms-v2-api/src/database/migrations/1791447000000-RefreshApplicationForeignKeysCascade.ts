import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ensures every app_id → applications(id) FK uses ON DELETE CASCADE (except
 * users.active_app_id → SET NULL). Also adds missing FKs so deleting a company
 * cascades in MariaDB, not only in TypeORM metadata.
 */
export class RefreshApplicationForeignKeysCascade1791447000000
  implements MigrationInterface
{
  name = 'RefreshApplicationForeignKeysCascade1791447000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.convertExistingApplicationFksToCascade(queryRunner);
    await this.ensureUsersActiveAppSetNull(queryRunner);
    await this.addMissingApplicationFks(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const added: Array<{ TABLE_NAME: string; CONSTRAINT_NAME: string }> =
      await queryRunner.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND CONSTRAINT_NAME LIKE 'FK_%_app_id_applications'
    `);

    for (const row of added) {
      await queryRunner.query(
        `ALTER TABLE \`${row.TABLE_NAME}\` DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``,
      );
    }
  }

  private async convertExistingApplicationFksToCascade(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const fks: Array<{
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }> = await queryRunner.query(`
      SELECT k.TABLE_NAME, k.COLUMN_NAME, k.CONSTRAINT_NAME, k.REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.REFERENCED_TABLE_NAME = 'applications'
        AND NOT (k.TABLE_NAME = 'users' AND k.COLUMN_NAME = 'active_app_id')
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
        REFERENCES \`applications\` (\`${fk.REFERENCED_COLUMN_NAME}\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  private async ensureUsersActiveAppSetNull(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const existing: Array<{ CONSTRAINT_NAME: string }> = await queryRunner.query(`
      SELECT k.CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.TABLE_NAME = 'users'
        AND k.COLUMN_NAME = 'active_app_id'
        AND k.REFERENCED_TABLE_NAME = 'applications'
      LIMIT 1
    `);

    if (existing.length > 0) {
      return;
    }

    await queryRunner.query(`
      UPDATE \`users\` u
      LEFT JOIN \`applications\` a ON a.id = u.active_app_id
      SET u.active_app_id = NULL
      WHERE u.active_app_id IS NOT NULL AND a.id IS NULL
    `);

    const col: Array<{ COLUMN_NAME: string }> = await queryRunner.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'active_app_id'
    `);

    if (col.length === 0) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD CONSTRAINT \`FK_users_active_app_id_applications\`
      FOREIGN KEY (\`active_app_id\`)
      REFERENCES \`applications\` (\`id\`)
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  private async addMissingApplicationFks(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const appIdColumns: Array<{
      TABLE_NAME: string;
      IS_NULLABLE: string;
      COLUMN_TYPE: string;
    }> = await queryRunner.query(`
      SELECT c.TABLE_NAME, c.IS_NULLABLE, c.COLUMN_TYPE
      FROM information_schema.COLUMNS c
      WHERE c.TABLE_SCHEMA = DATABASE()
        AND c.COLUMN_NAME = 'app_id'
        AND c.TABLE_NAME <> 'applications'
      ORDER BY c.TABLE_NAME
    `);

    const withFk: Array<{ TABLE_NAME: string }> = await queryRunner.query(`
      SELECT DISTINCT k.TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.COLUMN_NAME = 'app_id'
        AND k.REFERENCED_TABLE_NAME = 'applications'
    `);
    const hasFk = new Set(withFk.map((r) => r.TABLE_NAME));

    for (const { TABLE_NAME, IS_NULLABLE, COLUMN_TYPE } of appIdColumns) {
      if (hasFk.has(TABLE_NAME)) {
        continue;
      }

      await this.normalizeAppIdColumn(
        queryRunner,
        TABLE_NAME,
        IS_NULLABLE,
        COLUMN_TYPE,
      );

      if (IS_NULLABLE === 'YES') {
        await queryRunner.query(`
          UPDATE \`${TABLE_NAME}\` t
          LEFT JOIN \`applications\` a ON a.id = t.app_id
          SET t.app_id = NULL
          WHERE t.app_id IS NOT NULL AND a.id IS NULL
        `);
      } else {
        await queryRunner.query(`
          DELETE t FROM \`${TABLE_NAME}\` t
          LEFT JOIN \`applications\` a ON a.id = t.app_id
          WHERE t.app_id IS NOT NULL AND a.id IS NULL
        `);
      }

      const constraintName = `FK_${TABLE_NAME}_app_id_applications`;
      await queryRunner.query(`
        ALTER TABLE \`${TABLE_NAME}\`
        ADD CONSTRAINT \`${constraintName}\`
        FOREIGN KEY (\`app_id\`)
        REFERENCES \`applications\` (\`id\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  /** applications.id is int unsigned — child app_id must match for FK creation. */
  private async normalizeAppIdColumn(
    queryRunner: QueryRunner,
    tableName: string,
    isNullable: string,
    columnType: string,
  ): Promise<void> {
    if (columnType === 'int(10) unsigned') {
      return;
    }

    const nullSql = isNullable === 'YES' ? 'NULL' : 'NOT NULL';
    await queryRunner.query(`
      ALTER TABLE \`${tableName}\`
      MODIFY \`app_id\` int(10) unsigned ${nullSql}
    `);
  }
}
