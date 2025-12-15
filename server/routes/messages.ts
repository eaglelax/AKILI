import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validate, validateQuery, createChannelSchema, createMessageSchema, updateMessageSchema, paginationSchema } from '../validators';

const router = Router();

// ============================================
// CHANNELS
// ============================================

// GET /api/messages/channels - Liste des canaux
router.get('/channels', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;
    const isAdmin = req.teamMember!.isAdmin;

    let channels;

    if (isAdmin) {
      // Admin voit tous les canaux
      channels = await storage.getAllChatChannels();
    } else {
      // Employee voit les canaux où il est membre
      channels = await storage.getChannelsForMember(currentUserId);
    }

    res.json({
      success: true,
      data: channels,
    });
  } catch (error: any) {
    console.error("Get channels error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des canaux"
    });
  }
});

// GET /api/messages/channels/:id - Détail d'un canal
router.get('/channels/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;
    const isAdmin = req.teamMember!.isAdmin;

    const channel = await storage.getChatChannel(id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé"
      });
    }

    // Vérifier l'accès si privé
    if (channel.isPrivate && !isAdmin) {
      const isMember = await storage.isChannelMember(id, currentUserId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à ce canal"
        });
      }
    }

    const channelWithMembers = await storage.getChatChannelWithMembers(id);

    res.json({
      success: true,
      data: channelWithMembers,
    });
  } catch (error: any) {
    console.error("Get channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du canal"
    });
  }
});

// POST /api/messages/channels - Créer un canal
router.post('/channels', requireAuth, validate(createChannelSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const channelData = {
      ...req.body,
      createdBy: req.teamMember!.id,
    };

    const channel = await storage.createChatChannel(channelData);

    // Ajouter le créateur comme membre
    await storage.addChannelMember(channel.id, req.teamMember!.id);

    // Ajouter les membres spécifiés
    if (req.body.memberIds && Array.isArray(req.body.memberIds)) {
      for (const memberId of req.body.memberIds) {
        if (memberId !== req.teamMember!.id) {
          await storage.addChannelMember(channel.id, memberId);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: channel,
      message: "Canal créé avec succès"
    });
  } catch (error: any) {
    console.error("Create channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du canal"
    });
  }
});

// POST /api/messages/channels/:id/join - Rejoindre un canal
router.post('/channels/:id/join', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const channel = await storage.getChatChannel(id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé"
      });
    }

    // Vérifier si canal public ou si admin
    if (channel.isPrivate && !req.teamMember!.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Ce canal est privé"
      });
    }

    const isMember = await storage.isChannelMember(id, currentUserId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "Vous êtes déjà membre de ce canal"
      });
    }

    await storage.addChannelMember(id, currentUserId);

    res.json({
      success: true,
      message: "Vous avez rejoint le canal"
    });
  } catch (error: any) {
    console.error("Join channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la tentative de rejoindre le canal"
    });
  }
});

// POST /api/messages/channels/:id/leave - Quitter un canal
router.post('/channels/:id/leave', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const channel = await storage.getChatChannel(id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé"
      });
    }

    // Ne pas quitter le canal général
    if (channel.type === 'general') {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas quitter le canal général"
      });
    }

    await storage.removeChannelMember(id, currentUserId);

    res.json({
      success: true,
      message: "Vous avez quitté le canal"
    });
  } catch (error: any) {
    console.error("Leave channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la tentative de quitter le canal"
    });
  }
});

// ============================================
// MESSAGES
// ============================================

// GET /api/messages/channels/:channelId/messages - Messages d'un canal
router.get('/channels/:channelId/messages', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { channelId } = req.params;
    const { page, limit } = req.query as any;
    const currentUserId = req.teamMember!.id;
    const isAdmin = req.teamMember!.isAdmin;

    const channel = await storage.getChatChannel(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé"
      });
    }

    // Vérifier l'accès
    if (channel.isPrivate && !isAdmin) {
      const isMember = await storage.isChannelMember(channelId, currentUserId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
    }

    const messages = await storage.getChatMessages(channelId, { page, limit: limit || 50 });

    // Marquer comme lu
    await storage.updateLastReadAt(channelId, currentUserId);

    res.json({
      success: true,
      data: messages.data,
      pagination: messages.pagination,
    });
  } catch (error: any) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages"
    });
  }
});

// POST /api/messages - Envoyer un message
router.post('/', requireAuth, validate(createMessageSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { channelId } = req.body;
    const currentUserId = req.teamMember!.id;
    const isAdmin = req.teamMember!.isAdmin;

    const channel = await storage.getChatChannel(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Canal non trouvé"
      });
    }

    // Vérifier l'accès
    if (channel.isPrivate && !isAdmin) {
      const isMember = await storage.isChannelMember(channelId, currentUserId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas membre de ce canal"
        });
      }
    }

    const messageData = {
      ...req.body,
      senderId: currentUserId,
    };

    const message = await storage.createChatMessage(messageData);

    // Créer des notifications pour les mentions
    if (req.body.mentions && Array.isArray(req.body.mentions)) {
      for (const mentionedId of req.body.mentions) {
        if (mentionedId !== currentUserId) {
          await storage.createNotification({
            recipientId: mentionedId,
            senderId: currentUserId,
            title: "Vous avez été mentionné",
            message: `${req.teamMember!.name} vous a mentionné dans ${channel.name}`,
            type: 'mention',
            relatedType: 'message',
            relatedId: message.id,
          });
        }
      }
    }

    // Charger les infos du sender pour la réponse
    const messageWithSender = await storage.getChatMessageWithSender(message.id);

    res.status(201).json({
      success: true,
      data: messageWithSender,
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message"
    });
  }
});

// PUT /api/messages/:id - Modifier un message
router.put('/:id', requireAuth, validate(updateMessageSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;

    const message = await storage.getChatMessage(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message non trouvé"
      });
    }

    // Seul l'auteur peut modifier
    if (message.senderId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier ce message"
      });
    }

    const updatedMessage = await storage.updateChatMessage(id, {
      content: req.body.content,
      isEdited: true,
      editedAt: new Date(),
    });

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error: any) {
    console.error("Update message error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du message"
    });
  }
});

// DELETE /api/messages/:id - Supprimer un message
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.teamMember!.id;
    const isAdmin = req.teamMember!.isAdmin;

    const message = await storage.getChatMessage(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message non trouvé"
      });
    }

    // Seul l'auteur ou admin peut supprimer
    if (message.senderId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer ce message"
      });
    }

    await storage.deleteChatMessage(id);

    res.json({
      success: true,
      message: "Message supprimé"
    });
  } catch (error: any) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du message"
    });
  }
});

// ============================================
// DIRECT MESSAGES
// ============================================

// POST /api/messages/direct - Créer ou récupérer une conversation directe
router.post('/direct', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.teamMember!.id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "ID du destinataire requis"
      });
    }

    if (recipientId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas vous envoyer un message à vous-même"
      });
    }

    // Vérifier si le destinataire existe
    const recipient = await storage.getTeamMember(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Destinataire non trouvé"
      });
    }

    // Chercher un canal direct existant
    let channel = await storage.getDirectChannel(currentUserId, recipientId);

    if (!channel) {
      // Créer un nouveau canal direct
      channel = await storage.createChatChannel({
        name: `DM: ${req.teamMember!.name} & ${recipient.name}`,
        type: 'direct',
        isPrivate: true,
        createdBy: currentUserId,
      });

      await storage.addChannelMember(channel.id, currentUserId);
      await storage.addChannelMember(channel.id, recipientId);
    }

    res.json({
      success: true,
      data: channel,
    });
  } catch (error: any) {
    console.error("Get/Create direct channel error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la conversation"
    });
  }
});

// GET /api/messages/unread - Messages non lus
router.get('/unread', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.teamMember!.id;

    const unreadCounts = await storage.getUnreadMessageCounts(currentUserId);

    res.json({
      success: true,
      data: unreadCounts,
    });
  } catch (error: any) {
    console.error("Get unread messages error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages non lus"
    });
  }
});

export default router;
