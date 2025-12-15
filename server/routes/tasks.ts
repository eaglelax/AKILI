import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin, requireOwnerOrAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validate, validateQuery, createTaskSchema, updateTaskSchema, taskFilterSchema } from '../validators';

const router = Router();

// ============================================
// GET /api/tasks - Liste des tâches
// ============================================

router.get('/', requireAuth, validateQuery(taskFilterSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { assignee, project, client, status, priority, page, limit, sortBy, sortOrder } = req.query as any;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let tasks;

    // Admin voit toutes les tâches, employee voit seulement les siennes
    if (isAdmin) {
      // Admin peut filtrer
      if (assignee) {
        tasks = await storage.getTasksByAssignee(assignee, { page, limit, sortBy, sortOrder });
      } else if (project) {
        tasks = await storage.getTasksByProject(project, { page, limit, sortBy, sortOrder });
      } else if (client) {
        tasks = await storage.getTasksByClient(client, { page, limit, sortBy, sortOrder });
      } else {
        tasks = await storage.getAllTasks({ page, limit, sortBy, sortOrder, status, priority });
      }
    } else {
      // Employee: ses propres tâches + celles qu'il a créées
      tasks = await storage.getTasksForMember(currentUserId, { page, limit, sortBy, sortOrder, status, priority });
    }

    res.json({
      success: true,
      data: tasks.data,
      pagination: tasks.pagination,
    });
  } catch (error: any) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des tâches"
    });
  }
});

// ============================================
// GET /api/tasks/:id - Détail d'une tâche
// ============================================

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const task = await storage.getTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      const isAssignee = task.assignedTo === currentUserId;
      const isCreator = task.createdBy === currentUserId;

      if (!isAssignee && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette tâche"
        });
      }
    }

    // Charger les relations
    const taskWithRelations = await storage.getTaskWithRelations(id);

    res.json({
      success: true,
      data: taskWithRelations,
    });
  } catch (error: any) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la tâche"
    });
  }
});

// ============================================
// POST /api/tasks - Créer une tâche
// ============================================

router.post('/', requireAuth, validate(createTaskSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.teamMember!.id,
    };

    // Si pas de hourlyRate défini, utiliser celui du membre assigné
    if (!taskData.hourlyRate && taskData.assignedTo) {
      const assignee = await storage.getTeamMember(taskData.assignedTo);
      if (assignee) {
        taskData.hourlyRate = assignee.hourlyRate;
      }
    }

    const task = await storage.createTask(taskData);

    // Créer une notification pour l'assigné
    if (taskData.assignedTo && taskData.assignedTo !== req.teamMember!.id) {
      await storage.createNotification({
        recipientId: taskData.assignedTo,
        senderId: req.teamMember!.id,
        title: "Nouvelle tâche assignée",
        message: `"${task.name}" vous a été assignée`,
        type: 'task_assigned',
        relatedType: 'task',
        relatedId: task.id,
      });
    }

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'create',
      entityType: 'task',
      entityId: task.id,
      newValue: taskData,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: "Tâche créée avec succès"
    });
  } catch (error: any) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la tâche"
    });
  }
});

// ============================================
// PUT /api/tasks/:id - Modifier une tâche
// ============================================

router.put('/:id', requireAuth, validate(updateTaskSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const existingTask = await storage.getTask(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      const isAssignee = existingTask.assignedTo === currentUserId;
      const isCreator = existingTask.createdBy === currentUserId;

      if (!isAssignee && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Non autorisé à modifier cette tâche"
        });
      }

      // Employee ne peut pas réassigner à quelqu'un d'autre
      if (req.body.assignedTo && req.body.assignedTo !== currentUserId && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Non autorisé à réassigner cette tâche"
        });
      }
    }

    // Si le statut passe à 'termine', enregistrer la date de complétion
    if (req.body.status === 'termine' && existingTask.status !== 'termine') {
      req.body.completedAt = new Date();
      req.body.progress = 100;
    }

    const updatedTask = await storage.updateTask(id, req.body);

    // Notification si réassignation
    if (req.body.assignedTo && req.body.assignedTo !== existingTask.assignedTo) {
      await storage.createNotification({
        recipientId: req.body.assignedTo,
        senderId: req.teamMember!.id,
        title: "Tâche assignée",
        message: `"${updatedTask.name}" vous a été assignée`,
        type: 'task_assigned',
        relatedType: 'task',
        relatedId: updatedTask.id,
      });
    }

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'update',
      entityType: 'task',
      entityId: id,
      oldValue: existingTask,
      newValue: req.body,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      data: updatedTask,
      message: "Tâche mise à jour"
    });
  } catch (error: any) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la tâche"
    });
  }
});

// ============================================
// DELETE /api/tasks/:id - Supprimer une tâche
// ============================================

router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const task = await storage.getTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    await storage.deleteTask(id);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete',
      entityType: 'task',
      entityId: id,
      oldValue: task,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Tâche supprimée"
    });
  } catch (error: any) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la tâche"
    });
  }
});

// ============================================
// POST /api/tasks/:id/start-timer - Démarrer chrono
// ============================================

router.post('/:id/start-timer', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const task = await storage.getTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier les permissions (assigné ou admin)
    if (!isAdmin && task.assignedTo !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à démarrer le chrono de cette tâche"
      });
    }

    if (task.isTimerActive) {
      return res.status(400).json({
        success: false,
        message: "Le chronomètre est déjà actif"
      });
    }

    await storage.startTimer(id, currentUserId);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'timer_start',
      entityType: 'task',
      entityId: id,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Chronomètre démarré"
    });
  } catch (error: any) {
    console.error("Start timer error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du démarrage du chronomètre"
    });
  }
});

// ============================================
// POST /api/tasks/:id/stop-timer - Arrêter chrono
// ============================================

router.post('/:id/stop-timer', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const task = await storage.getTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier les permissions (assigné, celui qui a démarré, ou admin)
    if (!isAdmin && task.assignedTo !== currentUserId && task.timerStartedBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à arrêter le chrono de cette tâche"
      });
    }

    if (!task.isTimerActive) {
      return res.status(400).json({
        success: false,
        message: "Le chronomètre n'est pas actif"
      });
    }

    const timeEntry = await storage.stopTimer(id);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'timer_stop',
      entityType: 'task',
      entityId: id,
      newValue: { duration: timeEntry?.duration },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Chronomètre arrêté",
      data: timeEntry,
    });
  } catch (error: any) {
    console.error("Stop timer error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'arrêt du chronomètre"
    });
  }
});

// ============================================
// GET /api/tasks/:id/time-entries - Historique temps
// ============================================

router.get('/:id/time-entries', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const task = await storage.getTask(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }

    // Vérifier les permissions
    if (!isAdmin && task.assignedTo !== currentUserId && task.createdBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    const timeEntries = await storage.getTimeEntries(id);

    res.json({
      success: true,
      data: timeEntries,
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
// GET /api/tasks/active-timers - Timers actifs
// ============================================

router.get('/timers/active', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let activeTimers;

    if (isAdmin) {
      activeTimers = await storage.getAllActiveTimers();
    } else {
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

export default router;
