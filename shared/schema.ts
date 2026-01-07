import { sql } from 'drizzle-orm';
import {
  index,
  json,
  mysqlTable,
  timestamp,
  varchar,
  text,
  int,
  boolean,
  decimal,
  mysqlEnum,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = mysqlEnum('user_role', ['admin', 'employee']);
export const userStatusEnum = mysqlEnum('user_status', ['online', 'offline', 'busy', 'away']);
export const taskStatusEnum = mysqlEnum('task_status', ['en_attente', 'en_cours', 'en_pause', 'termine', 'annule']);
export const priorityEnum = mysqlEnum('priority', ['basse', 'moyenne', 'haute', 'urgente']);
export const projectStatusEnum = mysqlEnum('project_status', ['planning', 'active', 'paused', 'completed', 'cancelled']);
export const channelTypeEnum = mysqlEnum('channel_type', ['general', 'project', 'direct']);
export const messageTypeEnum = mysqlEnum('message_type', ['text', 'file', 'system']);
export const notificationTypeEnum = mysqlEnum('notification_type', [
  'task_assigned',
  'task_updated',
  'deadline_approaching',
  'mention',
  'project_update',
  'timer_reminder',
  'system'
]);

// ============================================
// SESSION TABLE (Express Session Store)
// ============================================

export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("idx_session_expire").on(table.expire)],
);

// ============================================
// USERS TABLE (Authentication)
// ============================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 20 }).default('employee').notNull(), // 'admin' | 'employee'
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_role").on(table.role),
]);

// ============================================
// TEAM MEMBERS TABLE
// ============================================

export const teamMembers = mysqlTable("team_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // Job title (Directeur, Designer, etc.)
  department: varchar("department", { length: 100 }), // Département (création, commercial, etc.)
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Mot de passe hashé (bcrypt)
  userRole: varchar("user_role", { length: 20 }).default('member').notNull(), // super_admin, admin, member
  isAdmin: boolean("is_admin").default(false).notNull(), // Deprecated: use userRole instead
  skills: json("skills").$type<string[]>().default([]),
  status: varchar("status", { length: 20 }).default('offline').notNull(), // online, offline, busy, away
  avatar: varchar("avatar", { length: 10 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_team_members_username").on(table.username),
  index("idx_team_members_status").on(table.status),
  index("idx_team_members_department").on(table.department),
]);

// ============================================
// CLIENTS TABLE
// ============================================

export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // Secteur d'activité
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  monthlyBudget: decimal("monthly_budget", { precision: 12, scale: 2 }).default('0'),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  satisfaction: decimal("satisfaction", { precision: 3, scale: 2 }).default('0'), // 0-5 rating
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default('0'),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_clients_name").on(table.name),
  index("idx_clients_is_active").on(table.isActive),
]);

// ============================================
// PROJECTS TABLE
// ============================================

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: 'set null' }),
  status: varchar("status", { length: 20 }).default('planning').notNull(), // planning, active, paused, completed, cancelled
  priority: varchar("priority", { length: 20 }).default('moyenne').notNull(), // basse, moyenne, haute, urgente
  budget: decimal("budget", { precision: 12, scale: 2 }).default('0'),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default('0'),
  progress: int("progress").default(0).notNull(), // 0-100
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  deadline: timestamp("deadline"),
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_projects_status").on(table.status),
  index("idx_projects_client_id").on(table.clientId),
  index("idx_projects_created_by").on(table.createdBy),
]);

// ============================================
// PROJECT MEMBERS (Many-to-Many)
// ============================================

export const projectMembers = mysqlTable("project_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  role: varchar("role", { length: 100 }), // Role dans le projet
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
  index("idx_project_members_project").on(table.projectId),
  index("idx_project_members_member").on(table.memberId),
  uniqueIndex("idx_project_member_unique").on(table.projectId, table.memberId),
]);

// ============================================
// TASKS TABLE
// ============================================

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: 'set null' }),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: 'set null' }),
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => teamMembers.id, { onDelete: 'set null' }),
  status: varchar("status", { length: 20 }).default('en_attente').notNull(),
  priority: varchar("priority", { length: 20 }).default('moyenne').notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }).default('0'),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).default('0'),
  deadline: timestamp("deadline"),
  completedAt: timestamp("completed_at"),
  isTimerActive: boolean("is_timer_active").default(false).notNull(),
  timerStartedAt: timestamp("timer_started_at"),
  timerStartedBy: varchar("timer_started_by", { length: 36 }).references(() => teamMembers.id),
  totalTimeSpent: int("total_time_spent").default(0).notNull(), // in seconds
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tasks_assigned_to").on(table.assignedTo),
  index("idx_tasks_project_id").on(table.projectId),
  index("idx_tasks_client_id").on(table.clientId),
  index("idx_tasks_status").on(table.status),
  index("idx_tasks_created_by").on(table.createdBy),
  index("idx_tasks_deadline").on(table.deadline),
]);

// ============================================
// TIME ENTRIES TABLE
// ============================================

export const timeEntries = mysqlTable("time_entries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  taskId: varchar("task_id", { length: 36 }).references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: int("duration").default(0).notNull(), // in seconds
  description: text("description"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_time_entries_task_id").on(table.taskId),
  index("idx_time_entries_member_id").on(table.memberId),
  index("idx_time_entries_start_time").on(table.startTime),
]);

// ============================================
// CHAT CHANNELS TABLE
// ============================================

export const chatChannels = mysqlTable("chat_channels", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).default('project').notNull(), // general, project, direct
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: 'cascade' }),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_channels_type").on(table.type),
  index("idx_chat_channels_project_id").on(table.projectId),
]);

// ============================================
// CHANNEL MEMBERS TABLE (Many-to-Many)
// ============================================

export const channelMembers = mysqlTable("channel_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  channelId: varchar("channel_id", { length: 36 }).references(() => chatChannels.id, { onDelete: 'cascade' }).notNull(),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  role: varchar("role", { length: 20 }).default('member'), // admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at"),
}, (table) => [
  index("idx_channel_members_channel").on(table.channelId),
  index("idx_channel_members_member").on(table.memberId),
  uniqueIndex("idx_channel_member_unique").on(table.channelId, table.memberId),
]);

// ============================================
// CHAT MESSAGES TABLE
// ============================================

export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'set null' }),
  channelId: varchar("channel_id", { length: 36 }).references(() => chatChannels.id, { onDelete: 'cascade' }).notNull(),
  messageType: varchar("message_type", { length: 20 }).default('text').notNull(), // text, file, system
  fileUrl: varchar("file_url", { length: 500 }),
  fileName: varchar("file_name", { length: 255 }),
  mentions: json("mentions").$type<string[]>().default([]), // Array of member IDs
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_messages_channel_id").on(table.channelId),
  index("idx_chat_messages_sender_id").on(table.senderId),
  index("idx_chat_messages_created_at").on(table.createdAt),
]);

// ============================================
// NOTIFICATIONS TABLE
// ============================================

export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  recipientId: varchar("recipient_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  senderId: varchar("sender_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'set null' }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // task_assigned, deadline_approaching, mention, etc.
  isRead: boolean("is_read").default(false).notNull(),
  relatedType: varchar("related_type", { length: 50 }), // task, project, message
  relatedId: varchar("related_id", { length: 36 }), // ID of related entity
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notifications_recipient_id").on(table.recipientId),
  index("idx_notifications_is_read").on(table.isRead),
  index("idx_notifications_created_at").on(table.createdAt),
]);

// ============================================
// PERFORMANCE METRICS TABLE
// ============================================

export const performanceMetrics = mysqlTable("performance_metrics", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  tasksCompleted: int("tasks_completed").default(0).notNull(),
  tasksAssigned: int("tasks_assigned").default(0).notNull(),
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }).default('0').notNull(),
  billableHours: decimal("billable_hours", { precision: 8, scale: 2 }).default('0').notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0').notNull(),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }).default('0').notNull(), // 0-100
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default('0').notNull(), // 0-100
  onTimeDelivery: decimal("on_time_delivery", { precision: 5, scale: 2 }).default('0').notNull(), // 0-100 percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_performance_member_id").on(table.memberId),
  index("idx_performance_month_year").on(table.month, table.year),
  uniqueIndex("idx_performance_unique").on(table.memberId, table.month, table.year),
]);

// ============================================
// ACTIVITY LOG TABLE (Audit Trail)
// ============================================

export const activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'set null' }),
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, login, logout, etc.
  entityType: varchar("entity_type", { length: 50 }).notNull(), // task, project, client, etc.
  entityId: varchar("entity_id", { length: 36 }),
  oldValue: json("old_value"),
  newValue: json("new_value"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_activity_logs_user_id").on(table.userId),
  index("idx_activity_logs_entity").on(table.entityType, table.entityId),
  index("idx_activity_logs_created_at").on(table.createdAt),
]);

// ============================================
// PERMISSIONS TABLE
// ============================================

export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  canViewAllTasks: boolean("can_view_all_tasks").default(false).notNull(),
  canEditAllTasks: boolean("can_edit_all_tasks").default(false).notNull(),
  canDeleteTasks: boolean("can_delete_tasks").default(false).notNull(),
  canViewAllProjects: boolean("can_view_all_projects").default(false).notNull(),
  canEditAllProjects: boolean("can_edit_all_projects").default(false).notNull(),
  canManageClients: boolean("can_manage_clients").default(false).notNull(),
  canManageTeam: boolean("can_manage_team").default(false).notNull(),
  canViewAnalytics: boolean("can_view_analytics").default(false).notNull(),
  canManagePermissions: boolean("can_manage_permissions").default(false).notNull(),
  canExportData: boolean("can_export_data").default(false).notNull(),
  dailyHourLimit: int("daily_hour_limit").default(8),
  maxOvertimeHours: int("max_overtime_hours").default(2),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_permissions_member_unique").on(table.memberId),
]);

// ============================================
// PROJECT FILES TABLE (Fichiers attachés aux projets)
// ============================================

export const projectFiles = mysqlTable("project_files", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: 'cascade' }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(), // brief, deliverable, reference, other
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: int("file_size"), // in bytes
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileData: text("file_data"), // Base64 encoded file data for small files
  description: text("description"),
  uploadedBy: varchar("uploaded_by", { length: 36 }).references(() => teamMembers.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_project_files_project_id").on(table.projectId),
  index("idx_project_files_type").on(table.fileType),
  index("idx_project_files_uploaded_by").on(table.uploadedBy),
]);

// ============================================
// SETTINGS TABLE
// ============================================

export const settings = mysqlTable("settings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_settings_key").on(table.key),
]);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one }) => ({
  teamMember: one(teamMembers, { fields: [users.id], references: [teamMembers.userId] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  tasks: many(tasks, { relationName: 'assignedTasks' }),
  createdTasks: many(tasks, { relationName: 'createdTasks' }),
  timeEntries: many(timeEntries),
  sentMessages: many(chatMessages),
  createdProjects: many(projects),
  notifications: many(notifications, { relationName: 'receivedNotifications' }),
  sentNotifications: many(notifications, { relationName: 'sentNotifications' }),
  performanceMetrics: many(performanceMetrics),
  projectMemberships: many(projectMembers),
  channelMemberships: many(channelMembers),
  activityLogs: many(activityLogs),
  permissions: one(permissions),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  projects: many(projects),
  tasks: many(tasks),
  creator: one(teamMembers, { fields: [clients.createdBy], references: [teamMembers.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  creator: one(teamMembers, { fields: [projects.createdBy], references: [teamMembers.id] }),
  tasks: many(tasks),
  chatChannels: many(chatChannels),
  members: many(projectMembers),
  files: many(projectFiles),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, { fields: [projectFiles.projectId], references: [projects.id] }),
  uploader: one(teamMembers, { fields: [projectFiles.uploadedBy], references: [teamMembers.id] }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  member: one(teamMembers, { fields: [projectMembers.memberId], references: [teamMembers.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  client: one(clients, { fields: [tasks.clientId], references: [clients.id] }),
  assignee: one(teamMembers, { fields: [tasks.assignedTo], references: [teamMembers.id], relationName: 'assignedTasks' }),
  creator: one(teamMembers, { fields: [tasks.createdBy], references: [teamMembers.id], relationName: 'createdTasks' }),
  timerStarter: one(teamMembers, { fields: [tasks.timerStartedBy], references: [teamMembers.id] }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
  member: one(teamMembers, { fields: [timeEntries.memberId], references: [teamMembers.id] }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  project: one(projects, { fields: [chatChannels.projectId], references: [projects.id] }),
  creator: one(teamMembers, { fields: [chatChannels.createdBy], references: [teamMembers.id] }),
  messages: many(chatMessages),
  members: many(channelMembers),
}));

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
  channel: one(chatChannels, { fields: [channelMembers.channelId], references: [chatChannels.id] }),
  member: one(teamMembers, { fields: [channelMembers.memberId], references: [teamMembers.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(teamMembers, { fields: [chatMessages.senderId], references: [teamMembers.id] }),
  channel: one(chatChannels, { fields: [chatMessages.channelId], references: [chatChannels.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(teamMembers, { fields: [notifications.recipientId], references: [teamMembers.id], relationName: 'receivedNotifications' }),
  sender: one(teamMembers, { fields: [notifications.senderId], references: [teamMembers.id], relationName: 'sentNotifications' }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  member: one(teamMembers, { fields: [performanceMetrics.memberId], references: [teamMembers.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(teamMembers, { fields: [activityLogs.userId], references: [teamMembers.id] }),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  member: one(teamMembers, { fields: [permissions.memberId], references: [teamMembers.id] }),
}));

// ============================================
// ZOD SCHEMAS (Validation)
// ============================================

// Users
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Email invalide"),
  passwordHash: z.string().min(1, "Mot de passe requis"),
  role: z.enum(['admin', 'employee']).default('employee'),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectUserSchema = createSelectSchema(users);

// Team Members
export const insertTeamMemberSchema = createInsertSchema(teamMembers, {
  name: z.string().min(2, "Nom requis (min 2 caractères)"),
  role: z.string().min(2, "Rôle requis"),
  username: z.string().min(3, "Username requis (min 3 caractères)"),
  skills: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateTeamMemberSchema = insertTeamMemberSchema.partial();

// Clients
export const insertClientSchema = createInsertSchema(clients, {
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide").optional().nullable(),
  satisfaction: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateClientSchema = insertClientSchema.partial();

// Projects
export const insertProjectSchema = createInsertSchema(projects, {
  name: z.string().min(2, "Nom requis"),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'urgente']).default('moyenne'),
  progress: z.number().min(0).max(100).default(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateProjectSchema = insertProjectSchema.partial();

// Tasks
export const insertTaskSchema = createInsertSchema(tasks, {
  name: z.string().min(2, "Nom requis"),
  status: z.enum(['en_attente', 'en_cours', 'en_pause', 'termine', 'annule']).default('en_attente'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'urgente']).default('moyenne'),
  progress: z.number().min(0).max(100).default(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateTaskSchema = insertTaskSchema.partial();

// Time Entries
export const insertTimeEntrySchema = createInsertSchema(timeEntries, {
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional().nullable(),
  duration: z.number().min(0).default(0),
}).omit({ id: true, createdAt: true });

// Chat
export const insertChatChannelSchema = createInsertSchema(chatChannels, {
  name: z.string().min(1, "Nom requis"),
  type: z.enum(['general', 'project', 'direct']).default('project'),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertChatMessageSchema = createInsertSchema(chatMessages, {
  content: z.string().min(1, "Message requis"),
  messageType: z.enum(['text', 'file', 'system']).default('text'),
  mentions: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true });

// Notifications
export const insertNotificationSchema = createInsertSchema(notifications, {
  title: z.string().min(1, "Titre requis"),
  message: z.string().min(1, "Message requis"),
  type: z.enum(['task_assigned', 'task_updated', 'deadline_approaching', 'mention', 'project_update', 'timer_reminder', 'system']),
}).omit({ id: true, createdAt: true });

// Permissions
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true, updatedAt: true });
export const updatePermissionSchema = insertPermissionSchema.partial();

// Activity Logs
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// Project Files
export const insertProjectFileSchema = createInsertSchema(projectFiles, {
  fileName: z.string().min(1, "Nom de fichier requis"),
  originalName: z.string().min(1, "Nom original requis"),
  fileType: z.enum(['brief', 'deliverable', 'reference', 'other']).default('other'),
  filePath: z.string().min(1, "Chemin requis"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateProjectFileSchema = insertProjectFileSchema.partial();

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;
export type ChannelMember = typeof channelMembers.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Setting = typeof settings.$inferSelect;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// USER ROLE TYPES
// ============================================

export type UserRole = 'admin' | 'employee';

export interface AuthenticatedUser {
  id: string;
  memberId: string;
  name: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
  permissions?: Permission;
}
