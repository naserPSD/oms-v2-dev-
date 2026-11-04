import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationNameToUserTrainings1791180708000
  implements MigrationInterface
{
  name = 'AddLocationNameToUserTrainings1791180708000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        ADD \`location_name\` varchar(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_trainings\`
        DROP COLUMN \`location_name\`
    `);
  }
}
