import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseStatusIdsForTrainingType1791180800000
  implements MigrationInterface
{
  name = 'UseStatusIdsForTrainingType1791180800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`user_trainings\`
      SET \`training_type\` = CASE
        WHEN LOWER(TRIM(\`training_type\`)) = 'internal' THEN '267'
        WHEN LOWER(TRIM(\`training_type\`)) = 'external' THEN '268'
        WHEN TRIM(\`training_type\`) REGEXP '^[0-9]+$' THEN TRIM(\`training_type\`)
        ELSE NULL
      END
    `);
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
      MODIFY \`training_type\` int unsigned NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`user_trainings\`
      SET \`training_type\` = CASE
        WHEN \`training_type\` = 267 THEN 'Internal'
        WHEN \`training_type\` = 268 THEN 'External'
        ELSE CAST(\`training_type\` AS CHAR)
      END
    `);
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
      MODIFY \`training_type\` varchar(32) NULL
    `);
  }
}
