import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { TeamMember, Permission, AuthenticatedUser } from '@shared/schema';

// ============================================
// Types pour les requêtes authentifiées
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  teamMember?: TeamMember;
  permissions?: Permission;
}

// ============================================
// Session Types
// ============================================

declare module 'express-session' {
  interface SessionData {
    teamMember?: TeamMember;
    userId?: string;
    isAdmin?: boolean;
  }
}

// ============================================
// Middleware: Vérification de l'authentification
// ============================================

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.session.teamMember) {
      res.status(401).json({
        success: false,
        message: "Non autorisé - Veuillez vous connecter"
      });
      return;
    }

    // Charger le membre depuis la DB pour avoir les données à jour
    const member = await storage.getTeamMember(req.session.teamMember.id);

    if (!member) {
      req.session.destroy(() => {});
      res.status(401).json({
        success: false,
        message: "Session invalide - Membre non trouvé"
      });
      return;
    }

    // Charger les permissions du membre
    const permissions = await storage.getMemberPermissions(member.id);

    // Attacher les données à la requête
    req.teamMember = member;
    req.permissions = permissions || undefined;
    req.user = {
      id: member.userId || member.id,
      memberId: member.id,
      name: member.name,
      username: member.username,
      role: member.isAdmin ? 'admin' : 'employee',
      isAdmin: member.isAdmin,
      permissions: permissions || undefined,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: "Erreur d'authentification"
    });
  }
};

// ============================================
// Middleware: Vérification du rôle Admin
// ============================================

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // D'abord vérifier l'authentification
    if (!req.session.teamMember) {
      res.status(401).json({
        success: false,
        message: "Non autorisé - Veuillez vous connecter"
      });
      return;
    }

    const member = await storage.getTeamMember(req.session.teamMember.id);

    if (!member) {
      res.status(401).json({
        success: false,
        message: "Session invalide"
      });
      return;
    }

    if (!member.isAdmin) {
      res.status(403).json({
        success: false,
        message: "Accès refusé - Droits administrateur requis"
      });
      return;
    }

    // Charger les permissions admin
    const permissions = await storage.getMemberPermissions(member.id);

    req.teamMember = member;
    req.permissions = permissions || undefined;
    req.user = {
      id: member.userId || member.id,
      memberId: member.id,
      name: member.name,
      username: member.username,
      role: 'admin',
      isAdmin: true,
      permissions: permissions || undefined,
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: "Erreur de vérification des droits"
    });
  }
};

// ============================================
// Middleware: Vérification du rôle Employee
// ============================================

export const requireEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.session.teamMember) {
      res.status(401).json({
        success: false,
        message: "Non autorisé - Veuillez vous connecter"
      });
      return;
    }

    const member = await storage.getTeamMember(req.session.teamMember.id);

    if (!member) {
      res.status(401).json({
        success: false,
        message: "Session invalide"
      });
      return;
    }

    const permissions = await storage.getMemberPermissions(member.id);

    req.teamMember = member;
    req.permissions = permissions || undefined;
    req.user = {
      id: member.userId || member.id,
      memberId: member.id,
      name: member.name,
      username: member.username,
      role: member.isAdmin ? 'admin' : 'employee',
      isAdmin: member.isAdmin,
      permissions: permissions || undefined,
    };

    next();
  } catch (error) {
    console.error('Employee middleware error:', error);
    res.status(500).json({
      success: false,
      message: "Erreur de vérification"
    });
  }
};

// ============================================
// Middleware Factory: Vérification de rôle dynamique
// ============================================

export const requireRole = (role: 'admin' | 'employee') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (role === 'admin') {
      return requireAdmin(req, res, next);
    }
    return requireEmployee(req, res, next);
  };
};

// ============================================
// Middleware: Vérification de permission spécifique
// ============================================

type PermissionKey =
  | 'canViewAllTasks'
  | 'canEditAllTasks'
  | 'canDeleteTasks'
  | 'canViewAllProjects'
  | 'canEditAllProjects'
  | 'canManageClients'
  | 'canManageTeam'
  | 'canViewAnalytics'
  | 'canManagePermissions'
  | 'canExportData';

export const requirePermission = (permission: PermissionKey) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.session.teamMember) {
        res.status(401).json({
          success: false,
          message: "Non autorisé"
        });
        return;
      }

      const member = await storage.getTeamMember(req.session.teamMember.id);

      if (!member) {
        res.status(401).json({
          success: false,
          message: "Session invalide"
        });
        return;
      }

      // Les admins ont toutes les permissions
      if (member.isAdmin) {
        req.teamMember = member;
        req.user = {
          id: member.userId || member.id,
          memberId: member.id,
          name: member.name,
          username: member.username,
          role: 'admin',
          isAdmin: true,
        };
        next();
        return;
      }

      // Vérifier la permission spécifique
      const permissions = await storage.getMemberPermissions(member.id);

      if (!permissions || !permissions[permission]) {
        res.status(403).json({
          success: false,
          message: `Permission requise: ${permission}`
        });
        return;
      }

      req.teamMember = member;
      req.permissions = permissions;
      req.user = {
        id: member.userId || member.id,
        memberId: member.id,
        name: member.name,
        username: member.username,
        role: 'employee',
        isAdmin: false,
        permissions,
      };

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: "Erreur de vérification des permissions"
      });
    }
  };
};

// ============================================
// Middleware: Vérification propriétaire de ressource
// ============================================

export const requireOwnerOrAdmin = (
  getResourceOwnerId: (req: AuthenticatedRequest) => Promise<string | null>
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.session.teamMember) {
        res.status(401).json({
          success: false,
          message: "Non autorisé"
        });
        return;
      }

      const member = await storage.getTeamMember(req.session.teamMember.id);

      if (!member) {
        res.status(401).json({
          success: false,
          message: "Session invalide"
        });
        return;
      }

      // Les admins peuvent tout modifier
      if (member.isAdmin) {
        req.teamMember = member;
        req.user = {
          id: member.userId || member.id,
          memberId: member.id,
          name: member.name,
          username: member.username,
          role: 'admin',
          isAdmin: true,
        };
        next();
        return;
      }

      // Vérifier si l'utilisateur est le propriétaire
      const ownerId = await getResourceOwnerId(req);

      if (ownerId !== member.id) {
        res.status(403).json({
          success: false,
          message: "Accès refusé - Vous n'êtes pas le propriétaire de cette ressource"
        });
        return;
      }

      req.teamMember = member;
      req.user = {
        id: member.userId || member.id,
        memberId: member.id,
        name: member.name,
        username: member.username,
        role: 'employee',
        isAdmin: false,
      };

      next();
    } catch (error) {
      console.error('Owner middleware error:', error);
      res.status(500).json({
        success: false,
        message: "Erreur de vérification de propriété"
      });
    }
  };
};

// ============================================
// Middleware: Rate Limiting basique
// ============================================

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: "Trop de requêtes - Veuillez réessayer plus tard"
      });
      return;
    }

    record.count++;
    next();
  };
};

// ============================================
// Middleware: Logging des actions
// ============================================

export const logAction = (action: string, entityType: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Stocker l'action pour le log après la réponse
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.teamMember) {
        try {
          await storage.createActivityLog({
            userId: req.teamMember.id,
            action,
            entityType,
            entityId: req.params.id || null,
            ipAddress: req.ip || null,
            userAgent: req.get('User-Agent') || null,
          });
        } catch (error) {
          console.error('Failed to log action:', error);
        }
      }
    });

    next();
  };
};
