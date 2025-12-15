import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validate, validateQuery, createClientSchema, updateClientSchema, paginationSchema } from '../validators';

const router = Router();

// ============================================
// GET /api/clients - Liste des clients
// ============================================

router.get('/', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as any;
    const isAdmin = req.teamMember!.isAdmin;

    // Seuls les admins voient tous les clients
    // Les employees voient les clients de leurs projets
    let clients;

    if (isAdmin) {
      clients = await storage.getAllClients({ page, limit, sortBy, sortOrder });
    } else {
      clients = await storage.getClientsForMember(req.teamMember!.id, { page, limit, sortBy, sortOrder });
    }

    res.json({
      success: true,
      data: clients.data,
      pagination: clients.pagination,
    });
  } catch (error: any) {
    console.error("Get clients error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des clients"
    });
  }
});

// ============================================
// GET /api/clients/:id - Détail d'un client
// ============================================

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    // Charger les stats et projets associés
    const clientWithDetails = await storage.getClientWithDetails(id);

    res.json({
      success: true,
      data: clientWithDetails,
    });
  } catch (error: any) {
    console.error("Get client error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du client"
    });
  }
});

// ============================================
// POST /api/clients - Créer un client (Admin only)
// ============================================

router.post('/', requireAdmin, validate(createClientSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const clientData = {
      ...req.body,
      createdBy: req.teamMember!.id,
    };

    const client = await storage.createClient(clientData);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'create',
      entityType: 'client',
      entityId: client.id,
      newValue: clientData,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: client,
      message: "Client créé avec succès"
    });
  } catch (error: any) {
    console.error("Create client error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du client"
    });
  }
});

// ============================================
// PUT /api/clients/:id - Modifier un client (Admin only)
// ============================================

router.put('/:id', requireAdmin, validate(updateClientSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const existingClient = await storage.getClient(id);

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    const updatedClient = await storage.updateClient(id, req.body);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'update',
      entityType: 'client',
      entityId: id,
      oldValue: existingClient,
      newValue: req.body,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      data: updatedClient,
      message: "Client mis à jour"
    });
  } catch (error: any) {
    console.error("Update client error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du client"
    });
  }
});

// ============================================
// DELETE /api/clients/:id - Supprimer un client (Admin only)
// ============================================

router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    // Vérifier s'il y a des projets actifs
    const activeProjects = await storage.getActiveProjectsForClient(id);
    if (activeProjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${activeProjects.length} projet(s) actif(s) associé(s)`
      });
    }

    await storage.deleteClient(id);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete',
      entityType: 'client',
      entityId: id,
      oldValue: client,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Client supprimé"
    });
  } catch (error: any) {
    console.error("Delete client error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du client"
    });
  }
});

// ============================================
// GET /api/clients/:id/projects - Projets d'un client
// ============================================

router.get('/:id/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    const projects = await storage.getProjectsByClient(id);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Get client projects error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des projets"
    });
  }
});

// ============================================
// GET /api/clients/:id/tasks - Tâches d'un client
// ============================================

router.get('/:id/tasks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    const tasks = await storage.getTasksByClient(id);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Get client tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des tâches"
    });
  }
});

// ============================================
// GET /api/clients/:id/revenue - Revenus d'un client
// ============================================

router.get('/:id/revenue', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    const revenue = await storage.getClientRevenue(
      id,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: revenue,
    });
  } catch (error: any) {
    console.error("Get client revenue error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des revenus"
    });
  }
});

// ============================================
// PUT /api/clients/:id/satisfaction - Mettre à jour satisfaction
// ============================================

router.put('/:id/satisfaction', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { satisfaction } = req.body;

    if (satisfaction === undefined || satisfaction < 0 || satisfaction > 5) {
      return res.status(400).json({
        success: false,
        message: "La satisfaction doit être entre 0 et 5"
      });
    }

    const client = await storage.getClient(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé"
      });
    }

    await storage.updateClient(id, { satisfaction: satisfaction.toString() });

    res.json({
      success: true,
      message: "Satisfaction mise à jour"
    });
  } catch (error: any) {
    console.error("Update client satisfaction error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la satisfaction"
    });
  }
});

export default router;
