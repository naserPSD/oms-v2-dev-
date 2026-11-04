-- Website contents (dynamic public website sections) + menu permission

CREATE TABLE IF NOT EXISTS `website_contents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_key` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `content_type` VARCHAR(20) NOT NULL DEFAULT 'item',
  `eyebrow` VARCHAR(150) NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `icon_url` VARCHAR(500) NULL,
  `preview_url` VARCHAR(500) NULL,
  `preview_bg` VARCHAR(30) NULL,
  `features` JSON NULL,
  `cta_label` VARCHAR(150) NULL,
  `cta_href` VARCHAR(500) NULL,
  `accent_color` VARCHAR(30) NULL,
  `icon_bg` VARCHAR(30) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_website_contents_slug` (`slug`),
  KEY `idx_website_contents_section_key` (`section_key`),
  KEY `idx_website_contents_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `website_contents`
  (`section_key`, `slug`, `content_type`, `eyebrow`, `title`, `description`, `icon_url`, `preview_url`, `preview_bg`, `features`, `cta_label`, `cta_href`, `accent_color`, `icon_bg`, `sort_order`, `is_active`)
VALUES
(
  'home_beyond_products',
  'home-beyond-products-meta',
  'meta',
  'BEYOND THE CORE FOUR',
  'Other products from Sanzio.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Talk to our team →',
  '/contact',
  '#2A93C0',
  NULL,
  0,
  1
),
(
  'home_beyond_products',
  'hr-management',
  'item',
  NULL,
  'HR Management',
  'Keep employee records, attendance and everyday HR operations in one organised place.',
  '/images/sanzio-hr-icon-only.webp',
  NULL,
  '#F5FBFE',
  JSON_ARRAY('Employee Management', 'Attendance & Leave', 'HR Records', 'Role-based Access'),
  'Explore HR Management →',
  'https://calendly.com/domplio-info/30min',
  '#2A93C0',
  '#F0FAFF',
  1,
  1
),
(
  'home_beyond_products',
  'sanzio-connect',
  'item',
  NULL,
  'Sanzio Connect',
  'A communication platform to manage SMS, Email and WhatsApp marketing from one dashboard.',
  '/images/sanzio-connect-fab-icon.webp',
  '/images/sanzio-connect-dashboard.png',
  '#FBF7FF',
  JSON_ARRAY('SMS Marketing', 'Email Campaigns', 'WhatsApp Messaging', 'Analytics & Reports'),
  'Explore Sanzio Connect →',
  '/connect',
  '#A21CAF',
  '#F7F0FF',
  2,
  1
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `icon_url` = VALUES(`icon_url`),
  `features` = VALUES(`features`),
  `cta_label` = VALUES(`cta_label`),
  `cta_href` = VALUES(`cta_href`),
  `accent_color` = VALUES(`accent_color`),
  `icon_bg` = VALUES(`icon_bg`),
  `is_active` = VALUES(`is_active`);

-- Admin menu under Settings
INSERT INTO `permissions`
  (`parent_id`, `menu_position_id`, `type`, `name`, `code`, `description`, `path`, `icon`, `sort_order`, `is_active`, `is_required`, `is_system`)
SELECT
  1,
  264,
  'page',
  'Website Setting',
  'settings.website-settings',
  'Manage dynamic public website content',
  '/settings/website-settings',
  NULL,
  6,
  1,
  1,
  0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `permissions` WHERE `code` = 'settings.website-settings'
);

-- Grant to Super Admin + Admin roles
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code IN ('super_admin', 'admin')
  AND p.code = 'settings.website-settings'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
