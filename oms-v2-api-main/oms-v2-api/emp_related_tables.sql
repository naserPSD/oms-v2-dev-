CREATE TABLE `emp_designation_history` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` INT(10) UNSIGNED NOT NULL,
    `designation_id` INT(10) UNSIGNED NOT NULL,
    `effective_date` DATE NOT NULL,
    `end_date` DATE NULL DEFAULT NULL,
    `reason` ENUM('promotion', 'demotion', 'transfer', 'new_hire', 'reorganization') NULL,
    `comments` TEXT NULL,
    `approved_by` INT(10) UNSIGNED NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`)
);

CREATE TABLE `employee_salary_history` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` INT(10) UNSIGNED NOT NULL,
    `basic_salary` DECIMAL(12,2) NOT NULL,
    `house_rent_allowance` DECIMAL(12,2) DEFAULT 0,
    `medical_allowance` DECIMAL(12,2) DEFAULT 0,
    `transport_allowance` DECIMAL(12,2) DEFAULT 0,
    `other_allowances` DECIMAL(12,2) DEFAULT 0,
    `total_salary` DECIMAL(12,2) NOT NULL,
    `effective_date` DATE NOT NULL,
    `end_date` DATE NULL DEFAULT NULL,
    `increment_type` ENUM('step', 'promotion', 'adjustment', 'special', 'correction') DEFAULT 'step',
    `increment_amount` DECIMAL(12,2) NOT NULL,
    `increment_percentage` DECIMAL(5,2) NOT NULL,
    `reason` TEXT NULL,
    `approved_by` INT(10) UNSIGNED NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`)
);

CREATE TABLE `employee_grade_history` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` INT(10) UNSIGNED NOT NULL,
    `grade_id` INT(10) UNSIGNED NOT NULL,
    `effective_date` DATE NOT NULL,
    `end_date` DATE NULL DEFAULT NULL,
    `reason` ENUM('promotion', 'demotion', 'adjustment', 'new_hire') NULL,
    `comments` TEXT NULL,
    `approved_by` INT(10) UNSIGNED NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`)
);

CREATE TABLE `employee_department_history` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` INT(10) UNSIGNED NOT NULL,
    `department_id` INT(10) UNSIGNED NOT NULL,
    `unit_id` INT(10) UNSIGNED NULL,
    `effective_date` DATE NOT NULL,
    `end_date` DATE NULL DEFAULT NULL,
    `reason` ENUM('transfer', 'reorganization', 'new_hire', 'project_change') NULL,
    `comments` TEXT NULL,
    `approved_by` INT(10) UNSIGNED NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`)
);

CREATE TABLE `employee_location_history` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` INT(10) UNSIGNED NOT NULL,
    `location_id` INT(10) UNSIGNED NOT NULL,
    `work_location_type` ENUM('office', 'remote', 'hybrid', 'client_site') DEFAULT 'office',
    `effective_date` DATE NOT NULL,
    `end_date` DATE NULL DEFAULT NULL,
    `reason` TEXT NULL,
    `approved_by` INT(10) UNSIGNED NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`)
);