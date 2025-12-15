# Guide de Déploiement - Akili (Jo'Fé Digital)

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
3. [Variables d'Environnement](#variables-denvironnement)
4. [Installation](#installation)
5. [Migration et Données Initiales](#migration-et-données-initiales)
6. [Démarrage](#démarrage)
7. [Structure du Projet](#structure-du-projet)
8. [API Endpoints](#api-endpoints)
9. [Système de Rôles](#système-de-rôles)
10. [WebSocket](#websocket)
11. [Dépannage](#dépannage)

---

## 🔧 Prérequis

- **Node.js** v18+ (recommandé v20+)
- **MySQL** 8.0+
- **npm** ou **yarn**

## 💾 Configuration de la Base de Données

### 1. Installation MySQL

```bash
# Windows (via XAMPP, WAMP, ou MySQL Installer)
# Linux
sudo apt install mysql-server

# Mac
brew install mysql
```

### 2. Création de la Base de Données

```sql
-- Connexion à MySQL
mysql -u root -p

-- Créer la base de données
CREATE DATABASE akili CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vérifier
SHOW DATABASES;
```

## 🔐 Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=akili

# Session
SESSION_SECRET=votre-secret-super-secure-ici-2024

# Mots de passe administrateurs
ADMIN_PASSWORD_SERGE=JeSuisMoi
ADMIN_PASSWORD_ENOS=AdminEnos2024!
DEFAULT_MEMBER_PASSWORD=jofe2024

# Environnement
NODE_ENV=development
PORT=5000
```

## 📦 Installation

```bash
# Cloner le projet (si nécessaire)
git clone <url-du-repo>
cd akili

# Installer les dépendances
npm install
```

## 🗃️ Migration et Données Initiales

### Étape 1 : Générer les migrations

```bash
npm run db:generate
```

### Étape 2 : Exécuter les migrations

```bash
npm run db:migrate
```

### Étape 3 : Insérer les données initiales

```bash
npm run db:seed
```

### Alternative : Tout en une commande

```bash
npm run db:reset
```

## 🚀 Démarrage

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

### Production

```bash
# Compiler le projet
npm run build

# Démarrer en production
npm run start
```

## 📁 Structure du Projet

```
akili/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── hooks/          # Hooks React Query
│   │   ├── lib/            # Utilitaires
│   │   └── pages/          # Pages de l'application
│   └── index.html
├── server/                 # Backend Express
│   ├── middleware/         # Middlewares (auth, roles)
│   │   └── auth.ts         # Authentification & autorisations
│   ├── routes/             # Routes modulaires
│   │   ├── auth.ts         # /api/auth/*
│   │   ├── users.ts        # /api/users/*
│   │   ├── tasks.ts        # /api/tasks/*
│   │   ├── projects.ts     # /api/projects/*
│   │   ├── clients.ts      # /api/clients/*
│   │   ├── messages.ts     # /api/messages/*
│   │   ├── timers.ts       # /api/timers/*
│   │   ├── analytics.ts    # /api/analytics/*
│   │   ├── notifications.ts# /api/notifications/*
│   │   └── index.ts        # Agrégation des routes
│   ├── validators/         # Validation Zod
│   │   └── index.ts        # Tous les schémas
│   ├── storage.ts          # Couche d'accès données
│   ├── websocket.ts        # WebSocket avec validation
│   ├── routes.ts           # Configuration principale
│   └── index.ts            # Point d'entrée serveur
├── shared/                 # Code partagé
│   └── schema.ts           # Schéma Drizzle MySQL
├── scripts/                # Scripts utilitaires
│   ├── migrate.ts          # Migration base de données
│   └── seed.ts             # Données initiales
├── migrations/             # Fichiers de migration
├── drizzle.config.ts       # Configuration Drizzle
└── package.json
```

## 🔗 API Endpoints

### Authentification (`/api/auth`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/login` | Connexion | Non |
| POST | `/logout` | Déconnexion | Oui |
| GET | `/me` | Utilisateur actuel | Oui |
| GET | `/status` | Status de session | Non |
| PUT | `/password` | Changer mot de passe | Oui |

### Utilisateurs (`/api/users`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des membres | Oui |
| GET | `/online` | Membres en ligne | Oui |
| GET | `/:id` | Détail d'un membre | Oui |
| POST | `/` | Créer un membre | Admin |
| PUT | `/:id` | Modifier un membre | Admin |
| DELETE | `/:id` | Supprimer un membre | Admin |
| GET | `/:id/permissions` | Permissions | Admin |
| PUT | `/:id/permissions` | Modifier permissions | Admin |
| GET | `/:id/tasks` | Tâches du membre | Oui |
| GET | `/:id/time-entries` | Historique temps | Oui |
| GET | `/:id/performance` | Performance | Oui |

### Tâches (`/api/tasks`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des tâches | Oui |
| GET | `/:id` | Détail d'une tâche | Oui |
| POST | `/` | Créer une tâche | Oui |
| PUT | `/:id` | Modifier une tâche | Oui |
| DELETE | `/:id` | Supprimer une tâche | Admin |
| POST | `/:id/start-timer` | Démarrer chrono | Oui |
| POST | `/:id/stop-timer` | Arrêter chrono | Oui |
| GET | `/:id/time-entries` | Historique temps | Oui |

### Projets (`/api/projects`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des projets | Oui |
| GET | `/:id` | Détail d'un projet | Oui |
| POST | `/` | Créer un projet | Oui |
| PUT | `/:id` | Modifier un projet | Admin |
| DELETE | `/:id` | Supprimer un projet | Admin |
| POST | `/:id/members` | Ajouter un membre | Admin |
| DELETE | `/:id/members/:memberId` | Retirer un membre | Admin |
| GET | `/:id/tasks` | Tâches du projet | Oui |

### Clients (`/api/clients`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste des clients | Oui |
| GET | `/:id` | Détail d'un client | Oui |
| POST | `/` | Créer un client | Admin |
| PUT | `/:id` | Modifier un client | Admin |
| DELETE | `/:id` | Supprimer un client | Admin |
| GET | `/:id/revenue` | Revenu du client | Admin |
| GET | `/:id/projects` | Projets du client | Oui |
| GET | `/:id/tasks` | Tâches du client | Oui |

### Analytics (`/api/analytics`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/dashboard` | Stats dashboard | Oui |
| GET | `/team` | Stats équipe | Oui |
| GET | `/performance` | Performance globale | Admin |
| GET | `/revenue` | Revenus | Admin |
| GET | `/roi` | ROI par client | Admin |

### Messages (`/api/messages`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/channels` | Liste des canaux | Oui |
| POST | `/channels` | Créer un canal | Oui |
| GET | `/channels/:id/messages` | Messages d'un canal | Oui |
| POST | `/messages` | Envoyer un message | Oui |
| PUT | `/messages/:id` | Modifier un message | Oui |
| DELETE | `/messages/:id` | Supprimer un message | Oui |
| GET | `/direct/:memberId` | Messages directs | Oui |

### Timers (`/api/timers`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/active` | Timers actifs | Oui |
| GET | `/time-entries` | Historique temps | Oui |
| GET | `/summary` | Résumé du temps | Oui |

### Notifications (`/api/notifications`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Mes notifications | Oui |
| GET | `/unread` | Non lues | Oui |
| PUT | `/:id/read` | Marquer comme lue | Oui |
| PUT | `/read-all` | Tout marquer lu | Oui |
| DELETE | `/:id` | Supprimer | Oui |

## 👥 Système de Rôles

### Administrateurs (2)
- **Serge ASSALÉ** - serge.assale / JeSuisMoi
- **Enos GOUBA** - enos.gouba / (voir env)

**Permissions:**
- Voir toutes les tâches, projets, clients
- Créer/modifier/supprimer tout
- Gérer les membres et permissions
- Accéder aux analytics complets

### Employés (12)
- Mot de passe par défaut: `jofe2024`

**Permissions:**
- Voir uniquement leurs tâches assignées
- Modifier leurs tâches
- Démarrer/arrêter leurs timers
- Accéder au chat
- Voir leurs propres statistiques

## 🔌 WebSocket

### Connexion

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

// Authentification
ws.send(JSON.stringify({
  type: 'user_connect',
  data: { memberId: 'uuid', memberName: 'Nom' },
  timestamp: Date.now()
}));
```

### Types de Messages

| Type | Description |
|------|-------------|
| `user_connect` | Connexion d'un utilisateur |
| `user_disconnect` | Déconnexion |
| `chat_message` | Message chat |
| `task_updated` | Mise à jour de tâche |
| `timer_started` | Timer démarré |
| `timer_stopped` | Timer arrêté |
| `project_updated` | Mise à jour projet |
| `request_dashboard_update` | Demander refresh dashboard |
| `request_team_update` | Demander refresh équipe |
| `ping` | Heartbeat |

## 🔧 Dépannage

### Erreur de connexion MySQL

```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les credentials
mysql -u root -p -e "SHOW DATABASES;"
```

### Erreur de migration

```bash
# Supprimer et recréer la base
mysql -u root -p -e "DROP DATABASE akili; CREATE DATABASE akili CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Relancer la migration
npm run db:reset
```

### Port déjà utilisé

```bash
# Trouver le processus
lsof -i :5000
# ou sur Windows
netstat -ano | findstr :5000

# Changer le port dans .env
PORT=3000
```

### Drizzle Studio (GUI pour la base de données)

```bash
npm run db:studio
```

Accessible sur `https://local.drizzle.studio`

---

## 📞 Support

Pour toute question ou problème, contacter l'équipe de développement.

**Jo'Fé Digital** - Akili v2.0
