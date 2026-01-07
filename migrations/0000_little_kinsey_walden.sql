CREATE TABLE `activity_logs` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` varchar(36),
	`old_value` json,
	`new_value` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channel_members` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`channel_id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role` varchar(20) DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`last_read_at` timestamp NULL,
	CONSTRAINT `channel_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_channel_member_unique` UNIQUE(`channel_id`,`member_id`)
);
--> statement-breakpoint
CREATE TABLE `chat_channels` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(20) NOT NULL DEFAULT 'project',
	`project_id` varchar(36),
	`is_private` boolean NOT NULL DEFAULT false,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`content` text NOT NULL,
	`sender_id` varchar(36),
	`channel_id` varchar(36) NOT NULL,
	`message_type` varchar(20) NOT NULL DEFAULT 'text',
	`file_url` varchar(500),
	`file_name` varchar(255),
	`mentions` json DEFAULT ('[]'),
	`is_edited` boolean NOT NULL DEFAULT false,
	`edited_at` timestamp NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`contact_person` varchar(255),
	`email` varchar(255),
	`phone` varchar(50),
	`address` text,
	`monthly_budget` decimal(12,2) DEFAULT '0',
	`contract_start_date` timestamp NULL,
	`contract_end_date` timestamp NULL,
	`satisfaction` decimal(3,2) DEFAULT '0',
	`total_revenue` decimal(12,2) DEFAULT '0',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`recipient_id` varchar(36) NOT NULL,
	`sender_id` varchar(36),
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`related_type` varchar(50),
	`related_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`member_id` varchar(36) NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`tasks_completed` int NOT NULL DEFAULT 0,
	`tasks_assigned` int NOT NULL DEFAULT 0,
	`total_hours` decimal(8,2) NOT NULL DEFAULT '0',
	`billable_hours` decimal(8,2) NOT NULL DEFAULT '0',
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`performance_score` decimal(5,2) NOT NULL DEFAULT '0',
	`quality_score` decimal(5,2) NOT NULL DEFAULT '0',
	`on_time_delivery` decimal(5,2) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_performance_unique` UNIQUE(`member_id`,`month`,`year`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`member_id` varchar(36) NOT NULL,
	`can_view_all_tasks` boolean NOT NULL DEFAULT false,
	`can_edit_all_tasks` boolean NOT NULL DEFAULT false,
	`can_delete_tasks` boolean NOT NULL DEFAULT false,
	`can_view_all_projects` boolean NOT NULL DEFAULT false,
	`can_edit_all_projects` boolean NOT NULL DEFAULT false,
	`can_manage_clients` boolean NOT NULL DEFAULT false,
	`can_manage_team` boolean NOT NULL DEFAULT false,
	`can_view_analytics` boolean NOT NULL DEFAULT false,
	`can_manage_permissions` boolean NOT NULL DEFAULT false,
	`can_export_data` boolean NOT NULL DEFAULT false,
	`daily_hour_limit` int DEFAULT 8,
	`max_overtime_hours` int DEFAULT 2,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_permissions_member_unique` UNIQUE(`member_id`)
);
--> statement-breakpoint
CREATE TABLE `project_files` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`project_id` varchar(36),
	`file_name` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`file_type` varchar(100) NOT NULL,
	`mime_type` varchar(100),
	`file_size` int,
	`file_path` varchar(500) NOT NULL,
	`file_data` text,
	`description` text,
	`uploaded_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`project_id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role` varchar(100),
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_project_member_unique` UNIQUE(`project_id`,`member_id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`client_id` varchar(36),
	`status` varchar(20) NOT NULL DEFAULT 'planning',
	`priority` varchar(20) NOT NULL DEFAULT 'moyenne',
	`budget` decimal(12,2) DEFAULT '0',
	`actual_cost` decimal(12,2) DEFAULT '0',
	`progress` int NOT NULL DEFAULT 0,
	`start_date` timestamp NULL,
	`end_date` timestamp NULL,
	`deadline` timestamp NULL,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` varchar(255) NOT NULL,
	`sess` json NOT NULL,
	`expire` timestamp NOT NULL,
	CONSTRAINT `sessions_sid` PRIMARY KEY(`sid`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`description` text,
	`updated_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`),
	CONSTRAINT `idx_settings_key` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`project_id` varchar(36),
	`client_id` varchar(36),
	`assigned_to` varchar(36),
	`status` varchar(20) NOT NULL DEFAULT 'en_attente',
	`priority` varchar(20) NOT NULL DEFAULT 'moyenne',
	`progress` int NOT NULL DEFAULT 0,
	`estimated_hours` decimal(8,2),
	`actual_hours` decimal(8,2) DEFAULT '0',
	`hourly_rate` decimal(10,2),
	`total_cost` decimal(12,2) DEFAULT '0',
	`deadline` timestamp NULL,
	`completed_at` timestamp NULL,
	`is_timer_active` boolean NOT NULL DEFAULT false,
	`timer_started_at` timestamp NULL,
	`timer_started_by` varchar(36),
	`total_time_spent` int NOT NULL DEFAULT 0,
	`created_by` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`role` varchar(100) NOT NULL,
	`department` varchar(100),
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`is_admin` boolean NOT NULL DEFAULT false,
	`hourly_rate` decimal(10,2) NOT NULL DEFAULT '5000',
	`skills` json DEFAULT ('[]'),
	`status` varchar(20) NOT NULL DEFAULT 'offline',
	`avatar` varchar(10),
	`phone` varchar(50),
	`email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_members_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`task_id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NULL,
	`duration` int NOT NULL DEFAULT 0,
	`description` text,
	`hourly_rate` decimal(10,2),
	`cost` decimal(12,2) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`first_name` varchar(100),
	`last_name` varchar(100),
	`role` varchar(20) NOT NULL DEFAULT 'employee',
	`profile_image_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_team_members_id_fk` FOREIGN KEY (`user_id`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `channel_members` ADD CONSTRAINT `channel_members_channel_id_chat_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `chat_channels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `channel_members` ADD CONSTRAINT `channel_members_member_id_team_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_channels` ADD CONSTRAINT `chat_channels_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_channels` ADD CONSTRAINT `chat_channels_created_by_team_members_id_fk` FOREIGN KEY (`created_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_id_team_members_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_channel_id_chat_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `chat_channels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_created_by_team_members_id_fk` FOREIGN KEY (`created_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_id_team_members_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sender_id_team_members_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_member_id_team_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_member_id_team_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_uploaded_by_team_members_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_member_id_team_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_created_by_team_members_id_fk` FOREIGN KEY (`created_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `settings` ADD CONSTRAINT `settings_updated_by_team_members_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigned_to_team_members_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `team_members`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_timer_started_by_team_members_id_fk` FOREIGN KEY (`timer_started_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_created_by_team_members_id_fk` FOREIGN KEY (`created_by`) REFERENCES `team_members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_member_id_team_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `team_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_activity_logs_user_id` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_entity` ON `activity_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_created_at` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_channel_members_channel` ON `channel_members` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_channel_members_member` ON `channel_members` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_channels_type` ON `chat_channels` (`type`);--> statement-breakpoint
CREATE INDEX `idx_chat_channels_project_id` ON `chat_channels` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_channel_id` ON `chat_messages` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_sender_id` ON `chat_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_messages_created_at` ON `chat_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_clients_name` ON `clients` (`name`);--> statement-breakpoint
CREATE INDEX `idx_clients_is_active` ON `clients` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_notifications_recipient_id` ON `notifications` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `idx_notifications_is_read` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `idx_notifications_created_at` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_performance_member_id` ON `performance_metrics` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_performance_month_year` ON `performance_metrics` (`month`,`year`);--> statement-breakpoint
CREATE INDEX `idx_project_files_project_id` ON `project_files` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_files_type` ON `project_files` (`file_type`);--> statement-breakpoint
CREATE INDEX `idx_project_files_uploaded_by` ON `project_files` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `idx_project_members_project` ON `project_members` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_members_member` ON `project_members` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `idx_projects_client_id` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_created_by` ON `projects` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE INDEX `idx_tasks_assigned_to` ON `tasks` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project_id` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_client_id` ON `tasks` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_created_by` ON `tasks` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_tasks_deadline` ON `tasks` (`deadline`);--> statement-breakpoint
CREATE INDEX `idx_team_members_username` ON `team_members` (`username`);--> statement-breakpoint
CREATE INDEX `idx_team_members_status` ON `team_members` (`status`);--> statement-breakpoint
CREATE INDEX `idx_team_members_department` ON `team_members` (`department`);--> statement-breakpoint
CREATE INDEX `idx_time_entries_task_id` ON `time_entries` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_time_entries_member_id` ON `time_entries` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_time_entries_start_time` ON `time_entries` (`start_time`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);