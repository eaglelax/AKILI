import { z } from 'zod';

// ============================================
// Schémas de validation communs
// ============================================

export const uuidSchema = z.string().uuid("ID invalide");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ============================================
// Validation Auth
// ============================================

export const loginSchema = z.object({
  username: z.string().min(3, "Username requis (min 3 caractères)"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe requis (min 8 caractères)"),
  firstName: z.string().min(2, "Prénom requis").optional(),
  lastName: z.string().min(2, "Nom requis").optional(),
});

// ============================================
// Validation Team Members
// ============================================

export const createTeamMemberSchema = z.object({
  name: z.string().min(2, "Nom requis (min 2 caractères)"),
  role: z.string().min(2, "Rôle requis"),
  department: z.string().optional().nullable(),
  username: z.string().min(3, "Username requis (min 3 caractères)"),
  password: z.string().min(6, "Mot de passe requis (min 6 caractères)"),
  isAdmin: z.boolean().default(false),
  hourlyRate: z.string().optional().default('5000'),
  skills: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return val || [];
  }),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable().or(z.literal('')).transform(val => val || null),
  avatar: z.string().max(10).optional().nullable(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

// ============================================
// Validation Clients
// ============================================

export const createClientSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  type: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email("Email invalide").optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  monthlyBudget: z.string().optional().default('0'),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractEndDate: z.coerce.date().optional().nullable(),
  satisfaction: z.string().optional().default('0'),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateClientSchema = createClientSchema.partial();

// ============================================
// Validation Projects
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional().nullable(),
  clientId: z.string().uuid().optional().nullable().or(z.literal('')).transform(val => val || null),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'urgente']).default('moyenne'),
  budget: z.string().optional().default('0'),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const addProjectMemberSchema = z.object({
  memberId: z.string().uuid("ID membre invalide"),
  role: z.string().optional(),
});

// ============================================
// Validation Tasks
// ============================================

// Helper pour transformer une chaîne vide en null pour les UUIDs optionnels
const optionalUuidOrNull = z.string().optional().nullable().transform(val => {
  if (!val || val === '') return null;
  // Vérifier si c'est un UUID valide
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val) ? val : null;
});

export const createTaskSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional().nullable().default(''),
  projectId: optionalUuidOrNull,
  clientId: optionalUuidOrNull,
  assignedTo: optionalUuidOrNull,
  status: z.enum(['en_attente', 'en_cours', 'en_pause', 'termine', 'annule']).default('en_attente'),
  priority: z.enum(['basse', 'normale', 'moyenne', 'haute', 'elevee', 'critique', 'urgente']).default('normale'),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  estimatedHours: z.union([z.string(), z.number()]).optional().nullable().transform(val => {
    if (val === null || val === undefined || val === '') return null;
    return String(val);
  }),
  hourlyRate: z.string().optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFilterSchema = z.object({
  assignee: z.string().uuid().optional(),
  project: z.string().uuid().optional(),
  client: z.string().uuid().optional(),
  status: z.enum(['en_attente', 'en_cours', 'en_pause', 'termine', 'annule']).optional(),
  priority: z.enum(['basse', 'normale', 'moyenne', 'haute', 'elevee', 'critique', 'urgente']).optional(),
  ...paginationSchema.shape,
});

// ============================================
// Validation Time Entries
// ============================================

export const createTimeEntrySchema = z.object({
  taskId: z.string().uuid("ID tâche invalide"),
  memberId: z.string().uuid("ID membre invalide"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional().nullable(),
  duration: z.number().int().min(0).default(0),
  description: z.string().optional(),
  hourlyRate: z.string().optional(),
});

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

// ============================================
// Validation Chat
// ============================================

export const createChannelSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  type: z.enum(['general', 'project', 'direct']).default('project'),
  projectId: z.string().uuid().optional().nullable(),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(z.string().uuid()).optional(),
});

export const updateChannelSchema = createChannelSchema.partial();

export const createMessageSchema = z.object({
  content: z.string().min(1, "Message requis"),
  channelId: z.string().uuid("ID canal invalide"),
  messageType: z.enum(['text', 'file', 'system']).default('text'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  mentions: z.array(z.string().uuid()).optional().default([]),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message requis"),
});

// ============================================
// Validation Notifications
// ============================================

export const createNotificationSchema = z.object({
  recipientId: z.string().uuid("ID destinataire invalide"),
  senderId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Titre requis"),
  message: z.string().min(1, "Message requis"),
  type: z.enum([
    'task_assigned',
    'task_updated',
    'deadline_approaching',
    'mention',
    'project_update',
    'timer_reminder',
    'system'
  ]),
  relatedType: z.enum(['task', 'project', 'message']).optional(),
  relatedId: z.string().uuid().optional(),
});

// ============================================
// Validation Permissions
// ============================================

export const updatePermissionsSchema = z.object({
  canViewAllTasks: z.boolean().optional(),
  canEditAllTasks: z.boolean().optional(),
  canDeleteTasks: z.boolean().optional(),
  canViewAllProjects: z.boolean().optional(),
  canEditAllProjects: z.boolean().optional(),
  canManageClients: z.boolean().optional(),
  canManageTeam: z.boolean().optional(),
  canViewAnalytics: z.boolean().optional(),
  canManagePermissions: z.boolean().optional(),
  canExportData: z.boolean().optional(),
  dailyHourLimit: z.number().int().min(1).max(24).optional(),
  maxOvertimeHours: z.number().int().min(0).max(12).optional(),
});

// ============================================
// Validation Analytics
// ============================================

export const analyticsFilterSchema = z.object({
  memberId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  ...dateRangeSchema.shape,
});

// ============================================
// Validation WebSocket Messages
// ============================================

export const wsMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user_connect'),
    data: z.object({
      memberId: z.string().uuid(),
      memberName: z.string(),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('user_disconnect'),
    data: z.object({
      memberId: z.string().uuid(),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('chat_message'),
    data: z.object({
      content: z.string().min(1),
      channelId: z.string().uuid(),
      senderId: z.string().uuid(),
      mentions: z.array(z.string().uuid()).optional(),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('task_updated'),
    data: z.object({
      taskId: z.string().uuid(),
      changes: z.record(z.unknown()),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('timer_started'),
    data: z.object({
      taskId: z.string().uuid(),
      memberId: z.string().uuid(),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('timer_stopped'),
    data: z.object({
      taskId: z.string().uuid(),
      memberId: z.string().uuid(),
      duration: z.number(),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('project_updated'),
    data: z.object({
      projectId: z.string().uuid(),
      changes: z.record(z.unknown()),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('request_dashboard_update'),
    data: z.object({}).optional(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('request_team_update'),
    data: z.object({}).optional(),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('ping'),
    data: z.object({}).optional(),
    timestamp: z.number(),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// ============================================
// Helper: Validate Request
// ============================================

import { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.query);
      req.query = data as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Paramètres invalides",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req.params);
      req.params = data as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Paramètres URL invalides",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
