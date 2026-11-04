import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extend sp_hard_delete_application to also permanently delete users
 * that belong to the company and are not members of any other company.
 */
export class HardDeleteApplicationUsers1790000009100
  implements MigrationInterface
{
  name = 'HardDeleteApplicationUsers1790000009100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_application`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_hard_delete_application(IN p_app_id INT UNSIGNED)
      BEGIN
        DECLARE v_exists INT DEFAULT 0;

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

        DELETE FROM account_categories WHERE app_id = p_app_id;
        DELETE FROM account_expenses WHERE app_id = p_app_id;
        DELETE FROM account_income WHERE app_id = p_app_id;
        DELETE FROM app_holidays WHERE app_id = p_app_id;
        DELETE FROM app_profiles WHERE app_id = p_app_id;
        DELETE FROM app_users WHERE app_id = p_app_id;
        DELETE FROM attendance_reconciliations WHERE app_id = p_app_id;
        DELETE FROM aws_media WHERE app_id = p_app_id;
        DELETE FROM batch_emails WHERE app_id = p_app_id;
        DELETE FROM company_documents WHERE app_id = p_app_id;
        DELETE FROM company_document_records WHERE app_id = p_app_id;
        DELETE FROM coupon_redemptions WHERE app_id = p_app_id;
        DELETE FROM departments WHERE app_id = p_app_id;
        DELETE FROM designations WHERE app_id = p_app_id;
        DELETE FROM employees WHERE app_id = p_app_id;
        DELETE FROM employee_assets WHERE app_id = p_app_id;
        DELETE FROM employee_hierarchy WHERE app_id = p_app_id;
        DELETE FROM emp_attendances WHERE app_id = p_app_id;
        DELETE FROM emp_attendance_late_counters WHERE app_id = p_app_id;
        DELETE FROM emp_attendance_penalties WHERE app_id = p_app_id;
        DELETE FROM emp_income_tax_tiers WHERE app_id = p_app_id;
        DELETE FROM emp_invitations WHERE app_id = p_app_id;
        DELETE FROM emp_late_counters WHERE app_id = p_app_id;
        DELETE FROM emp_leave_requests WHERE app_id = p_app_id;
        DELETE FROM emp_leave_types WHERE app_id = p_app_id;
        DELETE FROM emp_payment_history WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_monthly_breakdowns WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_monthly_records WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_runs WHERE app_id = p_app_id;
        DELETE FROM emp_pay_items WHERE app_id = p_app_id;
        DELETE FROM emp_promotions WHERE app_id = p_app_id;
        DELETE FROM emp_salary_change_types WHERE app_id = p_app_id;
        DELETE FROM emp_salary_grades WHERE app_id = p_app_id;
        DELETE FROM emp_salary_grade_rules WHERE app_id = p_app_id;
        DELETE FROM emp_salary_history WHERE app_id = p_app_id;
        DELETE FROM emp_salary_structures WHERE app_id = p_app_id;
        DELETE FROM emp_salary_structure_details WHERE app_id = p_app_id;
        DELETE FROM events WHERE app_id = p_app_id;
        DELETE FROM hr_meetings WHERE app_id = p_app_id;
        DELETE FROM invoices WHERE app_id = p_app_id;
        DELETE FROM job_applicants WHERE app_id = p_app_id;
        DELETE FROM job_applicant_interviewers WHERE app_id = p_app_id;
        DELETE FROM job_categories WHERE app_id = p_app_id;
        DELETE FROM job_interviewers WHERE app_id = p_app_id;
        DELETE FROM job_interview_schedules WHERE app_id = p_app_id;
        DELETE FROM job_interview_weights WHERE app_id = p_app_id;
        DELETE FROM job_postings WHERE app_id = p_app_id;
        DELETE FROM job_recruitment_step_names WHERE app_id = p_app_id;
        DELETE FROM job_vacancies WHERE app_id = p_app_id;
        DELETE FROM job_weights WHERE app_id = p_app_id;
        DELETE FROM late_attendance_rules WHERE app_id = p_app_id;
        DELETE FROM leads WHERE app_id = p_app_id;
        DELETE FROM lead_emails WHERE app_id = p_app_id;
        DELETE FROM lead_groups WHERE app_id = p_app_id;
        DELETE FROM lead_pipelines WHERE app_id = p_app_id;
        DELETE FROM lead_stages WHERE app_id = p_app_id;
        DELETE FROM life_events WHERE app_id = p_app_id;
        DELETE FROM notices WHERE app_id = p_app_id;
        DELETE FROM offices WHERE app_id = p_app_id;
        DELETE FROM office_shifts WHERE app_id = p_app_id;
        DELETE FROM office_weekends WHERE app_id = p_app_id;
        DELETE FROM requisitions WHERE app_id = p_app_id;
        DELETE FROM roles WHERE app_id = p_app_id;
        DELETE FROM role_permissions WHERE app_id = p_app_id;
        DELETE FROM salary_calculation_formulas WHERE app_id = p_app_id;
        DELETE FROM sender_emails WHERE app_id = p_app_id;
        DELETE FROM services WHERE app_id = p_app_id;
        DELETE FROM subscriptions WHERE app_id = p_app_id;
        DELETE FROM subscription_changes WHERE app_id = p_app_id;
        DELETE FROM subscription_seats WHERE app_id = p_app_id;
        DELETE FROM subscription_users WHERE app_id = p_app_id;
        DELETE FROM tasks WHERE app_id = p_app_id;
        DELETE FROM task_assignees WHERE app_id = p_app_id;
        DELETE FROM task_boards WHERE app_id = p_app_id;
        DELETE FROM task_cards WHERE app_id = p_app_id;
        DELETE FROM task_comments WHERE app_id = p_app_id;
        DELETE FROM task_tags WHERE app_id = p_app_id;
        DELETE FROM task_workspaces WHERE app_id = p_app_id;
        DELETE FROM user_expense_categories WHERE app_id = p_app_id;
        DELETE FROM user_income_categories WHERE app_id = p_app_id;
        DELETE FROM user_roles WHERE app_id = p_app_id;
        DELETE FROM visit_applications WHERE app_id = p_app_id;

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

        UPDATE applications a
          INNER JOIN tmp_users_to_delete d ON d.user_id = a.created_by
           SET a.created_by = NULL;

        DELETE x FROM audit_logs x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM auth_otp x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM hr_meeting_notes x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM notifications x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM password_resets x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM payment_transactions x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM personal_notes x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_activities x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_audit_log x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_certifications x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_contact_infos x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_educations x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_google_tokens x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_language_proficiencies x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_permissions x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_profiles x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_projects x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_references x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_roles x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_sessions x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_skills x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_trainings x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;
        DELETE x FROM user_work_experiences x INNER JOIN tmp_users_to_delete d ON d.user_id = x.user_id;

        DELETE u FROM users u
          INNER JOIN tmp_users_to_delete d ON d.user_id = u.id;

        DROP TEMPORARY TABLE IF EXISTS tmp_users_to_delete;
        DROP TEMPORARY TABLE IF EXISTS tmp_app_user_ids;

        SET FOREIGN_KEY_CHECKS = 1;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore previous procedure body without user deletion (from 1790000009000).
    // Re-run HardDeleteApplicationCascade migration logic is heavy; drop only
    // the user-delete extension by recreating the prior procedure without user wipe.
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_application`);
    await queryRunner.query(`
      CREATE PROCEDURE sp_hard_delete_application(IN p_app_id INT UNSIGNED)
      BEGIN
        DECLARE v_exists INT DEFAULT 0;
        SELECT COUNT(*) INTO v_exists FROM applications WHERE id = p_app_id;
        IF v_exists = 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application not found';
        END IF;
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
        DELETE FROM account_categories WHERE app_id = p_app_id;
        DELETE FROM account_expenses WHERE app_id = p_app_id;
        DELETE FROM account_income WHERE app_id = p_app_id;
        DELETE FROM app_holidays WHERE app_id = p_app_id;
        DELETE FROM app_profiles WHERE app_id = p_app_id;
        DELETE FROM app_users WHERE app_id = p_app_id;
        DELETE FROM attendance_reconciliations WHERE app_id = p_app_id;
        DELETE FROM aws_media WHERE app_id = p_app_id;
        DELETE FROM batch_emails WHERE app_id = p_app_id;
        DELETE FROM company_documents WHERE app_id = p_app_id;
        DELETE FROM company_document_records WHERE app_id = p_app_id;
        DELETE FROM coupon_redemptions WHERE app_id = p_app_id;
        DELETE FROM departments WHERE app_id = p_app_id;
        DELETE FROM designations WHERE app_id = p_app_id;
        DELETE FROM employees WHERE app_id = p_app_id;
        DELETE FROM employee_assets WHERE app_id = p_app_id;
        DELETE FROM employee_hierarchy WHERE app_id = p_app_id;
        DELETE FROM emp_attendances WHERE app_id = p_app_id;
        DELETE FROM emp_attendance_late_counters WHERE app_id = p_app_id;
        DELETE FROM emp_attendance_penalties WHERE app_id = p_app_id;
        DELETE FROM emp_income_tax_tiers WHERE app_id = p_app_id;
        DELETE FROM emp_invitations WHERE app_id = p_app_id;
        DELETE FROM emp_late_counters WHERE app_id = p_app_id;
        DELETE FROM emp_leave_requests WHERE app_id = p_app_id;
        DELETE FROM emp_leave_types WHERE app_id = p_app_id;
        DELETE FROM emp_payment_history WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_monthly_breakdowns WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_monthly_records WHERE app_id = p_app_id;
        DELETE FROM emp_payroll_runs WHERE app_id = p_app_id;
        DELETE FROM emp_pay_items WHERE app_id = p_app_id;
        DELETE FROM emp_promotions WHERE app_id = p_app_id;
        DELETE FROM emp_salary_change_types WHERE app_id = p_app_id;
        DELETE FROM emp_salary_grades WHERE app_id = p_app_id;
        DELETE FROM emp_salary_grade_rules WHERE app_id = p_app_id;
        DELETE FROM emp_salary_history WHERE app_id = p_app_id;
        DELETE FROM emp_salary_structures WHERE app_id = p_app_id;
        DELETE FROM emp_salary_structure_details WHERE app_id = p_app_id;
        DELETE FROM events WHERE app_id = p_app_id;
        DELETE FROM hr_meetings WHERE app_id = p_app_id;
        DELETE FROM invoices WHERE app_id = p_app_id;
        DELETE FROM job_applicants WHERE app_id = p_app_id;
        DELETE FROM job_applicant_interviewers WHERE app_id = p_app_id;
        DELETE FROM job_categories WHERE app_id = p_app_id;
        DELETE FROM job_interviewers WHERE app_id = p_app_id;
        DELETE FROM job_interview_schedules WHERE app_id = p_app_id;
        DELETE FROM job_interview_weights WHERE app_id = p_app_id;
        DELETE FROM job_postings WHERE app_id = p_app_id;
        DELETE FROM job_recruitment_step_names WHERE app_id = p_app_id;
        DELETE FROM job_vacancies WHERE app_id = p_app_id;
        DELETE FROM job_weights WHERE app_id = p_app_id;
        DELETE FROM late_attendance_rules WHERE app_id = p_app_id;
        DELETE FROM leads WHERE app_id = p_app_id;
        DELETE FROM lead_emails WHERE app_id = p_app_id;
        DELETE FROM lead_groups WHERE app_id = p_app_id;
        DELETE FROM lead_pipelines WHERE app_id = p_app_id;
        DELETE FROM lead_stages WHERE app_id = p_app_id;
        DELETE FROM life_events WHERE app_id = p_app_id;
        DELETE FROM notices WHERE app_id = p_app_id;
        DELETE FROM offices WHERE app_id = p_app_id;
        DELETE FROM office_shifts WHERE app_id = p_app_id;
        DELETE FROM office_weekends WHERE app_id = p_app_id;
        DELETE FROM requisitions WHERE app_id = p_app_id;
        DELETE FROM roles WHERE app_id = p_app_id;
        DELETE FROM role_permissions WHERE app_id = p_app_id;
        DELETE FROM salary_calculation_formulas WHERE app_id = p_app_id;
        DELETE FROM sender_emails WHERE app_id = p_app_id;
        DELETE FROM services WHERE app_id = p_app_id;
        DELETE FROM subscriptions WHERE app_id = p_app_id;
        DELETE FROM subscription_changes WHERE app_id = p_app_id;
        DELETE FROM subscription_seats WHERE app_id = p_app_id;
        DELETE FROM subscription_users WHERE app_id = p_app_id;
        DELETE FROM tasks WHERE app_id = p_app_id;
        DELETE FROM task_assignees WHERE app_id = p_app_id;
        DELETE FROM task_boards WHERE app_id = p_app_id;
        DELETE FROM task_cards WHERE app_id = p_app_id;
        DELETE FROM task_comments WHERE app_id = p_app_id;
        DELETE FROM task_tags WHERE app_id = p_app_id;
        DELETE FROM task_workspaces WHERE app_id = p_app_id;
        DELETE FROM user_expense_categories WHERE app_id = p_app_id;
        DELETE FROM user_income_categories WHERE app_id = p_app_id;
        DELETE FROM user_roles WHERE app_id = p_app_id;
        DELETE FROM visit_applications WHERE app_id = p_app_id;
        DELETE FROM applications WHERE id = p_app_id;
        SET FOREIGN_KEY_CHECKS = 1;
      END
    `);
  }
}
