import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import tasksRoutes from './tasks';
import projectsRoutes from './projects';
import clientsRoutes from './clients';
import messagesRoutes from './messages';
import chatRoutes from './chat';
import timersRoutes from './timers';
import analyticsRoutes from './analytics';
import notificationsRoutes from './notifications';

const router = Router();

// ============================================
// API Routes
// ============================================

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/team-members', usersRoutes); // Alias pour compatibilité
router.use('/tasks', tasksRoutes);
router.use('/projects', projectsRoutes);
router.use('/clients', clientsRoutes);
router.use('/messages', messagesRoutes);
router.use('/chat', chatRoutes); // Chat lié aux projets
router.use('/timers', timersRoutes);
router.use('/time-entries', timersRoutes); // Alias
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationsRoutes);

// ============================================
// Health Check
// ============================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API Info
// ============================================

router.get('/', (req, res) => {
  res.json({
    success: true,
    name: "Akili API - Jo'Fé Digital",
    version: "2.0.0",
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tasks: '/api/tasks',
      projects: '/api/projects',
      clients: '/api/clients',
      messages: '/api/messages',
      timers: '/api/timers',
      analytics: '/api/analytics',
      notifications: '/api/notifications',
    },
  });
});

export default router;
