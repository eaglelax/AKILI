import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validateQuery, paginationSchema, createTimeEntrySchema, validate } from '../validators';

const router = Router();

// ============================================
// GET /api/timers/active - Timers actifs
// ============================================

router.get('/active', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let activeTimers;

    if (isAdmin) {
      // Admin voit tous les timers actifs
      activeTimers = await storage.getAllActiveTimers();
    } else {
      // Employee voit ses propres timers
      activeTimers = await storage.getActiveTimersForMember(currentUserId);
    }

    res.json({
      success: true,
      data: activeTimers,
    });
  } catch (error: any) {
    console.error("Get active timers error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des timers actifs"
    });
  }
});

// ============================================
// POST /api/timers/stop-all - Arrêter tous les timers (Admin)
// ============================================

router.post('/stop-all', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const stoppedCount = await storage.stopAllTimers();

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'stop_all_timers',
      entityType: 'timer',
      entityId: null,
      newValue: { stoppedCount },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: `${stoppedCount} timer(s) arrêté(s)`,
      data: { stoppedCount },
    });
  } catch (error: any) {
    console.error("Stop all timers error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'arrêt des timers"
    });
  }
});

// ============================================
// GET /api/timers/entries - Historique des entrées de temps
// ============================================

router.get('/entries', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as any;
    const { taskId, memberId, startDate, endDate } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier permissions
    if (!isAdmin && memberId && memberId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    const targetMemberId = isAdmin ? (memberId as string) : currentUserId;

    const entries = await storage.getTimeEntriesFiltered({
      taskId: taskId as string,
      memberId: targetMemberId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: entries.data,
      pagination: entries.pagination,
    });
  } catch (error: any) {
    console.error("Get time entries error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique"
    });
  }
});

// ============================================
// POST /api/timers/entries - Créer une entrée manuelle
// ============================================

router.post('/entries', requireAuth, validate(createTimeEntrySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier que l'utilisateur peut créer une entrée pour ce membre
    if (!isAdmin && req.body.memberId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à créer une entrée pour un autre membre"
      });
    }

    // Vérifier que la tâche existe
    const task = await storage.getTask(req.body.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier l'accès à la tâche
    if (!isAdmin && task.assignedTo !== currentUserId && task.createdBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à ajouter du temps sur cette tâche"
      });
    }

    // Calculer la durée si non fournie
    let duration = req.body.duration;
    if (!duration && req.body.startTime && req.body.endTime) {
      const start = new Date(req.body.startTime).getTime();
      const end = new Date(req.body.endTime).getTime();
      duration = Math.floor((end - start) / 1000);
    }

    // Cost calculation removed (no longer using hourly rates)
    const cost = 0; // Default cost to 0

    const entryData = {
      ...req.body,
      duration,
      cost: cost.toString(),
    };

    const entry = await storage.createTimeEntry(entryData);

    // Mettre à jour les stats de la tâche
    await storage.updateTaskTimeStats(req.body.taskId);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'create_time_entry',
      entityType: 'time_entry',
      entityId: entry.id,
      newValue: entryData,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: "Entrée de temps créée"
    });
  } catch (error: any) {
    console.error("Create time entry error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'entrée"
    });
  }
});

// ============================================
// PUT /api/timers/entries/:id - Modifier une entrée
// ============================================

router.put('/entries/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const entry = await storage.getTimeEntry(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entrée non trouvée"
      });
    }

    // Vérifier les permissions
    if (!isAdmin && entry.memberId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier cette entrée"
      });
    }

    // Recalculer la durée et le coût si nécessaire
    let updateData = { ...req.body };

    if (req.body.startTime && req.body.endTime) {
      const start = new Date(req.body.startTime).getTime();
      const end = new Date(req.body.endTime).getTime();
      updateData.duration = Math.floor((end - start) / 1000);
    }

    if (updateData.duration !== undefined) {
      // Cost calculation removed (no longer using hourly rates)
      updateData.cost = '0';
    }

    const updatedEntry = await storage.updateTimeEntry(id, updateData);

    // Mettre à jour les stats de la tâche
    await storage.updateTaskTimeStats(entry.taskId);

    res.json({
      success: true,
      data: updatedEntry,
      message: "Entrée mise à jour"
    });
  } catch (error: any) {
    console.error("Update time entry error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'entrée"
    });
  }
});

// ============================================
// DELETE /api/timers/entries/:id - Supprimer une entrée
// ============================================

router.delete('/entries/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const entry = await storage.getTimeEntry(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entrée non trouvée"
      });
    }

    // Seul admin peut supprimer
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Accès administrateur requis pour supprimer une entrée"
      });
    }

    const taskId = entry.taskId;

    await storage.deleteTimeEntry(id);

    // Mettre à jour les stats de la tâche
    await storage.updateTaskTimeStats(taskId);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete_time_entry',
      entityType: 'time_entry',
      entityId: id,
      oldValue: entry,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Entrée supprimée"
    });
  } catch (error: any) {
    console.error("Delete time entry error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'entrée"
    });
  }
});

// ============================================
// GET /api/timers/summary - Résumé des temps
// ============================================

router.get('/summary', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const groupByOption = (groupBy as 'day' | 'week' | 'month' | 'member' | 'project' | 'client') || 'day';

    let summary;

    if (isAdmin) {
      summary = await storage.getTimeSummary(
        undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        groupByOption
      );
    } else {
      summary = await storage.getTimeSummary(
        currentUserId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        groupByOption
      );
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("Get time summary error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du résumé"
    });
  }
});

// ============================================
// GET /api/timers/today - Temps du jour
// ============================================

router.get('/today', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayStats;

    if (isAdmin) {
      todayStats = await storage.getTodayTimeStats();
    } else {
      todayStats = await storage.getMemberTodayTimeStats(currentUserId);
    }

    res.json({
      success: true,
      data: todayStats,
    });
  } catch (error: any) {
    console.error("Get today stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des stats du jour"
    });
  }
});

// ============================================
// GET /api/timers/weekly - Temps de la semaine
// ============================================

router.get('/weekly', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let weeklyStats;

    if (isAdmin) {
      weeklyStats = await storage.getWeeklyTimeStats();
    } else {
      weeklyStats = await storage.getMemberWeeklyTimeStats(currentUserId);
    }

    res.json({
      success: true,
      data: weeklyStats,
    });
  } catch (error: any) {
    console.error("Get weekly stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des stats de la semaine"
    });
  }
});

export default router;
