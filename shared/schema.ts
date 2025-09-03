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
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jo'Fé Digital team members
export const teamMembers = mysqlTable("team_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default('5000'),
  skills: json("skills"), // JSON array instead of PostgreSQL array
  status: varchar("status", { length: 20 }).default('offline'), // online, offline, busy, away
  avatar: varchar("avatar", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // sector/industry
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  monthlyBudget: decimal("monthly_budget", { precision: 12, scale: 2 }),
  contractEndDate: timestamp("contract_end_date"),
  satisfaction: decimal("satisfaction", { precision: 3, scale: 2 }).default('0'), // 0-5 rating
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default('0'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id),
  status: varchar("status", { length: 20 }).default('planning'), // planning, active, paused, completed, cancelled
  priority: varchar("priority", { length: 20 }).default('moyenne'), // basse, moyenne, haute, urgente
  budget: decimal("budget", { precision: 12, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default('0'),
  progress: int("progress").default(0), // 0-100
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  deadline: timestamp("deadline"),
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks
export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id),
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => teamMembers.id),
  status: varchar("status", { length: 20 }).default('en_attente'), // en_attente, en_cours, en_pause, termine, annule
  priority: varchar("priority", { length: 20 }).default('moyenne'), // basse, moyenne, haute, urgente
  progress: int("progress").default(0), // 0-100
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }).default('0'),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).default('0'),
  deadline: timestamp("deadline"),
  isTimerActive: boolean("is_timer_active").default(false),
  timerStartedAt: timestamp("timer_started_at"),
  totalTimeSpent: int("total_time_spent").default(0), // in seconds
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time tracking entries
export const timeEntries = mysqlTable("time_entries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  taskId: varchar("task_id", { length: 36 }).references(() => tasks.id),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: int("duration").default(0), // in seconds
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages
export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 36 }).references(() => teamMembers.id),
  channelId: varchar("channel_id", { length: 36 }).notNull(), // general, project-specific, etc.
  messageType: varchar("message_type", { length: 20 }).default('text'), // text, file, system
  fileUrl: varchar("file_url", { length: 500 }),
  mentions: json("mentions"), // JSON array for @username mentions
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat channels
export const chatChannels = mysqlTable("chat_channels", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).default('project'), // general, project, direct
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id),
  isPrivate: boolean("is_private").default(false),
  members: json("members"), // JSON array of member IDs
  createdBy: varchar("created_by", { length: 36 }).references(() => teamMembers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  recipientId: varchar("recipient_id", { length: 36 }).references(() => teamMembers.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // task_assigned, deadline_approaching, mention, etc.
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id", { length: 36 }), // ID of related task/project/etc
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance metrics
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  memberId: varchar("member_id", { length: 36 }).references(() => teamMembers.id),
  month: int("month").notNull(),
  year: int("year").notNull(),
  tasksCompleted: int("tasks_completed").default(0),
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }).default('0'),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }).default('0'), // 0-100
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default('0'), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  sentMessages: many(chatMessages),
  createdProjects: many(projects),
  notifications: many(notifications),
  performanceMetrics: many(performanceMetrics),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  creator: one(teamMembers, { fields: [projects.createdBy], references: [teamMembers.id] }),
  tasks: many(tasks),
  chatChannel: one(chatChannels),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  client: one(clients, { fields: [tasks.clientId], references: [clients.id] }),
  assignee: one(teamMembers, { fields: [tasks.assignedTo], references: [teamMembers.id] }),
  creator: one(teamMembers, { fields: [tasks.createdBy], references: [teamMembers.id] }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
  member: one(teamMembers, { fields: [timeEntries.memberId], references: [teamMembers.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(teamMembers, { fields: [chatMessages.senderId], references: [teamMembers.id] }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  project: one(projects, { fields: [chatChannels.projectId], references: [projects.id] }),
  creator: one(teamMembers, { fields: [chatChannels.createdBy], references: [teamMembers.id] }),
  messages: many(chatMessages),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(teamMembers, { fields: [notifications.recipientId], references: [teamMembers.id] }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  member: one(teamMembers, { fields: [performanceMetrics.memberId], references: [teamMembers.id] }),
}));

// Insert schemas
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
