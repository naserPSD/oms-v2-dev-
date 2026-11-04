import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountIncome1790000000000 implements MigrationInterface {
  name = 'CreateAccountIncome1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE account_income (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        app_id INT UNSIGNED NOT NULL,
        income_number VARCHAR(100) NOT NULL,
        source VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
        income_date DATETIME NOT NULL,
        payment_method VARCHAR(50) NULL,
        reference VARCHAR(150) NULL,
        customer_id INT UNSIGNED NULL,
        account_invoice_id INT UNSIGNED NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'received',
        notes TEXT NULL,
        created_by INT UNSIGNED NULL,
        updated_by INT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_account_income_app_number (app_id, income_number),
        UNIQUE KEY uq_account_income_app_reference (app_id, reference),
        KEY idx_account_income_app_date (app_id, income_date),
        KEY idx_account_income_app_status (app_id, status),
        KEY idx_account_income_customer (app_id, customer_id),
        CONSTRAINT fk_account_income_app FOREIGN KEY (app_id) REFERENCES applications (id) ON DELETE CASCADE,
        CONSTRAINT fk_account_income_customer FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_account_income_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_account_income_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS account_income');
  }
}