export interface WSMessage {
  type: string;
  data: any;
  userId?: string;
  timestamp: number;
}

export interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  totalTime: number;
}

export interface TeamStats {
  totalMembers: number;
  onlineMembers: number;
}

export interface ClientStats {
  totalClients: number;
  activeProjects: number;
  totalRevenue: number;
}

export interface PerformanceData {
  member: string;
  tasksCompleted: number;
  totalHours: number;
  revenue: number;
  performance: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'general' | 'project' | 'direct';
  projectId?: string;
  isPrivate: boolean;
  members: string[];
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  channelId: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  mentions?: string[];
  createdAt: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export type Priority = 'basse' | 'moyenne' | 'haute' | 'urgente';
export type TaskStatus = 'en_attente' | 'en_cours' | 'en_pause' | 'termine' | 'annule';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type MemberStatus = 'online' | 'offline' | 'busy' | 'away';
