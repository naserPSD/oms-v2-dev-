-- SEO columns for blogs (run once; ignore "Duplicate column" if already applied)
ALTER TABLE `blogs` ADD COLUMN `seo_title` VARCHAR(255) NULL AFTER `cover_image`;
ALTER TABLE `blogs` ADD COLUMN `seo_description` VARCHAR(320) NULL AFTER `seo_title`;
ALTER TABLE `blogs` ADD COLUMN `seo_keywords` VARCHAR(500) NULL AFTER `seo_description`;
ALTER TABLE `blogs` ADD COLUMN `og_image` VARCHAR(500) NULL AFTER `seo_keywords`;
ALTER TABLE `blogs` ADD COLUMN `canonical_url` VARCHAR(500) NULL AFTER `og_image`;
ALTER TABLE `blogs` ADD COLUMN `no_index` TINYINT(1) NOT NULL DEFAULT 0 AFTER `canonical_url`;
