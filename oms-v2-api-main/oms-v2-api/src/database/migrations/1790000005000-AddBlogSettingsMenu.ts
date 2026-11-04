import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogSettingsMenu1790000005000 implements MigrationInterface {
  name = 'AddBlogSettingsMenu1790000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO permissions
        (parent_id, menu_position_id, type, name, code, description, path, icon, sort_order, is_active, is_required, is_system)
      SELECT
        (SELECT id FROM (SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1) AS sm),
        264,
        'page',
        'Blog Settings',
        'settings.blog-settings',
        'Manage public blog posts',
        '/settings/blog-settings',
        NULL,
        7,
        1,
        1,
        0
      FROM DUAL
      WHERE EXISTS (SELECT 1 FROM permissions WHERE code = 'settings' AND type = 'module')
        AND NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'settings.blog-settings')
    `);

    await queryRunner.query(`
      UPDATE permissions
      SET
        menu_position_id = 264,
        parent_id = (
          SELECT id FROM (
            SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1
          ) AS settings_module
        ),
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE code = 'settings.blog-settings'
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT rp.role_id, p_blog.id
      FROM role_permissions rp
      INNER JOIN permissions p_web
        ON p_web.id = rp.permission_id AND p_web.code = 'settings.website-settings'
      CROSS JOIN permissions p_blog ON p_blog.code = 'settings.blog-settings'
      WHERE NOT EXISTS (
        SELECT 1 FROM role_permissions rp2
        WHERE rp2.role_id = rp.role_id AND rp2.permission_id = p_blog.id
      )
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (app_id, role_id, permission_id, created_at)
      SELECT rp.app_id, rp.role_id, p_blog.id, CURRENT_TIMESTAMP
      FROM role_permissions rp
      INNER JOIN permissions p_web
        ON p_web.id = rp.permission_id AND p_web.code = 'settings.website-settings'
      CROSS JOIN permissions p_blog ON p_blog.code = 'settings.blog-settings'
      WHERE rp.app_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp2
          WHERE rp2.role_id = rp.role_id
            AND rp2.permission_id = p_blog.id
            AND (rp2.app_id <=> rp.app_id)
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE rp FROM role_permissions rp
      INNER JOIN permissions p ON p.id = rp.permission_id
      WHERE p.code = 'settings.blog-settings'
    `);
    await queryRunner.query(`
      DELETE FROM permissions WHERE code = 'settings.blog-settings'
    `);
  }
}
