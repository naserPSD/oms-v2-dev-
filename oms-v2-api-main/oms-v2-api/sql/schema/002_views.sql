-- MySQL dump 10.13  Distrib 9.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: revinr_oms_new
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `vw_employee_master_with_salary`
--

DROP TABLE IF EXISTS `vw_employee_master_with_salary`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_master_with_salary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_employee_master_with_salary` AS SELECT 
 1 AS `id`,
 1 AS `employee_code`,
 1 AS `employee_name`,
 1 AS `email`,
 1 AS `designation`,
 1 AS `office_name`,
 1 AS `office_shift`,
 1 AS `employee_status`,
 1 AS `employment_status`,
 1 AS `joining_date`,
 1 AS `resignation_date`,
 1 AS `current_status`,
 1 AS `current_grade_id`,
 1 AS `current_grade`,
 1 AS `current_grade_code`,
 1 AS `current_basic_salary`,
 1 AS `active_salary_structure_id`,
 1 AS `structure_basic_salary`,
 1 AS `gross_salary`,
 1 AS `net_salary`,
 1 AS `salary_effective_from`,
 1 AS `salary_effective_to`,
 1 AS `salary_approval_status`,
 1 AS `user_active`,
 1 AS `user_created_date`,
 1 AS `days_since_user_created`,
 1 AS `employment_duration_days`,
 1 AS `salary_grade_compliance`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_employee_salary_history`
--

DROP TABLE IF EXISTS `vw_employee_salary_history`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_salary_history`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_employee_salary_history` AS SELECT 
 1 AS `employee_id`,
 1 AS `employee_code`,
 1 AS `employee_name`,
 1 AS `designation`,
 1 AS `salary_structure_id`,
 1 AS `basic_salary`,
 1 AS `gross_salary`,
 1 AS `net_salary`,
 1 AS `effective_from`,
 1 AS `effective_to`,
 1 AS `remarks`,
 1 AS `grade_name`,
 1 AS `grade_code`,
 1 AS `structure_status`,
 1 AS `approval_status`,
 1 AS `created_by_first_name`,
 1 AS `created_by_last_name`,
 1 AS `created_by_full_name`,
 1 AS `created_at`,
 1 AS `updated_by_first_name`,
 1 AS `updated_by_last_name`,
 1 AS `updated_by_full_name`,
 1 AS `updated_at`,
 1 AS `approved_by_first_name`,
 1 AS `approved_by_last_name`,
 1 AS `approved_by_full_name`,
 1 AS `approved_at`,
 1 AS `structure_duration_days`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_employee_salary_summary`
--

DROP TABLE IF EXISTS `vw_employee_salary_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_salary_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_employee_salary_summary` AS SELECT 
 1 AS `employee_id`,
 1 AS `employee_code`,
 1 AS `employee_name`,
 1 AS `designation`,
 1 AS `office_name`,
 1 AS `employee_status`,
 1 AS `employment_status`,
 1 AS `joining_date`,
 1 AS `resignation_date`,
 1 AS `salary_structure_id`,
 1 AS `basic_salary`,
 1 AS `gross_salary`,
 1 AS `total_deductions`,
 1 AS `net_salary`,
 1 AS `grade_name`,
 1 AS `grade_code`,
 1 AS `current_grade_id`,
 1 AS `current_basic_salary`,
 1 AS `earnings_count`,
 1 AS `deductions_count`,
 1 AS `taxable_earnings`,
 1 AS `non_taxable_earnings`,
 1 AS `statutory_deductions`,
 1 AS `structure_effective_from`,
 1 AS `structure_effective_to`,
 1 AS `days_active`,
 1 AS `structure_status`,
 1 AS `approval_status`,
 1 AS `employment_status_display`,
 1 AS `grade_range_compliance`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vw_payroll_dashboard_summary`
--

DROP TABLE IF EXISTS `vw_payroll_dashboard_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vw_payroll_dashboard_summary` (
  `total_active_employees` bigint DEFAULT NULL,
  `active_salary_structures` bigint DEFAULT NULL,
  `pending_approvals` bigint DEFAULT NULL,
  `total_monthly_gross` decimal(34,2) DEFAULT NULL,
  `total_monthly_net` decimal(34,2) DEFAULT NULL,
  `avg_gross_salary` decimal(16,6) DEFAULT NULL,
  `avg_net_salary` decimal(16,6) DEFAULT NULL,
  `grades_in_use` bigint DEFAULT NULL,
  `structures_created_last_30_days` bigint DEFAULT NULL,
  `structures_updated_last_30_days` bigint DEFAULT NULL,
  `currently_employed` bigint DEFAULT NULL,
  `resigned_employees` bigint DEFAULT NULL,
  `unique_pay_items_in_use` bigint DEFAULT NULL,
  `total_active_pay_items` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `vw_employee_master_with_salary`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_master_with_salary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_master_with_salary` AS select `e`.`id` AS `id`,`e`.`employee_code` AS `employee_code`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `employee_name`,`u`.`email` AS `email`,`d`.`name` AS `designation`,`o`.`name` AS `office_name`,`os`.`name` AS `office_shift`,`st_emp`.`name` AS `employee_status`,`st_empstat`.`name` AS `employment_status`,`e`.`joining_date` AS `joining_date`,`e`.`resignation_date` AS `resignation_date`,(case when (`e`.`resignation_date` is null) then 'Active' else 'Resigned' end) AS `current_status`,`e`.`current_grade_id` AS `current_grade_id`,`sg`.`grade_name` AS `current_grade`,`sg`.`grade_code` AS `current_grade_code`,`e`.`current_basic_salary` AS `current_basic_salary`,`ss`.`id` AS `active_salary_structure_id`,`ss`.`basic_salary` AS `structure_basic_salary`,`ss`.`gross_salary` AS `gross_salary`,`ss`.`net_salary` AS `net_salary`,`ss`.`effective_from` AS `salary_effective_from`,`ss`.`effective_to` AS `salary_effective_to`,(case when (`ss`.`is_approved` = 1) then 'Approved' else 'Pending Approval' end) AS `salary_approval_status`,`u`.`is_active` AS `user_active`,`u`.`created_at` AS `user_created_date`,(to_days(curdate()) - to_days(`u`.`created_at`)) AS `days_since_user_created`,(case when (`e`.`resignation_date` is not null) then (to_days(`e`.`resignation_date`) - to_days(`e`.`joining_date`)) else (to_days(curdate()) - to_days(`e`.`joining_date`)) end) AS `employment_duration_days`,(case when ((`ss`.`basic_salary` is not null) and (`sg`.`min_salary` is not null) and (`sg`.`max_salary` is not null)) then (case when (`ss`.`basic_salary` between `sg`.`min_salary` and `sg`.`max_salary`) then 'Within Grade Range' when (`ss`.`basic_salary` < `sg`.`min_salary`) then 'Below Grade Minimum' when (`ss`.`basic_salary` > `sg`.`max_salary`) then 'Above Grade Maximum' end) else 'No Active Salary Structure' end) AS `salary_grade_compliance` from ((((((((`employees` `e` join `users` `u` on((`e`.`user_id` = `u`.`id`))) left join `designations` `d` on((`e`.`designation_id` = `d`.`id`))) left join `offices` `o` on((`e`.`office_id` = `o`.`id`))) left join `office_shifts` `os` on((`e`.`office_shift_id` = `os`.`id`))) left join `statuses` `st_emp` on((`e`.`employee_status_id` = `st_emp`.`id`))) left join `statuses` `st_empstat` on((`e`.`employment_status_id` = `st_empstat`.`id`))) left join `emp_salary_grades` `sg` on((`e`.`current_grade_id` = `sg`.`id`))) left join `emp_salary_structures` `ss` on(((`e`.`id` = `ss`.`emp_id`) and (`ss`.`is_active` = 1) and ((`ss`.`effective_to` is null) or (`ss`.`effective_to` >= curdate()))))) where (`u`.`is_active` = 1) order by `e`.`employee_code` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_employee_salary_history`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_salary_history`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_salary_history` AS select `e`.`id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `employee_name`,`d`.`name` AS `designation`,`ss`.`id` AS `salary_structure_id`,`ss`.`basic_salary` AS `basic_salary`,`ss`.`gross_salary` AS `gross_salary`,`ss`.`net_salary` AS `net_salary`,`ss`.`effective_from` AS `effective_from`,`ss`.`effective_to` AS `effective_to`,`ss`.`remarks` AS `remarks`,`sg`.`grade_name` AS `grade_name`,`sg`.`grade_code` AS `grade_code`,(case when ((`ss`.`is_active` = 1) and ((`ss`.`effective_to` is null) or (`ss`.`effective_to` >= curdate()))) then 'Active' when (`ss`.`effective_to` < curdate()) then 'Expired' else 'Inactive' end) AS `structure_status`,(case when (`ss`.`is_approved` = 1) then 'Approved' else 'Pending' end) AS `approval_status`,`uc`.`first_name` AS `created_by_first_name`,`uc`.`last_name` AS `created_by_last_name`,concat(`uc`.`first_name`,' ',`uc`.`last_name`) AS `created_by_full_name`,`ss`.`created_at` AS `created_at`,`uu`.`first_name` AS `updated_by_first_name`,`uu`.`last_name` AS `updated_by_last_name`,concat(`uu`.`first_name`,' ',`uu`.`last_name`) AS `updated_by_full_name`,`ss`.`updated_at` AS `updated_at`,`ua`.`first_name` AS `approved_by_first_name`,`ua`.`last_name` AS `approved_by_last_name`,concat(`ua`.`first_name`,' ',`ua`.`last_name`) AS `approved_by_full_name`,`ss`.`approved_at` AS `approved_at`,(to_days(coalesce(`ss`.`effective_to`,curdate())) - to_days(`ss`.`effective_from`)) AS `structure_duration_days` from (((((((`emp_salary_structures` `ss` join `employees` `e` on((`ss`.`emp_id` = `e`.`id`))) join `users` `u` on((`e`.`user_id` = `u`.`id`))) left join `emp_salary_grades` `sg` on((`ss`.`grade_id` = `sg`.`id`))) left join `designations` `d` on((`e`.`designation_id` = `d`.`id`))) left join `users` `uc` on((`ss`.`created_by` = `uc`.`id`))) left join `users` `uu` on((`ss`.`updated_by` = `uu`.`id`))) left join `users` `ua` on((`ss`.`approved_by` = `ua`.`id`))) where (`u`.`is_active` = 1) order by `e`.`employee_code`,`ss`.`effective_from` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_employee_salary_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_salary_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_salary_summary` AS select `e`.`id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `employee_name`,`d`.`name` AS `designation`,`o`.`name` AS `office_name`,`st_emp`.`name` AS `employee_status`,`st_empstat`.`name` AS `employment_status`,`e`.`joining_date` AS `joining_date`,`e`.`resignation_date` AS `resignation_date`,`ss`.`id` AS `salary_structure_id`,`ss`.`basic_salary` AS `basic_salary`,`ss`.`gross_salary` AS `gross_salary`,`ss`.`total_deductions` AS `total_deductions`,`ss`.`net_salary` AS `net_salary`,`sg`.`grade_name` AS `grade_name`,`sg`.`grade_code` AS `grade_code`,`e`.`current_grade_id` AS `current_grade_id`,`e`.`current_basic_salary` AS `current_basic_salary`,(select count(0) from `emp_salary_structure_details` where ((`emp_salary_structure_details`.`salary_structure_id` = `ss`.`id`) and `emp_salary_structure_details`.`pay_item_id` in (select `emp_pay_items`.`id` from `emp_pay_items` where (`emp_pay_items`.`pay_item_type_id` = 194)))) AS `earnings_count`,(select count(0) from `emp_salary_structure_details` where ((`emp_salary_structure_details`.`salary_structure_id` = `ss`.`id`) and `emp_salary_structure_details`.`pay_item_id` in (select `emp_pay_items`.`id` from `emp_pay_items` where (`emp_pay_items`.`pay_item_type_id` = 195)))) AS `deductions_count`,(select coalesce(sum(`emp_salary_structure_details`.`amount`),0) from `emp_salary_structure_details` where ((`emp_salary_structure_details`.`salary_structure_id` = `ss`.`id`) and `emp_salary_structure_details`.`pay_item_id` in (select `emp_pay_items`.`id` from `emp_pay_items` where ((`emp_pay_items`.`pay_item_type_id` = 194) and (`emp_pay_items`.`is_taxable` = 1))))) AS `taxable_earnings`,(select coalesce(sum(`emp_salary_structure_details`.`amount`),0) from `emp_salary_structure_details` where ((`emp_salary_structure_details`.`salary_structure_id` = `ss`.`id`) and `emp_salary_structure_details`.`pay_item_id` in (select `emp_pay_items`.`id` from `emp_pay_items` where ((`emp_pay_items`.`pay_item_type_id` = 194) and (`emp_pay_items`.`is_taxable` = 0))))) AS `non_taxable_earnings`,(select coalesce(sum(`emp_salary_structure_details`.`amount`),0) from `emp_salary_structure_details` where ((`emp_salary_structure_details`.`salary_structure_id` = `ss`.`id`) and `emp_salary_structure_details`.`pay_item_id` in (select `emp_pay_items`.`id` from `emp_pay_items` where (`emp_pay_items`.`is_statutory` = 1)))) AS `statutory_deductions`,`ss`.`effective_from` AS `structure_effective_from`,`ss`.`effective_to` AS `structure_effective_to`,(to_days(coalesce(`ss`.`effective_to`,curdate())) - to_days(`ss`.`effective_from`)) AS `days_active`,(case when ((`ss`.`is_active` = 1) and ((`ss`.`effective_to` is null) or (`ss`.`effective_to` >= curdate()))) then 'Active' when (`ss`.`effective_to` < curdate()) then 'Expired' else 'Inactive' end) AS `structure_status`,(case when (`ss`.`is_approved` = 1) then 'Approved' else 'Pending' end) AS `approval_status`,(case when (`e`.`resignation_date` is null) then 'Currently Employed' else concat('Resigned on ',date_format(`e`.`resignation_date`,'%d-%m-%Y')) end) AS `employment_status_display`,(case when (`ss`.`basic_salary` between `sg`.`min_salary` and `sg`.`max_salary`) then 'Within Range' when (`ss`.`basic_salary` < `sg`.`min_salary`) then 'Below Minimum' when (`ss`.`basic_salary` > `sg`.`max_salary`) then 'Above Maximum' else 'N/A' end) AS `grade_range_compliance` from (((((((`emp_salary_structures` `ss` join `employees` `e` on((`ss`.`emp_id` = `e`.`id`))) join `users` `u` on((`e`.`user_id` = `u`.`id`))) left join `emp_salary_grades` `sg` on((`ss`.`grade_id` = `sg`.`id`))) left join `designations` `d` on((`e`.`designation_id` = `d`.`id`))) left join `offices` `o` on((`e`.`office_id` = `o`.`id`))) left join `statuses` `st_emp` on((`e`.`employee_status_id` = `st_emp`.`id`))) left join `statuses` `st_empstat` on((`e`.`employment_status_id` = `st_empstat`.`id`))) where ((`ss`.`is_active` = 1) and (`u`.`is_active` = 1)) order by `e`.`employee_code` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07  9:25:46
