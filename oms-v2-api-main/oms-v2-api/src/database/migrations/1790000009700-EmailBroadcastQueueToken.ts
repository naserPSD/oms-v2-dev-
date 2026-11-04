import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailBroadcastQueueToken1790000009700
  implements MigrationInterface
{
  name = 'EmailBroadcastQueueToken1790000009700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns: Array<{ Field: string }> = await queryRunner.query(
      `SHOW COLUMNS FROM \`email_broadcasts\` LIKE 'queue_token'`,
    );
    if (columns.length > 0) return;
    await queryRunner.query(`
      ALTER TABLE \`email_broadcasts\`
      ADD \`queue_token\` varchar(64) NULL AFTER \`schedule_time\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`email_broadcasts\` DROP COLUMN \`queue_token\`
    `);
  }
}
