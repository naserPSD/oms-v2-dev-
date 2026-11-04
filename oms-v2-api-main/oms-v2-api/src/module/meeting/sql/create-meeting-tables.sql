-- Meeting module tables (run once on revinr_oms_new if TypeORM sync fails)

CREATE TABLE IF NOT EXISTS hr_meetings (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  app_id int UNSIGNED NOT NULL,
  title varchar(255) NOT NULL,
  host_user_id int UNSIGNED NULL,
  host_employee_id int UNSIGNED NULL,
  host_name varchar(255) NULL,
  meeting_type varchar(64) NOT NULL DEFAULT 'Online Meeting',
  start_at datetime NOT NULL,
  end_at datetime NOT NULL,
  meet_url varchar(512) NULL,
  google_event_id varchar(255) NULL,
  room_name varchar(255) NULL,
  company_name varchar(255) NULL,
  client_name varchar(255) NULL,
  address varchar(512) NULL,
  list_status varchar(32) NOT NULL DEFAULT 'SCHEDULED',
  is_repeat tinyint NOT NULL DEFAULT 0,
  repeat_days int NULL,
  creator_id int UNSIGNED NULL,
  created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX IDX_hr_meetings_app_id (app_id),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hr_meeting_attendees (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  meeting_id int UNSIGNED NOT NULL,
  employee_id int UNSIGNED NULL,
  user_id int UNSIGNED NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NULL,
  role varchar(128) NULL,
  attendance varchar(32) NULL,
  invite_status varchar(32) NOT NULL DEFAULT 'pending',
  INDEX IDX_hr_meeting_attendees_meeting_id (meeting_id),
  PRIMARY KEY (id),
  CONSTRAINT FK_hr_meeting_attendees_meeting FOREIGN KEY (meeting_id) REFERENCES hr_meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hr_meeting_agenda_items (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  meeting_id int UNSIGNED NOT NULL,
  text varchar(512) NOT NULL,
  is_done tinyint NOT NULL DEFAULT 0,
  INDEX IDX_hr_meeting_agenda_meeting_id (meeting_id),
  PRIMARY KEY (id),
  CONSTRAINT FK_hr_meeting_agenda_meeting FOREIGN KEY (meeting_id) REFERENCES hr_meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hr_meeting_notes (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  meeting_id int UNSIGNED NOT NULL,
  user_id int UNSIGNED NOT NULL,
  content text NULL,
  created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY UQ_hr_meeting_notes_meeting_user (meeting_id, user_id),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_google_tokens (
  id int UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id int UNSIGNED NOT NULL,
  access_token text NULL,
  refresh_token text NULL,
  token_expiry datetime NULL,
  scope varchar(512) NULL,
  created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY UQ_user_google_tokens_user_id (user_id),
  PRIMARY KEY (id)
) ENGINE=InnoDB;
