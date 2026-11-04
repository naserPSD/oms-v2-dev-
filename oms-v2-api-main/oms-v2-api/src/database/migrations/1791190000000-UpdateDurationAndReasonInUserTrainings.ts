import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDurationAndReasonInUserTrainings1791190000000
  implements MigrationInterface
{
  name = 'UpdateDurationAndReasonInUserTrainings1791190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        DROP COLUMN \`course_duration\`,
        ADD \`duration\` int unsigned NULL,
        MODIFY \`reason\` varchar(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        DROP COLUMN \`duration\`,
        ADD \`course_duration\` varchar(255) NULL,
        MODIFY \`reason\` text NULL
    `);
  }
}
