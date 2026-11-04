-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
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
-- Current Database: `revinr_oms_new`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `revinr_oms_new` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `revinr_oms_new`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `module_id` int unsigned DEFAULT NULL COMMENT 'ID of the entity this address belongs to (e.g., office ID, user ID)',
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Module name this address belongs to (e.g., "office", "user") ',
  `address_type` enum('Residential','Commercial','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Commercial',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(24) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_id` int unsigned DEFAULT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gmap_latitude` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gmap_longitude` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `map_link` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_module` (`module`),
  KEY `idx_addresses_module_id` (`module_id`),
  KEY `FK_98e1ca336038167c7eb48c02582` (`country_id`),
  CONSTRAINT `FK_98e1ca336038167c7eb48c02582` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_holiday_dates`
--

DROP TABLE IF EXISTS `app_holiday_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_holiday_dates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_holiday_id` int unsigned NOT NULL,
  `holiday_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_holidays`
--

DROP TABLE IF EXISTS `app_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `holiday_id` int unsigned DEFAULT NULL,
  `holiday_type_id` int DEFAULT NULL,
  `holiday_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `day_count` tinyint DEFAULT '1',
  `is_recurring` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether it repeats annually',
  `is_official` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether it├â┬ó├óΓÇÜ┬¼├óΓÇ₧┬ós an official day off',
  `creator_id` int DEFAULT NULL,
  `editor_id` int DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_119c4da9cf2aafb08b0c7397206` (`app_id`),
  CONSTRAINT `FK_119c4da9cf2aafb08b0c7397206` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_profiles`
--

DROP TABLE IF EXISTS `app_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `email` int unsigned DEFAULT NULL,
  `phone_country_id` int unsigned DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linked_in_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_users`
--

DROP TABLE IF EXISTS `app_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `user_type_id` int unsigned DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `leaving_date` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_app_user_active` (`is_active`),
  KEY `FK_066997c6a75c0847736ac6ed017` (`app_id`),
  KEY `FK_1c9491ba157e3501f828d224706` (`user_id`),
  KEY `FK_149001b5142ad410f820256e496` (`user_type_id`),
  CONSTRAINT `FK_066997c6a75c0847736ac6ed017` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_149001b5142ad410f820256e496` FOREIGN KEY (`user_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_1c9491ba157e3501f828d224706` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_id` int unsigned NOT NULL,
  `size_id` int unsigned NOT NULL,
  `logo_media_id` int unsigned DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_country_id` int unsigned DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linked_in_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4522503a636e1cf4b032c7627b9` (`type_id`),
  KEY `FK_a0176e2c5f40e0cd595750d07e8` (`size_id`),
  KEY `FK_8a3de82147959fc94746262d4ee` (`phone_country_id`),
  KEY `FK_049ad019832264e195e99e5bd4f` (`created_by`),
  CONSTRAINT `FK_049ad019832264e195e99e5bd4f` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_4522503a636e1cf4b032c7627b9` FOREIGN KEY (`type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_8a3de82147959fc94746262d4ee` FOREIGN KEY (`phone_country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_a0176e2c5f40e0cd595750d07e8` FOREIGN KEY (`size_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asset_types`
--

DROP TABLE IF EXISTS `asset_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_types` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_reconciliations`
--

DROP TABLE IF EXISTS `attendance_reconciliations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_reconciliations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `emp_id` int unsigned NOT NULL,
  `app_id` int unsigned NOT NULL,
  `attendance_id` int unsigned DEFAULT NULL,
  `attendance_date` date DEFAULT NULL,
  `in_time` time DEFAULT NULL,
  `out_time` time DEFAULT NULL,
  `in_time_remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `out_time_remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `in_time_status_id` int unsigned DEFAULT NULL,
  `in_time_approve_date` datetime DEFAULT NULL,
  `in_time_supervisor_remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `out_time_status_id` int unsigned DEFAULT NULL,
  `out_time_approve_date` datetime DEFAULT NULL,
  `out_time_supervisor_remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_8c7edcc2541857dd2c65387c98` (`attendance_id`),
  KEY `FK_45847576632b41fa0a321ae2805` (`app_id`),
  KEY `FK_f2ee0ffea256c5d73d78526dac0` (`emp_id`),
  KEY `FK_9b96798b818e7f3f19fec29b6c5` (`in_time_status_id`),
  KEY `FK_8f8bd3d6d3bb1118db1d7b87b41` (`out_time_status_id`),
  CONSTRAINT `FK_45847576632b41fa0a321ae2805` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8c7edcc2541857dd2c65387c98d` FOREIGN KEY (`attendance_id`) REFERENCES `emp_attendances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8f8bd3d6d3bb1118db1d7b87b41` FOREIGN KEY (`out_time_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_9b96798b818e7f3f19fec29b6c5` FOREIGN KEY (`in_time_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_f2ee0ffea256c5d73d78526dac0` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` longtext COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `entity_id` bigint unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_id` (`id`),
  KEY `FK_bd2726fd31b35443f2245b93ba0` (`user_id`),
  CONSTRAINT `FK_bd2726fd31b35443f2245b93ba0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=846 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_otp`
--

DROP TABLE IF EXISTS `auth_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_otp` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `session_id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `otp_type` enum('login','reset_password','email_verification') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `otp_channel` enum('email','phone') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `otp` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `expired_at` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8fedd7b49c9922431069914529` (`session_id`),
  KEY `FK_c2a200c28f413a3bd7fc9cb6d94` (`user_id`),
  CONSTRAINT `FK_c2a200c28f413a3bd7fc9cb6d94` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aws_media`
--

DROP TABLE IF EXISTS `aws_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aws_media` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Entity Name',
  `model_id` int unsigned DEFAULT NULL COMMENT 'Entity Id',
  `document_type_id` int unsigned DEFAULT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` double(24,2) DEFAULT NULL COMMENT 'Size Unit Is Bytes',
  `extension` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `awsKey` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `batch_email_recipients`
--

DROP TABLE IF EXISTS `batch_email_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_email_recipients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `batch_email_id` int unsigned NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','sent','opened','link_visited','bounced','spam_complaint') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `sent_at` datetime DEFAULT NULL,
  `bounced_at` datetime DEFAULT NULL,
  `opened_at` datetime DEFAULT NULL,
  `link_visited_at` datetime DEFAULT NULL,
  `message_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_0bae36c5059b36d07158ad9ef7b` (`batch_email_id`),
  CONSTRAINT `FK_0bae36c5059b36d07158ad9ef7b` FOREIGN KEY (`batch_email_id`) REFERENCES `batch_emails` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `batch_email_sections`
--

DROP TABLE IF EXISTS `batch_email_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_email_sections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `batch_email_id` int unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `img_id` int unsigned DEFAULT NULL,
  `btn_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `btn_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_text` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `batch_emails`
--

DROP TABLE IF EXISTS `batch_emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_emails` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `campaign_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_html` text COLLATE utf8mb4_unicode_ci,
  `sent_at` datetime DEFAULT NULL,
  `total_recipients` int unsigned NOT NULL DEFAULT '0',
  `creator_id` int unsigned DEFAULT NULL,
  `editor_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `filter_query` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `template_design` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_870fb3d62d16d4ebb1eaf7f592e` (`app_id`),
  KEY `FK_44c992ec37851c92e4fc9821393` (`creator_id`),
  KEY `FK_8f4129f411b4a486138dc58f07f` (`editor_id`),
  CONSTRAINT `FK_44c992ec37851c92e4fc9821393` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_870fb3d62d16d4ebb1eaf7f592e` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_8f4129f411b4a486138dc58f07f` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `excerpt` text,
  `content` longtext,
  `cover_image` varchar(500) DEFAULT NULL,
  `author_name` varchar(150) DEFAULT 'Sanzio Team',
  `author_role` varchar(150) DEFAULT 'Product',
  `read_time` varchar(50) DEFAULT '4 min read',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blogs_slug` (`slug`),
  KEY `idx_blogs_category` (`category`),
  KEY `idx_blogs_is_published` (`is_published`),
  KEY `idx_blogs_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_document_records`
--

DROP TABLE IF EXISTS `company_document_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_document_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `company_document_id` int unsigned DEFAULT NULL,
  `entity` varchar(255) DEFAULT NULL,
  `entity_id` int unsigned DEFAULT NULL,
  `media_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_documents`
--

DROP TABLE IF EXISTS `company_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `document_type_id` int unsigned DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expired_date` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_41859951301d036cf6f71ee5bcc` (`app_id`),
  KEY `FK_836f530b81765540aaf89c24d35` (`document_type_id`),
  CONSTRAINT `FK_41859951301d036cf6f71ee5bcc` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_836f530b81765540aaf89c24d35` FOREIGN KEY (`document_type_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `capital` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `citizenship` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_sub_unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_decimals` int DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iso_3166_2` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `iso_3166_3` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `region_code` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `sub_region_code` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `eea` tinyint(1) NOT NULL DEFAULT '0',
  `calling_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flag` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `status_by` int DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `currency_symbol` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=253 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coupon_redemptions`
--

DROP TABLE IF EXISTS `coupon_redemptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_redemptions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `subscription_id` int unsigned DEFAULT NULL,
  `coupon_id` int unsigned NOT NULL,
  `invoice_id` int unsigned DEFAULT NULL,
  `discount_applied` decimal(10,2) NOT NULL,
  `stripe_promotion_code_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `unique_company_coupon_subscription` (`coupon_id`),
  KEY `FK_d0719796192d7a170fd5fdd23a4` (`app_id`),
  KEY `FK_c4502cbd570b4e89a1f170a9ab8` (`subscription_id`),
  KEY `FK_342a1098c58775007800b90daf4` (`invoice_id`),
  CONSTRAINT `FK_342a1098c58775007800b90daf4` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  CONSTRAINT `FK_9df1b9bc48e3eea5da3762f8e56` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FK_c4502cbd570b4e89a1f170a9ab8` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `FK_d0719796192d7a170fd5fdd23a4` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `valid_from` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_until` datetime DEFAULT NULL,
  `max_redemptions` int DEFAULT NULL,
  `redemption_count` int DEFAULT '0',
  `applies_to` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `applicable_plans` longtext COLLATE utf8mb4_unicode_ci,
  `minimum_amount` decimal(10,2) DEFAULT NULL,
  `max_uses_per_company` int DEFAULT '1',
  `first_time_only` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_redeemable` tinyint(1) DEFAULT '1',
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_dc1cf7573d95d72ac52fe10a976` (`created_by`),
  CONSTRAINT `FK_dc1cf7573d95d72ac52fe10a976` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `db_configs`
--

DROP TABLE IF EXISTS `db_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `db_configs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `json_data` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d0fd92e1b7303036dc5a9041a9` (`key`),
  KEY `db_config_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `creator_id` int DEFAULT NULL,
  `updater_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DEPARTMENTS_APP_NAME` (`app_id`,`name`),
  KEY `FK_75430ef94b898b7bae7fcc28b6a` (`app_id`),
  CONSTRAINT `FK_75430ef94b898b7bae7fcc28b6a` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `designations`
--

DROP TABLE IF EXISTS `designations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int unsigned DEFAULT NULL,
  `level` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `creator_id` int DEFAULT NULL,
  `updater_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `IDX_DESIGNATIONS_APP_ID` (`app_id`),
  KEY `FK_97884615dba807341722aa7aa4b` (`department_id`),
  CONSTRAINT `FK_97884615dba807341722aa7aa4b` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `education_maps`
--

DROP TABLE IF EXISTS `education_maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education_maps` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('Course Level','Degree','Field of Study') COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  `serial` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_attendance_late_counters`
--

DROP TABLE IF EXISTS `emp_attendance_late_counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_attendance_late_counters` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `late_attendance_rule_id` int unsigned DEFAULT NULL,
  `late_counter` tinyint unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_8258dba66349e65b144ab805b76` (`app_id`),
  KEY `FK_41a3a26b13ca0fd437f86800cf8` (`office_id`),
  KEY `FK_add9f8e048c1aebe0fb8df8b781` (`emp_id`),
  KEY `FK_2b6ba371c71a4acc3fd88afde53` (`late_attendance_rule_id`),
  CONSTRAINT `FK_2b6ba371c71a4acc3fd88afde53` FOREIGN KEY (`late_attendance_rule_id`) REFERENCES `late_attendance_rules` (`id`),
  CONSTRAINT `FK_41a3a26b13ca0fd437f86800cf8` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `FK_8258dba66349e65b144ab805b76` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_add9f8e048c1aebe0fb8df8b781` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_attendance_penalties`
--

DROP TABLE IF EXISTS `emp_attendance_penalties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_attendance_penalties` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `month` tinyint DEFAULT NULL,
  `year` smallint DEFAULT NULL,
  `entry_time` datetime DEFAULT NULL,
  `entry_status_id` int unsigned DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `application_status_id` int unsigned DEFAULT NULL,
  `approved_user_id` int unsigned DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_0fd9bc8188d32bf66413aad934b` (`app_id`),
  KEY `FK_d1c8f24e963d86653d1c8c65e8f` (`emp_id`),
  KEY `FK_3208d168001de823d3ad0e1137b` (`entry_status_id`),
  KEY `FK_26f3cf402e1f634068a524275c4` (`application_status_id`),
  KEY `FK_4eac2840d672f8b8c688c20eab4` (`approved_user_id`),
  CONSTRAINT `FK_0fd9bc8188d32bf66413aad934b` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_26f3cf402e1f634068a524275c4` FOREIGN KEY (`application_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_3208d168001de823d3ad0e1137b` FOREIGN KEY (`entry_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_4eac2840d672f8b8c688c20eab4` FOREIGN KEY (`approved_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_d1c8f24e963d86653d1c8c65e8f` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_attendances`
--

DROP TABLE IF EXISTS `emp_attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_attendances` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `shift_id` int unsigned DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `attendance_status_id` int unsigned DEFAULT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_in_status_id` int unsigned DEFAULT NULL,
  `check_in_method_id` int unsigned DEFAULT NULL,
  `check_in_lat_long` text COLLATE utf8mb4_unicode_ci,
  `check_out` datetime DEFAULT NULL,
  `check_out_status_id` int unsigned DEFAULT NULL,
  `check_out_method_id` int unsigned DEFAULT NULL,
  `check_out_lat_long` text COLLATE utf8mb4_unicode_ci,
  `worked_hour` decimal(10,2) DEFAULT NULL,
  `overtime_hours` decimal(10,2) DEFAULT NULL,
  `start_break` datetime DEFAULT NULL,
  `end_break` datetime DEFAULT NULL,
  `break_minutes` int NOT NULL DEFAULT '0',
  `late_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `late_approval_status_id` int unsigned DEFAULT NULL,
  `late_approval_user_id` int unsigned DEFAULT NULL,
  `early_leave_reason_id` int unsigned DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `json_data` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97d5894c53b71c1137333e05dc` (`app_id`,`emp_id`,`attendance_date`),
  KEY `FK_8f52ef7a42ea3955bc1b75d0651` (`emp_id`),
  KEY `FK_7f6a9534583e20a2c8b3b7def70` (`office_id`),
  KEY `FK_dd80d932c49392b21df8e996c1b` (`shift_id`),
  KEY `FK_f650064107cfdb055fb3b76753b` (`attendance_status_id`),
  KEY `FK_e13a48248be73b2496c2bce11f5` (`check_in_status_id`),
  KEY `FK_845055b368fa4ed5b54abfb08cb` (`check_in_method_id`),
  KEY `FK_ee1215f0f30a0629a6630bf8f30` (`check_out_status_id`),
  KEY `FK_32064ade21ac2af9f9f3684eb97` (`check_out_method_id`),
  KEY `FK_be5bc31ac330472b96b1a50633c` (`late_approval_status_id`),
  KEY `FK_76bcfe65f1e2ad7b59681132044` (`late_approval_user_id`),
  KEY `FK_30d55f18df7d33a1a370080e5b2` (`early_leave_reason_id`),
  CONSTRAINT `FK_30d55f18df7d33a1a370080e5b2` FOREIGN KEY (`early_leave_reason_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_32064ade21ac2af9f9f3684eb97` FOREIGN KEY (`check_out_method_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_76bcfe65f1e2ad7b59681132044` FOREIGN KEY (`late_approval_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_7f6a9534583e20a2c8b3b7def70` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_845055b368fa4ed5b54abfb08cb` FOREIGN KEY (`check_in_method_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_8f52ef7a42ea3955bc1b75d0651` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a6dd9855718a143ba0922745696` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_be5bc31ac330472b96b1a50633c` FOREIGN KEY (`late_approval_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_dd80d932c49392b21df8e996c1b` FOREIGN KEY (`shift_id`) REFERENCES `office_shifts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_e13a48248be73b2496c2bce11f5` FOREIGN KEY (`check_in_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_ee1215f0f30a0629a6630bf8f30` FOREIGN KEY (`check_out_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_f650064107cfdb055fb3b76753b` FOREIGN KEY (`attendance_status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=309 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_income_tax_tiers`
--

DROP TABLE IF EXISTS `emp_income_tax_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_income_tax_tiers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `financial_year` varchar(10) NOT NULL COMMENT 'e.g., 2024-25',
  `tier_name` varchar(100) NOT NULL,
  `min_income` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_income` decimal(12,2) DEFAULT NULL COMMENT 'NULL means no upper limit',
  `tax_rate` decimal(5,2) NOT NULL COMMENT 'Percentage rate',
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Fixed tax amount for this tier',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_c50c9647eeeef2933654c2ddeae` (`app_id`),
  CONSTRAINT `FK_c50c9647eeeef2933654c2ddeae` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_invitations`
--

DROP TABLE IF EXISTS `emp_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_invitations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `office_id` int unsigned NOT NULL,
  `shift_id` int unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation_id` int unsigned DEFAULT NULL,
  `invitation_status_id` int unsigned NOT NULL DEFAULT '90',
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `IDX_4639fc2fa1c9ad61b49365a904` (`code`),
  KEY `FK_090173f0213fbdf1bec6832140f` (`app_id`),
  KEY `FK_5549bd83b3b14c9649131e7693f` (`office_id`),
  KEY `FK_6d4e8d6764ab66e8b73c74f8c28` (`invitation_status_id`),
  KEY `FK_bd1fc799fb67e00b6dd4642a86a` (`user_id`),
  KEY `FK_9e2285d53c9f751c180fd4bb9a9` (`emp_id`),
  CONSTRAINT `FK_090173f0213fbdf1bec6832140f` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_5549bd83b3b14c9649131e7693f` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `FK_6d4e8d6764ab66e8b73c74f8c28` FOREIGN KEY (`invitation_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_9e2285d53c9f751c180fd4bb9a9` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_bd1fc799fb67e00b6dd4642a86a` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_late_counters`
--

DROP TABLE IF EXISTS `emp_late_counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_late_counters` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `late_attendance_rule_id` int unsigned DEFAULT NULL,
  `late_counter` tinyint unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_leave_requests`
--

DROP TABLE IF EXISTS `emp_leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_leave_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `emp_id` int unsigned NOT NULL,
  `leave_type_id` int unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_media_id` int unsigned DEFAULT NULL,
  `approval_status_id` int unsigned NOT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_9a031229ccd106ca3806b3abc84` (`app_id`),
  KEY `FK_91cde87bd7e53e7ff9f75a62fe6` (`emp_id`),
  KEY `FK_aba7375a22de0ba0475794848b7` (`leave_type_id`),
  KEY `FK_99feecf362206cb8c3ae78cda33` (`approval_status_id`),
  KEY `FK_01d864186f2f72000a5b7722cf1` (`attachment_media_id`),
  CONSTRAINT `FK_01d864186f2f72000a5b7722cf1` FOREIGN KEY (`attachment_media_id`) REFERENCES `aws_media` (`id`),
  CONSTRAINT `FK_91cde87bd7e53e7ff9f75a62fe6` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_99feecf362206cb8c3ae78cda33` FOREIGN KEY (`approval_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_9a031229ccd106ca3806b3abc84` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_aba7375a22de0ba0475794848b7` FOREIGN KEY (`leave_type_id`) REFERENCES `emp_leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_leave_types`
--

DROP TABLE IF EXISTS `emp_leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_leave_types` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_paid` tinyint unsigned NOT NULL DEFAULT '1',
  `max_days_per_year` int unsigned NOT NULL,
  `requires_approval` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_pay_items`
--

DROP TABLE IF EXISTS `emp_pay_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_pay_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pay_item_type_id` int unsigned NOT NULL DEFAULT '194',
  `pay_item_category_id` int unsigned NOT NULL DEFAULT '200',
  `recurrence_type_id` int unsigned NOT NULL DEFAULT '201',
  `recurrence_count` int unsigned NOT NULL DEFAULT '1',
  `calculation_method_id` int unsigned DEFAULT NULL,
  `calc_value` decimal(10,2) DEFAULT '0.00',
  `affects_gross_salary` tinyint NOT NULL DEFAULT '1' COMMENT 'Whether this item affects gross salary calculation',
  `affects_net_salary` tinyint NOT NULL DEFAULT '1' COMMENT 'Whether this item affects net salary calculation',
  `is_statutory` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether this is a statutory requirement (PF, PT, ESI, etc.)',
  `is_taxable` tinyint NOT NULL DEFAULT '1',
  `tax_section` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Income Tax Section under which this falls (e.g., 80C for PF)',
  `max_limit` decimal(10,2) DEFAULT NULL COMMENT 'Maximum limit for this item if applicable',
  `min_limit` decimal(10,2) DEFAULT NULL COMMENT 'Minimum limit for this item if applicable',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_d13a762841a3684b7403403e44a` (`pay_item_type_id`),
  KEY `FK_dd377d5a8cad9c08229a944de3c` (`pay_item_category_id`),
  KEY `FK_149532ed0942dd93f3b38bd76e9` (`recurrence_type_id`),
  KEY `FK_4071f1a1085315d6fb02ffaf128` (`app_id`),
  KEY `FK_a6ecad63f992acad85ba843c6ce` (`calculation_method_id`),
  CONSTRAINT `FK_149532ed0942dd93f3b38bd76e9` FOREIGN KEY (`recurrence_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_4071f1a1085315d6fb02ffaf128` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a6ecad63f992acad85ba843c6ce` FOREIGN KEY (`calculation_method_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_d13a762841a3684b7403403e44a` FOREIGN KEY (`pay_item_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_dd377d5a8cad9c08229a944de3c` FOREIGN KEY (`pay_item_category_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_payment_history`
--

DROP TABLE IF EXISTS `emp_payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_payment_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `payment_method_id` int unsigned DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_date` date NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `paid_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `payroll_employee_id` int unsigned NOT NULL,
  `payment_status_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b9e7585b676d40774b94d32e371` (`emp_id`),
  KEY `FK_3d8916125e041bdfc8ec0620f92` (`app_id`),
  KEY `FK_84c2ca9dd34ff2e38d8c9a6da1f` (`payment_method_id`),
  KEY `FK_c200fbe4ca9fecd96d3a63ed23a` (`payment_status_id`),
  CONSTRAINT `FK_3d8916125e041bdfc8ec0620f92` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_84c2ca9dd34ff2e38d8c9a6da1f` FOREIGN KEY (`payment_method_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_b9e7585b676d40774b94d32e371` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_c200fbe4ca9fecd96d3a63ed23a` FOREIGN KEY (`payment_status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_payroll_monthly_breakdowns`
--

DROP TABLE IF EXISTS `emp_payroll_monthly_breakdowns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_payroll_monthly_breakdowns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `monthly_record_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `pay_item_id` bigint unsigned NOT NULL,
  `month` tinyint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_67a0e2387902bd05c5559e927ed` (`pay_item_id`),
  KEY `FK_c6d3c6013d315bb09d07ffc3dea` (`app_id`),
  KEY `FK_d755ee11672ff48950bc25538de` (`monthly_record_id`),
  KEY `FK_fe1f45582ed1f6a1e486f61153a` (`emp_id`),
  CONSTRAINT `FK_67a0e2387902bd05c5559e927ed` FOREIGN KEY (`pay_item_id`) REFERENCES `emp_pay_items` (`id`),
  CONSTRAINT `FK_c6d3c6013d315bb09d07ffc3dea` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_d755ee11672ff48950bc25538de` FOREIGN KEY (`monthly_record_id`) REFERENCES `emp_payroll_monthly_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_fe1f45582ed1f6a1e486f61153a` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=787 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_payroll_monthly_records`
--

DROP TABLE IF EXISTS `emp_payroll_monthly_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_payroll_monthly_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `payroll_run_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `month` tinyint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `salary_structure_id` int unsigned NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL,
  `total_earnings` decimal(12,2) DEFAULT '0.00',
  `total_deductions` decimal(12,2) DEFAULT '0.00',
  `net_salary` decimal(12,2) DEFAULT '0.00',
  `working_days` int DEFAULT '0',
  `present_days` int DEFAULT '0',
  `absent_days` int DEFAULT '0',
  `paid_days` decimal(5,2) DEFAULT '0.00',
  `extra_amount` decimal(12,2) DEFAULT '0.00',
  `penalties_amount` decimal(12,2) DEFAULT '0.00',
  `penalty_apply` tinyint DEFAULT '0',
  `payable` decimal(12,2) NOT NULL,
  `paid` decimal(12,2) DEFAULT '0.00',
  `due` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_status_id` int unsigned DEFAULT '182',
  `remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_be3222d63ab2d003256c8d68aad` (`salary_structure_id`),
  KEY `FK_6d758055b440824ae76c58abd6d` (`payment_status_id`),
  KEY `FK_867f5e5b4634b5532d0a1f9fc33` (`emp_id`),
  KEY `FK_60ac73e3461f66e0a2b0b2fa2ae` (`app_id`),
  KEY `FK_48c026017deff43d03026d50d32` (`payroll_run_id`),
  CONSTRAINT `FK_48c026017deff43d03026d50d32` FOREIGN KEY (`payroll_run_id`) REFERENCES `emp_payroll_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_60ac73e3461f66e0a2b0b2fa2ae` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_6d758055b440824ae76c58abd6d` FOREIGN KEY (`payment_status_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_867f5e5b4634b5532d0a1f9fc33` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_be3222d63ab2d003256c8d68aad` FOREIGN KEY (`salary_structure_id`) REFERENCES `emp_salary_structures` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_payroll_runs`
--

DROP TABLE IF EXISTS `emp_payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_payroll_runs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `payroll_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pay_period_month` tinyint unsigned NOT NULL,
  `pay_period_year` smallint unsigned NOT NULL,
  `pay_period_start` date DEFAULT NULL,
  `pay_period_end` date DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_status_id` int unsigned DEFAULT '182',
  `total_employees` int DEFAULT '0',
  `payable` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid` decimal(15,2) NOT NULL DEFAULT '0.00',
  `due` decimal(15,2) NOT NULL DEFAULT '0.00',
  `remarks` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_by` int unsigned DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_38cfa0862bdf9f02aaba3fcc205` (`payment_status_id`),
  KEY `FK_50dc702028d6aca97216f3e31b4` (`app_id`),
  KEY `FK_414ecd1d1a985d4891162b87d4c` (`processed_by`),
  CONSTRAINT `FK_38cfa0862bdf9f02aaba3fcc205` FOREIGN KEY (`payment_status_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_414ecd1d1a985d4891162b87d4c` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_50dc702028d6aca97216f3e31b4` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_promotions`
--

DROP TABLE IF EXISTS `emp_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_promotions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `employee_id` int unsigned NOT NULL,
  `action_status_id` int unsigned DEFAULT NULL,
  `old_designation_id` int unsigned DEFAULT NULL,
  `new_designation_id` int unsigned DEFAULT NULL,
  `old_grade_id` int unsigned DEFAULT NULL,
  `new_grade_id` int unsigned DEFAULT NULL,
  `old_basic_salary` decimal(12,2) DEFAULT NULL,
  `new_basic_salary` decimal(12,2) NOT NULL,
  `promotion_date` date NOT NULL,
  `effective_date` date NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  PRIMARY KEY (`id`),
  KEY `FK_99c2d91570df0a2fda00371ed3a` (`employee_id`),
  KEY `FK_10f972a6824cbf942fb857f0aec` (`app_id`),
  KEY `FK_fbc2d23cf29171f507d712961f3` (`action_status_id`),
  KEY `FK_29eaf2d64536ffed4ac9a436844` (`old_designation_id`),
  KEY `FK_3c23ea49e981b42ce5f162d0ed9` (`new_designation_id`),
  KEY `FK_6afe89aee588633d489ae1f3c18` (`old_grade_id`),
  KEY `FK_a6ac31206e16c281bafb425c7b0` (`new_grade_id`),
  KEY `FK_0824cd7150e1ebdc86f9d8cadd5` (`approved_by`),
  CONSTRAINT `FK_0824cd7150e1ebdc86f9d8cadd5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_10f972a6824cbf942fb857f0aec` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_29eaf2d64536ffed4ac9a436844` FOREIGN KEY (`old_designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_3c23ea49e981b42ce5f162d0ed9` FOREIGN KEY (`new_designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_6afe89aee588633d489ae1f3c18` FOREIGN KEY (`old_grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_99c2d91570df0a2fda00371ed3a` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a6ac31206e16c281bafb425c7b0` FOREIGN KEY (`new_grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_fbc2d23cf29171f507d712961f3` FOREIGN KEY (`action_status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_change_types`
--

DROP TABLE IF EXISTS `emp_salary_change_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_change_types` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `change_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `requires_approval` tinyint(1) DEFAULT '1',
  `approval_level` enum('HR','MANAGER','DIRECTOR','CEO') COLLATE utf8mb4_unicode_ci DEFAULT 'MANAGER',
  `max_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Maximum allowed percentage change',
  `max_amount` decimal(12,2) DEFAULT NULL COMMENT 'Maximum allowed amount change',
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a416a973393b189ecbf9fd8a3b` (`change_code`),
  KEY `FK_03ec3de1944f98318c7c8504c72` (`app_id`),
  CONSTRAINT `FK_03ec3de1944f98318c7c8504c72` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_grade_rules`
--

DROP TABLE IF EXISTS `emp_salary_grade_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_grade_rules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `grade_id` int unsigned NOT NULL,
  `pay_item_id` bigint unsigned NOT NULL,
  `min_basic` decimal(10,2) NOT NULL,
  `max_basic` decimal(10,2) NOT NULL,
  `calculation_method_id` int unsigned DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL COMMENT 'Percentage of basic salary',
  `fixed_amount` decimal(10,2) DEFAULT NULL COMMENT 'Fixed amount if not percentage-based',
  `formula` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Formula for calculation if method is FORMULA',
  `remarks` text COLLATE utf8mb4_unicode_ci COMMENT 'Any remarks about this rule',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL COMMENT 'Rule validity end date',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_d962828e6c2fd872cff85fb454d` (`grade_id`),
  KEY `FK_272e3cde868a2322b9944315b48` (`pay_item_id`),
  KEY `FK_8468022350e33ca8cf21d691df3` (`app_id`),
  KEY `FK_f8e3dccefed86e41a7bec7226a4` (`calculation_method_id`),
  KEY `FK_2c55d02705fd5ce97b049e2e06a` (`updated_by`),
  CONSTRAINT `FK_272e3cde868a2322b9944315b48` FOREIGN KEY (`pay_item_id`) REFERENCES `emp_pay_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_2c55d02705fd5ce97b049e2e06a` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_8468022350e33ca8cf21d691df3` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_d962828e6c2fd872cff85fb454d` FOREIGN KEY (`grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_f8e3dccefed86e41a7bec7226a4` FOREIGN KEY (`calculation_method_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_grades`
--

DROP TABLE IF EXISTS `emp_salary_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_grades` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `grade_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int NOT NULL DEFAULT '0' COMMENT 'numeric aceding order. Exp: 1,2,3',
  `min_salary` decimal(10,2) NOT NULL,
  `max_salary` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`),
  KEY `FK_c6a340828de3369c427ef000571` (`app_id`),
  CONSTRAINT `FK_c6a340828de3369c427ef000571` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_history`
--

DROP TABLE IF EXISTS `emp_salary_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `salary_structure_id` int unsigned DEFAULT NULL,
  `salary_event_type_id` int unsigned DEFAULT NULL,
  `change_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reason for change: Performance, Annual, Market Adjustment, etc.',
  `old_grade_id` int unsigned DEFAULT NULL,
  `new_grade_id` int unsigned DEFAULT NULL,
  `old_basic_salary` decimal(12,2) DEFAULT NULL,
  `new_basic_salary` decimal(12,2) DEFAULT NULL,
  `old_gross_salary` decimal(12,2) DEFAULT NULL,
  `new_gross_salary` decimal(12,2) DEFAULT NULL,
  `old_net_salary` decimal(12,2) DEFAULT NULL,
  `new_net_salary` decimal(12,2) DEFAULT NULL,
  `old_currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `new_currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `basic_increment_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Percentage increase in basic',
  `basic_increment_amount` decimal(12,2) DEFAULT NULL COMMENT 'Absolute increase in basic',
  `gross_increment_percentage` decimal(5,2) DEFAULT NULL,
  `gross_increment_amount` decimal(12,2) DEFAULT NULL,
  `component_changes` longtext COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of component changes',
  `effective_from` date NOT NULL COMMENT 'When change takes effect',
  `effective_to` date DEFAULT NULL COMMENT 'If temporary change, when it ends',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_status` enum('PENDING','APPROVED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `approval_remarks` text COLLATE utf8mb4_unicode_ci,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Order/Reference number',
  `reference_document` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Document file path/URL',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `additional_data` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Any additional structured data',
  `created_by` int unsigned DEFAULT NULL,
  `changed_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_f451c620cc33ed3d580919f78e0` (`emp_id`),
  KEY `FK_826e863604a52070ce20e10ed64` (`app_id`),
  KEY `FK_3f7523bdf955fc7da341be02f82` (`salary_structure_id`),
  KEY `FK_4b6041bfb2a9b087e58c9e40bde` (`salary_event_type_id`),
  KEY `FK_44d75647e0bdef1af5239b40d28` (`old_grade_id`),
  KEY `FK_a5329cdbc04edc0f6e00246ce8b` (`new_grade_id`),
  KEY `FK_2328e0ea722f6441fae73f8954e` (`approved_by`),
  KEY `FK_b1f3b11774592e5eb39df909b28` (`created_by`),
  KEY `FK_af03f15bf15d57442d40de8e34f` (`changed_by`),
  CONSTRAINT `FK_2328e0ea722f6441fae73f8954e` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_3f7523bdf955fc7da341be02f82` FOREIGN KEY (`salary_structure_id`) REFERENCES `emp_salary_structures` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_44d75647e0bdef1af5239b40d28` FOREIGN KEY (`old_grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_4b6041bfb2a9b087e58c9e40bde` FOREIGN KEY (`salary_event_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_826e863604a52070ce20e10ed64` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a5329cdbc04edc0f6e00246ce8b` FOREIGN KEY (`new_grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_af03f15bf15d57442d40de8e34f` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_b1f3b11774592e5eb39df909b28` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_f451c620cc33ed3d580919f78e0` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_structure_details`
--

DROP TABLE IF EXISTS `emp_salary_structure_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_structure_details` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `salary_structure_id` int unsigned NOT NULL,
  `pay_item_id` bigint unsigned NOT NULL,
  `calculation_method_id` int unsigned DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `calculated_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_variable` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether this amount varies each month',
  `is_recurring` tinyint NOT NULL DEFAULT '1' COMMENT 'Whether this is a recurring component',
  `effective_from` date DEFAULT NULL COMMENT 'Component effective start date',
  `effective_to` date DEFAULT NULL COMMENT 'Component effective end date',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_af3fde4869d377426b31476a0f1` (`pay_item_id`),
  KEY `FK_787597577bf0372e26985e95b89` (`salary_structure_id`),
  KEY `FK_2d6b20d1849b75429b4778be0ea` (`app_id`),
  KEY `FK_7981bf309f4bb5721a7ee0a49e6` (`calculation_method_id`),
  CONSTRAINT `FK_2d6b20d1849b75429b4778be0ea` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_787597577bf0372e26985e95b89` FOREIGN KEY (`salary_structure_id`) REFERENCES `emp_salary_structures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_7981bf309f4bb5721a7ee0a49e6` FOREIGN KEY (`calculation_method_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_af3fde4869d377426b31476a0f1` FOREIGN KEY (`pay_item_id`) REFERENCES `emp_pay_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=283 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_salary_structures`
--

DROP TABLE IF EXISTS `emp_salary_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_salary_structures` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `grade_id` int unsigned NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `gross_salary` decimal(12,2) DEFAULT '0.00' COMMENT 'Calculated gross salary',
  `total_deductions` decimal(12,2) DEFAULT '0.00' COMMENT 'Calculated total deductions',
  `net_salary` decimal(12,2) DEFAULT '0.00' COMMENT 'Calculated net salary',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Currency code',
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bank Transfer, Cash, Cheque, etc.',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_at` timestamp(6) NULL DEFAULT NULL,
  `is_approved` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether salary structure is approved',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` int unsigned DEFAULT NULL,
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_da4e72fb658d40b58cafab3245c` (`emp_id`),
  KEY `FK_ab17aef08c9d9e816b5ca062a08` (`grade_id`),
  KEY `FK_a85520df3d35807d46ae20d824a` (`app_id`),
  KEY `FK_8a9948a3f19799aedf6730d8f2a` (`approved_by`),
  KEY `FK_2ef2113e1cb7311b311b2f42176` (`created_by`),
  KEY `FK_900f4330dd2294a524c0e9d5445` (`updated_by`),
  CONSTRAINT `FK_2ef2113e1cb7311b311b2f42176` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_8a9948a3f19799aedf6730d8f2a` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_900f4330dd2294a524c0e9d5445` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_a85520df3d35807d46ae20d824a` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ab17aef08c9d9e816b5ca062a08` FOREIGN KEY (`grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_da4e72fb658d40b58cafab3245c` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_assets`
--

DROP TABLE IF EXISTS `employee_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_assets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `asset_type_id` int unsigned NOT NULL,
  `asset_status_id` int unsigned NOT NULL DEFAULT '143',
  `description` text COLLATE utf8mb4_unicode_ci,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `allocation_date` datetime DEFAULT NULL,
  `remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `withdrawal_date` datetime DEFAULT NULL,
  `allocated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_d2bca333a122cae372ebff22b90` (`employee_id`),
  KEY `FK_95b984280a402fd091aac3331da` (`asset_type_id`),
  KEY `FK_2839fbf0cbf4b2a95ca9b61340b` (`asset_status_id`),
  CONSTRAINT `FK_2839fbf0cbf4b2a95ca9b61340b` FOREIGN KEY (`asset_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_95b984280a402fd091aac3331da` FOREIGN KEY (`asset_type_id`) REFERENCES `asset_types` (`id`),
  CONSTRAINT `FK_d2bca333a122cae372ebff22b90` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_hierarchy`
--

DROP TABLE IF EXISTS `employee_hierarchy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_hierarchy` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned NOT NULL,
  `supervisor_id` int unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_4debdb91d87313c0872e6bbed38` (`supervisor_id`),
  KEY `FK_8c5f2a7b73965c2fa4509cd86d1` (`emp_id`),
  KEY `FK_a3eefd92b0eb891556faac5c53a` (`app_id`),
  CONSTRAINT `FK_4debdb91d87313c0872e6bbed38` FOREIGN KEY (`supervisor_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_8c5f2a7b73965c2fa4509cd86d1` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a3eefd92b0eb891556faac5c53a` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `app_id` int unsigned DEFAULT NULL,
  `designation_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `office_shift_id` int unsigned DEFAULT NULL,
  `employment_status_id` int unsigned DEFAULT NULL,
  `employee_status_id` int unsigned DEFAULT NULL,
  `current_grade_id` int unsigned DEFAULT NULL,
  `current_basic_salary` decimal(12,2) DEFAULT NULL,
  `joining_date` timestamp NULL DEFAULT NULL,
  `resignation_date` timestamp NULL DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci COMMENT 'Optional remarks for the invoice',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_56162b5f24af743a154680684f` (`employee_code`),
  KEY `FK_2d83c53c3e553a48dadb9722e38` (`user_id`),
  KEY `FK_42ab2985e93dfc8e9292aee3b5a` (`app_id`),
  KEY `FK_2de5d6e4fb3345f18bc467017f0` (`designation_id`),
  KEY `FK_091c099e2491eaef369972d1181` (`office_id`),
  KEY `FK_5baf62a7503da19e6b805cdc19e` (`office_shift_id`),
  KEY `FK_e9c202e0e795d59cf1f5bd3d3b9` (`employment_status_id`),
  KEY `FK_d648b02390d7ce76ace5da627ff` (`employee_status_id`),
  KEY `FK_38a665eb166ffb004caeefa4962` (`current_grade_id`),
  CONSTRAINT `FK_091c099e2491eaef369972d1181` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `FK_2d83c53c3e553a48dadb9722e38` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_2de5d6e4fb3345f18bc467017f0` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`),
  CONSTRAINT `FK_38a665eb166ffb004caeefa4962` FOREIGN KEY (`current_grade_id`) REFERENCES `emp_salary_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_42ab2985e93dfc8e9292aee3b5a` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_5baf62a7503da19e6b805cdc19e` FOREIGN KEY (`office_shift_id`) REFERENCES `office_shifts` (`id`),
  CONSTRAINT `FK_d648b02390d7ce76ace5da627ff` FOREIGN KEY (`employee_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_e9c202e0e795d59cf1f5bd3d3b9` FOREIGN KEY (`employment_status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_attendees`
--

DROP TABLE IF EXISTS `event_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_attendees` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `attendance_status_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c296e70709cd6f4cb6b4e3e7e2a` (`event_id`),
  KEY `FK_884f21d80380a5139024a6f0a66` (`employee_id`),
  KEY `FK_41bc87f3cb7413985e83386ca6f` (`attendance_status_id`),
  CONSTRAINT `FK_41bc87f3cb7413985e83386ca6f` FOREIGN KEY (`attendance_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_884f21d80380a5139024a6f0a66` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_c296e70709cd6f4cb6b4e3e7e2a` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `department_id` int unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_type_id` int DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `creator_id` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_event_type_id` (`event_type_id`),
  KEY `idx_status_id` (`status_id`),
  KEY `FK_events_applications` (`app_id`),
  CONSTRAINT `FK_events_applications` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `holiday_type_id` int unsigned DEFAULT NULL,
  `holiday_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_holidays` tinyint DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `creator_id` int DEFAULT NULL,
  `editor_id` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_5a1932b19967a02152b5f2d40e5` (`holiday_type_id`),
  CONSTRAINT `FK_5a1932b19967a02152b5f2d40e5` FOREIGN KEY (`holiday_type_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `app_id` int unsigned NOT NULL,
  `invoice_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `per_user_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_count` int NOT NULL DEFAULT '1',
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_period_start` datetime DEFAULT NULL,
  `billing_period_end` datetime DEFAULT NULL,
  `coupon_id` int unsigned DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `pdf_url` text COLLATE utf8mb4_unicode_ci,
  `invoice_items` longtext COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of invoice items',
  `stripe_invoice_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_4daff78189167989290a496d7e1` (`app_id`),
  KEY `FK_5152c0aa0f851d9b95972b442e0` (`subscription_id`),
  KEY `FK_235448f0474f16ab9b8a01b9973` (`coupon_id`),
  CONSTRAINT `FK_235448f0474f16ab9b8a01b9973` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  CONSTRAINT `FK_4daff78189167989290a496d7e1` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_5152c0aa0f851d9b95972b442e0` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_applicant_interviewers`
--

DROP TABLE IF EXISTS `job_applicant_interviewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applicant_interviewers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `job_interview_schedule_id` int unsigned DEFAULT NULL,
  `job_applicant_id` int unsigned NOT NULL,
  `job_vacancy_id` int unsigned NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `interview_status` enum('Pending','Unattended','Completed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pending',
  `interview_panels_url` varchar(512) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `interview_remarks` text COLLATE utf8mb4_general_ci,
  `creator_id` int unsigned NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_a8c0eb56707dd07f89f69add8bd` (`app_id`),
  KEY `FK_3da3a4b543489f5a36065abd918` (`job_applicant_id`),
  KEY `FK_529cbe4495a1c6a5e9b5ef78e22` (`job_vacancy_id`),
  KEY `FK_6b19794f3e51abc0d65996475ed` (`employee_id`),
  KEY `FK_ae2526c7c2bdb8c1abb0171319a` (`creator_id`),
  KEY `FK_909d1f8d56aa53d9ed6859e0a6b` (`job_interview_schedule_id`),
  CONSTRAINT `FK_3da3a4b543489f5a36065abd918` FOREIGN KEY (`job_applicant_id`) REFERENCES `job_applicants` (`id`),
  CONSTRAINT `FK_529cbe4495a1c6a5e9b5ef78e22` FOREIGN KEY (`job_vacancy_id`) REFERENCES `job_vacancies` (`id`),
  CONSTRAINT `FK_6b19794f3e51abc0d65996475ed` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_a8c0eb56707dd07f89f69add8bd` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_ae2526c7c2bdb8c1abb0171319a` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_applicants`
--

DROP TABLE IF EXISTS `job_applicants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applicants` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `job_vacancy_id` int unsigned NOT NULL,
  `job_recruitment_step_name_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `phone_country_id` int unsigned DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `job_interview_schedule_id` int unsigned DEFAULT NULL,
  `interview_rating` int unsigned NOT NULL DEFAULT '0',
  `summary` longtext COLLATE utf8mb3_unicode_ci,
  `cv_media_id` int unsigned DEFAULT NULL,
  `expected_salary` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_123df26e98b408d68206e58011c` (`app_id`),
  KEY `FK_fe86973c138d3cfa19d4c6ed529` (`job_recruitment_step_name_id`),
  KEY `FK_15bd02ff449224b6a2fc60f4e1d` (`office_id`),
  KEY `FK_e650fdf184f12f798c05064cfea` (`emp_id`),
  KEY `FK_3b845815d89164927f28aab3e7b` (`job_interview_schedule_id`),
  CONSTRAINT `FK_123df26e98b408d68206e58011c` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_categories`
--

DROP TABLE IF EXISTS `job_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint unsigned NOT NULL DEFAULT '1',
  `creator_id` int unsigned DEFAULT NULL,
  `editor_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_interview_schedules`
--

DROP TABLE IF EXISTS `job_interview_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_interview_schedules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `job_vacancy_id` int unsigned NOT NULL,
  `job_applicant_id` int unsigned NOT NULL,
  `schedule_datetime` datetime DEFAULT NULL,
  `location_type` enum('Office','Online') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `office_id` int DEFAULT NULL,
  `url` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `interview_completed` tinyint unsigned NOT NULL DEFAULT '0',
  `weight_subjects` int unsigned NOT NULL DEFAULT '0',
  `total_weight` int unsigned NOT NULL DEFAULT '0',
  `total_interviewer` int unsigned NOT NULL DEFAULT '0',
  `total_weight_mark` int unsigned NOT NULL DEFAULT '0',
  `creator_id` int DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_interview_weights`
--

DROP TABLE IF EXISTS `job_interview_weights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_interview_weights` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `job_vacancy_id` int unsigned DEFAULT NULL,
  `job_applicant_id` int unsigned DEFAULT NULL,
  `job_interviewer_id` int unsigned DEFAULT NULL,
  `job_interview_schedule_id` int unsigned DEFAULT NULL,
  `job_weight_id` int unsigned DEFAULT NULL,
  `weight_marking` int unsigned NOT NULL DEFAULT '0',
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_2c9120eca22bba9926b65bb01de` (`app_id`),
  KEY `FK_8a035b2792586a98818d7e3c7bf` (`job_vacancy_id`),
  KEY `FK_468000ef05215f988734eae246a` (`job_applicant_id`),
  KEY `FK_65734262cbba55c7167bd678016` (`job_interviewer_id`),
  KEY `FK_e94913dd3ab99461335dabd3d0e` (`job_interview_schedule_id`),
  KEY `FK_dd777919623cf370f4307d692b1` (`job_weight_id`),
  KEY `FK_de441d5bcf8a76c56ebd9fd245a` (`creator_id`),
  CONSTRAINT `FK_2c9120eca22bba9926b65bb01de` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_468000ef05215f988734eae246a` FOREIGN KEY (`job_applicant_id`) REFERENCES `job_applicants` (`id`),
  CONSTRAINT `FK_65734262cbba55c7167bd678016` FOREIGN KEY (`job_interviewer_id`) REFERENCES `job_interviewers` (`id`),
  CONSTRAINT `FK_8a035b2792586a98818d7e3c7bf` FOREIGN KEY (`job_vacancy_id`) REFERENCES `job_vacancies` (`id`),
  CONSTRAINT `FK_dd777919623cf370f4307d692b1` FOREIGN KEY (`job_weight_id`) REFERENCES `job_weights` (`id`),
  CONSTRAINT `FK_de441d5bcf8a76c56ebd9fd245a` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_e94913dd3ab99461335dabd3d0e` FOREIGN KEY (`job_interview_schedule_id`) REFERENCES `job_interview_schedules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_interviewers`
--

DROP TABLE IF EXISTS `job_interviewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_interviewers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `job_vacancy_id` int unsigned NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_f0ef08f34b52715f6ed2344b003` (`app_id`),
  CONSTRAINT `FK_f0ef08f34b52715f6ed2344b003` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `job_position_id` int unsigned NOT NULL,
  `code` varchar(50) NOT NULL DEFAULT '',
  `job_vacancy` tinyint NOT NULL DEFAULT '0',
  `posting_status_id` int unsigned NOT NULL DEFAULT '61',
  `publish_date` datetime DEFAULT NULL,
  `close_date` datetime DEFAULT NULL,
  `applicants_count` int unsigned NOT NULL DEFAULT '0',
  `views_count` int unsigned NOT NULL DEFAULT '0',
  `published_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_recruitment_step_names`
--

DROP TABLE IF EXISTS `job_recruitment_step_names`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_recruitment_step_names` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_recruitment_steps`
--

DROP TABLE IF EXISTS `job_recruitment_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_recruitment_steps` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `job_vacancy_id` int unsigned DEFAULT NULL,
  `step_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_55b243873ff80b99c84e1b56616` (`job_vacancy_id`),
  KEY `FK_3476a63dc6927f445f1b54f4a67` (`step_id`),
  CONSTRAINT `FK_3476a63dc6927f445f1b54f4a67` FOREIGN KEY (`step_id`) REFERENCES `job_recruitment_step_names` (`id`),
  CONSTRAINT `FK_55b243873ff80b99c84e1b56616` FOREIGN KEY (`job_vacancy_id`) REFERENCES `job_vacancies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_vacancies`
--

DROP TABLE IF EXISTS `job_vacancies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_vacancies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `shift_id` int unsigned DEFAULT NULL,
  `job_title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `no_of_vacancies` tinyint DEFAULT '1',
  `job_category_id` int unsigned DEFAULT NULL COMMENT 'Related with job_categories table',
  `employment_status_id` int unsigned DEFAULT NULL COMMENT 'Related to statuses table',
  `application_deadline` timestamp NULL DEFAULT NULL,
  `resume_receiving_option` int unsigned DEFAULT NULL COMMENT 'Related to statuses table',
  `special_instruction` text COLLATE utf8mb4_general_ci,
  `required_photo` tinyint unsigned DEFAULT '0',
  `prefer_video_resume` tinyint unsigned DEFAULT '0',
  `job_level` int unsigned DEFAULT NULL COMMENT 'Related to statuses table possible values "Entry Level", "Mid Level", "Top Level"',
  `job_context` text COLLATE utf8mb4_general_ci,
  `job_responsibilities` text COLLATE utf8mb4_general_ci,
  `workplace` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Related to statuses table values "work at office", "Work from home"',
  `min_salary` decimal(10,2) unsigned NOT NULL DEFAULT '0.00',
  `max_salary` decimal(10,2) unsigned NOT NULL DEFAULT '0.00',
  `show_salary_range` tinyint unsigned DEFAULT '1',
  `salary_negotiable` tinyint unsigned DEFAULT '0',
  `additional_salary_info` text COLLATE utf8mb4_general_ci,
  `preferred_edu_institute` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `others_edu_qualification` varchar(256) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `training_and_trade_course` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `professional_certification` varchar(512) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `area_of_experience` text COLLATE utf8mb4_general_ci,
  `additional_requirement` text COLLATE utf8mb4_general_ci,
  `skills` text COLLATE utf8mb4_general_ci,
  `min_year_experience` tinyint DEFAULT NULL,
  `max_year_experience` tinyint DEFAULT NULL,
  `is_apply_fresher` varchar(1) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '1=yes, 0=no',
  `experience_required` varchar(1) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '1=required, 0= not required',
  `gender` enum('Male','Female','Female and Male') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `min_age` tinyint DEFAULT NULL,
  `max_age` tinyint DEFAULT NULL,
  `save_step` tinyint DEFAULT '1' COMMENT '1 = Primary Info, 2 = Job Info, 3=Educatino Info, 4 = Preveiw and Complete',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_vacancy_edu_requirements`
--

DROP TABLE IF EXISTS `job_vacancy_edu_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_vacancy_edu_requirements` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `job_vacancy_id` int unsigned NOT NULL,
  `course_level_id` int unsigned NOT NULL,
  `course_name` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_weights`
--

DROP TABLE IF EXISTS `job_weights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_weights` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `job_vacancy_id` int unsigned NOT NULL,
  `weight_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `weight_value` double(15,2) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_0689cdf2c2bf4e5d4abac488d13` (`app_id`),
  KEY `FK_f9dd8d132c4b8a9a3a9c2a938bd` (`job_vacancy_id`),
  CONSTRAINT `FK_0689cdf2c2bf4e5d4abac488d13` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_f9dd8d132c4b8a9a3a9c2a938bd` FOREIGN KEY (`job_vacancy_id`) REFERENCES `job_vacancies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `late_attendance_rules`
--

DROP TABLE IF EXISTS `late_attendance_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `late_attendance_rules` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `min_late_minutes` int NOT NULL,
  `max_late_minutes` int DEFAULT NULL,
  `fine_interval_days` int DEFAULT '1' COMMENT '1 = per day, N = per N late days',
  `fine_amount` decimal(10,2) DEFAULT '0.00',
  `is_absent` tinyint(1) DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_ebf2239822a2b2078db784d5a26` (`app_id`),
  KEY `FK_53f95b6d842d72483310eede514` (`office_id`),
  CONSTRAINT `FK_53f95b6d842d72483310eede514` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `FK_ebf2239822a2b2078db784d5a26` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lead_emails`
--

DROP TABLE IF EXISTS `lead_emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_emails` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `lead_id` int unsigned DEFAULT NULL,
  `invoicing` tinyint(1) NOT NULL DEFAULT '0',
  `administrative` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(50) DEFAULT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `editor_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_b5bde123fb7c0d1ae96ca0c260a` (`lead_id`),
  CONSTRAINT `FK_b5bde123fb7c0d1ae96ca0c260a` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lead_groups`
--

DROP TABLE IF EXISTS `lead_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_groups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lead_pipelines`
--

DROP TABLE IF EXISTS `lead_pipelines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_pipelines` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `lead_group_id` int unsigned NOT NULL,
  `prev_stage_id` int unsigned NOT NULL,
  `current_statge_id` int unsigned NOT NULL,
  `days_in_stage` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lead_stages`
--

DROP TABLE IF EXISTS `lead_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_stages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `lead_group_id` int unsigned NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `lead_group_id` int unsigned NOT NULL,
  `lead_stage_id` int unsigned DEFAULT NULL,
  `first_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_contacted_at` datetime DEFAULT NULL,
  `next_followup_at` datetime DEFAULT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `life_events`
--

DROP TABLE IF EXISTS `life_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `life_events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `emp_id` int unsigned DEFAULT NULL,
  `event_type_id` int unsigned DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `json_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_8dbd6e4d945eddde52dc801c073` (`app_id`),
  KEY `FK_dbe39dd0490389fde727f7972ca` (`emp_id`),
  KEY `FK_3ded60c14ca5b4e96facfa4d40f` (`event_type_id`),
  CONSTRAINT `FK_3ded60c14ca5b4e96facfa4d40f` FOREIGN KEY (`event_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_8dbd6e4d945eddde52dc801c073` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_dbe39dd0490389fde727f7972ca` FOREIGN KEY (`emp_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `master_documents`
--

DROP TABLE IF EXISTS `master_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `document_type_id` int unsigned DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('Low','Normal','High') COLLATE utf8mb4_unicode_ci DEFAULT 'Normal',
  `page_route` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/main-dashboard',
  `is_active` tinyint(1) DEFAULT '1',
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_9a8a82462cab47c73d25f49261f` (`user_id`),
  CONSTRAINT `FK_9a8a82462cab47c73d25f49261f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `office_shifts`
--

DROP TABLE IF EXISTS `office_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office_shifts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `office_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `delay_start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `early_end_time` time DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_office_shifts_office_id` (`office_id`),
  CONSTRAINT `FK_0527fe78e97fd7a261ce67bd996` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `office_weekends`
--

DROP TABLE IF EXISTS `office_weekends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office_weekends` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `office_id` int unsigned NOT NULL,
  `shift_id` int unsigned DEFAULT NULL,
  `saturday` tinyint unsigned NOT NULL DEFAULT '0',
  `sunday` tinyint unsigned NOT NULL DEFAULT '0',
  `monday` tinyint unsigned NOT NULL DEFAULT '0',
  `tuesday` tinyint unsigned NOT NULL DEFAULT '0',
  `wednesday` tinyint unsigned NOT NULL DEFAULT '0',
  `thursday` tinyint unsigned NOT NULL DEFAULT '0',
  `friday` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `offices`
--

DROP TABLE IF EXISTS `offices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `type_id` int unsigned DEFAULT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of office ',
  `address_id` int unsigned DEFAULT NULL COMMENT 'Foreign key to address',
  `manager_id` int unsigned DEFAULT NULL,
  `has_shift` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether this office has shift schedules',
  `start_time` time DEFAULT NULL COMMENT 'Standard start time for shifts',
  `delay_start_time` time DEFAULT NULL COMMENT 'Latest allowed start time',
  `end_time` time DEFAULT NULL COMMENT 'Standard end time for shifts',
  `early_end_time` time DEFAULT NULL COMMENT 'Earliest allowed end time',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IANA timezone identifier (e.g., America/New_York)',
  `creator_id` int unsigned DEFAULT NULL,
  `editor_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`id`),
  KEY `idx_office_name` (`name`),
  KEY `FK_97403661d03aff3ea9135a5bd89` (`app_id`),
  KEY `FK_a8f6b7158dd8e140ec684eb2da2` (`type_id`),
  KEY `FK_1c32270765ba9fe74d0030c54c8` (`address_id`),
  KEY `FK_ddb5159e0eb6eeea444de7ee07f` (`manager_id`),
  KEY `FK_bf2bede0c011a1c67245b5fd3c3` (`creator_id`),
  KEY `FK_66953bbe4a5959fd698497b025e` (`editor_id`),
  CONSTRAINT `FK_1c32270765ba9fe74d0030c54c8` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_66953bbe4a5959fd698497b025e` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_97403661d03aff3ea9135a5bd89` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a8f6b7158dd8e140ec684eb2da2` FOREIGN KEY (`type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_bf2bede0c011a1c67245b5fd3c3` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_ddb5159e0eb6eeea444de7ee07f` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `session_id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `expired_date_time` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_f7a4c3bc48f24df007936d217be` (`user_id`),
  CONSTRAINT `FK_f7a4c3bc48f24df007936d217be` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int unsigned DEFAULT NULL,
  `menu_position_id` int unsigned DEFAULT NULL,
  `type` enum('module','page','action','feature') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'action',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `is_required` tinyint NOT NULL DEFAULT '1',
  `is_system` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8dad765629e83229da6feda1c1` (`code`),
  UNIQUE KEY `idx_permissions_code_unique` (`code`),
  KEY `idx_permissions_name` (`name`),
  KEY `FK_e152e0aa9e0df7ed44539db894c` (`parent_id`),
  CONSTRAINT `FK_e152e0aa9e0df7ed44539db894c` FOREIGN KEY (`parent_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions_closure`
--

DROP TABLE IF EXISTS `permissions_closure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions_closure` (
  `id_ancestor` int unsigned NOT NULL,
  `id_descendant` int unsigned NOT NULL,
  PRIMARY KEY (`id_ancestor`,`id_descendant`),
  KEY `IDX_7c9fe505a03ac0ac2f46661e91` (`id_ancestor`),
  KEY `IDX_f6966c45c60a0fa083adcbe78b` (`id_descendant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal_notes`
--

DROP TABLE IF EXISTS `personal_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_notes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_archived` tinyint(1) DEFAULT '0',
  `reminder_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `remarks`
--

DROP TABLE IF EXISTS `remarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remarks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` int unsigned DEFAULT NULL,
  `type_id` int unsigned DEFAULT NULL,
  `description` text,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_aa7dd509848f05fb79cf66761a8` (`creator_id`),
  CONSTRAINT `FK_aa7dd509848f05fb79cf66761a8` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `requisitions`
--

DROP TABLE IF EXISTS `requisitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisitions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `requisition_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `department_id` int unsigned DEFAULT NULL,
  `requisition_date` datetime NOT NULL,
  `item_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int unsigned NOT NULL,
  `unit_type_id` int unsigned DEFAULT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `status_id` int unsigned DEFAULT '138',
  `approved_by` int unsigned DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_bb810c522ee6410e15e1c3f2d2d` (`employee_id`),
  KEY `FK_469a258fe3b2180932bb204bf48` (`status_id`),
  KEY `FK_cbe2641e04d8b56c2dea2504001` (`app_id`),
  KEY `FK_966fb1dba0e2595fbd2f327327f` (`department_id`),
  KEY `FK_eddbab11d222a6caf97d31ae6f7` (`unit_type_id`),
  KEY `FK_f980768cfe21e54d23c6e11ab92` (`approved_by`),
  CONSTRAINT `FK_469a258fe3b2180932bb204bf48` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_966fb1dba0e2595fbd2f327327f` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `FK_bb810c522ee6410e15e1c3f2d2d` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_cbe2641e04d8b56c2dea2504001` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_eddbab11d222a6caf97d31ae6f7` FOREIGN KEY (`unit_type_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_f980768cfe21e54d23c6e11ab92` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `role_id` int unsigned NOT NULL,
  `permission_id` int unsigned NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_178199805b901ccd220ab7740ec` (`role_id`),
  KEY `FK_17022daf3f885f7d35423e9971e` (`permission_id`),
  KEY `FK_3595b1b8a54a2515b9fd12fbc59` (`app_id`),
  CONSTRAINT `FK_17022daf3f885f7d35423e9971e` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_178199805b901ccd220ab7740ec` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_3595b1b8a54a2515b9fd12fbc59` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5389 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_648e3f5447f725579d7d4ffdfb` (`name`),
  KEY `idx_roles_is_active` (`is_active`) USING BTREE,
  KEY `FK_fac0426e8caf934239ff03eae66` (`app_id`),
  CONSTRAINT `FK_fac0426e8caf934239ff03eae66` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salary_calculation_formulas`
--

DROP TABLE IF EXISTS `salary_calculation_formulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_calculation_formulas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `formula_name` varchar(100) NOT NULL,
  `formula_code` varchar(50) NOT NULL,
  `description` text,
  `formula_expression` varchar(500) NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT 'JSON array of variable names used in formula',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_formula_code` (`formula_code`),
  KEY `FK_formulas_app` (`app_id`),
  CONSTRAINT `FK_formulas_app` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `salary_calculation_formulas_chk_1` CHECK (json_valid(`variables`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sender_emails`
--

DROP TABLE IF EXISTS `sender_emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sender_emails` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `is_verfied` tinyint(1) NOT NULL DEFAULT '0',
  `verfied_by` int DEFAULT NULL,
  `verfied_at` datetime DEFAULT NULL,
  `signature_id` varchar(125) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_sender_emails_signature_id` (`signature_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `creator_id` int DEFAULT NULL,
  `updater_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `active_name` varchar(50) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then trim(`name`) else NULL end)) VIRTUAL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `UQ_SERVICES_APP_TYPE_ACTIVE_NAME` (`app_id`,`type_id`,`active_name`),
  KEY `IDX_SERVICES_APP_ID` (`app_id`),
  KEY `IDX_SERVICES_TYPE_ID` (`type_id`),
  KEY `IDX_SERVICES_CREATOR_ID` (`creator_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status_groups`
--

DROP TABLE IF EXISTS `status_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status_group_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statuses`
--

DROP TABLE IF EXISTS `statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statuses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `status_group_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Values must be capital letters.',
  `color_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `serial` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a860e6a2158936bd8216716545` (`code`),
  KEY `idx_status_id` (`id`),
  KEY `idx_status_name` (`name`),
  KEY `IDX_55a5d163567d18e6e724a16dcd` (`is_active`),
  KEY `FK_a2aa5ddc0653d6bcf4642f4dfff` (`status_group_id`),
  CONSTRAINT `FK_a2aa5ddc0653d6bcf4642f4dfff` FOREIGN KEY (`status_group_id`) REFERENCES `status_groups` (`id`),
  CONSTRAINT `statuses_chk_1` CHECK (json_valid(`data`))
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_changes`
--

DROP TABLE IF EXISTS `subscription_changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_changes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int unsigned NOT NULL,
  `app_id` int unsigned NOT NULL,
  `old_user_count` int NOT NULL,
  `new_user_count` int NOT NULL,
  `change_amount` decimal(10,2) NOT NULL,
  `prorated_amount` decimal(10,2) DEFAULT NULL,
  `effective_date` datetime NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `stripe_invoice_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_1c4dda5448fa138e42bb8bff0ba` (`subscription_id`),
  KEY `FK_a2310c12961ed78157dc37b1844` (`app_id`),
  CONSTRAINT `FK_1c4dda5448fa138e42bb8bff0ba` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `FK_a2310c12961ed78157dc37b1844` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_invoices`
--

DROP TABLE IF EXISTS `subscription_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_invoices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `issue_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `status_id` int unsigned NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_subscription_invoices_transaction_id` (`transaction_id`),
  KEY `FK_4f183991dc9bcbda39fa6141931` (`subscription_id`),
  KEY `FK_b811c7517d612a127aea27c0258` (`status_id`),
  CONSTRAINT `FK_4f183991dc9bcbda39fa6141931` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `FK_b811c7517d612a127aea27c0258` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `monthly_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `yearly_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `per_user_yearly_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `features` longtext COLLATE utf8mb4_unicode_ci,
  `min_users` int DEFAULT '1',
  `max_users` int DEFAULT NULL,
  `billing_cycle` enum('Monthly','Yearly') COLLATE utf8mb4_unicode_ci DEFAULT 'Monthly',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `trial_days` int DEFAULT '14',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_seats`
--

DROP TABLE IF EXISTS `subscription_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_seats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int unsigned NOT NULL,
  `app_id` int unsigned NOT NULL,
  `total_seats` int NOT NULL DEFAULT '1',
  `used_seats` int NOT NULL DEFAULT '0',
  `available_seats` int NOT NULL DEFAULT '1',
  `seat_history` longtext COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of seat history',
  `last_updated` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_9a4455eab9dc94040aa62b60530` (`subscription_id`),
  KEY `FK_cacda8e1e5908e246af9fff201b` (`app_id`),
  CONSTRAINT `FK_9a4455eab9dc94040aa62b60530` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `FK_cacda8e1e5908e246af9fff201b` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_users`
--

DROP TABLE IF EXISTS `subscription_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int unsigned NOT NULL,
  `app_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `added_by` int unsigned DEFAULT NULL,
  `added_at` datetime DEFAULT NULL,
  `removed_at` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `unique_subscription_user` (`subscription_id`,`user_id`) USING BTREE,
  KEY `FK_105b61034e0c323bf59997b04cd` (`user_id`),
  KEY `FK_78d05e78bb904001fb5ec830467` (`app_id`),
  CONSTRAINT `FK_105b61034e0c323bf59997b04cd` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_284cbcc27efa1a3bdefe032f770` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `FK_78d05e78bb904001fb5ec830467` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_subscription_users_insert` AFTER INSERT ON `subscription_users` FOR EACH ROW BEGIN

    UPDATE `subscription_seats`

    SET `used_seats` = `used_seats` + 1,

        `available_seats` = `total_seats` - (`used_seats` + 1),

        `last_updated` = NOW(),

        `seat_history` = JSON_ARRAY_APPEND(

            COALESCE(`seat_history`, '[]'),

            '$',

            JSON_OBJECT(

                'action', 'user_added',

                'user_id', NEW.user_id,

                'timestamp', NOW()

            )

        )

    WHERE `subscription_id` = NEW.subscription_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_subscription_users_update` AFTER UPDATE ON `subscription_users` FOR EACH ROW BEGIN

    IF OLD.is_active = 1 AND NEW.is_active = 0 THEN

        UPDATE `subscription_seats`

        SET `used_seats` = `used_seats` - 1,

            `available_seats` = `available_seats` + 1,

            `last_updated` = NOW(),

            `seat_history` = JSON_ARRAY_APPEND(

                COALESCE(`seat_history`, '[]'),

                '$',

                JSON_OBJECT(

                    'action', 'user_removed',

                    'user_id', NEW.user_id,

                    'timestamp', NOW()

                )

            )

        WHERE `subscription_id` = NEW.subscription_id;

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `plan_id` int unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status_id` int unsigned NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auto_renew` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_d0a95ef8a28188364c546eb65c1` (`user_id`),
  KEY `FK_e45fca5d912c3a2fab512ac25dc` (`plan_id`),
  KEY `FK_481cc25c5c275ff2089ed07b8f0` (`status_id`),
  KEY `FK_a0827e064ec016518d59a7f35c4` (`app_id`),
  CONSTRAINT `FK_481cc25c5c275ff2089ed07b8f0` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_a0827e064ec016518d59a7f35c4` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_d0a95ef8a28188364c546eb65c1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_e45fca5d912c3a2fab512ac25dc` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_assignees`
--

DROP TABLE IF EXISTS `task_assignees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignees` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigner_id` int unsigned NOT NULL,
  `workspace_id` int unsigned DEFAULT NULL,
  `board_id` int unsigned DEFAULT NULL,
  `card_id` int unsigned DEFAULT NULL,
  `task_id` int unsigned DEFAULT NULL,
  `task_role_id` int unsigned DEFAULT NULL,
  `assigned_on_id` int unsigned DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `IDX_3c48c9d2f84b2b3170dfdeb3e2` (`code`),
  KEY `idx_task_assignees_code` (`code`),
  KEY `FK_a0d3d2c19346ea160d3055c844e` (`assigner_id`),
  KEY `FK_d66bc1ac49fabfb3908a3f0e027` (`app_id`),
  KEY `FK_ba9f6dad8ae3374673eca259f11` (`workspace_id`),
  KEY `FK_eba4a200aff9fc29967a3f3fbe6` (`board_id`),
  KEY `FK_46aff690c67ae5ce714dfd70e02` (`card_id`),
  KEY `FK_0141288f2306f20da9a60ec8d69` (`task_id`),
  KEY `FK_f5ca6d7068b222aedd2cc5df8b7` (`task_role_id`),
  KEY `FK_e8ff60c0fbe271f5aa821d415e2` (`assigned_on_id`),
  CONSTRAINT `FK_0141288f2306f20da9a60ec8d69` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_46aff690c67ae5ce714dfd70e02` FOREIGN KEY (`card_id`) REFERENCES `task_cards` (`id`),
  CONSTRAINT `FK_a0d3d2c19346ea160d3055c844e` FOREIGN KEY (`assigner_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ba9f6dad8ae3374673eca259f11` FOREIGN KEY (`workspace_id`) REFERENCES `task_workspaces` (`id`),
  CONSTRAINT `FK_d66bc1ac49fabfb3908a3f0e027` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_e8ff60c0fbe271f5aa821d415e2` FOREIGN KEY (`assigned_on_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_eba4a200aff9fc29967a3f3fbe6` FOREIGN KEY (`board_id`) REFERENCES `task_boards` (`id`),
  CONSTRAINT `FK_f5ca6d7068b222aedd2cc5df8b7` FOREIGN KEY (`task_role_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_boards`
--

DROP TABLE IF EXISTS `task_boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_boards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `workspace_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_type_id` int unsigned DEFAULT '78',
  `active` tinyint NOT NULL DEFAULT '1',
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_4d1851ebc4eb8965fb3d4317524` (`workspace_id`),
  KEY `FK_5b049a751a7d6c321e9f101faea` (`view_type_id`),
  KEY `FK_6ea7baea9e4c295ae1bda614aa1` (`app_id`),
  KEY `FK_436e7b8528215581c9e772fde02` (`creator_id`),
  CONSTRAINT `FK_436e7b8528215581c9e772fde02` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_4d1851ebc4eb8965fb3d4317524` FOREIGN KEY (`workspace_id`) REFERENCES `task_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_5b049a751a7d6c321e9f101faea` FOREIGN KEY (`view_type_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_6ea7baea9e4c295ae1bda614aa1` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_cards`
--

DROP TABLE IF EXISTS `task_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_cards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `workspace_id` int unsigned DEFAULT NULL,
  `board_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Task Card',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#ffffff' COMMENT '7 length hex code',
  `serial` int unsigned DEFAULT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_8850cf8ab3dce729f31bfd64ce3` (`board_id`),
  KEY `FK_3e33cc2364cfa761f939e015647` (`app_id`),
  KEY `FK_00ce21dc3892b96b28ac57c6c5b` (`workspace_id`),
  KEY `FK_c7f6cd591642ed2496d53fe5d0d` (`creator_id`),
  CONSTRAINT `FK_00ce21dc3892b96b28ac57c6c5b` FOREIGN KEY (`workspace_id`) REFERENCES `task_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_3e33cc2364cfa761f939e015647` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_8850cf8ab3dce729f31bfd64ce3` FOREIGN KEY (`board_id`) REFERENCES `task_boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_c7f6cd591642ed2496d53fe5d0d` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_comments`
--

DROP TABLE IF EXISTS `task_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `task_id` int unsigned NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` int unsigned NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_ba9e465cfc707006e60aae59946` (`task_id`),
  KEY `FK_7aef7815c8c581b984466980663` (`creator_id`),
  KEY `FK_5e24e72df569153fa53a410f53b` (`app_id`),
  CONSTRAINT `FK_5e24e72df569153fa53a410f53b` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_7aef7815c8c581b984466980663` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_ba9e465cfc707006e60aae59946` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_tags`
--

DROP TABLE IF EXISTS `task_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `task_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_70515bc464901781ac60b82a1ea` (`task_id`),
  KEY `FK_3c0ab3332d9c15e7ceda6b41e9b` (`app_id`),
  KEY `FK_a9038e587403ca4891e5b4bf0fd` (`creator_id`),
  CONSTRAINT `FK_3c0ab3332d9c15e7ceda6b41e9b` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_70515bc464901781ac60b82a1ea` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a9038e587403ca4891e5b4bf0fd` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_workspaces`
--

DROP TABLE IF EXISTS `task_workspaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_workspaces` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_5e1a72a04251ae353854eda37fd` (`app_id`),
  KEY `FK_72a2cfb16c713a4132df0600780` (`creator_id`),
  CONSTRAINT `FK_5e1a72a04251ae353854eda37fd` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_72a2cfb16c713a4132df0600780` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `workspace_id` int unsigned DEFAULT NULL,
  `board_id` int unsigned DEFAULT NULL,
  `card_id` int unsigned NOT NULL,
  `parent_task_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `priority_id` int unsigned DEFAULT NULL,
  `task_status_id` int unsigned DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `serial` int unsigned DEFAULT NULL,
  `creator_id` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_1ea65b0999567ea981dd7b912be` (`card_id`),
  KEY `FK_1ac2eea4a4abec5fd7d0a741de6` (`app_id`),
  KEY `FK_5cb6ca4667dfa947871694da959` (`workspace_id`),
  KEY `FK_2680b7f3ecd70b05030ce6b4aef` (`board_id`),
  KEY `FK_54fc42a253a8338488ec1f960ad` (`parent_task_id`),
  KEY `FK_5d1c8f7898b5b84ad5ce08fcff8` (`priority_id`),
  KEY `FK_17438998ab7d1f268f9c9f16fe2` (`task_status_id`),
  KEY `FK_f4cb489461bc751498a28852356` (`creator_id`),
  CONSTRAINT `FK_17438998ab7d1f268f9c9f16fe2` FOREIGN KEY (`task_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_1ac2eea4a4abec5fd7d0a741de6` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `FK_1ea65b0999567ea981dd7b912be` FOREIGN KEY (`card_id`) REFERENCES `task_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_2680b7f3ecd70b05030ce6b4aef` FOREIGN KEY (`board_id`) REFERENCES `task_boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_54fc42a253a8338488ec1f960ad` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_5cb6ca4667dfa947871694da959` FOREIGN KEY (`workspace_id`) REFERENCES `task_workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_5d1c8f7898b5b84ad5ce08fcff8` FOREIGN KEY (`priority_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_f4cb489461bc751498a28852356` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(310) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `route` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referer_page` varchar(310) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_page` varchar(310) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_headers` text COLLATE utf8mb4_unicode_ci,
  `request_data` longtext COLLATE utf8mb4_unicode_ci,
  `response_code` int DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_user_activity_user_id` (`user_id`),
  CONSTRAINT `FK_a283f37e08edf5e37d38b375eec` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19868 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_audit_log`
--

DROP TABLE IF EXISTS `user_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `changed_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_audit_log_action` (`action`),
  KEY `FK_user_audit_log_revinr_oms_new.users` (`user_id`),
  CONSTRAINT `FK_user_audit_log_revinr_oms_new.users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_certifications`
--

DROP TABLE IF EXISTS `user_certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_certifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuing_organization` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `attachment_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_383baf26f3c062823386c17229f` (`user_id`),
  CONSTRAINT `FK_383baf26f3c062823386c17229f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_contact_infos`
--

DROP TABLE IF EXISTS `user_contact_infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_contact_infos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `mobile_personal` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_work` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_personal` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_official` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_person` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_contact_info_email_personal` (`email_personal`),
  KEY `idx_user_contact_info_email_official` (`email_official`),
  KEY `FK_f33be476cbce63d73bffa10d80c` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_educations`
--

DROP TABLE IF EXISTS `user_educations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_educations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `institute_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_foreign_institute` tinyint unsigned NOT NULL DEFAULT '0',
  `institute_country_id` int unsigned DEFAULT NULL,
  `education_level_id` int unsigned DEFAULT NULL,
  `group_id` int unsigned DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT 'Duration in years',
  `is_current` tinyint NOT NULL DEFAULT '0',
  `year_of_passing` int DEFAULT NULL,
  `result_type_id` int unsigned DEFAULT NULL,
  `result` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bbf6dad202fd7d5d898b64bd496` (`user_id`),
  KEY `FK_86e870b3f23bb4fdd25904ef912` (`institute_country_id`),
  KEY `FK_2b24f3ee83d995f62bbaf9b8ede` (`education_level_id`),
  KEY `FK_f4b515fe9c86dd94d32015496fb` (`group_id`),
  KEY `FK_fb41bf4f2d3c6fdc0ed4e125821` (`result_type_id`),
  CONSTRAINT `FK_2b24f3ee83d995f62bbaf9b8ede` FOREIGN KEY (`education_level_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_86e870b3f23bb4fdd25904ef912` FOREIGN KEY (`institute_country_id`) REFERENCES `countries` (`id`),
  CONSTRAINT `FK_bbf6dad202fd7d5d898b64bd496` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_f4b515fe9c86dd94d32015496fb` FOREIGN KEY (`group_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_fb41bf4f2d3c6fdc0ed4e125821` FOREIGN KEY (`result_type_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_language_proficiencies`
--

DROP TABLE IF EXISTS `user_language_proficiencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_language_proficiencies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `language_id` int DEFAULT NULL COMMENT 'This id will come from countries table',
  `speaking_level_id` int DEFAULT NULL COMMENT 'This id will come from statuses table group of proficiency level',
  `reading_level_id` int DEFAULT NULL COMMENT 'This id will come from statuses table group of proficiency level',
  `writing_level_id` int DEFAULT NULL COMMENT 'This id will come from statuses table group of proficiency level',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_6d567aec026274316270dac340a` (`user_id`),
  CONSTRAINT `FK_6d567aec026274316270dac340a` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=176 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `permission_id` int unsigned NOT NULL,
  `is_granted` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_3495bd31f1862d02931e8e8d2e8` (`user_id`),
  KEY `FK_8145f5fadacd311693c15e41f10` (`permission_id`),
  CONSTRAINT `FK_3495bd31f1862d02931e8e8d2e8` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8145f5fadacd311693c15e41f10` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `profile_picture_id` int unsigned DEFAULT NULL,
  `country_id` int unsigned DEFAULT NULL,
  `phone_country_id` int unsigned DEFAULT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_address_id` int DEFAULT NULL,
  `permanent_address_id` int DEFAULT NULL,
  `gender` enum('Female','Male','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group_id` int DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portfolio_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `willing_to_relocate` tinyint NOT NULL DEFAULT '0',
  `remote_only` tinyint NOT NULL DEFAULT '0',
  `is_public` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `passport_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nid_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fathers_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mothers_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marital_status_id` int DEFAULT NULL,
  `religion_id` int DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6ca9503d77ae39b4b5a6cc3ba8` (`user_id`),
  UNIQUE KEY `REL_6ca9503d77ae39b4b5a6cc3ba8` (`user_id`),
  KEY `idx_user_profile_phone` (`phone`),
  KEY `FK_08cebbf6264e68ce171deaf3e97` (`country_id`),
  CONSTRAINT `FK_08cebbf6264e68ce171deaf3e97` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`),
  CONSTRAINT `FK_6ca9503d77ae39b4b5a6cc3ba88` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_profile_update` AFTER UPDATE ON `user_profiles` FOR EACH ROW BEGIN

    -- Check if the phone number was changed and log it

    IF OLD.phone <> NEW.phone THEN

        INSERT INTO user_audit_log (user_id, action, old_value, new_value, changed_by)

        VALUES (OLD.user_id, 'UPDATE_PHONE', OLD.phone, NEW.phone, CURRENT_USER());

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `user_projects`
--

DROP TABLE IF EXISTS `user_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_projects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `project_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `used_technologies` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_USER_PROJECTS_USER_ID` (`user_id`),
  CONSTRAINT `FK_86ef6061f6f13aa9252b12cbe87` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_references`
--

DROP TABLE IF EXISTS `user_references`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_references` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relation` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_country_id` int DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_USER_REFERENCES_USER_ID` (`user_id`),
  CONSTRAINT `FK_b8e8d507307423713622a137e71` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `user_id` int unsigned NOT NULL,
  `role_id` int unsigned NOT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_87b8888186ca9769c960e926870` (`user_id`),
  KEY `FK_b23c65e50a758245a33ee35fda1` (`role_id`),
  KEY `FK_7bb02689c9f190a648da0922a99` (`app_id`),
  CONSTRAINT `FK_7bb02689c9f190a648da0922a99` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_87b8888186ca9769c960e926870` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_b23c65e50a758245a33ee35fda1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `start_date_time` datetime DEFAULT NULL,
  `end_date_time` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e9658e959c490b0a634dfc54783` (`user_id`),
  CONSTRAINT `FK_e9658e959c490b0a634dfc54783` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skills` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `skill_name` varchar(124) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skill_level` enum('Beginner','Intermediate','Advanced','Expert') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `years_of_experience` int unsigned DEFAULT NULL,
  `is_technical` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_6926002c360291df66bb2c5fdeb` (`user_id`),
  CONSTRAINT `FK_6926002c360291df66bb2c5fdeb` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_trainings`
--

DROP TABLE IF EXISTS `user_trainings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_trainings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `training_year` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `IDX_USER_TRAININGS_USER_ID` (`user_id`),
  CONSTRAINT `FK_7cce7d25be6aefebeb5571ee190` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_work_experiences`
--

DROP TABLE IF EXISTS `user_work_experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_work_experiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `job_title` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsibility` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_id` int unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_007dcdf7601e2a0ddd8010126a1` (`user_id`),
  KEY `FK_569a5dc00296aa1d4c179dae673` (`address_id`),
  CONSTRAINT `FK_007dcdf7601e2a0ddd8010126a1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_569a5dc00296aa1d4c179dae673` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `password` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `reset_first_password` tinyint NOT NULL DEFAULT '0',
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_app_id` int unsigned DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `last_timezone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_use_case` enum('Personal','Company') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `last_session_id` int unsigned DEFAULT NULL,
  `profile_completed` tinyint DEFAULT '0',
  `invitation_count` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_USER_EMAIL` (`email`),
  KEY `IDX_ef2fb839248017665e5033e730` (`first_name`),
  KEY `IDX_0408cb491623b121499d4fa238` (`last_name`),
  KEY `idx_user_is_active` (`is_active`),
  KEY `FK_757df119074ff3f265ed63179cf` (`active_app_id`),
  CONSTRAINT `FK_757df119074ff3f265ed63179cf` FOREIGN KEY (`active_app_id`) REFERENCES `applications` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN

    -- Check if the email was changed and log it

    IF OLD.email <> NEW.email THEN

        INSERT INTO user_audit_log (user_id, action, old_value, new_value, changed_by)

        VALUES (OLD.id, 'UPDATE_EMAIL', OLD.email, NEW.email, CURRENT_USER());

    END IF;



    -- Check if the password was changed and log it

    IF OLD.password <> NEW.password THEN

        INSERT INTO user_audit_log (user_id, action, old_value, new_value, changed_by)

        VALUES (OLD.id, 'UPDATE_PASSWORD', OLD.password, NEW.password, CURRENT_USER()); -- Don't log actual passwords!

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `visit_applications`
--

DROP TABLE IF EXISTS `visit_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_applications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int unsigned DEFAULT NULL,
  `visitor_emp_id` int unsigned NOT NULL,
  `host_emp_id` int unsigned NOT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `visit_time` time DEFAULT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `visit_status_id` int unsigned DEFAULT NULL,
  `application_status_id` int unsigned DEFAULT NULL,
  `remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_39c25d488b1915027f2128a547d` (`visitor_emp_id`),
  KEY `FK_a8182c26deb15bb460ec9ebebd4` (`host_emp_id`),
  KEY `FK_13da5e86cec91796921a2dec36b` (`app_id`),
  KEY `FK_061165f6369cd862897275a52dc` (`visit_status_id`),
  KEY `FK_d8b02b2f365c2f8e69392da92ef` (`application_status_id`),
  KEY `FK_267bec5685d995259989f5c5c89` (`created_by`),
  CONSTRAINT `FK_061165f6369cd862897275a52dc` FOREIGN KEY (`visit_status_id`) REFERENCES `statuses` (`id`),
  CONSTRAINT `FK_13da5e86cec91796921a2dec36b` FOREIGN KEY (`app_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_267bec5685d995259989f5c5c89` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_39c25d488b1915027f2128a547d` FOREIGN KEY (`visitor_emp_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_a8182c26deb15bb460ec9ebebd4` FOREIGN KEY (`host_emp_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `FK_d8b02b2f365c2f8e69392da92ef` FOREIGN KEY (`application_status_id`) REFERENCES `statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'revinr_oms_new'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_calculate_income_tax` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calculate_income_tax`(taxable_income DECIMAL(12,2),

    financial_year VARCHAR(10)

) RETURNS decimal(12,2)
    DETERMINISTIC
BEGIN

    DECLARE total_tax DECIMAL(12,2) DEFAULT 0;

    DECLARE remaining_income DECIMAL(12,2);

    DECLARE tier_min, tier_max DECIMAL(12,2);

    DECLARE tier_rate DECIMAL(5,2);

    DECLARE tier_amount DECIMAL(12,2);

    DECLARE done INT DEFAULT 0;

    

    DECLARE tax_cursor CURSOR FOR 

        SELECT min_income, max_income, tax_rate, tax_amount

        FROM emp_income_tax_tiers

        WHERE financial_year = financial_year

        AND is_active = 1

        ORDER BY min_income;

    

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    

    SET remaining_income = taxable_income;

    

    OPEN tax_cursor;

    

    tax_loop: LOOP

        FETCH tax_cursor INTO tier_min, tier_max, tier_rate, tier_amount;

        IF done THEN

            LEAVE tax_loop;

        END IF;

        

        -- If income falls within this tier

        IF remaining_income > tier_min THEN

            -- Calculate taxable amount in this tier

            SET @tier_taxable = LEAST(

                COALESCE(tier_max, remaining_income) - tier_min,

                remaining_income - tier_min

            );

            

            IF @tier_taxable > 0 THEN

                -- Calculate tax for this tier

                SET total_tax = total_tax + (@tier_taxable * tier_rate / 100);

                

                -- Add fixed tax amount if any

                SET total_tax = total_tax + tier_amount;

            END IF;

        END IF;

    END LOOP;

    

    CLOSE tax_cursor;

    

    -- Apply standard deduction (├â┬ó├óΓé¼┼í├é┬╣50,000)

    IF taxable_income > 50000 THEN

        SET total_tax = total_tax - 50000;

    END IF;

    

    -- Ensure tax is not negative

    IF total_tax < 0 THEN

        SET total_tax = 0;

    END IF;

    

    RETURN ROUND(total_tax, 2);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetStatus`(IN status_id INT)
BEGIN

    SELECT 

        s.id,

        s.status_group_id,

        s.name AS status_name,

        s.code,

        s.color_name,

        s.is_active,

        s.serial,

        sg.name AS group_name

    FROM statuses s

    LEFT JOIN status_groups sg ON s.status_group_id = sg.id

    WHERE s.id = status_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUser`(IN userId INT)
BEGIN

    SELECT * FROM users WHERE id = userId;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calculate_formula_components` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calculate_formula_components`(

    IN p_employee_id INT,

    IN p_month_year DATE

)
BEGIN

    DECLARE v_basic_salary DECIMAL(12,2);

    DECLARE v_overtime_hours DECIMAL(5,2);

    DECLARE v_sales_amount DECIMAL(12,2);

    DECLARE v_performance_rating DECIMAL(5,2);

    DECLARE v_taxable_income DECIMAL(12,2);

    DECLARE v_income_tax DECIMAL(12,2);

    

    -- Get basic salary

    SELECT basic_salary INTO v_basic_salary

    FROM emp_salary_structures

    WHERE emp_id = p_employee_id

    AND is_active = 1

    AND effective_from <= p_month_year

    AND (effective_to IS NULL OR effective_to >= p_month_year);

    

    -- Example: Get overtime hours for the month (you would get this from attendance table)

    SET v_overtime_hours = 20; -- Example: 20 hours overtime

    

    -- Example: Get sales amount for the month

    SET v_sales_amount = 750000; -- Example: ├â┬ó├óΓé¼┼í├é┬╣7.5L sales

    

    -- Example: Get performance rating

    SET v_performance_rating = 85; -- Example: 85% performance

    

    -- Calculate taxable income (Gross - Non-taxable components)

    SELECT gross_salary INTO v_taxable_income

    FROM emp_salary_structures

    WHERE emp_id = p_employee_id

    AND is_active = 1;

    

    -- Calculate Income Tax using tiered calculation

    SET v_income_tax = fn_calculate_income_tax(v_taxable_income, '2024-25');

    

    -- Update formula-based components

    UPDATE emp_salary_structure_details essd

    JOIN emp_pay_items epi ON essd.pay_item_id = epi.id

    SET 

        essd.amount = CASE 

            WHEN epi.item_code = 'TAX' THEN v_income_tax

            WHEN epi.item_code = 'OT' THEN ROUND(v_basic_salary / (30 * 8) * v_overtime_hours * 2, 2)

            WHEN epi.item_code = 'INCENTIVE' THEN 

                CASE 

                    WHEN v_sales_amount >= 1000000 THEN v_sales_amount * 0.02

                    WHEN v_sales_amount >= 500000 THEN v_sales_amount * 0.01

                    ELSE 0

                END

            WHEN epi.item_code = 'VARIABLE' THEN ROUND(v_basic_salary * (v_performance_rating / 100), 2)

            ELSE essd.amount

        END,

        essd.calculated_amount = CASE 

            WHEN epi.item_code = 'TAX' THEN v_income_tax

            WHEN epi.item_code = 'OT' THEN ROUND(v_basic_salary / (30 * 8) * v_overtime_hours * 2, 2)

            WHEN epi.item_code = 'INCENTIVE' THEN 

                CASE 

                    WHEN v_sales_amount >= 1000000 THEN v_sales_amount * 0.02

                    WHEN v_sales_amount >= 500000 THEN v_sales_amount * 0.01

                    ELSE 0

                END

            WHEN epi.item_code = 'VARIABLE' THEN ROUND(v_basic_salary * (v_performance_rating / 100), 2)

            ELSE essd.calculated_amount

        END,

        essd.updated_at = CURRENT_TIMESTAMP(6)

    WHERE essd.salary_structure_id IN (

        SELECT id FROM emp_salary_structures 

        WHERE emp_id = p_employee_id 

        AND is_active = 1

    )

    AND epi.calculation_type_id IN (206, 207) -- TIERED or FORMULA

    AND essd.effective_from <= p_month_year

    AND (essd.effective_to IS NULL OR essd.effective_to >= p_month_year);

    

    -- Update total deductions and net salary

    UPDATE emp_salary_structures ss

    SET 

        total_deductions = (

            SELECT COALESCE(SUM(essd.amount), 0)

            FROM emp_salary_structure_details essd

            JOIN emp_pay_items epi ON essd.pay_item_id = epi.id

            WHERE essd.salary_structure_id = ss.id

            AND epi.pay_item_type_id = 195  -- Deductions

        ),

        net_salary = ss.gross_salary - (

            SELECT COALESCE(SUM(essd.amount), 0)

            FROM emp_salary_structure_details essd

            JOIN emp_pay_items epi ON essd.pay_item_id = epi.id

            WHERE essd.salary_structure_id = ss.id

            AND epi.pay_item_type_id = 195  -- Deductions

        ),

        updated_at = CURRENT_TIMESTAMP(6)

    WHERE ss.emp_id = p_employee_id

    AND ss.is_active = 1;

    

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07  9:25:37
