import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseDepartmentDescriptionLength1790880000000
  implements MigrationInterface
{
  name = 'IncreaseDepartmentDescriptionLength1790880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `departments` MODIFY COLUMN `description` varchar(255) NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `departments` MODIFY COLUMN `description` varchar(50) NULL',
    );
  }
}
