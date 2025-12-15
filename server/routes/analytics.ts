import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin, requirePermission, AuthenticatedRequest } from '../middleware/auth';
import { validateQuery, analyticsFilterSchema } from '../validators';

const router = Router();

// ============================================
// GET /api/analytics/dashboard - Stats dashboard
// ============================================

router.get('/dashboard', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let stats;

    if (isAdmin) {
      // Dashboard admin complet
      stats = await storage.getDashboardStats();
    } else {
      // Dashboard limité pour les employés
      stats = await storage.getMemberDashboardStats(currentUserId);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

// ============================================
// GET /api/analytics/team - Stats équipe (Admin)
// ============================================

router.get('/team', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const teamStats = await storage.getTeamStats();

    res.json({
      success: true,
      data: teamStats,
    });
  } catch (error: any) {
    console.error("Get team stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques équipe"
    });
  }
});

// ============================================
// GET /api/analytics/clients - Stats clients (Admin)
// ============================================

router.get('/clients', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const clientStats = await storage.getClientStats();

    res.json({
      success: true,
      data: clientStats,
    });
  } catch (error: any) {
    console.error("Get client stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques clients"
    });
  }
});

// ============================================
// GET /api/analytics/performance - Performance équipe
// ============================================

router.get('/performance', requireAuth, validateQuery(analyticsFilterSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { memberId, month, year } = req.query as any;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier permissions
    if (!isAdmin && memberId && memberId !== currentUserId) {
      const permissions = await storage.getMemberPermissions(currentUserId);
      if (!permissions?.canViewAnalytics) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé aux performances des autres membres"
        });
      }
    }

    const performance = await storage.getPerformanceMetrics(
      memberId || (isAdmin ? undefined : currentUserId),
      month,
      year
    );

    res.json({
      success: true,
      data: performance,
    });
  } catch (error: any) {
    console.error("Get performance error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des performances"
    });
  }
});

// ============================================
// GET /api/analytics/revenue - Revenus (Admin)
// ============================================

router.get('/revenue', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const revenue = await storage.getRevenueStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      (groupBy as 'day' | 'week' | 'month') || 'month'
    );

    res.json({
      success: true,
      data: revenue,
    });
  } catch (error: any) {
    console.error("Get revenue error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des revenus"
    });
  }
});

// ============================================
// GET /api/analytics/productivity - Productivité
// ============================================

router.get('/productivity', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let productivity;

    if (isAdmin) {
      productivity = await storage.getTeamProductivity(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    } else {
      productivity = await storage.getMemberProductivity(
        currentUserId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    }

    res.json({
      success: true,
      data: productivity,
    });
  } catch (error: any) {
    console.error("Get productivity error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la productivité"
    });
  }
});

// ============================================
// GET /api/analytics/tasks - Stats tâches
// ============================================

router.get('/tasks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let taskStats;

    if (isAdmin) {
      taskStats = await storage.getTaskStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    } else {
      taskStats = await storage.getMemberTaskStats(
        currentUserId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    }

    res.json({
      success: true,
      data: taskStats,
    });
  } catch (error: any) {
    console.error("Get task stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de tâches"
    });
  }
});

// ============================================
// GET /api/analytics/time - Stats temps
// ============================================

router.get('/time', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, memberId } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    // Vérifier permissions
    if (!isAdmin && memberId && memberId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    const targetMemberId = memberId as string || (isAdmin ? undefined : currentUserId);

    const timeStats = await storage.getTimeStats(
      targetMemberId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: timeStats,
    });
  } catch (error: any) {
    console.error("Get time stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de temps"
    });
  }
});

// ============================================
// GET /api/analytics/projects - Stats projets
// ============================================

router.get('/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let projectStats;

    if (isAdmin) {
      projectStats = await storage.getProjectStats();
    } else {
      projectStats = await storage.getMemberProjectStats(currentUserId);
    }

    res.json({
      success: true,
      data: projectStats,
    });
  } catch (error: any) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques de projets"
    });
  }
});

// ============================================
// GET /api/analytics/roi - ROI et rentabilité (Admin)
// ============================================

router.get('/roi', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { clientId, projectId, startDate, endDate } = req.query;

    const roi = await storage.getROIStats(
      clientId as string,
      projectId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: roi,
    });
  } catch (error: any) {
    console.error("Get ROI error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du ROI"
    });
  }
});

// ============================================
// GET /api/analytics/export - Exporter données (Admin)
// ============================================

router.get('/export', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    if (!type || !['tasks', 'time', 'revenue', 'performance'].includes(type as string)) {
      return res.status(400).json({
        success: false,
        message: "Type d'export invalide"
      });
    }

    const data = await storage.exportData(
      type as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
      // Convertir en CSV
      const csv = convertToCSV(data);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data,
      });
    }
  } catch (error: any) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export"
    });
  }
});

// Helper pour convertir en CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// ============================================
// POST /api/analytics/calculate - Recalculer performance
// ============================================

router.post('/calculate', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { memberId, month, year } = req.body;

    if (!memberId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "memberId, month et year requis"
      });
    }

    const metric = await storage.calculateMemberPerformance(memberId, month, year);

    res.json({
      success: true,
      data: metric,
      message: "Performance recalculée"
    });
  } catch (error: any) {
    console.error("Calculate performance error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul de la performance"
    });
  }
});

// ============================================
// GET /api/analytics/deadlines - Échéances à venir
// ============================================

router.get('/deadlines', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { days } = req.query;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;
    const daysAhead = parseInt(days as string) || 7;

    let deadlines;

    if (isAdmin) {
      deadlines = await storage.getUpcomingDeadlines(daysAhead);
    } else {
      deadlines = await storage.getMemberUpcomingDeadlines(currentUserId, daysAhead);
    }

    res.json({
      success: true,
      data: deadlines,
    });
  } catch (error: any) {
    console.error("Get deadlines error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des échéances"
    });
  }
});

// ============================================
// GET /api/analytics/activity - Journal d'activité (Admin)
// ============================================

router.get('/activity', requireAdmin, validateQuery(analyticsFilterSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { memberId, startDate, endDate } = req.query as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const activity = await storage.getActivityLogs({
      memberId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });

    res.json({
      success: true,
      data: activity.data,
      pagination: activity.pagination,
    });
  } catch (error: any) {
    console.error("Get activity error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du journal d'activité"
    });
  }
});

export default router;
