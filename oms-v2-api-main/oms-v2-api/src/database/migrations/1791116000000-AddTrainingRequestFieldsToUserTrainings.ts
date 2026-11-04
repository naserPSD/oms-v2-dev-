import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingRequestFieldsToUserTrainings1791116000000
  implements MigrationInterface
{
  name = 'AddTrainingRequestFieldsToUserTrainings1791116000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        ADD \`training_type\` varchar(32) NULL,
        ADD \`quantity\` int unsigned NULL,
        ADD \`estimated_cost\` decimal(12,2) NULL,
        ADD \`reason\` text NULL,
        ADD \`additional_notes\` text NULL,
        ADD \`status_id\` int unsigned NULL,
        ADD \`approved_by\` int unsigned NULL,
        ADD \`approved_date\` date NULL,
        ADD \`remarks\` text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        DROP COLUMN \`remarks\`,
        DROP COLUMN \`approved_date\`,
        DROP COLUMN \`approved_by\`,
        DROP COLUMN \`status_id\`,
        DROP COLUMN \`additional_notes\`,
        DROP COLUMN \`reason\`,
        DROP COLUMN \`estimated_cost\`,
        DROP COLUMN \`quantity\`,
        DROP COLUMN \`training_type\`
    `);
  }
}
