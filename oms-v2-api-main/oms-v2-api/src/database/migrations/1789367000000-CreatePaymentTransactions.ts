import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentTransactions1789367000000
  implements MigrationInterface
{
  name = 'CreatePaymentTransactions1789367000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE payment_transactions (
        id int unsigned NOT NULL AUTO_INCREMENT,
        user_id int unsigned NOT NULL,
        subscription_plan_id int unsigned NOT NULL,
        subscription_id int unsigned NULL,
        tran_id varchar(100) NOT NULL,
        amount decimal(10,2) NOT NULL,
        currency varchar(10) NOT NULL DEFAULT 'BDT',
        status enum('PENDING','SUCCESS','FAILED','CANCELLED','VALIDATED') NOT NULL DEFAULT 'PENDING',
        payment_method varchar(50) NULL DEFAULT 'sslcommerz',
        gateway varchar(50) NULL DEFAULT 'sslcommerz',
        gateway_response json NULL,
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_payment_transactions_tran_id (tran_id),
        CONSTRAINT FK_payment_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_payment_transactions_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
        CONSTRAINT FK_payment_transactions_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE payment_transactions');
  }
}