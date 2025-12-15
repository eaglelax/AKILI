import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateQuery, paginationSchema } from '../validators';

const router = Router();

// ============================================
// GET /api/notifications - Liste des notifications
// ============================================

router.get('/', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query as any;
    const { unreadOnly } = req.query;
    const currentUserId = req.teamMember!.id;

    const notifications = await storage.getNotifications(currentUserId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    res.json({
      success: true,
      data: notifications.data,
      pagination: notifications.pagination,
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des notifications"
    });
  }
});

// ============================================
// GET /api/notifications/unread-count - Nombre de non lues
// ============================================

router.get('/unread-count', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;

    const count = await storage.getUnreadNotificationCount(currentUserId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du nombre de notifications"
    });
  }
});

// ============================================
// PUT /api/notifications/:id/read - Marquer comme lue
// ============================================

router.put('/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const notification = await storage.getNotification(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification non trouvée"
      });
    }

    // Vérifier que c'est bien la notification de l'utilisateur
    if (notification.recipientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    await storage.markNotificationAsRead(id);

    res.json({
      success: true,
      message: "Notification marquée comme lue"
    });
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    });
  }
});

// ============================================
// PUT /api/notifications/read-all - Marquer toutes comme lues
// ============================================

router.put('/read-all', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;

    await storage.markAllNotificationsAsRead(currentUserId);

    res.json({
      success: true,
      message: "Toutes les notifications marquées comme lues"
    });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    });
  }
});

// ============================================
// DELETE /api/notifications/:id - Supprimer une notification
// ============================================

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const notification = await storage.getNotification(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification non trouvée"
      });
    }

    // Vérifier que c'est bien la notification de l'utilisateur
    if (notification.recipientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    await storage.deleteNotification(id);

    res.json({
      success: true,
      message: "Notification supprimée"
    });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression"
    });
  }
});

// ============================================
// DELETE /api/notifications/clear-all - Supprimer toutes
// ============================================

router.delete('/clear-all', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;

    await storage.deleteAllNotifications(currentUserId);

    res.json({
      success: true,
      message: "Toutes les notifications supprimées"
    });
  } catch (error: any) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression"
    });
  }
});

export default router;
