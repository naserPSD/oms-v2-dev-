import { MigrationInterface, QueryRunner } from 'typeorm';
import { HardDeleteApplicationUsers1790000009100 } from './1790000009100-HardDeleteApplicationUsers';

/**
 * Recreate sp_hard_delete_application so that users who belonged only to the
 * deleted company are removed through sp_hard_delete_user (Admin users are kept).
 */

const APP_SCOPED_TABLES = [
  'account_categories',
  'account_expenses',
  'account_income',
  'app_holidays',
  'app_profiles',
  'app_users',
  'attendance_reconciliations',
  'aws_media',
  'batch_emails',
  'company_documents',
  'company_document_records',
  'coupon_redemptions',
  'departments',
  'designations',
  'employees',
  'employee_assets',
  'employee_hierarchy',
  'emp_attendances',
  'emp_attendance_late_counters',
  'emp_attendance_penalties',
  'emp_income_tax_tiers',
  'emp_invitations',
  'emp_late_counters',
  'emp_leave_requests',
  'emp_leave_types',
  'emp_payment_history',
  'emp_payroll_monthly_breakdowns',
  'emp_payroll_monthly_records',
  'emp_payroll_runs',
  'emp_pay_items',
  'emp_promotions',
  'emp_salary_change_types',
  'emp_salary_grades',
  'emp_salary_grade_rules',
  'emp_salary_history',
  'emp_salary_structures',
  'emp_salary_structure_details',
  'events',
  'hr_meetings',
  'invoices',
  'job_applicants',
  'job_applicant_interviewers',
  'job_categories',
  'job_interviewers',
  'job_interview_schedules',
  'job_interview_weights',
  'job_postings',
  'job_recruitment_step_names',
  'job_vacancies',
  'job_weights',
  'late_attendance_rules',
  'leads',
  'lead_emails',
  'lead_groups',
  'lead_pipelines',
  'lead_stages',
  'life_events',
  'notices',
  'offices',
  'office_shifts',
  'office_weekends',
  'requisitions',
  'roles',
  'role_permissions',
  'salary_calculation_formulas',
  'sender_emails',
  'services',
  'subscriptions',
  'subscription_changes',
  'subscription_seats',
  'subscription_users',
  'tasks',
  'task_assignees',
  'task_boards',
  'task_cards',
  'task_comments',
  'task_tags',
  'task_workspaces',
  'user_expense_categories',
  'user_income_categories',
  'user_roles',
  'visit_applications',
];

export class ApplicationDeleteUsesUserProcedure1791446001000
  implements MigrationInterface
{
  name = 'ApplicationDeleteUsesUserProcedure1791446001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_application`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_hard_delete_application(IN p_app_id INT UNSIGNED)
      BEGIN
        DECLARE v_exists INT DEFAULT 0;
        DECLARE v_done INT DEFAULT 0;
        DECLARE v_user_id INT UNSIGNED;
        DECLARE cur_users CURSOR FOR
          SELECT t.user_id
            FROM tmp_users_to_delete t
            INNER JOIN users u ON u.id = t.user_id
           WHERE IFNULL(u.app_use_case, '') <> 'Admin';
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

        SELECT COUNT(*) INTO v_exists FROM applications WHERE id = p_app_id;
        IF v_exists = 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application not found';
        END IF;

        DROP TEMPORARY TABLE IF EXISTS tmp_app_user_ids;
        CREATE TEMPORARY TABLE tmp_app_user_ids (
          user_id INT UNSIGNED NOT NULL PRIMARY KEY
        );
        INSERT INTO tmp_app_user_ids (user_id)
        SELECT DISTINCT user_id
        FROM app_users
        WHERE app_id = p_app_id
          AND user_id IS NOT NULL;

        SET FOREIGN_KEY_CHECKS = 0;

        DELETE d FROM app_holiday_dates d
          INNER JOIN app_holidays h ON h.id = d.app_holiday_id
         WHERE h.app_id = p_app_id;

        DELETE r FROM batch_email_recipients r
          INNER JOIN batch_emails b ON b.id = r.batch_email_id
         WHERE b.app_id = p_app_id;

        DELETE a FROM event_attendees a
          INNER JOIN events e ON e.id = a.event_id
         WHERE e.app_id = p_app_id;

        DELETE s FROM job_recruitment_steps s
          INNER JOIN job_vacancies v ON v.id = s.job_vacancy_id
         WHERE v.app_id = p_app_id;

        DELETE si FROM subscription_invoices si
          INNER JOIN subscriptions sub ON sub.id = si.subscription_id
         WHERE sub.app_id = p_app_id;

        DELETE ai FROM hr_meeting_agenda_items ai
          INNER JOIN hr_meetings m ON m.id = ai.meeting_id
         WHERE m.app_id = p_app_id;

        DELETE at FROM hr_meeting_attendees at
          INNER JOIN hr_meetings m ON m.id = at.meeting_id
         WHERE m.app_id = p_app_id;

        UPDATE payment_transactions pt
          INNER JOIN invoices i ON i.id = pt.invoice_id
           SET pt.invoice_id = NULL
         WHERE i.app_id = p_app_id;

        UPDATE payment_transactions pt
          INNER JOIN subscriptions sub ON sub.id = pt.subscription_id
           SET pt.subscription_id = NULL
         WHERE sub.app_id = p_app_id;

        UPDATE users SET active_app_id = NULL WHERE active_app_id = p_app_id;

        ${APP_SCOPED_TABLES.map(
          (table) => `DELETE FROM \`${table}\` WHERE app_id = p_app_id;`,
        ).join('\n        ')}

        DELETE FROM applications WHERE id = p_app_id;

        -- Users who belonged only to this company (no other app_users left)
        DROP TEMPORARY TABLE IF EXISTS tmp_users_to_delete;
        CREATE TEMPORARY TABLE tmp_users_to_delete (
          user_id INT UNSIGNED NOT NULL PRIMARY KEY
        );
        INSERT INTO tmp_users_to_delete (user_id)
        SELECT t.user_id
        FROM tmp_app_user_ids t
        WHERE NOT EXISTS (
          SELECT 1 FROM app_users au WHERE au.user_id = t.user_id
        );

        OPEN cur_users;
        users_loop: LOOP
          FETCH cur_users INTO v_user_id;
          IF v_done = 1 THEN
            LEAVE users_loop;
          END IF;
          CALL sp_hard_delete_user(v_user_id);
          SET v_done = 0;
        END LOOP;
        CLOSE cur_users;

        DROP TEMPORARY TABLE IF EXISTS tmp_users_to_delete;
        DROP TEMPORARY TABLE IF EXISTS tmp_app_user_ids;

        SET FOREIGN_KEY_CHECKS = 1;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await new HardDeleteApplicationUsers1790000009100().up(queryRunner);
  }
}
