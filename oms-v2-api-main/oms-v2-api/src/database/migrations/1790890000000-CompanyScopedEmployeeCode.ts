import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyScopedEmployeeCode1790890000000
  implements MigrationInterface
{
  name = 'CompanyScopedEmployeeCode1790890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Find and drop any single-column unique index on employee_code in employees table
    const singleUniqueIndexes: Array<{ INDEX_NAME: string }> =
      await queryRunner.query(`
        SELECT DISTINCT INDEX_NAME
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'employees'
          AND COLUMN_NAME = 'employee_code'
          AND NON_UNIQUE = 0
          AND INDEX_NAME != 'PRIMARY'
      `);

    for (const idx of singleUniqueIndexes) {
      if (idx.INDEX_NAME !== 'UQ_EMPLOYEES_APP_CODE') {
        try {
          await queryRunner.query(
            `ALTER TABLE \`employees\` DROP INDEX \`${idx.INDEX_NAME}\``,
          );
        } catch (err) {
          // ignore if already dropped
        }
      }
    }

    // 2. Ensure composite unique index exists on (app_id, employee_code)
    const existingComposite: Array<any> = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'employees'
        AND INDEX_NAME = 'UQ_EMPLOYEES_APP_CODE'
      LIMIT 1
    `);

    if (existingComposite.length === 0) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX \`UQ_EMPLOYEES_APP_CODE\`
        ON \`employees\` (\`app_id\`, \`employee_code\`)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        'DROP INDEX `UQ_EMPLOYEES_APP_CODE` ON `employees`',
      );
    } catch (err) {}

    try {
      await queryRunner.query(`
        CREATE UNIQUE INDEX \`IDX_56162b5f24af743a154680684f\`
        ON \`employees\` (\`employee_code\`)
      `);
    } catch (err) {}
  }
}
