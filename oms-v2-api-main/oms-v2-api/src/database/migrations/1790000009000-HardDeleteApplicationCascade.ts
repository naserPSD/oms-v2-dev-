import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Company hard-delete support:
 * - Convert applications child FKs from NO ACTION / RESTRICT → ON DELETE CASCADE
 * - Keep users.active_app_id as ON DELETE SET NULL
 * - Create stored procedure sp_hard_delete_application for wiping a company and all associate data
 *   (covers tables without FKs and deeper NO ACTION chains via FOREIGN_KEY_CHECKS)
 */
export class HardDeleteApplicationCascade1790000009000
  implements MigrationInterface
{
  name = 'HardDeleteApplicationCascade1790000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fks: Array<{
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }> = await queryRunner.query(`
      SELECT k.TABLE_NAME, k.COLUMN_NAME, k.CONSTRAINT_NAME, k.REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.REFERENCED_TABLE_NAME = 'applications'
        AND r.DELETE_RULE IN ('NO ACTION', 'RESTRICT')
    `);

    for (const fk of fks) {
      await queryRunner.query(
        `ALTER TABLE \`${fk.TABLE_NAME}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
      );
      await queryRunner.query(`
        ALTER TABLE \`${fk.TABLE_NAME}\`
        ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\`
        FOREIGN KEY (\`${fk.COLUMN_NAME}\`)
        REFERENCES \`applications\` (\`${fk.REFERENCED_COLUMN_NAME}\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

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

        -- Orphan / junction rows without app_id
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

        -- Every table that stores app_id
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP PROCEDURE IF EXISTS sp_hard_delete_application`);

    // Revert CASCADE back to NO ACTION for FKs this migration changed.
    // (We cannot perfectly restore RESTRICT vs NO ACTION; NO ACTION is MySQL-equivalent.)
    const cascadeFks: Array<{
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }> = await queryRunner.query(`
      SELECT k.TABLE_NAME, k.COLUMN_NAME, k.CONSTRAINT_NAME, k.REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS r
        ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
       AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
      WHERE k.TABLE_SCHEMA = DATABASE()
        AND k.REFERENCED_TABLE_NAME = 'applications'
        AND r.DELETE_RULE = 'CASCADE'
        AND k.CONSTRAINT_NAME IN (
          'FK_119c4da9cf2aafb08b0c7397206',
          'FK_870fb3d62d16d4ebb1eaf7f592e',
          'FK_42ab2985e93dfc8e9292aee3b5a',
          'FK_090173f0213fbdf1bec6832140f',
          'FK_9a031229ccd106ca3806b3abc84',
          'FK_2d6b20d1849b75429b4778be0ea',
          'FK_events_applications',
          'FK_123df26e98b408d68206e58011c',
          'FK_a8c0eb56707dd07f89f69add8bd',
          'FK_f0ef08f34b52715f6ed2344b003',
          'FK_2c9120eca22bba9926b65bb01de',
          'FK_0689cdf2c2bf4e5d4abac488d13',
          'FK_8dbd6e4d945eddde52dc801c073',
          'FK_cbe2641e04d8b56c2dea2504001',
          'FK_formulas_app',
          'FK_a2310c12961ed78157dc37b1844',
          'FK_1ac2eea4a4abec5fd7d0a741de6',
          'FK_d66bc1ac49fabfb3908a3f0e027',
          'FK_6ea7baea9e4c295ae1bda614aa1',
          'FK_3e33cc2364cfa761f939e015647',
          'FK_5e24e72df569153fa53a410f53b',
          'FK_5e1a72a04251ae353854eda37fd'
        )
    `);

    for (const fk of cascadeFks) {
      await queryRunner.query(
        `ALTER TABLE \`${fk.TABLE_NAME}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``,
      );
      await queryRunner.query(`
        ALTER TABLE \`${fk.TABLE_NAME}\`
        ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\`
        FOREIGN KEY (\`${fk.COLUMN_NAME}\`)
        REFERENCES \`applications\` (\`${fk.REFERENCED_COLUMN_NAME}\`)
        ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    }
  }
}
