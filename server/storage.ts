import {
  users,
  teamMembers,
  clients,
  projects,
  projectMembers,
  projectFiles,
  tasks,
  timeEntries,
  chatMessages,
  chatChannels,
  channelMembers,
  notifications,
  performanceMetrics,
  activityLogs,
  permissions,
  settings,
  type User,
  type TeamMember,
  type InsertTeamMember,
  type Client,
  type InsertClient,
  type Project,
  type InsertProject,
  type ProjectFile,
  type InsertProjectFile,
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
  type ActivityLog,
  type InsertActivityLog,
  type Permission,
  type InsertPermission,
  type PaginationParams,
  type PaginatedResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, like, or, inArray, isNull, ne, count } from "drizzle-orm";

// ============================================
// Helper: Pagination
// ============================================

function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

function getOffset(params: PaginationParams): number {
  const page = params.page || 1;
  const limit = params.limit || 20;
  return (page - 1) * limit;
}

// ============================================
// Storage Class
// ============================================

export class DatabaseStorage {
  // ==========================================
  // USER OPERATIONS
  // ==========================================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(userData as any);
    return this.getUser(user.insertId as any) as Promise<User>;
  }

  // ==========================================
  // TEAM MEMBER OPERATIONS
  // ==========================================

  async getAllTeamMembers(params: PaginationParams = {}): Promise<PaginatedResult<TeamMember>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db.select({ count: count() }).from(teamMembers);
    const total = totalResult.count;

    const data = await db
      .select()
      .from(teamMembers)
      .orderBy(params.sortOrder === 'desc' ? desc(teamMembers.name) : asc(teamMembers.name))
      .limit(limit)
      .offset(offset);

    return paginate(data, total, params);
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
    const [result] = await db.insert(teamMembers).values(member as any);
    const [newMember] = await db.select().from(teamMembers).where(eq(teamMembers.username, member.username));
    return newMember;
  }

  async updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember> {
    await db
      .update(teamMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
    return this.getTeamMember(id) as Promise<TeamMember>;
  }

  async updateTeamMemberPassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(teamMembers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  async getOnlineMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers).where(eq(teamMembers.status, 'online'));
  }

  async getMemberStats(memberId: string): Promise<any> {
    const [taskStats] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END)`,
      })
      .from(tasks)
      .where(eq(tasks.assignedTo, memberId));

    const [timeStats] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(duration) / 3600, 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.memberId, memberId));

    return {
      tasks: taskStats,
      time: timeStats,
    };
  }

  // ==========================================
  // PERMISSIONS OPERATIONS
  // ==========================================

  async getMemberPermissions(memberId: string): Promise<Permission | null> {
    const [perm] = await db.select().from(permissions).where(eq(permissions.memberId, memberId));
    return perm || null;
  }

  async createMemberPermissions(memberId: string, data: Partial<InsertPermission>): Promise<Permission> {
    await db.insert(permissions).values({ ...data, memberId } as any);
    return this.getMemberPermissions(memberId) as Promise<Permission>;
  }

  async updateMemberPermissions(memberId: string, data: Partial<InsertPermission>): Promise<Permission> {
    await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.memberId, memberId));
    return this.getMemberPermissions(memberId) as Promise<Permission>;
  }

  // ==========================================
  // CLIENT OPERATIONS
  // ==========================================

  async getAllClients(params: PaginationParams = {}): Promise<PaginatedResult<Client>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db.select({ count: count() }).from(clients);
    const total = totalResult.count;

    const data = await db
      .select()
      .from(clients)
      .orderBy(asc(clients.name))
      .limit(limit)
      .offset(offset);

    return paginate(data, total, params);
  }

  async getClientsForMember(memberId: string, params: PaginationParams = {}): Promise<PaginatedResult<Client>> {
    // Get clients from projects where member is involved
    const memberProjects = await db
      .select({ clientId: projects.clientId })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(eq(projectMembers.memberId, memberId));

    const clientIds = memberProjects.map(p => p.clientId).filter(Boolean) as string[];

    if (clientIds.length === 0) {
      return paginate([], 0, params);
    }

    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(inArray(clients.id, clientIds));

    const data = await db
      .select()
      .from(clients)
      .where(inArray(clients.id, clientIds))
      .orderBy(asc(clients.name))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientWithDetails(id: string): Promise<any> {
    const client = await this.getClient(id);
    if (!client) return null;

    const clientProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, id));

    const clientTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.clientId, id));

    return {
      ...client,
      projects: clientProjects,
      tasks: clientTasks,
      projectCount: clientProjects.length,
      taskCount: clientTasks.length,
    };
  }

  async createClient(data: InsertClient): Promise<Client> {
    await db.insert(clients).values(data as any);
    const [newClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.name, data.name))
      .orderBy(desc(clients.createdAt))
      .limit(1);
    return newClient;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client> {
    await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id));
    return this.getClient(id) as Promise<Client>;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getActiveProjectsForClient(clientId: string): Promise<Project[]> {
    return db
      .select()
      .from(projects)
      .where(and(eq(projects.clientId, clientId), eq(projects.status, 'active')));
  }

  async getClientRevenue(clientId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const conditions = [eq(tasks.clientId, clientId)];
    if (startDate) conditions.push(gte(tasks.createdAt, startDate));
    if (endDate) conditions.push(lte(tasks.createdAt, endDate));

    const [result] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(total_cost), 0)`,
        totalHours: sql<number>`COALESCE(SUM(actual_hours), 0)`,
        taskCount: count(),
      })
      .from(tasks)
      .where(and(...conditions));

    return result;
  }

  // ==========================================
  // PROJECT OPERATIONS
  // ==========================================

  async getAllProjects(params: PaginationParams = {}): Promise<PaginatedResult<Project>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db.select({ count: count() }).from(projects);
    const total = totalResult.count;

    const data = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, total, params);
  }

  async getProjectsForMember(memberId: string, params: PaginationParams = {}): Promise<PaginatedResult<Project>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    // Projects where member is a member or creator
    const memberProjectIds = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.memberId, memberId));

    const projectIds = memberProjectIds.map(p => p.projectId);

    const [totalResult] = await db
      .select({ count: count() })
      .from(projects)
      .where(or(inArray(projects.id, projectIds), eq(projects.createdBy, memberId)));

    const data = await db
      .select()
      .from(projects)
      .where(or(
        projectIds.length > 0 ? inArray(projects.id, projectIds) : sql`1=0`,
        eq(projects.createdBy, memberId)
      ))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectWithRelations(id: string): Promise<any> {
    const project = await this.getProject(id);
    if (!project) return null;

    const client = project.clientId ? await this.getClient(project.clientId) : null;
    const members = await this.getProjectMembers(id);
    const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, id));

    return {
      ...project,
      client,
      members,
      tasks: projectTasks,
    };
  }

  async createProject(data: InsertProject): Promise<Project> {
    await db.insert(projects).values(data as any);
    const [newProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.name, data.name))
      .orderBy(desc(projects.createdAt))
      .limit(1);
    return newProject;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project> {
    await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return this.getProject(id) as Promise<Project>;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  // Project Members
  async isProjectMember(projectId: string, memberId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.memberId, memberId)));
    return !!result;
  }

  async getProjectMembers(projectId: string): Promise<any[]> {
    const members = await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        memberId: projectMembers.memberId,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        member: teamMembers,
      })
      .from(projectMembers)
      .innerJoin(teamMembers, eq(projectMembers.memberId, teamMembers.id))
      .where(eq(projectMembers.projectId, projectId));

    return members;
  }

  async addProjectMember(projectId: string, memberId: string, role?: string): Promise<void> {
    await db.insert(projectMembers).values({ projectId, memberId, role } as any);
  }

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.memberId, memberId)));
  }

  async getProjectChannel(projectId: string): Promise<ChatChannel | null> {
    const [channel] = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.projectId, projectId));
    return channel || null;
  }

  // ==========================================
  // TASK OPERATIONS
  // ==========================================

  async getAllTasks(params: PaginationParams & { status?: string; priority?: string } = {}): Promise<PaginatedResult<Task>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);
    const conditions: any[] = [];

    if (params.status) conditions.push(eq(tasks.status, params.status));
    if (params.priority) conditions.push(eq(tasks.priority, params.priority));

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const data = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getTasksForMember(memberId: string, params: PaginationParams & { status?: string; priority?: string } = {}): Promise<PaginatedResult<Task>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);
    const conditions: any[] = [
      or(eq(tasks.assignedTo, memberId), eq(tasks.createdBy, memberId))
    ];

    if (params.status) conditions.push(eq(tasks.status, params.status));
    if (params.priority) conditions.push(eq(tasks.priority, params.priority));

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTaskWithRelations(id: string): Promise<any> {
    const task = await this.getTask(id);
    if (!task) return null;

    const assignee = task.assignedTo ? await this.getTeamMember(task.assignedTo) : null;
    const project = task.projectId ? await this.getProject(task.projectId) : null;
    const client = task.clientId ? await this.getClient(task.clientId) : null;
    const taskTimeEntries = await db.select().from(timeEntries).where(eq(timeEntries.taskId, id));

    return {
      ...task,
      assignee,
      project,
      client,
      timeEntries: taskTimeEntries,
    };
  }

  async getTasksByAssignee(memberId: string, params: PaginationParams = {}): Promise<PaginatedResult<Task>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.assignedTo, memberId));

    const data = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, memberId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getTasksByProject(projectId: string, params: PaginationParams = {}): Promise<PaginatedResult<Task>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const data = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getTasksByClient(clientId: string, params: PaginationParams = {}): Promise<PaginatedResult<Task>> {
    const limit = params.limit || 50;
    const offset = getOffset(params);

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.clientId, clientId));

    const data = await db
      .select()
      .from(tasks)
      .where(eq(tasks.clientId, clientId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async createTask(data: InsertTask): Promise<Task> {
    await db.insert(tasks).values(data as any);
    const [newTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.name, data.name))
      .orderBy(desc(tasks.createdAt))
      .limit(1);
    return newTask;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task> {
    await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id));
    return this.getTask(id) as Promise<Task>;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Timer Operations
  async startTimer(taskId: string, memberId: string): Promise<void> {
    await db
      .update(tasks)
      .set({
        isTimerActive: true,
        timerStartedAt: new Date(),
        timerStartedBy: memberId,
        status: 'en_cours',
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }

  async stopTimer(taskId: string): Promise<TimeEntry | null> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task || !task.timerStartedAt) return null;

    const duration = Math.floor((Date.now() - task.timerStartedAt.getTime()) / 1000);
    const newTotalTime = (task.totalTimeSpent || 0) + duration;
    const newActualHours = newTotalTime / 3600;
    const hourlyRate = Number(task.hourlyRate || 0);
    const newTotalCost = newActualHours * hourlyRate;
    const entryCost = (duration / 3600) * hourlyRate;

    // Update task
    await db
      .update(tasks)
      .set({
        isTimerActive: false,
        timerStartedAt: null,
        timerStartedBy: null,
        totalTimeSpent: newTotalTime,
        actualHours: newActualHours.toFixed(2),
        totalCost: newTotalCost.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    // Create time entry
    const entry = await this.createTimeEntry({
      taskId,
      memberId: task.assignedTo || task.timerStartedBy!,
      startTime: task.timerStartedAt,
      endTime: new Date(),
      duration,
      hourlyRate: task.hourlyRate || undefined,
      cost: entryCost.toFixed(2),
    } as any);

    return entry;
  }

  async getAllActiveTimers(): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.isTimerActive, true));
  }

  async getActiveTimersForMember(memberId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(and(eq(tasks.isTimerActive, true), eq(tasks.assignedTo, memberId)));
  }

  async stopAllTimers(): Promise<number> {
    const activeTimers = await this.getAllActiveTimers();

    for (const task of activeTimers) {
      await this.stopTimer(task.id);
    }

    return activeTimers.length;
  }

  async updateTaskTimeStats(taskId: string): Promise<void> {
    const [stats] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId));

    const totalHours = (stats.totalDuration || 0) / 3600;

    await db
      .update(tasks)
      .set({
        totalTimeSpent: stats.totalDuration || 0,
        actualHours: totalHours.toFixed(2),
        totalCost: (stats.totalCost || 0).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }

  // ==========================================
  // TIME ENTRY OPERATIONS
  // ==========================================

  async getTimeEntries(taskId?: string, memberId?: string): Promise<TimeEntry[]> {
    const conditions: any[] = [];
    if (taskId) conditions.push(eq(timeEntries.taskId, taskId));
    if (memberId) conditions.push(eq(timeEntries.memberId, memberId));

    return db
      .select()
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(timeEntries.createdAt));
  }

  async getTimeEntriesByMember(memberId: string): Promise<TimeEntry[]> {
    return db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.memberId, memberId))
      .orderBy(desc(timeEntries.createdAt));
  }

  async getTimeEntriesFiltered(params: {
    taskId?: string;
    memberId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<TimeEntry>> {
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;
    const conditions: any[] = [];

    if (params.taskId) conditions.push(eq(timeEntries.taskId, params.taskId));
    if (params.memberId) conditions.push(eq(timeEntries.memberId, params.memberId));
    if (params.startDate) conditions.push(gte(timeEntries.startTime, params.startDate));
    if (params.endDate) conditions.push(lte(timeEntries.startTime, params.endDate));

    const [totalResult] = await db
      .select({ count: count() })
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const data = await db
      .select()
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(params.sortOrder === 'asc' ? asc(timeEntries.startTime) : desc(timeEntries.startTime))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return entry;
  }

  async createTimeEntry(data: InsertTimeEntry): Promise<TimeEntry> {
    await db.insert(timeEntries).values(data as any);
    const [newEntry] = await db
      .select()
      .from(timeEntries)
      .orderBy(desc(timeEntries.createdAt))
      .limit(1);
    return newEntry;
  }

  async updateTimeEntry(id: string, data: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    await db.update(timeEntries).set(data as any).where(eq(timeEntries.id, id));
    return this.getTimeEntry(id) as Promise<TimeEntry>;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await db.delete(timeEntries).where(eq(timeEntries.id, id));
  }

  // Time Stats
  async getTimeSummary(
    memberId?: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'day' | 'week' | 'month' | 'member' | 'project' | 'client' = 'day'
  ): Promise<any[]> {
    const conditions: any[] = [];
    if (memberId) conditions.push(eq(timeEntries.memberId, memberId));
    if (startDate) conditions.push(gte(timeEntries.startTime, startDate));
    if (endDate) conditions.push(lte(timeEntries.startTime, endDate));

    // Basic summary
    const result = await db
      .select({
        totalDuration: sql<number>`SUM(duration)`,
        totalCost: sql<number>`SUM(cost)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result;
  }

  async getTodayTimeStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(gte(timeEntries.startTime, today));

    return {
      ...result,
      totalHours: (result.totalDuration || 0) / 3600,
    };
  }

  async getMemberTodayTimeStats(memberId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.memberId, memberId), gte(timeEntries.startTime, today)));

    return {
      ...result,
      totalHours: (result.totalDuration || 0) / 3600,
    };
  }

  async getWeeklyTimeStats(): Promise<any> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(gte(timeEntries.startTime, weekStart));

    return {
      ...result,
      totalHours: (result.totalDuration || 0) / 3600,
    };
  }

  async getMemberWeeklyTimeStats(memberId: string): Promise<any> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.memberId, memberId), gte(timeEntries.startTime, weekStart)));

    return {
      ...result,
      totalHours: (result.totalDuration || 0) / 3600,
    };
  }

  // ==========================================
  // CHAT OPERATIONS
  // ==========================================

  async getAllChatChannels(): Promise<ChatChannel[]> {
    return db.select().from(chatChannels).orderBy(asc(chatChannels.name));
  }

  async getChannelsForMember(memberId: string): Promise<ChatChannel[]> {
    const memberChannelIds = await db
      .select({ channelId: channelMembers.channelId })
      .from(channelMembers)
      .where(eq(channelMembers.memberId, memberId));

    const channelIds = memberChannelIds.map(c => c.channelId);

    if (channelIds.length === 0) {
      // Return general channels at least
      return db
        .select()
        .from(chatChannels)
        .where(eq(chatChannels.type, 'general'));
    }

    return db
      .select()
      .from(chatChannels)
      .where(or(inArray(chatChannels.id, channelIds), eq(chatChannels.type, 'general')));
  }

  async getChatChannel(id: string): Promise<ChatChannel | undefined> {
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, id));
    return channel;
  }

  async getChatChannelWithMembers(id: string): Promise<any> {
    const channel = await this.getChatChannel(id);
    if (!channel) return null;

    const members = await db
      .select({
        id: channelMembers.id,
        channelId: channelMembers.channelId,
        memberId: channelMembers.memberId,
        joinedAt: channelMembers.joinedAt,
        member: teamMembers,
      })
      .from(channelMembers)
      .innerJoin(teamMembers, eq(channelMembers.memberId, teamMembers.id))
      .where(eq(channelMembers.channelId, id));

    return {
      ...channel,
      members,
    };
  }

  async createChatChannel(data: InsertChatChannel): Promise<ChatChannel> {
    await db.insert(chatChannels).values(data as any);
    const [newChannel] = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.name, data.name))
      .orderBy(desc(chatChannels.createdAt))
      .limit(1);
    return newChannel;
  }

  async isChannelMember(channelId: string, memberId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.memberId, memberId)));
    return !!result;
  }

  async addChannelMember(channelId: string, memberId: string): Promise<void> {
    await db.insert(channelMembers).values({ channelId, memberId } as any);
  }

  async removeChannelMember(channelId: string, memberId: string): Promise<void> {
    await db
      .delete(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.memberId, memberId)));
  }

  async updateLastReadAt(channelId: string, memberId: string): Promise<void> {
    await db
      .update(channelMembers)
      .set({ lastReadAt: new Date() })
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.memberId, memberId)));
  }

  async getDirectChannel(memberId1: string, memberId2: string): Promise<ChatChannel | null> {
    // Find a direct channel containing both members
    const channels = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.type, 'direct'));

    for (const channel of channels) {
      const members = await db
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.channelId, channel.id));

      const memberIds = members.map(m => m.memberId);
      if (memberIds.includes(memberId1) && memberIds.includes(memberId2) && memberIds.length === 2) {
        return channel;
      }
    }

    return null;
  }

  // Messages
  async getChatMessages(channelId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResult<ChatMessage>> {
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;

    const [totalResult] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId));

    const data = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data.reverse(), totalResult.count, params);
  }

  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message;
  }

  async getChatMessageWithSender(id: string): Promise<any> {
    const message = await this.getChatMessage(id);
    if (!message) return null;

    const sender = message.senderId ? await this.getTeamMember(message.senderId) : null;

    return {
      ...message,
      sender,
    };
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    await db.insert(chatMessages).values(data as any);
    const [newMessage] = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(1);
    return newMessage;
  }

  async updateChatMessage(id: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    await db.update(chatMessages).set(data as any).where(eq(chatMessages.id, id));
    return this.getChatMessage(id) as Promise<ChatMessage>;
  }

  async deleteChatMessage(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  async getUnreadMessageCounts(memberId: string): Promise<any[]> {
    const memberChannels = await db
      .select()
      .from(channelMembers)
      .where(eq(channelMembers.memberId, memberId));

    const result = [];

    for (const membership of memberChannels) {
      const lastReadAt = membership.lastReadAt || new Date(0);

      const [unreadCount] = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.channelId, membership.channelId),
          gte(chatMessages.createdAt, lastReadAt),
          ne(chatMessages.senderId, memberId)
        ));

      result.push({
        channelId: membership.channelId,
        unreadCount: unreadCount.count,
      });
    }

    return result;
  }

  // ==========================================
  // NOTIFICATION OPERATIONS
  // ==========================================

  async getNotifications(
    memberId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ): Promise<PaginatedResult<Notification>> {
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;
    const conditions = [eq(notifications.recipientId, memberId)];

    if (params.unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notif] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notif;
  }

  async getUnreadNotificationCount(memberId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.recipientId, memberId), eq(notifications.isRead, false)));
    return result.count;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    await db.insert(notifications).values(data as any);
    const [newNotif] = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(1);
    return newNotif;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(memberId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, memberId));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async deleteAllNotifications(memberId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.recipientId, memberId));
  }

  // ==========================================
  // ANALYTICS OPERATIONS
  // ==========================================

  async getDashboardStats(): Promise<any> {
    const [taskStats] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END)`,
      })
      .from(tasks);

    const [projectStats] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      })
      .from(projects);

    const [clientStats] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
      })
      .from(clients);

    const [memberStats] = await db
      .select({
        total: count(),
        online: sql<number>`SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END)`,
      })
      .from(teamMembers);

    const [revenueStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(total_cost), 0)`,
        totalHours: sql<number>`COALESCE(SUM(actual_hours), 0)`,
      })
      .from(tasks);

    return {
      tasks: taskStats,
      projects: projectStats,
      clients: clientStats,
      team: memberStats,
      revenue: revenueStats,
      timestamp: new Date().toISOString(),
    };
  }

  async getMemberDashboardStats(memberId: string): Promise<any> {
    const [taskStats] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END)`,
      })
      .from(tasks)
      .where(eq(tasks.assignedTo, memberId));

    const [timeStats] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(duration) / 3600, 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(cost), 0)`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.memberId, memberId));

    return {
      tasks: taskStats,
      time: timeStats,
      timestamp: new Date().toISOString(),
    };
  }

  async getTeamStats(): Promise<any> {
    const members = await db.select().from(teamMembers);

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const [stats] = await db
          .select({
            tasksCompleted: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
            totalHours: sql<number>`COALESCE(SUM(actual_hours), 0)`,
          })
          .from(tasks)
          .where(eq(tasks.assignedTo, member.id));

        return {
          ...member,
          stats,
        };
      })
    );

    return {
      total: members.length,
      online: members.filter(m => m.status === 'online').length,
      members: memberStats,
    };
  }

  async getClientStats(): Promise<any> {
    const [stats] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
        totalRevenue: sql<number>`COALESCE(SUM(total_revenue), 0)`,
        avgSatisfaction: sql<number>`COALESCE(AVG(satisfaction), 0)`,
      })
      .from(clients);

    return stats;
  }

  async getPerformanceMetrics(memberId?: string, month?: number, year?: number): Promise<PerformanceMetric[]> {
    const conditions: any[] = [];
    if (memberId) conditions.push(eq(performanceMetrics.memberId, memberId));
    if (month) conditions.push(eq(performanceMetrics.month, month));
    if (year) conditions.push(eq(performanceMetrics.year, year));

    return db
      .select()
      .from(performanceMetrics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(performanceMetrics.year), desc(performanceMetrics.month));
  }

  async calculateMemberPerformance(memberId: string, month: number, year: number): Promise<PerformanceMetric> {
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
    const performanceScore = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0;

    // Check for on-time deliveries
    const onTimeDeliveries = completedTasks.filter(t => {
      if (!t.deadline || !t.completedAt) return true;
      return new Date(t.completedAt) <= new Date(t.deadline);
    }).length;
    const onTimeDeliveryRate = completedTasks.length > 0 ? (onTimeDeliveries / completedTasks.length) * 100 : 0;

    // Insert or update
    const existing = await db
      .select()
      .from(performanceMetrics)
      .where(
        and(
          eq(performanceMetrics.memberId, memberId),
          eq(performanceMetrics.month, month),
          eq(performanceMetrics.year, year)
        )
      );

    const metricData = {
      memberId,
      month,
      year,
      tasksCompleted: completedTasks.length,
      tasksAssigned: memberTasks.length,
      totalHours: totalHours.toFixed(2),
      billableHours: totalHours.toFixed(2),
      revenue: totalRevenue.toFixed(2),
      performanceScore: performanceScore.toFixed(2),
      qualityScore: '85.00',
      onTimeDelivery: onTimeDeliveryRate.toFixed(2),
    };

    if (existing.length > 0) {
      await db
        .update(performanceMetrics)
        .set({ ...metricData, updatedAt: new Date() })
        .where(eq(performanceMetrics.id, existing[0].id));
      return this.getPerformanceMetrics(memberId, month, year).then(m => m[0]);
    } else {
      await db.insert(performanceMetrics).values(metricData as any);
      return this.getPerformanceMetrics(memberId, month, year).then(m => m[0]);
    }
  }

  async getRevenueStats(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(tasks.createdAt, startDate));
    if (endDate) conditions.push(lte(tasks.createdAt, endDate));

    const [result] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(total_cost), 0)`,
        totalHours: sql<number>`COALESCE(SUM(actual_hours), 0)`,
        taskCount: count(),
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result;
  }

  async getTeamProductivity(startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(timeEntries.startTime, startDate));
    if (endDate) conditions.push(lte(timeEntries.startTime, endDate));

    const [result] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(duration) / 3600, 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result;
  }

  async getMemberProductivity(memberId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [eq(timeEntries.memberId, memberId)];
    if (startDate) conditions.push(gte(timeEntries.startTime, startDate));
    if (endDate) conditions.push(lte(timeEntries.startTime, endDate));

    const [result] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(duration) / 3600, 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(and(...conditions));

    return result;
  }

  async getTaskStats(startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(tasks.createdAt, startDate));
    if (endDate) conditions.push(lte(tasks.createdAt, endDate));

    const [result] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END)`,
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result;
  }

  async getMemberTaskStats(memberId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [eq(tasks.assignedTo, memberId)];
    if (startDate) conditions.push(gte(tasks.createdAt, startDate));
    if (endDate) conditions.push(lte(tasks.createdAt, endDate));

    const [result] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END)`,
      })
      .from(tasks)
      .where(and(...conditions));

    return result;
  }

  async getTimeStats(memberId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [];
    if (memberId) conditions.push(eq(timeEntries.memberId, memberId));
    if (startDate) conditions.push(gte(timeEntries.startTime, startDate));
    if (endDate) conditions.push(lte(timeEntries.startTime, endDate));

    const [result] = await db
      .select({
        totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
        totalCost: sql<number>`COALESCE(SUM(cost), 0)`,
        entryCount: count(),
      })
      .from(timeEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      ...result,
      totalHours: (result.totalDuration || 0) / 3600,
    };
  }

  async getProjectStats(): Promise<any> {
    const [result] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        planning: sql<number>`SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END)`,
      })
      .from(projects);

    return result;
  }

  async getMemberProjectStats(memberId: string): Promise<any> {
    const memberProjectIds = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.memberId, memberId));

    const projectIds = memberProjectIds.map(p => p.projectId);

    if (projectIds.length === 0) {
      return { total: 0, active: 0, completed: 0 };
    }

    const [result] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    return result;
  }

  async getROIStats(clientId?: string, projectId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const conditions: any[] = [];
    if (clientId) conditions.push(eq(tasks.clientId, clientId));
    if (projectId) conditions.push(eq(tasks.projectId, projectId));
    if (startDate) conditions.push(gte(tasks.createdAt, startDate));
    if (endDate) conditions.push(lte(tasks.createdAt, endDate));

    const [result] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(total_cost), 0)`,
        totalHours: sql<number>`COALESCE(SUM(actual_hours), 0)`,
        taskCount: count(),
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result;
  }

  async exportData(type: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const conditions: any[] = [];

    switch (type) {
      case 'tasks':
        if (startDate) conditions.push(gte(tasks.createdAt, startDate));
        if (endDate) conditions.push(lte(tasks.createdAt, endDate));
        return db.select().from(tasks).where(conditions.length > 0 ? and(...conditions) : undefined);

      case 'time':
        if (startDate) conditions.push(gte(timeEntries.startTime, startDate));
        if (endDate) conditions.push(lte(timeEntries.startTime, endDate));
        return db.select().from(timeEntries).where(conditions.length > 0 ? and(...conditions) : undefined);

      case 'revenue':
        if (startDate) conditions.push(gte(tasks.createdAt, startDate));
        if (endDate) conditions.push(lte(tasks.createdAt, endDate));
        return db
          .select({
            taskId: tasks.id,
            taskName: tasks.name,
            clientId: tasks.clientId,
            projectId: tasks.projectId,
            totalCost: tasks.totalCost,
            actualHours: tasks.actualHours,
            createdAt: tasks.createdAt,
          })
          .from(tasks)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

      case 'performance':
        return db.select().from(performanceMetrics);

      default:
        return [];
    }
  }

  async getUpcomingDeadlines(daysAhead: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return db
      .select()
      .from(tasks)
      .where(
        and(
          gte(tasks.deadline, now),
          lte(tasks.deadline, futureDate),
          ne(tasks.status, 'termine'),
          ne(tasks.status, 'annule')
        )
      )
      .orderBy(asc(tasks.deadline));
  }

  async getMemberUpcomingDeadlines(memberId: string, daysAhead: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.assignedTo, memberId),
          gte(tasks.deadline, now),
          lte(tasks.deadline, futureDate),
          ne(tasks.status, 'termine'),
          ne(tasks.status, 'annule')
        )
      )
      .orderBy(asc(tasks.deadline));
  }

  // ==========================================
  // ACTIVITY LOG OPERATIONS
  // ==========================================

  async createActivityLog(data: InsertActivityLog): Promise<ActivityLog> {
    await db.insert(activityLogs).values(data as any);
    const [newLog] = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(1);
    return newLog;
  }

  async getActivityLogs(params: {
    memberId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ActivityLog>> {
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;
    const conditions: any[] = [];

    if (params.memberId) conditions.push(eq(activityLogs.userId, params.memberId));
    if (params.startDate) conditions.push(gte(activityLogs.createdAt, params.startDate));
    if (params.endDate) conditions.push(lte(activityLogs.createdAt, params.endDate));

    const [totalResult] = await db
      .select({ count: count() })
      .from(activityLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const data = await db
      .select()
      .from(activityLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return paginate(data, totalResult.count, params);
  }

  // ==========================================
  // PROJECT FILES OPERATIONS
  // ==========================================

  async createProjectFile(data: InsertProjectFile): Promise<ProjectFile> {
    await db.insert(projectFiles).values(data as any);
    const [newFile] = await db
      .select()
      .from(projectFiles)
      .orderBy(desc(projectFiles.createdAt))
      .limit(1);
    return newFile;
  }

  async getProjectFile(id: string): Promise<ProjectFile | undefined> {
    const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, id));
    return file;
  }

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(desc(projectFiles.createdAt));
  }

  async getProjectFilesByType(projectId: string, fileType: string): Promise<ProjectFile[]> {
    return db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          eq(projectFiles.fileType, fileType)
        )
      )
      .orderBy(desc(projectFiles.createdAt));
  }

  async updateProjectFile(id: string, data: Partial<InsertProjectFile>): Promise<ProjectFile | undefined> {
    await db
      .update(projectFiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projectFiles.id, id));
    return this.getProjectFile(id);
  }

  async deleteProjectFile(id: string): Promise<void> {
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
  }

  async deleteProjectFiles(projectId: string): Promise<void> {
    await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
