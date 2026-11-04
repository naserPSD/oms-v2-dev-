import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyScopedDepartmentNames1790860000000
  implements MigrationInterface
{
  name = 'CompanyScopedDepartmentNames1790860000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates: Array<{ app_id: number; name: string }> =
      await queryRunner.query(`
        SELECT app_id, MIN(name) AS name
        FROM departments
        WHERE app_id IS NOT NULL AND name IS NOT NULL
        GROUP BY app_id, LOWER(TRIM(name))
        HAVING COUNT(*) > 1
        LIMIT 1
      `);

    if (duplicates.length > 0) {
      throw new Error(
        'Cannot make department names company-scoped: duplicate normalized department names already exist within a company.',
      );
    }

    await queryRunner.query(
      'ALTER TABLE `departments` DROP INDEX `IDX_8681da666ad9699d568b3e9106`',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`UQ_DEPARTMENTS_APP_NAME\`
      ON \`departments\` (\`app_id\`, \`name\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const duplicates: Array<{ name: string }> = await queryRunner.query(`
      SELECT MIN(name) AS name
      FROM departments
      WHERE name IS NOT NULL
      GROUP BY name
      HAVING COUNT(*) > 1
      LIMIT 1
    `);

    if (duplicates.length > 0) {
      throw new Error(
        'Cannot restore the global department-name unique index while multiple companies use the same department name.',
      );
    }

    await queryRunner.query(
      'DROP INDEX `UQ_DEPARTMENTS_APP_NAME` ON `departments`',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`IDX_8681da666ad9699d568b3e9106\`
      ON \`departments\` (\`name\`)
    `);
  }
}
