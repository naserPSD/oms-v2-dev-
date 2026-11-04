import { MigrationInterface, QueryRunner } from 'typeorm';

/** Restore app_users.user_id and user_type_id FKs (HeidiSQL showed 0 on those columns). */
export class AppUsersForeignKeys1791449000000 implements MigrationInterface {
  name = 'AppUsersForeignKeys1791449000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing: Array<{
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
    }> = await queryRunner.query(`
      SELECT k.COLUMN_NAME, k.CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.TABLE_NAME = 'app_users'
        AND k.COLUMN_NAME IN ('user_id', 'user_type_id')
        AND k.REFERENCED_TABLE_NAME IS NOT NULL
    `);

    const hasUserId = existing.some((r) => r.COLUMN_NAME === 'user_id');
    const hasUserType = existing.some((r) => r.COLUMN_NAME === 'user_type_id');

    if (!hasUserId) {
      await queryRunner.query(`
        ALTER TABLE \`app_users\`
        ADD CONSTRAINT \`FK_1c9491ba157e3501f828d224706\`
        FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    if (!hasUserType) {
      await queryRunner.query(`
        ALTER TABLE \`app_users\`
        ADD CONSTRAINT \`FK_149001b5142ad410f820256e496\`
        FOREIGN KEY (\`user_type_id\`)
        REFERENCES \`statuses\` (\`id\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`app_users\` DROP FOREIGN KEY IF EXISTS \`FK_1c9491ba157e3501f828d224706\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`app_users\` DROP FOREIGN KEY IF EXISTS \`FK_149001b5142ad410f820256e496\``,
    );
  }
}
