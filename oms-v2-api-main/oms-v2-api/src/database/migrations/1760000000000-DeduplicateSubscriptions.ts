import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeduplicateSubscriptions1760000000000
  implements MigrationInterface
{
  name = 'DeduplicateSubscriptions1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TEMPORARY TABLE subscription_dedupe AS
      SELECT duplicate.id AS duplicate_id, keep.id AS keep_id
      FROM subscriptions duplicate
      INNER JOIN subscriptions keep
        ON keep.user_id = duplicate.user_id
        AND keep.app_id = duplicate.app_id
        AND (
          keep.created_at > duplicate.created_at
          OR (
            keep.created_at = duplicate.created_at
            AND keep.id > duplicate.id
          )
        )
        AND NOT EXISTS (
          SELECT 1
          FROM subscriptions newer_keep
          WHERE newer_keep.user_id = duplicate.user_id
            AND newer_keep.app_id = duplicate.app_id
            AND (
              newer_keep.created_at > keep.created_at
              OR (
                newer_keep.created_at = keep.created_at
                AND newer_keep.id > keep.id
              )
            )
        )
    `);
    await queryRunner.query(
      'ALTER TABLE subscription_dedupe ADD PRIMARY KEY (duplicate_id)',
    );

    // Avoid violating the existing unique key on subscription_users while reparenting.
    await queryRunner.query(`
      DELETE child
      FROM subscription_users child
      INNER JOIN subscription_dedupe mapping
        ON mapping.duplicate_id = child.subscription_id
      INNER JOIN subscription_users kept
        ON kept.subscription_id = mapping.keep_id
        AND kept.user_id = child.user_id
    `);
    await queryRunner.query(`
      UPDATE subscription_users child
      INNER JOIN subscription_dedupe mapping
        ON mapping.duplicate_id = child.subscription_id
      SET child.subscription_id = mapping.keep_id
    `);

    for (const table of [
      'subscription_changes',
      'subscription_seats',
      'subscription_invoices',
      'invoices',
      'coupon_redemptions',
    ]) {
      await queryRunner.query(`
        UPDATE ${table} child
        INNER JOIN subscription_dedupe mapping
          ON mapping.duplicate_id = child.subscription_id
        SET child.subscription_id = mapping.keep_id
      `);
    }

    await queryRunner.query(`
      DELETE subscription
      FROM subscriptions subscription
      INNER JOIN subscription_dedupe mapping
        ON mapping.duplicate_id = subscription.id
    `);
    await queryRunner.query(`
      ALTER TABLE subscriptions
      ADD UNIQUE KEY UQ_subscriptions_user_app (user_id, app_id)
    `);
    await queryRunner.query('DROP TEMPORARY TABLE subscription_dedupe');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE subscriptions DROP INDEX UQ_subscriptions_user_app',
    );
  }
}
