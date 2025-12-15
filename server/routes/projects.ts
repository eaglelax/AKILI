import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validate, validateQuery, createProjectSchema, updateProjectSchema, paginationSchema, addProjectMemberSchema } from '../validators';
import express from 'express';

const router = Router();

// Middleware pour parser le JSON avec une limite plus grande pour les fichiers Base64
router.use(express.json({ limit: '50mb' }));

// ============================================
// GET /api/projects - Liste des projets
// ============================================

router.get('/', requireAuth, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as any;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    let projects;

    if (isAdmin) {
      // Admin voit tous les projets
      projects = await storage.getAllProjects({ page, limit, sortBy, sortOrder });
    } else {
      // Employee voit uniquement les projets où il est membre
      projects = await storage.getProjectsForMember(currentUserId, { page, limit, sortBy, sortOrder });
    }

    res.json({
      success: true,
      data: projects.data,
      pagination: projects.pagination,
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des projets"
    });
  }
});

// ============================================
// GET /api/projects/:id - Détail d'un projet
// ============================================

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      const isMember = await storage.isProjectMember(id, currentUserId);
      const isCreator = project.createdBy === currentUserId;

      if (!isMember && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à ce projet"
        });
      }
    }

    // Charger les relations
    const projectWithRelations = await storage.getProjectWithRelations(id);

    res.json({
      success: true,
      data: projectWithRelations,
    });
  } catch (error: any) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du projet"
    });
  }
});

// ============================================
// POST /api/projects - Créer un projet
// ============================================

router.post('/', requireAuth, validate(createProjectSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.teamMember!.id,
    };

    const project = await storage.createProject(projectData);

    // Ajouter le créateur comme membre du projet
    await storage.addProjectMember(project.id, req.teamMember!.id, 'Créateur');

    // Créer un canal de chat pour le projet
    await storage.createChatChannel({
      name: `Projet: ${project.name}`,
      type: 'project',
      projectId: project.id,
      createdBy: req.teamMember!.id,
    });

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'create',
      entityType: 'project',
      entityId: project.id,
      newValue: projectData,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: project,
      message: "Projet créé avec succès"
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du projet"
    });
  }
});

// ============================================
// PUT /api/projects/:id - Modifier un projet
// ============================================

router.put('/:id', requireAuth, validate(updateProjectSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    console.log("PUT /api/projects/:id - Données reçues:", req.body);

    const existingProject = await storage.getProject(id);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier les permissions
    if (!isAdmin) {
      const isCreator = existingProject.createdBy === currentUserId;
      const permissions = await storage.getMemberPermissions(currentUserId);

      if (!isCreator && !permissions?.canEditAllProjects) {
        return res.status(403).json({
          success: false,
          message: "Non autorisé à modifier ce projet"
        });
      }
    }

    const updatedProject = await storage.updateProject(id, req.body);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'update',
      entityType: 'project',
      entityId: id,
      oldValue: existingProject,
      newValue: req.body,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      data: updatedProject,
      message: "Projet mis à jour"
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du projet"
    });
  }
});

// ============================================
// DELETE /api/projects/:id - Supprimer un projet
// ============================================

router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    await storage.deleteProject(id);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete',
      entityType: 'project',
      entityId: id,
      oldValue: project,
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Projet supprimé"
    });
  } catch (error: any) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du projet"
    });
  }
});

// ============================================
// GET /api/projects/:id/members - Membres du projet
// ============================================

router.get('/:id/members', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier l'accès
    if (!isAdmin) {
      const isMember = await storage.isProjectMember(id, currentUserId);
      if (!isMember && project.createdBy !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
    }

    const members = await storage.getProjectMembers(id);

    res.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Get project members error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des membres"
    });
  }
});

// ============================================
// POST /api/projects/:id/members - Ajouter un membre
// ============================================

router.post('/:id/members', requireAuth, validate(addProjectMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { memberId, role } = req.body;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier les permissions
    if (!isAdmin && project.createdBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à ajouter des membres"
      });
    }

    // Vérifier si le membre existe
    const member = await storage.getTeamMember(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Vérifier si déjà membre
    const isMember = await storage.isProjectMember(id, memberId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "Ce membre fait déjà partie du projet"
      });
    }

    await storage.addProjectMember(id, memberId, role);

    // Ajouter au canal de chat du projet
    const channel = await storage.getProjectChannel(id);
    if (channel) {
      await storage.addChannelMember(channel.id, memberId);
    }

    // Notification
    await storage.createNotification({
      recipientId: memberId,
      senderId: req.teamMember!.id,
      title: "Ajouté à un projet",
      message: `Vous avez été ajouté au projet "${project.name}"`,
      type: 'project_update',
      relatedType: 'project',
      relatedId: id,
    });

    res.json({
      success: true,
      message: "Membre ajouté au projet"
    });
  } catch (error: any) {
    console.error("Add project member error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout du membre"
    });
  }
});

// ============================================
// DELETE /api/projects/:id/members/:memberId - Retirer un membre
// ============================================

router.delete('/:id/members/:memberId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, memberId } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier les permissions
    if (!isAdmin && project.createdBy !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à retirer des membres"
      });
    }

    // Ne pas retirer le créateur
    if (memberId === project.createdBy) {
      return res.status(400).json({
        success: false,
        message: "Impossible de retirer le créateur du projet"
      });
    }

    await storage.removeProjectMember(id, memberId);

    // Retirer du canal de chat du projet
    const channel = await storage.getProjectChannel(id);
    if (channel) {
      await storage.removeChannelMember(channel.id, memberId);
    }

    res.json({
      success: true,
      message: "Membre retiré du projet"
    });
  } catch (error: any) {
    console.error("Remove project member error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du retrait du membre"
    });
  }
});

// ============================================
// GET /api/projects/:id/tasks - Tâches du projet
// ============================================

router.get('/:id/tasks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.teamMember!.isAdmin;
    const currentUserId = req.teamMember!.id;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    // Vérifier l'accès
    if (!isAdmin) {
      const isMember = await storage.isProjectMember(id, currentUserId);
      if (!isMember && project.createdBy !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
    }

    const tasks = await storage.getTasksByProject(id);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Get project tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des tâches"
    });
  }
});

// ============================================
// GET /api/projects/by-client/:clientId - Projets par client
// ============================================

router.get('/by-client/:clientId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { clientId } = req.params;
    const isAdmin = req.teamMember!.isAdmin;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Accès administrateur requis"
      });
    }

    const projects = await storage.getProjectsByClient(clientId);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Get projects by client error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des projets"
    });
  }
});

// ============================================
// FILE UPLOAD ROUTES
// ============================================

// POST /api/projects/files/upload - Upload a file (peut être appelé sans projectId)
router.post('/files/upload', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fileName, fileData, fileType, mimeType, projectId, description } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({
        success: false,
        message: "Nom de fichier et données requis"
      });
    }

    // Décoder la taille du fichier depuis Base64
    const base64Data = fileData.split(',')[1] || fileData;
    const fileSize = Math.round((base64Data.length * 3) / 4);

    // Générer un nom de fichier unique
    const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const fileRecord = await storage.createProjectFile({
      projectId: projectId || null,
      fileName: uniqueFileName,
      originalName: fileName,
      fileType: fileType || 'other',
      mimeType: mimeType || 'application/octet-stream',
      fileSize,
      filePath: `/uploads/${uniqueFileName}`,
      fileData: base64Data,
      description: description || null,
      uploadedBy: req.teamMember!.id,
    });

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'upload',
      entityType: 'project_file',
      entityId: fileRecord.id,
      newValue: { fileName, fileType, projectId },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.status(201).json({
      success: true,
      data: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        fileType: fileRecord.fileType,
        mimeType: fileRecord.mimeType,
        fileSize: fileRecord.fileSize,
        createdAt: fileRecord.createdAt,
      },
      message: "Fichier uploadé avec succès"
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload du fichier"
    });
  }
});

// GET /api/projects/:id/files - Liste des fichiers d'un projet
router.get('/:id/files', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const project = await storage.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé"
      });
    }

    let files;
    if (type) {
      files = await storage.getProjectFilesByType(id, type as string);
    } else {
      files = await storage.getProjectFiles(id);
    }

    // Ne pas renvoyer les données binaires dans la liste
    const filesWithoutData = files.map(f => ({
      id: f.id,
      fileName: f.fileName,
      originalName: f.originalName,
      fileType: f.fileType,
      mimeType: f.mimeType,
      fileSize: f.fileSize,
      description: f.description,
      createdAt: f.createdAt,
    }));

    res.json({
      success: true,
      data: filesWithoutData,
    });
  } catch (error: any) {
    console.error("Get project files error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des fichiers"
    });
  }
});

// GET /api/projects/files/:fileId - Télécharger un fichier
router.get('/files/:fileId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fileId } = req.params;

    const file = await storage.getProjectFile(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé"
      });
    }

    res.json({
      success: true,
      data: {
        id: file.id,
        fileName: file.fileName,
        originalName: file.originalName,
        fileType: file.fileType,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        fileData: file.fileData,
        description: file.description,
        createdAt: file.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get file error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du fichier"
    });
  }
});

// GET /api/projects/files/:fileId/download - Télécharger un fichier en binaire
router.get('/files/:fileId/download', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fileId } = req.params;

    const file = await storage.getProjectFile(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé"
      });
    }

    if (!file.fileData) {
      return res.status(404).json({
        success: false,
        message: "Données du fichier non disponibles"
      });
    }

    // Convertir Base64 en buffer
    const buffer = Buffer.from(file.fileData, 'base64');

    res.set({
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  } catch (error: any) {
    console.error("Download file error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement du fichier"
    });
  }
});

// PUT /api/projects/files/:fileId - Associer un fichier à un projet
router.put('/files/:fileId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fileId } = req.params;
    const { projectId, description, fileType } = req.body;

    const file = await storage.getProjectFile(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé"
      });
    }

    const updateData: any = {};
    if (projectId !== undefined) updateData.projectId = projectId;
    if (description !== undefined) updateData.description = description;
    if (fileType !== undefined) updateData.fileType = fileType;

    const updatedFile = await storage.updateProjectFile(fileId, updateData);

    res.json({
      success: true,
      data: {
        id: updatedFile?.id,
        fileName: updatedFile?.fileName,
        originalName: updatedFile?.originalName,
        fileType: updatedFile?.fileType,
        projectId: updatedFile?.projectId,
      },
      message: "Fichier mis à jour"
    });
  } catch (error: any) {
    console.error("Update file error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du fichier"
    });
  }
});

// DELETE /api/projects/files/:fileId - Supprimer un fichier
router.delete('/files/:fileId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fileId } = req.params;

    const file = await storage.getProjectFile(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Fichier non trouvé"
      });
    }

    await storage.deleteProjectFile(fileId);

    // Log l'action
    await storage.createActivityLog({
      userId: req.teamMember!.id,
      action: 'delete',
      entityType: 'project_file',
      entityId: fileId,
      oldValue: { fileName: file.originalName, fileType: file.fileType },
      ipAddress: req.ip || null,
      userAgent: req.get('User-Agent') || null,
    });

    res.json({
      success: true,
      message: "Fichier supprimé"
    });
  } catch (error: any) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du fichier"
    });
  }
});

export default router;
