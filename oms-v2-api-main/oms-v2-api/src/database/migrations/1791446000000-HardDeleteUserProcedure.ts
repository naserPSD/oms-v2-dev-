import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create sp_hard_delete_user(p_user_id): permanently delete a non-Admin user,
 * their employee records and all associate data. Shared company records
 * (applications, departments, tasks, ...) are kept and only lose the user
 * reference.
 *
 * Usage: CALL sp_hard_delete_user(25);
 */

/** Tables keyed by employees.id: [table, column]. */
const EMPLOYEE_CHILD_TABLES: Array<[string, string]> = [
  ['attendance_reconciliations', 'emp_id'],
  ['employee_assets', 'employee_id'],
  ['employee_hierarchy', 'emp_id'],
  ['employee_hierarchy', 'supervisor_id'],
  ['emp_attendances', 'emp_id'],
  ['emp_attendance_late_counters', 'emp_id'],
  ['emp_attendance_penalties', 'emp_id'],
  ['emp_invitations', 'emp_id'],
  ['emp_late_counters', 'emp_id'],
  ['emp_leave_requests', 'emp_id'],
  ['emp_payment_history', 'emp_id'],
  ['emp_payroll_monthly_breakdowns', 'emp_id'],
  ['emp_payroll_monthly_records', 'emp_id'],
  ['emp_promotions', 'employee_id'],
  ['emp_salary_history', 'emp_id'],
  ['emp_salary_structures', 'emp_id'],
  ['event_attendees', 'employee_id'],
  ['hr_meeting_attendees', 'employee_id'],
  ['job_applicant_interviewers', 'employee_id'],
  ['job_interviewers', 'employee_id'],
  ['life_events', 'emp_id'],
  ['requisitions', 'employee_id'],
  ['task_assignees', 'assigner_id'],
  ['visit_applications', 'visitor_emp_id'],
  ['visit_applications', 'host_emp_id'],
];

/** Rows that belong to the user and are deleted: [table, column]. */
const USER_OWNED_TABLES: Array<[string, string]> = [
  ['app_users', 'user_id'],
  ['audit_logs', 'user_id'],
  ['auth_otp', 'user_id'],
  ['emp_invitations', 'user_id'],
  ['hr_meeting_attendees', 'user_id'],
  ['hr_meeting_notes', 'user_id'],
  ['job_applicant_interviewers', 'creator_id'],
  ['notifications', 'user_id'],
  ['password_resets', 'user_id'],
  ['payment_transactions', 'user_id'],
  ['personal_notes', 'user_id'],
  ['subscription_users', 'user_id'],
  ['task_comments', 'creator_id'],
  ['user_activities', 'user_id'],
  ['user_audit_log', 'user_id'],
  ['user_certifications', 'user_id'],
  ['user_contact_infos', 'user_id'],
  ['user_educations', 'user_id'],
  ['user_expense_categories', 'user_id'],
  ['user_google_tokens', 'user_id'],
  ['user_income_categories', 'user_id'],
  ['user_language_proficiencies', 'user_id'],
  ['user_permissions', 'user_id'],
  ['user_profiles', 'user_id'],
  ['user_projects', 'user_id'],
  ['user_references', 'user_id'],
  ['user_roles', 'user_id'],
  ['user_sessions', 'user_id'],
  ['user_skills', 'user_id'],
  ['user_trainings', 'user_id'],
  ['user_work_experiences', 'user_id'],
];

/** Creator/approver stamps on shared records, set to NULL: [table, column]. */
const USER_STAMP_COLUMNS: Array<[string, string]> = [
  ['account_categories', 'created_by'],
  ['account_categories', 'updated_by'],
  ['account_expenses', 'created_by'],
  ['account_expenses', 'updated_by'],
  ['account_income', 'created_by'],
  ['account_income', 'updated_by'],
  ['account_income', 'customer_id'],
  ['applications', 'created_by'],
  ['app_holidays', 'creator_id'],
  ['app_holidays', 'editor_id'],
  ['aws_media', 'creator_id'],
  ['batch_emails', 'editor_id'],
  ['countries', 'status_by'],
  ['coupons', 'created_by'],
  ['departments', 'creator_id'],
  ['departments', 'updater_id'],
  ['designations', 'creator_id'],
  ['designations', 'updater_id'],
  ['email_broadcasts', 'created_by'],
  ['email_templates', 'created_by'],
  ['employee_assets', 'allocated_by'],
  ['emp_attendances', 'late_approval_user_id'],
  ['emp_attendance_penalties', 'approved_user_id'],
  ['emp_leave_requests', 'approved_by'],
  ['emp_payment_history', 'paid_by'],
  ['emp_payroll_runs', 'processed_by'],
  ['emp_promotions', 'approved_by'],
  ['emp_salary_grade_rules', 'updated_by'],
  ['emp_salary_history', 'approved_by'],
  ['emp_salary_history', 'changed_by'],
  ['emp_salary_history', 'created_by'],
  ['emp_salary_structures', 'approved_by'],
  ['emp_salary_structures', 'created_by'],
  ['emp_salary_structures', 'updated_by'],
  ['events', 'creator_id'],
  ['holidays', 'creator_id'],
  ['holidays', 'editor_id'],
  ['hr_meetings', 'creator_id'],
  ['hr_meetings', 'host_user_id'],
  ['job_categories', 'creator_id'],
  ['job_categories', 'editor_id'],
  ['job_interview_schedules', 'creator_id'],
  ['job_interview_weights', 'creator_id'],
  ['job_postings', 'published_by'],
  ['leads', 'creator_id'],
  ['lead_emails', 'creator_id'],
  ['lead_emails', 'editor_id'],
  ['offices', 'creator_id'],
  ['offices', 'editor_id'],
  ['remarks', 'creator_id'],
  ['requisitions', 'approved_by'],
  ['sender_emails', 'verfied_by'],
  ['services', 'creator_id'],
  ['services', 'updater_id'],
  ['subscription_changes', 'created_by'],
  ['subscription_users', 'added_by'],
  ['tasks', 'creator_id'],
  ['task_boards', 'creator_id'],
  ['task_cards', 'creator_id'],
  ['task_tags', 'creator_id'],
  ['task_workspaces', 'creator_id'],
  ['user_trainings', 'approved_by'],
  ['visit_applications', 'created_by'],
];

/** NOT NULL creator stamps on shared records; 0 marks a deleted user. */
const USER_STAMP_COLUMNS_NOT_NULL: Array<[string, string]> = [
  ['asset_types', 'created_by'],
  ['company_asset_types', 'created_by'],
  ['notices', 'created_by'],
];

const deleteByTmp = (rows: Array<[string, string]>, tmp: string) =>
  rows
    .map(
      ([table, column]) =>
        `DELETE x FROM \`${table}\` x INNER JOIN ${tmp} t ON t.id = x.\`${column}\`;`,
    )
    .join('\n        ');

const deleteByUser = (rows: Array<[string, string]>) =>
  rows
    .map(
      ([table, column]) =>
        `DELETE FROM \`${table}\` WHERE \`${column}\` = p_user_id;`,
    )
    .join('\n        ');

const setByUser = (rows: Array<[string, string]>, value: 'NULL' | '0') =>
  rows
    .map(
      ([table, column]) =>
        `UPDATE \`${table}\` SET \`${column}\` = ${value} WHERE \`${column}\` = p_user_id;`,
    )
    .join('\n        ');

export class HardDeleteUserProcedure1791446000000 implements MigrationInterface {
  name = 'HardDeleteUserProcedure1791446000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_user`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_hard_delete_user(IN p_user_id INT UNSIGNED)
      BEGIN
        DECLARE v_exists INT DEFAULT 0;
        DECLARE v_use_case VARCHAR(32) DEFAULT '';
        DECLARE v_fk_checks INT DEFAULT 1;
        DECLARE v_own_tx TINYINT DEFAULT 0;

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
          IF v_own_tx = 1 THEN
            ROLLBACK;
          END IF;
          SET FOREIGN_KEY_CHECKS = v_fk_checks;
          RESIGNAL;
        END;

        SET v_fk_checks = @@FOREIGN_KEY_CHECKS;

        SELECT COUNT(*), IFNULL(MAX(app_use_case), '')
          INTO v_exists, v_use_case
          FROM users
         WHERE id = p_user_id;

        IF v_exists = 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
        END IF;
        IF v_use_case = 'Admin' THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admin users cannot be deleted';
        END IF;

        -- Join the caller's transaction (e.g. sp_hard_delete_application) instead of committing it
        IF @@in_transaction = 0 THEN
          START TRANSACTION;
          SET v_own_tx = 1;
        END IF;

        SET FOREIGN_KEY_CHECKS = 0;

        -- Employee records of the user and everything under them
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_emp_ids;
        CREATE TEMPORARY TABLE tmp_hdu_emp_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_emp_ids (id)
        SELECT id FROM employees WHERE user_id = p_user_id;

        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_structure_ids;
        CREATE TEMPORARY TABLE tmp_hdu_structure_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_structure_ids (id)
        SELECT s.id FROM emp_salary_structures s
          INNER JOIN tmp_hdu_emp_ids e ON e.id = s.emp_id;

        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_record_ids;
        CREATE TEMPORARY TABLE tmp_hdu_record_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_record_ids (id)
        SELECT r.id FROM emp_payroll_monthly_records r
          INNER JOIN tmp_hdu_emp_ids e ON e.id = r.emp_id;

        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_applicant_ids;
        CREATE TEMPORARY TABLE tmp_hdu_applicant_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_applicant_ids (id)
        SELECT a.id FROM job_applicants a
          INNER JOIN tmp_hdu_emp_ids e ON e.id = a.emp_id;

        DELETE x FROM emp_salary_structure_details x
          INNER JOIN tmp_hdu_structure_ids t ON t.id = x.salary_structure_id;
        DELETE x FROM emp_payroll_monthly_breakdowns x
          INNER JOIN tmp_hdu_record_ids t ON t.id = x.monthly_record_id;
        DELETE x FROM job_applicant_interviewers x
          INNER JOIN tmp_hdu_applicant_ids t ON t.id = x.job_applicant_id;
        DELETE x FROM job_interview_schedules x
          INNER JOIN tmp_hdu_applicant_ids t ON t.id = x.job_applicant_id;
        DELETE x FROM job_interview_weights x
          INNER JOIN tmp_hdu_applicant_ids t ON t.id = x.job_applicant_id;
        DELETE x FROM job_applicants x
          INNER JOIN tmp_hdu_applicant_ids t ON t.id = x.id;

        ${deleteByTmp(EMPLOYEE_CHILD_TABLES, 'tmp_hdu_emp_ids')}

        UPDATE task_assignees x
          INNER JOIN tmp_hdu_emp_ids t ON t.id = x.assigned_on_id
           SET x.assigned_on_id = NULL;
        UPDATE hr_meetings x
          INNER JOIN tmp_hdu_emp_ids t ON t.id = x.host_employee_id
           SET x.host_employee_id = NULL;

        DELETE x FROM employees x
          INNER JOIN tmp_hdu_emp_ids t ON t.id = x.id;

        -- Subscriptions owned by the user
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_sub_ids;
        CREATE TEMPORARY TABLE tmp_hdu_sub_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_sub_ids (id)
        SELECT id FROM subscriptions WHERE user_id = p_user_id;

        UPDATE payment_transactions pt
          INNER JOIN invoices i ON i.id = pt.invoice_id
          INNER JOIN tmp_hdu_sub_ids t ON t.id = i.subscription_id
           SET pt.invoice_id = NULL;
        UPDATE payment_transactions pt
          INNER JOIN tmp_hdu_sub_ids t ON t.id = pt.subscription_id
           SET pt.subscription_id = NULL;

        ${deleteByTmp(
          [
            ['coupon_redemptions', 'subscription_id'],
            ['invoices', 'subscription_id'],
            ['subscription_changes', 'subscription_id'],
            ['subscription_invoices', 'subscription_id'],
            ['subscription_seats', 'subscription_id'],
            ['subscription_users', 'subscription_id'],
            ['subscriptions', 'id'],
          ],
          'tmp_hdu_sub_ids',
        )}

        UPDATE payment_transactions pt
          INNER JOIN invoices i ON i.id = pt.invoice_id
           SET pt.invoice_id = NULL
         WHERE i.user_id = p_user_id;
        DELETE FROM invoices WHERE user_id = p_user_id;

        -- Batch emails created by the user
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_batch_ids;
        CREATE TEMPORARY TABLE tmp_hdu_batch_ids (id INT UNSIGNED NOT NULL PRIMARY KEY);
        INSERT INTO tmp_hdu_batch_ids (id)
        SELECT id FROM batch_emails WHERE creator_id = p_user_id;

        ${deleteByTmp(
          [
            ['batch_email_recipients', 'batch_email_id'],
            ['batch_email_sections', 'batch_email_id'],
            ['batch_emails', 'id'],
          ],
          'tmp_hdu_batch_ids',
        )}

        -- Shared company records keep their rows and lose the user reference
        ${setByUser(USER_STAMP_COLUMNS, 'NULL')}
        ${setByUser(USER_STAMP_COLUMNS_NOT_NULL, '0')}

        -- Personal data
        ${deleteByUser(USER_OWNED_TABLES)}

        DELETE FROM users WHERE id = p_user_id;

        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_batch_ids;
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_sub_ids;
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_applicant_ids;
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_record_ids;
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_structure_ids;
        DROP TEMPORARY TABLE IF EXISTS tmp_hdu_emp_ids;

        SET FOREIGN_KEY_CHECKS = v_fk_checks;

        IF v_own_tx = 1 THEN
          COMMIT;
        END IF;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_user`);
  }
}
