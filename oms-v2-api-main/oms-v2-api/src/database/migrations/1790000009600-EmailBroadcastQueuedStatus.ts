import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailBroadcastQueuedStatus1790000009600
  implements MigrationInterface
{
  name = 'EmailBroadcastQueuedStatus1790000009600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`email_broadcasts\`
      MODIFY \`status\` enum('draft','scheduled','queued','sent','failed')
      NOT NULL DEFAULT 'draft'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`email_broadcasts\` SET \`status\` = 'draft' WHERE \`status\` = 'queued'
    `);
    await queryRunner.query(`
      ALTER TABLE \`email_broadcasts\`
      MODIFY \`status\` enum('draft','scheduled','sent','failed')
      NOT NULL DEFAULT 'sent'
    `);
  }
}
