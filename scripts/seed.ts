import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema';

// Générer UUID sans dépendance externe
const uuidv4 = () => crypto.randomUUID();

// ============================================
// Script de Seed - Données Jo'Fé Digital
// ============================================

async function seedDatabase() {
  console.log('🌱 Démarrage du seed de la base de données...');
  console.log('');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'akili',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    const db = drizzle(connection, { schema, mode: 'default' });

    // ============================================
    // Hasher les mots de passe
    // ============================================
    console.log('🔐 Hashage des mots de passe...');

    // Mot de passe par défaut pour tous les nouveaux membres: jofe2024
    const defaultPassword = await bcrypt.hash('jofe2024', 10);

    // ============================================
    // 1. Création des 14 membres de l'équipe Jo'Fé Digital
    // ============================================
    console.log('👥 Création des membres de l\'équipe...');

    const teamMembersData = [
      // Super Administrateur principal (compte générique)
      {
        id: uuidv4(),
        name: "Administrateur Système",
        role: "Super Administrateur",
        department: "Direction",
        username: "admin",
        password: defaultPassword, // jofe2024
        userRole: "super_admin", // Super Admin - peut créer admins et super_admins
        isAdmin: true, // Pour compatibilité
        skills: JSON.stringify(["Administration", "Gestion système"]),
        email: "admin@jofedigital.com",
        avatar: "AD",
        status: "offline",
      },
      // Administrateur (1)
      {
        id: uuidv4(),
        name: "Serge ASSALÉ",
        role: "Directeur Création & Marketing",
        department: "Direction",
        username: "serge.assale",
        password: defaultPassword, // Sera changé à la première connexion
        userRole: "admin", // Admin - peut créer seulement des membres
        isAdmin: true, // Pour compatibilité
        skills: JSON.stringify(["Stratégie", "Direction artistique", "Management"]),
        email: "serge@jofedigital.com",
        avatar: "SA",
        status: "offline",
      },
      // Administrateur (1)
      {
        id: uuidv4(),
        name: "Enos GOUBA",
        role: "Coordinateur Production",
        department: "Production",
        username: "enos.gouba",
        password: defaultPassword,
        userRole: "admin", // Admin - peut créer seulement des membres
        isAdmin: true, // Pour compatibilité
        skills: JSON.stringify(["Coordination", "Planning", "Production"]),
        email: "enos@jofedigital.com",
        avatar: "EG",
        status: "offline",
      },

      // Équipe Créative (6)
      {
        id: uuidv4(),
        name: "Paul Junior OUEDRAOGO",
        role: "Graphiste Photomonteur",
        department: "Création",
        username: "paul.ouedraogo",
        password: defaultPassword,
        userRole: "member", // Membre standard
        isAdmin: false,
        skills: JSON.stringify(["Photoshop", "Photomontage", "Retouche"]),
        avatar: "PO",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Fortune YANOGO",
        role: "Photographe/Vidéaste",
        department: "Création",
        username: "fortune.yanogo",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Photographie", "Vidéo", "Éclairage"]),
        avatar: "FY",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Bientama PARÉ",
        role: "Motion Designer",
        department: "Création",
        username: "bientama.pare",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["After Effects", "Animation", "Motion"]),
        avatar: "BP",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Issa CISSE",
        role: "Graphiste Junior",
        department: "Création",
        username: "issa.cisse",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Design graphique", "Illustration"]),
        avatar: "IC",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Jean-Jacques SAMPABAO",
        role: "Directeur Artistique Junior",
        department: "Création",
        username: "jean.sampabao",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Direction artistique", "Concept", "Brand Design"]),
        avatar: "JS",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Abdoul Latif OUEDRAOGO",
        role: "Designer UI/UX",
        department: "Création",
        username: "latif.ouedraogo",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["UI/UX", "Figma", "Prototypage"]),
        avatar: "AO",
        status: "offline",
      },

      // Communication & Marketing (6)
      {
        id: uuidv4(),
        name: "Florita KABORÉ",
        role: "Responsable Médias Sociaux",
        department: "Communication",
        username: "florita.kabore",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Social Media", "Ads", "Analytics"]),
        avatar: "FK",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Nebié WEBOU",
        role: "Chef de Pub/Concepteur Rédacteur",
        department: "Communication",
        username: "nebie.webou",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Rédaction", "Concept", "Stratégie"]),
        avatar: "NW",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Djamilatou GUIGUEMDE",
        role: "Chef de Pub Stagiaire",
        department: "Communication",
        username: "djamilatou.guiguemde",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Conception pub", "Recherche", "Analyse"]),
        avatar: "DG",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Linda KABORÉ",
        role: "Conceptrice Rédactrice Lead",
        department: "Communication",
        username: "linda.kabore",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Rédaction", "Concept", "Stratégie"]),
        avatar: "LK",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Maryse BOMBIRI",
        role: "Community Manager",
        department: "Communication",
        username: "maryse.bombiri",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Community", "Content", "Engagement"]),
        avatar: "MB",
        status: "offline",
      },
      {
        id: uuidv4(),
        name: "Faridatou BARRY",
        role: "Chef de Pub/CM",
        department: "Communication",
        username: "faridatou.barry",
        password: defaultPassword,
        userRole: "member",
        isAdmin: false,
        skills: JSON.stringify(["Chef de Pub", "Community", "Stratégie"]),
        avatar: "FB",
        status: "offline",
      },
    ];

    for (const member of teamMembersData) {
      await db.insert(schema.teamMembers).values(member);
    }
    console.log(`✅ ${teamMembersData.length} membres créés`);

    // Créer les permissions par défaut pour chaque membre
    console.log('🔐 Création des permissions...');
    for (const member of teamMembersData) {
      await db.insert(schema.permissions).values({
        id: uuidv4(),
        memberId: member.id,
        canViewAllTasks: member.isAdmin,
        canEditAllTasks: member.isAdmin,
        canDeleteTasks: member.isAdmin,
        canViewAllProjects: member.isAdmin,
        canEditAllProjects: member.isAdmin,
        canManageClients: member.isAdmin,
        canManageTeam: member.isAdmin,
        canViewAnalytics: member.isAdmin,
        canManagePermissions: member.isAdmin,
        canExportData: member.isAdmin,
        dailyHourLimit: 8,
        maxOvertimeHours: 4,
      });
    }
    console.log('✅ Permissions créées');

    // ============================================
    // 2. Création des clients
    // ============================================
    console.log('🏢 Création des clients...');

    const clientsData = [
      { name: "MOOV AFRICA", type: "Télécommunications", monthlyBudget: "2500000", satisfaction: "4.9", isActive: true },
      { name: "BANK OF AFRICA", type: "Services Financiers", monthlyBudget: "1800000", satisfaction: "4.7", isActive: true },
      { name: "VINCENT & ASSOCIES", type: "Cabinet d'Avocats", monthlyBudget: "650000", satisfaction: "4.8", isActive: true },
      { name: "ANEREE", type: "Énergie", monthlyBudget: "450000", satisfaction: "4.5", isActive: true },
      { name: "JO'FE DIGITAL", type: "Marketing Digital", monthlyBudget: "300000", satisfaction: "5.0", isActive: true },
      { name: "ORANGE BURKINA", type: "Télécommunications", monthlyBudget: "2200000", satisfaction: "4.6", isActive: true },
      { name: "CORIS BANK", type: "Services Financiers", monthlyBudget: "1500000", satisfaction: "4.8", isActive: true },
      { name: "ONATEL", type: "Télécommunications", monthlyBudget: "1800000", satisfaction: "4.4", isActive: true },
      { name: "SONABEL", type: "Énergie", monthlyBudget: "900000", satisfaction: "4.3", isActive: true },
      { name: "TOTAL BURKINA", type: "Pétrole & Gaz", monthlyBudget: "1200000", satisfaction: "4.5", isActive: true },
    ];

    const clientIds: string[] = [];
    for (const client of clientsData) {
      const clientId = uuidv4();
      clientIds.push(clientId);
      await db.insert(schema.clients).values({
        id: clientId,
        ...client,
      });
    }
    console.log(`✅ ${clientsData.length} clients créés`);

    // ============================================
    // 3. Création du canal de chat général
    // ============================================
    console.log('💬 Création des canaux de chat...');

    const generalChannelId = uuidv4();
    await db.insert(schema.chatChannels).values({
      id: generalChannelId,
      name: "Général",
      description: "Canal de discussion générale de l'équipe Jo'Fé Digital",
      type: "general",
      isPrivate: false,
      createdBy: teamMembersData[0].id,
    });

    // Ajouter tous les membres au canal général
    for (const member of teamMembersData) {
      await db.insert(schema.channelMembers).values({
        id: uuidv4(),
        channelId: generalChannelId,
        memberId: member.id,
        role: member.isAdmin ? 'admin' : 'member',
      });
    }
    console.log('✅ Canal général créé avec tous les membres');

    // ============================================
    // 4. Paramètres système
    // ============================================
    console.log('⚙️ Création des paramètres...');

    await db.insert(schema.settings).values([
      { id: uuidv4(), key: 'auto_start_timers', value: JSON.stringify(true), category: 'timers' },
      { id: uuidv4(), key: 'background_timers', value: JSON.stringify(true), category: 'timers' },
      { id: uuidv4(), key: 'deadline_alerts', value: JSON.stringify(true), category: 'notifications' },
      { id: uuidv4(), key: 'strict_mode', value: JSON.stringify(false), category: 'permissions' },
      { id: uuidv4(), key: 'daily_limit_hours', value: JSON.stringify(8), category: 'timers' },
      { id: uuidv4(), key: 'mandatory_break_minutes', value: JSON.stringify(60), category: 'timers' },
      { id: uuidv4(), key: 'overtime_multiplier', value: JSON.stringify(1.5), category: 'timers' },
      { id: uuidv4(), key: 'company_name', value: JSON.stringify("Jo'Fé Digital"), category: 'general' },
      { id: uuidv4(), key: 'currency', value: JSON.stringify('FCFA'), category: 'general' },
    ]);
    console.log('✅ Paramètres créés');

    await connection.end();

    console.log('');
    console.log('🎉 Seed terminé avec succès!');
    console.log('');
    console.log('Données créées:');
    console.log(`  - ${teamMembersData.length} membres d'équipe (1 super admin, 2 admins, 12 membres)`);
    console.log(`  - ${clientsData.length} clients`);
    console.log('  - 1 canal de chat général');
    console.log('  - 9 paramètres système');
    console.log('');
    console.log('📌 IDENTIFIANTS PAR DÉFAUT:');
    console.log('   Tous les utilisateurs ont le mot de passe: jofe2024');
    console.log('');
    console.log('   🔑 RÔLES:');
    console.log('   ✨ Super Admin (peut créer admins et super_admins):');
    console.log('      - admin / jofe2024 (compte système)');
    console.log('');
    console.log('   👔 Administrateurs (peuvent créer seulement des membres):');
    console.log('      - serge.assale / jofe2024');
    console.log('      - enos.gouba / jofe2024');
    console.log('');
    console.log('   👤 Membres (12 employés)');
    console.log('');
    console.log('⚠️  Il est recommandé de changer les mots de passe après la première connexion!');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedDatabase();
