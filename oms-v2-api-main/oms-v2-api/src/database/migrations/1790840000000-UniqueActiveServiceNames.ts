import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueActiveServiceNames1790840000000
  implements MigrationInterface
{
  name = 'UniqueActiveServiceNames1790840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE services
      SET name = TRIM(name)
      WHERE deleted_at IS NULL AND name IS NOT NULL AND name <> TRIM(name)
    `);

    await queryRunner.query(`
      UPDATE services AS duplicate
      INNER JOIN services AS keeper
        ON keeper.app_id = duplicate.app_id
        AND keeper.type_id = duplicate.type_id
        AND LOWER(TRIM(keeper.name)) = LOWER(TRIM(duplicate.name))
        AND keeper.deleted_at IS NULL
        AND duplicate.deleted_at IS NULL
        AND duplicate.id <> keeper.id
        AND (
          keeper.is_active > duplicate.is_active
          OR (
            keeper.is_active = duplicate.is_active
            AND keeper.id < duplicate.id
          )
        )
      SET duplicate.deleted_at = CURRENT_TIMESTAMP,
          duplicate.updated_at = CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE services
      ADD COLUMN active_name VARCHAR(50)
        GENERATED ALWAYS AS (
          CASE WHEN deleted_at IS NULL THEN TRIM(name) ELSE NULL END
        ) VIRTUAL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX UQ_SERVICES_APP_TYPE_ACTIVE_NAME
      ON services (app_id, type_id, active_name)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX UQ_SERVICES_APP_TYPE_ACTIVE_NAME ON services',
    );
    await queryRunner.query(
      'ALTER TABLE services DROP COLUMN active_name',
    );
  }
}