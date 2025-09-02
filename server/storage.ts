import {
  users,
  teamMembers,
  clients,
  projects,
  tasks,
  timeEntries,
  chatMessages,
  chatChannels,
  notifications,
  performanceMetrics,
  type User,
  type UpsertUser,
  type TeamMember,
  type InsertTeamMember,
  type Client,
  type InsertClient,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type TimeEntry,
  type InsertTimeEntry,
  type ChatMessage,
  type InsertChatMessage,
  type ChatChannel,
  type InsertChatChannel,
  type Notification,
  type InsertNotification,
  type PerformanceMetric,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, like, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team member operations
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  getTeamMemberByUsername(username: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<void>;
  
  // Client operations
  getAllClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByAssignee(memberId: string): Promise<Task[]>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  getTasksByClient(clientId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  startTimer(taskId: string): Promise<void>;
  stopTimer(taskId: string): Promise<void>;
  
  // Time tracking operations
  getTimeEntries(taskId?: string, memberId?: string): Promise<TimeEntry[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, entry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  
  // Chat operations
  getChatChannels(): Promise<ChatChannel[]>;
  getChatMessages(channelId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  createChatChannel(channel: InsertChatChannel): Promise<ChatChannel>;
  
  // Notification operations
  getNotifications(memberId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Analytics operations
  getPerformanceMetrics(memberId?: string, month?: number, year?: number): Promise<PerformanceMetric[]>;
  calculateMemberPerformance(memberId: string, month: number, year: number): Promise<PerformanceMetric>;
  getDashboardStats(): Promise<any>;
  getTeamStats(): Promise<any>;
  getClientStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team member operations
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).orderBy(asc(teamMembers.name));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async getTeamMemberByUsername(username: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.username, username));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [updated] = await db
      .update(teamMembers)
      .set({ ...member, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // Client operations
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(asc(clients.name));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByAssignee(memberId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, memberId));
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksByClient(clientId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.clientId, clientId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async startTimer(taskId: string): Promise<void> {
    await db
      .update(tasks)
      .set({ 
        isTimerActive: true, 
        timerStartedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId));
  }

  async stopTimer(taskId: string): Promise<void> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (task && task.timerStartedAt) {
      const duration = Math.floor((Date.now() - task.timerStartedAt.getTime()) / 1000);
      const newTotalTime = (task.totalTimeSpent || 0) + duration;
      const newActualHours = newTotalTime / 3600;
      const newTotalCost = newActualHours * Number(task.hourlyRate || 0);

      await db
        .update(tasks)
        .set({ 
          isTimerActive: false, 
          timerStartedAt: null,
          totalTimeSpent: newTotalTime,
          actualHours: newActualHours.toString(),
          totalCost: newTotalCost.toString(),
          updatedAt: new Date()
        })
        .where(eq(tasks.id, taskId));

      // Create time entry
      await this.createTimeEntry({
        taskId: taskId,
        memberId: task.assignedTo!,
        startTime: task.timerStartedAt,
        endTime: new Date(),
        duration: duration,
      });
    }
  }

  // Time tracking operations
  async getTimeEntries(taskId?: string, memberId?: string): Promise<TimeEntry[]> {
    if (taskId && memberId) {
      return await db.select().from(timeEntries)
        .where(and(eq(timeEntries.taskId, taskId), eq(timeEntries.memberId, memberId)))
        .orderBy(desc(timeEntries.createdAt));
    } else if (taskId) {
      return await db.select().from(timeEntries)
        .where(eq(timeEntries.taskId, taskId))
        .orderBy(desc(timeEntries.createdAt));
    } else if (memberId) {
      return await db.select().from(timeEntries)
        .where(eq(timeEntries.memberId, memberId))
        .orderBy(desc(timeEntries.createdAt));
    }
    
    return await db.select().from(timeEntries).orderBy(desc(timeEntries.createdAt));
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const [newEntry] = await db.insert(timeEntries).values(entry).returning();
    return newEntry;
  }

  async updateTimeEntry(id: string, entry: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updated] = await db
      .update(timeEntries)
      .set(entry)
      .where(eq(timeEntries.id, id))
      .returning();
    return updated;
  }

  // Chat operations
  async getChatChannels(): Promise<ChatChannel[]> {
    return await db.select().from(chatChannels).orderBy(asc(chatChannels.name));
  }

  async getChatMessages(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async createChatChannel(channel: InsertChatChannel): Promise<ChatChannel> {
    const [newChannel] = await db.insert(chatChannels).values(channel).returning();
    return newChannel;
  }

  // Notification operations
  async getNotifications(memberId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, memberId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Analytics operations
  async getPerformanceMetrics(memberId?: string, month?: number, year?: number): Promise<PerformanceMetric[]> {
    let query = db.select().from(performanceMetrics);
    
    const conditions = [];
    if (memberId) conditions.push(eq(performanceMetrics.memberId, memberId));
    if (month) conditions.push(eq(performanceMetrics.month, month));
    if (year) conditions.push(eq(performanceMetrics.year, year));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(performanceMetrics.year), desc(performanceMetrics.month));
  }

  async calculateMemberPerformance(memberId: string, month: number, year: number): Promise<PerformanceMetric> {
    // Calculate performance metrics for a member for a specific month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const memberTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.assignedTo, memberId),
          gte(tasks.createdAt, startDate),
          lte(tasks.createdAt, endDate)
        )
      );

    const completedTasks = memberTasks.filter(t => t.status === 'termine');
    const totalHours = memberTasks.reduce((sum, task) => sum + Number(task.actualHours || 0), 0);
    const totalRevenue = memberTasks.reduce((sum, task) => sum + Number(task.totalCost || 0), 0);
    
    const performanceScore = completedTasks.length > 0 ? 
      (completedTasks.length / memberTasks.length) * 100 : 0;

    const [metric] = await db
      .insert(performanceMetrics)
      .values({
        memberId,
        month,
        year,
        tasksCompleted: completedTasks.length,
        totalHours: totalHours.toString(),
        revenue: totalRevenue.toString(),
        performanceScore: performanceScore.toString(),
        qualityScore: '85', // Default quality score
      })
      .onConflictDoUpdate({
        target: [performanceMetrics.memberId, performanceMetrics.month, performanceMetrics.year],
        set: {
          tasksCompleted: completedTasks.length,
          totalHours: totalHours.toString(),
          revenue: totalRevenue.toString(),
          performanceScore: performanceScore.toString(),
        },
      })
      .returning();

    return metric;
  }

  async getDashboardStats(): Promise<any> {
    const totalTasks = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const activeTasks = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'en_cours'));
    const completedToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'termine'),
          gte(tasks.updatedAt, new Date(new Date().setHours(0, 0, 0, 0)))
        )
      );

    const totalTimeResult = await db
      .select({ sum: sql<number>`coalesce(sum(${tasks.totalTimeSpent}), 0)` })
      .from(tasks);

    return {
      totalTasks: totalTasks[0]?.count || 0,
      activeTasks: activeTasks[0]?.count || 0,
      completedToday: completedToday[0]?.count || 0,
      totalTime: totalTimeResult[0]?.sum || 0,
    };
  }

  async getTeamStats(): Promise<any> {
    const totalMembers = await db.select({ count: sql<number>`count(*)` }).from(teamMembers);
    const onlineMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembers)
      .where(eq(teamMembers.status, 'online'));

    return {
      totalMembers: totalMembers[0]?.count || 0,
      onlineMembers: onlineMembers[0]?.count || 0,
    };
  }

  async getClientStats(): Promise<any> {
    const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const activeProjects = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.status, 'active'));

    const totalRevenueResult = await db
      .select({ sum: sql<number>`coalesce(sum(${clients.totalRevenue}), 0)` })
      .from(clients);

    return {
      totalClients: totalClients[0]?.count || 0,
      activeProjects: activeProjects[0]?.count || 0,
      totalRevenue: totalRevenueResult[0]?.sum || 0,
    };
  }
}

export const storage = new DatabaseStorage();
