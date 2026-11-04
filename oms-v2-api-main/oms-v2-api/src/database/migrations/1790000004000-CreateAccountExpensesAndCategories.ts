import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountExpensesAndCategories1790000004000 implements MigrationInterface {
  name = 'CreateAccountExpensesAndCategories1790000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account_categories (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        app_id INT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'expense',
        description TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_by INT UNSIGNED NULL,
        updated_by INT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_account_category_app_name_type (app_id, name, type),
        KEY idx_account_category_app_type (app_id, type),
        CONSTRAINT fk_account_category_app FOREIGN KEY (app_id) REFERENCES applications (id) ON DELETE CASCADE,
        CONSTRAINT fk_account_category_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_account_category_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account_expenses (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        app_id INT UNSIGNED NOT NULL,
        expense_number VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
        expense_date DATETIME NOT NULL,
        payment_method VARCHAR(50) NULL,
        vendor VARCHAR(150) NULL,
        reference VARCHAR(150) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'paid',
        notes TEXT NULL,
        created_by INT UNSIGNED NULL,
        updated_by INT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_account_expense_app_number (app_id, expense_number),
        KEY idx_account_expense_app_date (app_id, expense_date),
        KEY idx_account_expense_app_status (app_id, status),
        KEY idx_account_expense_app_category (app_id, category),
        CONSTRAINT fk_account_expense_app FOREIGN KEY (app_id) REFERENCES applications (id) ON DELETE CASCADE,
        CONSTRAINT fk_account_expense_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_account_expense_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS account_expenses');
    await queryRunner.query('DROP TABLE IF EXISTS account_categories');
  }
}
