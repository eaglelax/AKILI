-- Script de création des tables pour Akili - Jo'Fé Digital
-- Base de données: akili

USE akili;

-- Table sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expire` timestamp NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `idx_session_expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'employee',
  `profile_image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table team_members
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `user_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `hourly_rate` decimal(10,2) NOT NULL DEFAULT 5000.00,
  `skills` json DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'offline',
  `avatar` varchar(10) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_members_username_unique` (`username`),
  KEY `idx_team_members_username` (`username`),
  KEY `idx_team_members_status` (`status`),
  KEY `idx_team_members_department` (`department`),
  KEY `fk_team_members_user` (`user_id`),
  CONSTRAINT `fk_team_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `monthly_budget` decimal(12,2) DEFAULT 0.00,
  `contract_start_date` timestamp NULL DEFAULT NULL,
  `contract_end_date` timestamp NULL DEFAULT NULL,
  `satisfaction` decimal(3,2) DEFAULT 0.00,
  `total_revenue` decimal(12,2) DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clients_name` (`name`),
  KEY `idx_clients_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `client_id` varchar(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'planning',
  `priority` varchar(20) NOT NULL DEFAULT 'moyenne',
  `budget` decimal(12,2) DEFAULT 0.00,
  `actual_cost` decimal(12,2) DEFAULT 0.00,
  `progress` int NOT NULL DEFAULT 0,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_projects_status` (`status`),
  KEY `idx_projects_client_id` (`client_id`),
  KEY `idx_projects_created_by` (`created_by`),
  CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table project_members
CREATE TABLE IF NOT EXISTS `project_members` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `project_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_project_member_unique` (`project_id`, `member_id`),
  KEY `idx_project_members_project` (`project_id`),
  KEY `idx_project_members_member` (`member_id`),
  CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pm_member` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `client_id` varchar(36) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'en_attente',
  `priority` varchar(20) NOT NULL DEFAULT 'moyenne',
  `progress` int NOT NULL DEFAULT 0,
  `estimated_hours` decimal(8,2) DEFAULT NULL,
  `actual_hours` decimal(8,2) DEFAULT 0.00,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT 0.00,
  `deadline` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `is_timer_active` tinyint(1) NOT NULL DEFAULT 0,
  `timer_started_at` timestamp NULL DEFAULT NULL,
  `timer_started_by` varchar(36) DEFAULT NULL,
  `total_time_spent` int NOT NULL DEFAULT 0,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_assigned_to` (`assigned_to`),
  KEY `idx_tasks_project_id` (`project_id`),
  KEY `idx_tasks_client_id` (`client_id`),
  KEY `idx_tasks_status` (`status`),
  KEY `idx_tasks_created_by` (`created_by`),
  KEY `idx_tasks_deadline` (`deadline`),
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `team_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table time_entries
CREATE TABLE IF NOT EXISTS `time_entries` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `task_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `duration` int NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `cost` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_time_entries_task_id` (`task_id`),
  KEY `idx_time_entries_member_id` (`member_id`),
  KEY `idx_time_entries_start_time` (`start_time`),
  CONSTRAINT `fk_te_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_te_member` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table chat_channels
CREATE TABLE IF NOT EXISTS `chat_channels` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'project',
  `project_id` varchar(36) DEFAULT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_channels_type` (`type`),
  KEY `idx_chat_channels_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table channel_members
CREATE TABLE IF NOT EXISTS `channel_members` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `channel_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `role` varchar(20) DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_channel_member_unique` (`channel_id`, `member_id`),
  KEY `idx_channel_members_channel` (`channel_id`),
  KEY `idx_channel_members_member` (`member_id`),
  CONSTRAINT `fk_cm_channel` FOREIGN KEY (`channel_id`) REFERENCES `chat_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_member` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table chat_messages
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `content` text NOT NULL,
  `sender_id` varchar(36) DEFAULT NULL,
  `channel_id` varchar(36) NOT NULL,
  `message_type` varchar(20) NOT NULL DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `mentions` json DEFAULT NULL,
  `is_edited` tinyint(1) NOT NULL DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_channel_id` (`channel_id`),
  KEY `idx_chat_messages_sender_id` (`sender_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  CONSTRAINT `fk_msg_channel` FOREIGN KEY (`channel_id`) REFERENCES `chat_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `team_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `recipient_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `related_type` varchar(50) DEFAULT NULL,
  `related_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient_id` (`recipient_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notif_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_sender` FOREIGN KEY (`sender_id`) REFERENCES `team_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `member_id` varchar(36) NOT NULL,
  `can_view_all_tasks` tinyint(1) NOT NULL DEFAULT 0,
  `can_edit_all_tasks` tinyint(1) NOT NULL DEFAULT 0,
  `can_delete_tasks` tinyint(1) NOT NULL DEFAULT 0,
  `can_view_all_projects` tinyint(1) NOT NULL DEFAULT 0,
  `can_edit_all_projects` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_clients` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_team` tinyint(1) NOT NULL DEFAULT 0,
  `can_view_analytics` tinyint(1) NOT NULL DEFAULT 0,
  `can_manage_permissions` tinyint(1) NOT NULL DEFAULT 0,
  `can_export_data` tinyint(1) NOT NULL DEFAULT 0,
  `daily_hour_limit` int DEFAULT 8,
  `max_overtime_hours` int DEFAULT 2,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_permissions_member_unique` (`member_id`),
  CONSTRAINT `fk_perms_member` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table performance_metrics
CREATE TABLE IF NOT EXISTS `performance_metrics` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `member_id` varchar(36) NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `tasks_completed` int NOT NULL DEFAULT 0,
  `tasks_assigned` int NOT NULL DEFAULT 0,
  `total_hours` decimal(8,2) NOT NULL DEFAULT 0.00,
  `billable_hours` decimal(8,2) NOT NULL DEFAULT 0.00,
  `revenue` decimal(12,2) NOT NULL DEFAULT 0.00,
  `performance_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `quality_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `on_time_delivery` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_performance_unique` (`member_id`, `month`, `year`),
  KEY `idx_performance_member_id` (`member_id`),
  KEY `idx_performance_month_year` (`month`, `year`),
  CONSTRAINT `fk_perf_member` FOREIGN KEY (`member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table activity_logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_user_id` (`user_id`),
  KEY `idx_activity_logs_entity` (`entity_type`, `entity_id`),
  KEY `idx_activity_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `key` varchar(100) NOT NULL,
  `value` json NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`),
  KEY `idx_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Afficher les tables créées
SHOW TABLES;
