import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceToPaymentTransactions1789367001000
  implements MigrationInterface
{
  name = 'AddInvoiceToPaymentTransactions1789367001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_transactions
        ADD COLUMN invoice_id int unsigned NULL AFTER subscription_id,
        ADD KEY IDX_payment_transactions_invoice_id (invoice_id),
        ADD CONSTRAINT FK_payment_transactions_invoice
          FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_transactions
        DROP FOREIGN KEY FK_payment_transactions_invoice,
        DROP KEY IDX_payment_transactions_invoice_id,
        DROP COLUMN invoice_id
    `);
  }
}