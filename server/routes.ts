import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import apiRoutes from "./routes/index";
import { setupWebSocket } from "./websocket";

// ============================================
// Configuration des Routes - Akili API
// ============================================

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // Configuration Session
  // ============================================

  app.use(session({
    secret: process.env.SESSION_SECRET || 'akili-jofe-digital-secret-2024',
    resave: false,
    saveUninitialized: false,
    name: 'akili.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      sameSite: 'lax',
    },
  }));

  // ============================================
  // CORS Headers (pour développement)
  // ============================================

  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  // ============================================
  // Routes API Modulaires
  // ============================================

  app.use('/api', apiRoutes);

  // ============================================
  // Route 404 pour les API non trouvées
  // ============================================

  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route API non trouvée: ${req.method} ${req.originalUrl}`,
      availableEndpoints: {
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

  // ============================================
  // Création du serveur HTTP et WebSocket
  // ============================================

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}

// Extension de l'interface Session pour TypeScript
declare module 'express-session' {
  interface SessionData {
    teamMember?: {
      id: string;
      name: string;
      username: string;
      role: string;
      department?: string;
      isAdmin: boolean;
      avatar?: string;
    };
  }
}
