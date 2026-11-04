-- Blogs table + seed data for Sanzio marketing blog
-- Run against the MySQL database used by oms-v2-api

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NULL,
  `cover_image` VARCHAR(500) NULL,
  `author_name` VARCHAR(150) NULL DEFAULT 'Sanzio Team',
  `author_role` VARCHAR(150) NULL DEFAULT 'Product',
  `read_time` VARCHAR(50) NULL DEFAULT '4 min read',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` DATETIME NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blogs_slug` (`slug`),
  KEY `idx_blogs_category` (`category`),
  KEY `idx_blogs_is_published` (`is_published`),
  KEY `idx_blogs_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `blogs`
  (`title`, `slug`, `category`, `excerpt`, `content`, `author_name`, `author_role`, `read_time`, `is_published`, `published_at`)
VALUES
(
  'Behind the payroll engine',
  'payroll-engine',
  'PAYROLL',
  'How we handle multi-country compliance without slowing down finance teams.',
  '[{"h":"Payroll looks simple from the outside"},{"p":"Run a calculation, generate a payslip, done. In practice, every country adds its own statutory deductions, rounding rules and filing deadlines — and finance teams are the ones who absorb that complexity every single month."},{"p":"When we set out to rebuild Sanzio''s payroll engine, the goal wasn''t to hide that complexity. It was to make sure nobody has to hold it in their head."},{"h":"One engine, many rule sets"},{"p":"Instead of hard-coding country logic into the product, we built a rules layer that separates what payroll always needs — components, approvals, payslips — from what changes by jurisdiction. Statutory deductions, tax slabs and filing formats live as configuration, not code."},{"p":"That means adding a new country is a configuration exercise for our implementation team, not a release for engineering. It also means a bug fix in one jurisdiction''s tax logic can''t accidentally break another''s."},{"q":"The best payroll system is the one finance stops thinking about between the 1st and the 5th of the month."},{"h":"Approvals that don''t slow the close"},{"p":"Every run moves through the same checkpoints — inputs, review, approval, lock — regardless of jurisdiction. Variance checks flag anything that moved more than expected since last cycle, so approvers spend their time on exceptions instead of re-checking everything."},{"p":"Once a run is approved, it''s locked. Payslips generate automatically and land in each employee''s account the same day, with a full history retained for audits."},{"h":"What this means for finance teams"},{"p":"Fewer spreadsheets bridging the gap between HR and payroll, fewer manual re-entries between systems, and a clear audit trail for every run. Payroll stops being a monthly fire drill and becomes a process the team can actually rely on."}]',
  'Priya Menon',
  'Product Lead, Payroll',
  '6 min read',
  1,
  '2026-08-18 10:00:00'
),
(
  'Designing for HR admins',
  'designing-for-hr-admins',
  'PRODUCT',
  'The workflow decisions behind onboarding and attendance.',
  '[{"p":"The workflow decisions behind onboarding and attendance."},{"p":"This article covers how Sanzio designs everyday HR admin flows so teams spend less time chasing approvals and more time supporting people."}]',
  'Sanzio Team',
  'Product',
  '4 min read',
  1,
  '2026-08-09 10:00:00'
),
(
  'What''s new in Sanzio',
  'whats-new-in-sanzio',
  'RELEASES',
  'Recent releases across HR, Payroll, Workspace and Recruitment.',
  '[{"p":"Recent releases across HR, Payroll, Workspace and Recruitment."},{"p":"Catch up on the latest product improvements shipping across the Sanzio suite."}]',
  'Sanzio Team',
  'Product',
  '4 min read',
  1,
  '2026-08-01 10:00:00'
),
(
  'Hiring without the spreadsheet chaos',
  'hiring-without-the-spreadsheet-chaos',
  'RECRUITMENT',
  'How a shared pipeline keeps hiring teams and hiring managers on the same page.',
  '[{"p":"How a shared pipeline keeps hiring teams and hiring managers on the same page."},{"p":"A shared hiring pipeline reduces handoff gaps and keeps every stakeholder looking at the same candidate status."}]',
  'Sanzio Team',
  'Product',
  '4 min read',
  1,
  '2026-07-24 10:00:00'
),
(
  'Why we built one board instead of five',
  'why-we-built-one-board-instead-of-five',
  'WORKSPACE',
  'The case for a single shared workspace over disconnected task tools.',
  '[{"p":"The case for a single shared workspace over disconnected task tools."},{"p":"One shared board keeps ownership, deadlines and progress visible without juggling multiple tools."}]',
  'Sanzio Team',
  'Product',
  '4 min read',
  1,
  '2026-07-15 10:00:00'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `content` = VALUES(`content`),
  `category` = VALUES(`category`),
  `author_name` = VALUES(`author_name`),
  `author_role` = VALUES(`author_role`),
  `read_time` = VALUES(`read_time`),
  `is_published` = VALUES(`is_published`),
  `published_at` = VALUES(`published_at`);
