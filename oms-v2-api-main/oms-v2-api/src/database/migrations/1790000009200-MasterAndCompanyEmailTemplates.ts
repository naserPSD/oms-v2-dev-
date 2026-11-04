import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Master vs company email templates.
 * Master templates are platform-owned (super_admin only).
 * Company (subscriber) templates are scoped by app_id and can be imported
 * only from master templates marked available_for_subscriber.
 */
export class MasterAndCompanyEmailTemplates1790000009200
  implements MigrationInterface
{
  name = 'MasterAndCompanyEmailTemplates1790000009200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`email_templates\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`app_id\` int unsigned DEFAULT NULL,
        \`scope\` enum('master','company') NOT NULL DEFAULT 'company',
        \`available_for_subscriber\` tinyint(1) NOT NULL DEFAULT 0,
        \`source_template_id\` int unsigned DEFAULT NULL,
        \`name\` varchar(255) NOT NULL,
        \`subject\` varchar(500) NOT NULL,
        \`description\` text NULL,
        \`category\` varchar(50) NOT NULL,
        \`status\` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
        \`is_default\` tinyint(1) NOT NULL DEFAULT 0,
        \`content\` longtext NOT NULL,
        \`variables\` json NULL,
        \`created_by\` int unsigned DEFAULT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` timestamp(6) NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_email_templates_app\` (\`app_id\`),
        KEY \`idx_email_templates_scope\` (\`scope\`, \`available_for_subscriber\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      INSERT INTO permissions (
        parent_id, menu_position_id, type, name, code, description, path,
        icon, sort_order, is_active, is_required, is_system, created_at, updated_at
      )
      SELECT
        sm.id, 264, 'page', 'Master Email Templates', 'settings.master-email-templates',
        'Platform master email templates for subscribers to import',
        '/settings/master-email-templates',
        '', 9, 1, 1, 1, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
      FROM permissions sm
      WHERE sm.code = 'settings' AND sm.type = 'module' AND sm.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM permissions p
          WHERE p.code = 'settings.master-email-templates' AND p.deleted_at IS NULL
        )
      LIMIT 1
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT NULL, r.id, p.id, CURRENT_TIMESTAMP(6)
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'super_admin'
        AND r.deleted_at IS NULL
        AND p.code = 'settings.master-email-templates'
        AND p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN roles r ON r.id = rp.role_id
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE r.code = 'admin'
        AND p.code = 'settings.master-email-templates'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE p.code = 'settings.master-email-templates'
    `);
    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'settings.master-email-templates'
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS \`email_templates\``);
  }
}
