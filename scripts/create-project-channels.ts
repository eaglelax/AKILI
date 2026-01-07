import { storage } from "../server/storage";
import { db } from "../server/db";

/**
 * Script pour créer automatiquement des canaux de chat pour tous les projets existants
 * et ajouter tous les membres du projet au canal
 */

async function createProjectChannels() {
  console.log('🚀 Création des canaux de chat pour les projets...');

  try {
    // Récupérer tous les projets
    const projects = await storage.getAllProjects({ limit: 1000 });

    console.log(`📊 ${projects.data.length} projets trouvés`);

    for (const project of projects.data) {
      console.log(`\n📁 Traitement du projet: ${project.name}`);

      // Vérifier si un canal existe déjà pour ce projet
      const existingChannels = await storage.getAllChatChannels();
      const channelExists = existingChannels.some(ch => ch.projectId === project.id);

      if (channelExists) {
        console.log(`  ⏭️  Canal déjà existant, passage au suivant`);
        continue;
      }

      // Créer le canal pour le projet
      const channel = await storage.createChatChannel({
        name: `💼 ${project.name}`,
        description: `Discussion du projet ${project.name}`,
        type: 'project',
        projectId: project.id,
        isPrivate: false,
        createdBy: project.managerId || null,
      });

      console.log(`  ✅ Canal créé: ${channel.name}`);

      // Récupérer tous les membres du projet
      const projectMembers = await storage.getProjectMembers(project.id);

      console.log(`  👥 ${projectMembers.length} membres à ajouter au canal`);

      // Ajouter chaque membre au canal
      for (const pm of projectMembers) {
        await storage.addChannelMember(channel.id, pm.memberId, 'member');
        const member = await storage.getTeamMember(pm.memberId);
        console.log(`    ✓ ${member?.name} ajouté au canal`);
      }

      // Ajouter le manager comme admin du canal s'il n'est pas déjà membre
      if (project.managerId) {
        const isManagerMember = projectMembers.some(pm => pm.memberId === project.managerId);
        if (!isManagerMember) {
          await storage.addChannelMember(channel.id, project.managerId, 'admin');
          const manager = await storage.getTeamMember(project.managerId);
          console.log(`    ✓ ${manager?.name} (Manager) ajouté comme admin du canal`);
        }
      }
    }

    console.log('\n✨ Terminé ! Tous les canaux de projet ont été créés.');

    // Créer aussi un canal général si il n'existe pas
    const generalChannel = (await storage.getAllChatChannels()).find(ch => ch.type === 'general');

    if (!generalChannel) {
      console.log('\n📢 Création du canal général...');
      const general = await storage.createChatChannel({
        name: '🌐 Général',
        description: 'Canal général pour toute l\'équipe',
        type: 'general',
        isPrivate: false,
        createdBy: null,
      });

      // Ajouter tous les membres de l'équipe
      const allMembers = await storage.getAllTeamMembers();
      for (const member of allMembers) {
        await storage.addChannelMember(general.id, member.id, 'member');
      }

      console.log(`✅ Canal général créé avec ${allMembers.length} membres`);
    } else {
      console.log('\n⏭️  Canal général déjà existant');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des canaux:', error);
    process.exit(1);
  }
}

createProjectChannels();
