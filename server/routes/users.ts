import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validate, validateQuery, createTeamMemberSchema, updateTeamMemberSchema, paginationSchema, updatePermissionsSchema } from '../validators';

const router = Router();

// ============================================
// GET /api/users - Liste des membres de l'équipe
// ============================================

router.get('/', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as any;

    const members = await storage.getAllTeamMembers({ page, limit, sortBy, sortOrder });

    res.json({
      success: true,
      data: members.data,
      pagination: members.pagination,
    });
  } catch (error: any) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des membres"
    });
  }
});

// ============================================
// GET /api/users/online - Membres en ligne
// ============================================

router.get('/online', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const onlineMembers = await storage.getOnlineMembers();

    res.json({
      success: true,
      data: onlineMembers,
    });
  } catch (error: any) {
    console.error("Get online members error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des membres en ligne"
    });
  }
});

// ============================================
// GET /api/users/:id - Détail d'un membre
// ============================================

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const member = await storage.getTeamMember(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Charger les stats du membre
    const stats = await storage.getMemberStats(id);

    res.json({
      success: true,
      data: {
        ...member,
        stats,
      },
    });
  } catch (error: any) {
    console.error("Get team member error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du membre"
    });
  }
});

// ============================================
// POST /api/users - Créer un membre (Admin only)
// ============================================

router.post('/', requireAdmin, validate(createTeamMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    // Vérifier si le username existe déjà
    const existingMember = await storage.getTeamMemberByUsername(req.body.username);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "Ce nom d'utilisateur existe déjà"
      });
    }

    // Vérifier les permissions de création de rôle
    const currentUserRole = req.session.userRole || 'member';
    const requestedRole = req.body.userRole || 'member';

    // Seul super_admin peut créer des super_admin
    if (requestedRole === 'super_admin' && currentUserRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Seul un super administrateur peut créer un compte super administrateur"
      });
    }

    // Seul super_admin peut créer des admin
    if (requestedRole === 'admin' && currentUserRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Seul un super administrateur peut créer un compte administrateur"
      });
    }

    // Hasher le mot de passe avant de créer le membre
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Préparer les données avec les bons types
    const memberData = {
      name: req.body.name,
      role: req.body.role,
      department: req.body.department || null,
      username: req.body.username,
      password: hashedPassword,
      isAdmin: requestedRole === 'admin' || requestedRole === 'super_admin',
      userRole: requestedRole,
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      phone: req.body.phone || null,
      email: req.body.email || null,
      avatar: req.body.avatar || req.body.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    };

    console.log("Creating team member with data:", JSON.stringify(memberData, null, 2));

    const member = await storage.createTeamMember(memberData);

    // Créer les permissions par défaut
    try {
      await storage.createMemberPermissions(member.id, {
        canViewAllTasks: false,
        canEditAllTasks: false,
        canDeleteTasks: false,
        canViewAllProjects: false,
        canEditAllProjects: false,
        canManageClients: false,
        canManageTeam: false,
        canViewAnalytics: false,
        canManagePermissions: false,
        canExportData: false,
      });
    } catch (permError: any) {
      console.error("Error creating permissions (non-fatal):", permError.message);
    }

    // Log l'action
    try {
      await storage.createActivityLog({
        userId: req.teamMember!.id,
        action: 'create',
        entityType: 'team_member',
        entityId: member.id,
        newValue: memberData,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
    } catch (logError: any) {
      console.error("Error creating activity log (non-fatal):", logError.message);
    }

    res.status(201).json({
      success: true,
      data: member,
      message: "Membre créé avec succès"
    });
  } catch (error: any) {
    console.error("Create team member error:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la création du membre"
    });
  }
});

// ============================================
// PUT /api/users/:id - Modifier un membre (Admin only)
// ============================================

router.put('/:id', requireAdmin, validate(updateTeamMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const existingMember = await storage.getTeamMember(id);

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Vérifier les permissions de modification de rôle
    const currentUserRole = req.teamMember!.userRole || 'member';
    const requestedRole = req.body.userRole;

    // RÈGLE 1: Un admin ne peut PAS modifier son propre compte
    if (currentUserRole === 'admin' && id === currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Un administrateur ne peut pas modifier son propre compte. Contactez un super administrateur."
      });
    }

    // RÈGLE 2: Un super_admin ne peut PAS modifier son propre rôle
    if (currentUserRole === 'super_admin' && id === currentUserId && requestedRole && requestedRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez pas modifier votre propre rôle de super administrateur"
      });
    }

    // RÈGLE 3: Un admin ne peut PAS modifier un autre admin ou super_admin
    if (currentUserRole === 'admin' && (existingMember.userRole === 'admin' || existingMember.userRole === 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: "Un administrateur ne peut pas modifier un autre administrateur ou super administrateur"
      });
    }

    if (requestedRole) {
      // Seul super_admin peut attribuer le rôle super_admin
      if (requestedRole === 'super_admin' && currentUserRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: "Seul un super administrateur peut attribuer ce rôle"
        });
      }

      // Seul super_admin peut attribuer le rôle admin
      if (requestedRole === 'admin' && currentUserRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: "Seul un super administrateur peut attribuer ce rôle"
        });
      }

      // Mettre à jour isAdmin en fonction du rôle
      req.body.isAdmin = requestedRole === 'admin' || requestedRole === 'super_admin';
    }

    // Si changement de username, vérifier l'unicité
    if (req.body.username && req.body.username !== existingMember.username) {
      const memberWithUsername = await storage.getTeamMemberByUsername(req.body.username);
      if (memberWithUsername) {
        return res.status(400).json({
          success: false,
          message: "Ce nom d'utilisateur existe déjà"
        });
      }
    }

    const updatedMember = await storage.updateTeamMember(id, req.body);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'update',
      entityType: 'team_member',
      entityId: id,
      oldValue: existingMember,
      newValue: req.body,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      data: updatedMember,
      message: "Membre mis à jour"
    });
  } catch (error: any) {
    console.error("Update team member error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du membre"
    });
  }
});

// ============================================
// DELETE /api/users/:id - Supprimer un membre (Admin only)
// ============================================

router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;
    const currentUserRole = req.teamMember!.userRole || 'member';

    const member = await storage.getTeamMember(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Ne pas supprimer soi-même
    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas vous supprimer vous-même"
      });
    }

    // RÈGLE: Un admin ne peut PAS supprimer un autre admin ou super_admin
    if (currentUserRole === 'admin' && (member.userRole === 'admin' || member.userRole === 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: "Un administrateur ne peut pas supprimer un autre administrateur ou super administrateur"
      });
    }

    await storage.deleteTeamMember(id);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete',
      entityType: 'team_member',
      entityId: id,
      oldValue: member,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Membre supprimé"
    });
  } catch (error: any) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du membre"
    });
  }
});

// ============================================
// GET /api/users/:id/permissions - Permissions d'un membre
// ============================================

router.get('/:id/permissions', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const member = await storage.getTeamMember(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    const permissions = await storage.getMemberPermissions(id);

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    console.error("Get member permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des permissions"
    });
  }
});

// ============================================
// PUT /api/users/:id/permissions - Modifier les permissions
// ============================================

router.put('/:id/permissions', requireAdmin, validate(updatePermissionsSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const member = await storage.getTeamMember(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    const existingPermissions = await storage.getMemberPermissions(id);

    if (existingPermissions) {
      await storage.updateMemberPermissions(id, req.body);
    } else {
      await storage.createMemberPermissions(id, req.body);
    }

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'update_permissions',
      entityType: 'permissions',
      entityId: id,
      oldValue: existingPermissions,
      newValue: req.body,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Permissions mises à jour"
    });
  } catch (error: any) {
    console.error("Update permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour des permissions"
    });
  }
});

// ============================================
// GET /api/users/:id/tasks - Tâches d'un membre
// ============================================

router.get('/:id/tasks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier les permissions
    if (!isAdmin && id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    const tasks = await storage.getTasksByAssignee(id);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Get member tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des tâches"
    });
  }
});

// ============================================
// GET /api/users/:id/time-entries - Historique temps d'un membre
// ============================================

router.get('/:id/time-entries', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier les permissions
    if (!isAdmin && id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    const timeEntries = await storage.getTimeEntriesByMember(id);

    res.json({
      success: true,
      data: timeEntries,
    });
  } catch (error: any) {
    console.error("Get member time entries error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique"
    });
  }
});

// ============================================
// GET /api/users/:id/performance - Performance d'un membre
// ============================================

router.get('/:id/performance', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier les permissions
    if (!isAdmin && id !== currentUserId) {
      const permissions = await storage.getMemberPermissions(currentUserId);
      if (!permissions?.canViewAnalytics) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
    }

    const performance = await storage.getPerformanceMetrics(
      id,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    res.json({
      success: true,
      data: performance,
    });
  } catch (error: any) {
    console.error("Get member performance error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des performances"
    });
  }
});

// ============================================
// PUT /api/users/:id/reset-password - Réinitialiser mot de passe (Admin only)
// ============================================

router.put('/:id/reset-password', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    const member = await storage.getTeamMember(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateTeamMemberPassword(id, hashedPassword);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'reset_password',
      entityType: 'team_member',
      entityId: id,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe"
    });
  }
});

export default router;
