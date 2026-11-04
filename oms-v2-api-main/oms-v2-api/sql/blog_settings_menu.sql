-- Settings sidebar: Blog Settings (public blog CRUD)
-- Run on the same MySQL DB as oms-v2-api, then sign out & sign in to refresh the menu.

INSERT INTO `permissions`
  (`parent_id`, `menu_position_id`, `type`, `name`, `code`, `description`, `path`, `icon`, `sort_order`, `is_active`, `is_required`, `is_system`)
SELECT
  (SELECT id FROM permissions WHERE code = 'settings' AND type = 'module' LIMIT 1),
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
WHERE EXISTS (
  SELECT 1 FROM permissions WHERE code = 'settings' AND type = 'module'
)
AND NOT EXISTS (
  SELECT 1 FROM `permissions` WHERE `code` = 'settings.blog-settings'
);

INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code IN ('super_admin', 'admin')
  AND p.code = 'settings.blog-settings'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Grant to every role that already has Website Setting (same sidebar access pattern)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT rp.role_id, p_blog.id
FROM `role_permissions` rp
INNER JOIN `permissions` p_web
  ON p_web.id = rp.permission_id AND p_web.code = 'settings.website-settings'
CROSS JOIN `permissions` p_blog
  ON p_blog.code = 'settings.blog-settings'
WHERE NOT EXISTS (
  SELECT 1 FROM `role_permissions` rp2
  WHERE rp2.role_id = rp.role_id AND rp2.permission_id = p_blog.id
);

INSERT INTO `role_permissions` (`app_id`, `role_id`, `permission_id`, `created_at`)
SELECT rp.app_id, rp.role_id, p_blog.id, CURRENT_TIMESTAMP
FROM `role_permissions` rp
INNER JOIN `permissions` p_web
  ON p_web.id = rp.permission_id AND p_web.code = 'settings.website-settings'
CROSS JOIN `permissions` p_blog
  ON p_blog.code = 'settings.blog-settings'
WHERE rp.app_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2
    WHERE rp2.role_id = rp.role_id
      AND rp2.permission_id = p_blog.id
      AND (rp2.app_id <=> rp.app_id)
  );
