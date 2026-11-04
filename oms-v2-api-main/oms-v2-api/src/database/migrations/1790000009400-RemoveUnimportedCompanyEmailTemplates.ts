import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Company pages must list only templates that company imported or created.
 * Removes the catalog copies that were placed on every company.
 */
export class RemoveUnimportedCompanyEmailTemplates1790000009400
  implements MigrationInterface
{
  name = 'RemoveUnimportedCompanyEmailTemplates1790000009400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE company_template
      FROM email_templates company_template
      INNER JOIN email_templates master_template
        ON master_template.id = company_template.source_template_id
      WHERE company_template.scope = 'company'
        AND master_template.scope = 'master'
        AND master_template.name IN (
          'Welcome Email Template',
          'Password Reset Template',
          'Monthly Newsletter',
          'Order Confirmation',
          'Meeting Invitation',
          'Payment Receipt',
          'Account Verification',
          'Holiday Greetings',
          'Support Ticket Response',
          'Product Update Announcement'
        )
    `);
  }

  public async down(): Promise<void> {
    // Catalog copies are not restored. A company imports them from master templates.
  }
}
