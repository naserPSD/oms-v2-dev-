import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMasterCategories1790000007000 implements MigrationInterface {
  name = 'SeedMasterCategories1790000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const incomeCategories = [
      'Sales Revenue', 'Product Sales', 'Service Revenue', 'Subscription Revenue',
      'SaaS Revenue', 'Recurring Revenue', 'Project Revenue', 'Consulting Revenue',
      'Professional Services', 'Commission Income', 'Brokerage Income', 'Referral Income',
      'Affiliate Income', 'Licensing Income', 'Royalty Income', 'Contract Revenue',
      'Maintenance Revenue', 'Support Revenue', 'Implementation Revenue', 'Setup & Onboarding Fees',
      'Customization Revenue', 'Integration Fees', 'Interest Income', 'Investment Income',
      'Dividend Income', 'Rental Income', 'Asset Sale Income', 'Foreign Exchange Gain',
      'Cashback & Rebates', 'Other Income'
    ];

    const expenseCategories = [
      'Salaries & Wages', 'Office Rent', 'Utilities', 'Software & Subscriptions',
      'Cloud & Hosting', 'Marketing & Advertising', 'Travel & Transportation', 'Office Supplies',
      'Equipment & Hardware', 'Professional Services', 'Bank & Payment Processing Fees',
      'Taxes & Government Fees', 'Refunds & Chargebacks', 'Other Expenses'
    ];

    // Seed Income Categories
    for (const name of incomeCategories) {
      await queryRunner.query(
        `INSERT IGNORE INTO \`master_income_categories\` (\`name\`, \`description\`) VALUES (?, ?);`,
        [name, 'Default Master Income Category']
      );
    }

    // Seed Expense Categories
    for (const name of expenseCategories) {
      await queryRunner.query(
        `INSERT IGNORE INTO \`master_expense_categories\` (\`name\`, \`description\`) VALUES (?, ?);`,
        [name, 'Default Master Expense Category']
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`master_income_categories\``);
    await queryRunner.query(`DELETE FROM \`master_expense_categories\``);
  }
}
