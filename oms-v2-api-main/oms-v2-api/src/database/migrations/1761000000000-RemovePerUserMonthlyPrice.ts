import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePerUserMonthlyPrice1761000000000
  implements MigrationInterface
{
  name = 'RemovePerUserMonthlyPrice1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = await queryRunner.query(
      `SHOW COLUMNS FROM subscription_plans LIKE 'per_user_monthly_price'`,
    );

    if (Array.isArray(columns) && columns.length > 0) {
      await queryRunner.query(
        `ALTER TABLE subscription_plans DROP COLUMN per_user_monthly_price`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscription_plans
      ADD COLUMN per_user_monthly_price DECIMAL(10,2) NOT NULL DEFAULT '0.00'
      AFTER yearly_price
    `);
  }
}