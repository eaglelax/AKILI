import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ============================================
// GET /api/chat/channels - Liste des canaux accessibles
// ============================================

router.get('/channels', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;
    const userRole = req.teamMember!.userRole || 'member';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    let channels;

    if (isAdmin) {
      // Admin voit tous les canaux
      channels = await storage.getAllChatChannels();
    } else {
      // Membre voit seulement les canaux des projets auxquels il est assigné
      channels = await storage.getChatChannelsForMember(currentUserId);
    }

    // Enrichir avec les noms de projets et compter les messages non lus
    const enrichedChannels = await Promise.all(
      channels.map(async (channel) => {
        let projectName = null;
        if (channel.projectId) {
          const project = await storage.getProject(channel.projectId);
          projectName = project?.name || null;
        }

        // Compter les messages non lus (simplification : tous les messages récents)
        const unreadCount = 0; // TODO: implémenter le système de lecture

        return {
          ...channel,
          projectName,
          unreadCount,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedChannels,
    });
  } catch (error: any) {
    console.error("Get channels error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des canaux",
    });
  }
});

// ============================================
// GET /api/chat/messages/:channelId - Messages d'un canal
// ============================================

router.get('/messages/:channelId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { channelId } = req.params;
    const currentUserId = req.teamMember!.id;
    const userRole = req.teamMember!.userRole || 'member';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    // Vérifier l'accès au canal
    const channel = await storage.getChatChannel(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé",
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      // Membre standard : vérifier qu'il est membre du canal ou du projet lié
      const isMemberOfChannel = await storage.isChannelMember(channelId, currentUserId);

      if (!isMemberOfChannel) {
        // Vérifier si le canal est lié à un projet où il est assigné
        if (channel.projectId) {
          const projectMembers = await storage.getProjectMembers(channel.projectId);
          const isMemberOfProject = projectMembers.some((pm: any) => pm.memberId === currentUserId);

          if (!isMemberOfProject) {
            return res.status(403).json({
              success: false,
              message: "Vous n'avez pas accès à ce canal",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: "Vous n'avez pas accès à ce canal",
          });
        }
      }
    }

    // Récupérer les messages
    const messages = await storage.getChatMessages(channelId);

    // Enrichir avec les noms des expéditeurs
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = message.senderId ? await storage.getTeamMember(message.senderId) : null;

        return {
          ...message,
          senderName: sender?.name || 'Utilisateur supprimé',
          senderAvatar: sender?.avatar || null,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedMessages,
    });
  } catch (error: any) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages",
    });
  }
});

// ============================================
// POST /api/chat/messages - Envoyer un message
// ============================================

router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { channelId, content } = req.body;
    const currentUserId = req.teamMember!.id;
    const userRole = req.teamMember!.userRole || 'member';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!channelId || !content) {
      return res.status(400).json({
        success: false,
        message: "channelId et content requis",
      });
    }

    // Vérifier l'accès au canal
    const channel = await storage.getChatChannel(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé",
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      const isMemberOfChannel = await storage.isChannelMember(channelId, currentUserId);

      if (!isMemberOfChannel) {
        if (channel.projectId) {
          const projectMembers = await storage.getProjectMembers(channel.projectId);
          const isMemberOfProject = projectMembers.some((pm: any) => pm.memberId === currentUserId);

          if (!isMemberOfProject) {
            return res.status(403).json({
              success: false,
              message: "Vous n'avez pas accès à ce canal",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: "Vous n'avez pas accès à ce canal",
          });
        }
      }
    }

    // Créer le message
    const message = await storage.createChatMessage({
      channelId,
      senderId: currentUserId,
      content,
      messageType: 'text',
    });

    // Log l'action
    await storage.createActivityLog({
      userId: currentUserId,
      action: 'send_message',
      entityType: 'chat_message',
      entityId: message.id,
      newValue: { channelId, content: content.substring(0, 50) },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: message,
      message: "Message envoyé",
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message",
    });
  }
});

// ============================================
// POST /api/chat/channels - Créer un canal (Admin)
// ============================================

router.post('/channels', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, type, projectId, isPrivate } = req.body;
    const currentUserId = req.teamMember!.id;
    const userRole = req.teamMember!.userRole || 'member';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    // Seul un admin peut créer des canaux
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent créer des canaux",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le nom du canal est requis",
      });
    }

    // Créer le canal
    const channel = await storage.createChatChannel({
      name,
      description,
      type: type || 'general',
      projectId: projectId || null,
      isPrivate: isPrivate || false,
      createdBy: currentUserId,
    });

    // Ajouter automatiquement le créateur comme membre du canal
    await storage.addChannelMember(channel.id, currentUserId, 'admin');

    // Si le canal est lié à un projet, ajouter tous les membres du projet
    if (projectId) {
      const projectMembers = await storage.getProjectMembers(projectId);
      for (const pm of projectMembers) {
        if (pm.memberId !== currentUserId) {
          await storage.addChannelMember(channel.id, pm.memberId, 'member');
        }
      }
    }

    // Log l'action
    await storage.createActivityLog({
      userId: currentUserId,
      action: 'create',
      entityType: 'chat_channel',
      entityId: channel.id,
      newValue: { name, type, projectId },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: channel,
      message: "Canal créé avec succès",
    });
  } catch (error: any) {
    console.error("Create channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du canal",
    });
  }
});

export default router;
