import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterAndUserCategories1790000006000 implements MigrationInterface {
  name = 'CreateMasterAndUserCategories1790000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Master Income
    await queryRunner.query(`
      CREATE TABLE \`master_income_categories\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX \`IDX_MASTER_INC_NAME\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 2. Master Expense
    await queryRunner.query(`
      CREATE TABLE \`master_expense_categories\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX \`IDX_MASTER_EXP_NAME\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 3. User Income
    await queryRunner.query(`
      CREATE TABLE \`user_income_categories\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`app_id\` int UNSIGNED NOT NULL,
        \`user_id\` int UNSIGNED NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_uinc_cat_app_user\` (\`app_id\`, \`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 4. User Expense
    await queryRunner.query(`
      CREATE TABLE \`user_expense_categories\` (
        \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
        \`app_id\` int UNSIGNED NOT NULL,
        \`user_id\` int UNSIGNED NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_uexp_cat_app_user\` (\`app_id\`, \`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user_expense_categories\``);
    await queryRunner.query(`DROP TABLE \`user_income_categories\``);
    await queryRunner.query(`DROP TABLE \`master_expense_categories\``);
    await queryRunner.query(`DROP TABLE \`master_income_categories\``);
  }
}
