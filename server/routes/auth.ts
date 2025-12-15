import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validate, loginSchema } from '../validators';

const router = Router();

// ============================================
// POST /api/auth/login - Connexion équipe
// ============================================

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const member = await storage.getTeamMemberByUsername(username);

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects"
      });
    }

    // Vérification du mot de passe hashé dans team_members
    const isValidPassword = await bcrypt.compare(password, member.password);

    if (!isValidPassword) {
      // Log tentative de connexion échouée
      await storage.createActivityLog({
        userId: null,
        action: 'login_failed',
        entityType: 'auth',
        entityId: member.id,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects"
      });
    }

    // Mettre à jour le statut en ligne
    await storage.updateTeamMember(member.id, { status: 'online' });

    // Créer la session
    req.session.teamMember = {
      id: member.id,
      name: member.name,
      username: member.username,
      role: member.role,
      department: member.department || undefined,
      isAdmin: member.isAdmin,
      avatar: member.avatar || undefined,
    };
    req.session.userId = member.id;
    req.session.isAdmin = member.isAdmin;

    // Log connexion réussie
    await storage.createActivityLog({
      userId: member.id,
      action: 'login_success',
      entityType: 'auth',
      entityId: member.id,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    // Charger les permissions
    const permissions = await storage.getMemberPermissions(member.id);

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: member.name,
          username: member.username,
          role: member.role,
          department: member.department,
          isAdmin: member.isAdmin,
          avatar: member.avatar,
          email: member.email,
        },
        permissions,
        isAdmin: member.isAdmin,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion"
    });
  }
});

// ============================================
// POST /api/auth/logout - Déconnexion
// ============================================

router.post('/logout', async (req, res) => {
  try {
    const memberId = req.session.teamMember?.id;

    if (memberId) {
      // Mettre à jour le statut hors ligne
      await storage.updateTeamMember(memberId, { status: 'offline' });

      // Log déconnexion
      await storage.createActivityLog({
        userId: memberId,
        action: 'logout',
        entityType: 'auth',
        entityId: memberId,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      res.clearCookie('akili.sid');
      res.json({
        success: true,
        message: "Déconnexion réussie"
      });
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion"
    });
  }
});

// ============================================
// GET /api/auth/me - Utilisateur actuel
// ============================================

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.teamMember) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié"
      });
    }

    // Recharger les données fraîches depuis la BDD
    const member = await storage.getTeamMember(req.teamMember.id);
    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    const permissions = await storage.getMemberPermissions(req.teamMember.id);

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: member.name,
          username: member.username,
          role: member.role,
          department: member.department,
          isAdmin: member.isAdmin,
          avatar: member.avatar,
          email: member.email,
          status: member.status,
          hourlyRate: member.hourlyRate,
          skills: member.skills,
          phone: member.phone,
        },
        permissions,
        isAdmin: member.isAdmin,
      }
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil"
    });
  }
});

// ============================================
// PUT /api/auth/profile - Mettre à jour son profil
// ============================================

router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, phone, department } = req.body;

    if (!req.teamMember) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié"
      });
    }

    // Mise à jour des champs autorisés seulement
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (department !== undefined) updateData.department = department || null;

    const updatedMember = await storage.updateTeamMember(req.teamMember.id, updateData);

    // Mettre à jour la session
    if (name) {
      req.session.teamMember = {
        ...req.session.teamMember!,
        name,
      };
    }

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember.id,
      action: 'profile_update',
      entityType: 'auth',
      entityId: req.teamMember.id,
      newValue: updateData,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      data: updatedMember,
      message: "Profil mis à jour avec succès"
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil"
    });
  }
});

// ============================================
// PUT /api/auth/password - Changer mot de passe
// ============================================

router.put('/password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe actuel et nouveau mot de passe requis"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères"
      });
    }

    // Récupérer le membre avec le mot de passe
    const member = await storage.getTeamMemberByUsername(req.teamMember!.username);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, member.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe actuel incorrect"
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await storage.updateTeamMemberPassword(member.id, hashedPassword);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'password_change',
      entityType: 'auth',
      entityId: req.teamMember!.id,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Mot de passe modifié avec succès"
    });
  } catch (error: any) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de mot de passe"
    });
  }
});

// ============================================
// PUT /api/auth/status - Mettre à jour statut
// ============================================

router.put('/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'busy', 'away'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    await storage.updateTeamMember(req.teamMember!.id, { status });

    res.json({
      success: true,
      message: "Statut mis à jour"
    });
  } catch (error: any) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// ============================================
// GET /api/auth/check - Vérifier session
// ============================================

router.get('/check', (req, res) => {
  if (req.session.teamMember) {
    res.json({
      success: true,
      authenticated: true,
      isAdmin: req.session.isAdmin || false,
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      isAdmin: false,
    });
  }
});

export default router;
