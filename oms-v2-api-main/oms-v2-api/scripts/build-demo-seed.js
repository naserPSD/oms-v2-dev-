const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dump =
  process.env.MYSQLDUMP_PATH ||
  'D:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysqldump.exe';
const out = path.join(__dirname, '..', 'sql', 'seeds', '001_demo_seed.sql');

const args = [
  '-uroot',
  '--no-create-info',
  '--skip-triggers',
  '--complete-insert',
  '--insert-ignore',
  '--default-character-set=utf8mb4',
  '--set-gtid-purged=OFF',
  'revinr_oms_new',
  'countries',
  'status_groups',
  'statuses',
  'roles',
  'permissions',
  'role_permissions',
  'subscription_plans',
];

const buf = execFileSync(dump, args);

const header = `-- Demo seed for revinr_oms_new
-- Run AFTER schema migration on a fresh/empty DB
-- Demo login: demo@revinr.local / Demo@12345

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

`;

const demo = `

-- =========================
-- Demo company + admin user
-- =========================
INSERT INTO applications (id, name, type_id, size_id, logo_media_id, created_by, email, phone_country_id, phone, website_url, created_at, updated_at)
VALUES (1, 'Demo Company', 1, 14, NULL, NULL, 'demo@revinr.local', 15, '01700000000', 'https://localhost:3000', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);

INSERT INTO users (id, first_name, last_name, email, password, reset_first_password, active_app_id, email_verified_at, is_active, profile_completed, invitation_count, created_at, updated_at)
VALUES (
  1000,
  'Demo',
  'Admin',
  'demo@revinr.local',
  '$2b$10$NHKdenn9vX0Co97kKU8WoegpJfXvrRTpwU4a75E4SNDQasnNb.ZOK',
  0,
  1,
  NOW(6),
  1,
  1,
  0,
  NOW(6),
  NOW(6)
)
ON DUPLICATE KEY UPDATE password=VALUES(password), is_active=1, active_app_id=1, email_verified_at=VALUES(email_verified_at);

UPDATE applications SET created_by = 1000 WHERE id = 1;

INSERT INTO app_users (app_id, user_id, user_type_id, joining_date, is_active, created_at, updated_at)
SELECT 1, 1000, 17, CURDATE(), 1, NOW(6), NOW(6)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE app_id=1 AND user_id=1000);

INSERT INTO user_roles (app_id, user_id, role_id, created_at)
SELECT 1, 1000, id, NOW(6) FROM roles WHERE code='super_admin' LIMIT 1;

INSERT INTO user_profiles (user_id, country_id, phone_country_id, phone, gender, created_at, updated_at)
SELECT 1000, 15, 15, '01700000000', 'Male', NOW(6), NOW(6)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id=1000);

-- =========================
-- Demo blog posts
-- =========================
INSERT INTO blogs (title, slug, category, excerpt, content, author_name, author_role, read_time, is_published, published_at)
VALUES
(
  'Behind the payroll engine',
  'payroll-engine',
  'PAYROLL',
  'How we handle multi-country compliance without slowing down finance teams.',
  '[{"h":"Payroll looks simple from the outside"},{"p":"Run a calculation, generate a payslip, done."}]',
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
  '[{"p":"The workflow decisions behind onboarding and attendance."}]',
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
  '[{"p":"Recent releases across HR, Payroll, Workspace and Recruitment."}]',
  'Sanzio Team',
  'Product',
  '4 min read',
  1,
  '2026-08-01 10:00:00'
)
ON DUPLICATE KEY UPDATE title=VALUES(title), excerpt=VALUES(excerpt), content=VALUES(content), is_published=VALUES(is_published);

SET FOREIGN_KEY_CHECKS=1;
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header + buf.toString('utf8') + demo, 'utf8');
console.log('wrote', out, fs.statSync(out).size);
