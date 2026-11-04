import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Company email broadcasts. No sample rows: a subscriber sees a broadcast
 * only after that company composes one.
 */
export class CompanyEmailBroadcasts1790000009500 implements MigrationInterface {
  name = 'CompanyEmailBroadcasts1790000009500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`email_broadcasts\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`app_id\` int unsigned NOT NULL,
        \`subject\` varchar(500) NOT NULL,
        \`message\` longtext NOT NULL,
        \`recipient_type\` enum('all','selected','custom') NOT NULL DEFAULT 'all',
        \`custom_emails\` text NULL,
        \`status\` enum('draft','scheduled','sent','failed') NOT NULL DEFAULT 'sent',
        \`is_scheduled\` tinyint(1) NOT NULL DEFAULT 0,
        \`schedule_time\` datetime NULL,
        \`sent_at\` datetime NULL,
        \`recipients\` int NOT NULL DEFAULT 0,
        \`bounced\` int NOT NULL DEFAULT 0,
        \`received\` int NOT NULL DEFAULT 0,
        \`attachments\` int NOT NULL DEFAULT 0,
        \`recipient_details\` json NULL,
        \`attachment_details\` json NULL,
        \`created_by\` int unsigned DEFAULT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` timestamp(6) NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_email_broadcasts_app\` (\`app_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`email_broadcasts\``);
  }
}
