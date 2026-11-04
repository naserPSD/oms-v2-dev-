import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowReuseOfDeletedCompanyRoleNames1790850000000
  implements MigrationInterface
{
  name = 'AllowReuseOfDeletedCompanyRoleNames1790850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `roles` DROP INDEX `idx_roles_app_id_name`',
    );
    await queryRunner.query(`
      ALTER TABLE \`roles\`
      ADD COLUMN \`active_name\` VARCHAR(100)
        GENERATED ALWAYS AS (
          CASE WHEN \`deleted_at\` IS NULL THEN \`name\` ELSE NULL END
        ) VIRTUAL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`UQ_ROLES_APP_ACTIVE_NAME\`
      ON \`roles\` (\`app_id\`, \`active_name\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const duplicateNames: Array<{ app_id: number; name: string }> =
      await queryRunner.query(`
        SELECT app_id, name
        FROM roles
        WHERE app_id IS NOT NULL
        GROUP BY app_id, name
        HAVING COUNT(*) > 1
        LIMIT 1
      `);

    if (duplicateNames.length > 0) {
      throw new Error(
        'Cannot restore idx_roles_app_id_name while deleted roles share names with active roles.',
      );
    }

    await queryRunner.query(
      'DROP INDEX `UQ_ROLES_APP_ACTIVE_NAME` ON `roles`',
    );
    await queryRunner.query(
      'ALTER TABLE `roles` DROP COLUMN `active_name`',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`idx_roles_app_id_name\`
      ON \`roles\` (\`app_id\`, \`name\`)
    `);
  }
}