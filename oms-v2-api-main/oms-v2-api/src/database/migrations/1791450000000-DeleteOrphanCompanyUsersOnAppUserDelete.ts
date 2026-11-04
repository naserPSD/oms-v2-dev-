import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * When an application is deleted, app_users rows CASCADE away. This trigger
 * permanently removes users who no longer belong to any company (except Admin),
 * matching sp_hard_delete_application behaviour for direct SQL deletes.
 */
export class DeleteOrphanCompanyUsersOnAppUserDelete1791450000000
  implements MigrationInterface
{
  name = 'DeleteOrphanCompanyUsersOnAppUserDelete1791450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_app_users_after_delete_cleanup_user
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_app_users_after_delete_cleanup_user
      AFTER DELETE ON app_users
      FOR EACH ROW
      BEGIN
        DECLARE v_remaining INT DEFAULT 0;
        DECLARE v_is_admin INT DEFAULT 0;

        IF OLD.user_id IS NOT NULL THEN
          SELECT COUNT(*) INTO v_remaining
            FROM app_users
           WHERE user_id = OLD.user_id;

          IF v_remaining = 0 THEN
            SELECT COUNT(*) INTO v_is_admin
              FROM users
             WHERE id = OLD.user_id
               AND IFNULL(app_use_case, '') = 'Admin';

            IF v_is_admin = 0 THEN
              CALL sp_hard_delete_user(OLD.user_id);
            END IF;
          END IF;
        END IF;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_app_users_after_delete_cleanup_user
    `);
  }
}
