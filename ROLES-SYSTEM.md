# 🔐 Système de Rôles - AKILI

## Vue d'ensemble

Le système AKILI utilise **3 niveaux de rôles** pour la gestion des permissions et des accès.

---

## 📊 Les 3 Rôles

### 1. ✨ Super Admin (`super_admin`)

**Permissions complètes :**
- ✅ Créer des comptes **Super Administrateurs**
- ✅ Créer des comptes **Administrateurs**
- ✅ Créer des comptes **Membres**
- ✅ Modifier tous les comptes (y compris son propre compte)
- ✅ Supprimer tous les comptes
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gérer les permissions de tous les utilisateurs

**Restrictions :**
- Aucune

**Compte par défaut :**
- **Username:** `serge.assale`
- **Password:** `jofe2024`
- **Nom:** Serge ASSALÉ

---

### 2. 👔 Administrateur (`admin`)

**Permissions :**
- ✅ Créer des comptes **Membres** uniquement
- ✅ Modifier les comptes membres
- ✅ Accès aux fonctionnalités de gestion (projets, clients, tâches)
- ✅ Gérer les permissions des membres
- ✅ Voir les analytiques

**Restrictions :**
- ❌ **NE PEUT PAS** créer de comptes **Administrateurs**
- ❌ **NE PEUT PAS** créer de comptes **Super Administrateurs**
- ❌ **NE PEUT PAS** modifier son propre compte
- ❌ **NE PEUT PAS** modifier les comptes Super Admin
- ❌ **NE PEUT PAS** supprimer les comptes Admin ou Super Admin

**Compte par défaut :**
- **Username:** `enos.gouba`
- **Password:** `jofe2024`
- **Nom:** Enos GOUBA

---

### 3. 👤 Membre (`member`)

**Permissions :**
- ✅ Voir et gérer ses propres tâches
- ✅ Participer aux projets assignés
- ✅ Utiliser le chat et les notifications
- ✅ Suivre son temps de travail
- ✅ Modifier son propre profil (limité)

**Restrictions :**
- ❌ **NE PEUT PAS** créer de comptes
- ❌ **NE PEUT PAS** modifier d'autres utilisateurs
- ❌ **NE PEUT PAS** accéder aux fonctions d'administration
- ❌ Permissions limitées selon configuration individuelle

**Comptes par défaut :** 12 employés (voir liste complète dans le seed)

---

## 🛠️ Middlewares d'authentification

### `requireSuperAdmin`
Vérifie que l'utilisateur connecté a le rôle `super_admin`.

```typescript
router.post('/admin/create-super-admin', requireSuperAdmin, createSuperAdminHandler);
```

### `requireAdmin`
Vérifie que l'utilisateur a le rôle `admin` **OU** `super_admin`.

```typescript
router.post('/admin/create-member', requireAdmin, createMemberHandler);
```

### `requireAuth`
Vérifie simplement que l'utilisateur est authentifié (tous rôles).

```typescript
router.get('/tasks/my-tasks', requireAuth, getMyTasksHandler);
```

### `requirePermission(key)`
Vérifie une permission spécifique (ex: `canManageTeam`, `canDeleteTasks`).

```typescript
router.delete('/tasks/:id', requirePermission('canDeleteTasks'), deleteTaskHandler);
```

---

## 📋 Matrice des Permissions

| Action | Super Admin | Admin | Membre |
|--------|-------------|-------|--------|
| Créer Super Admin | ✅ | ❌ | ❌ |
| Créer Admin | ✅ | ❌ | ❌ |
| Créer Membre | ✅ | ✅ | ❌ |
| Modifier son compte | ✅ | ❌ | ✅ (limité) |
| Modifier autres comptes | ✅ | ✅ (membres seulement) | ❌ |
| Supprimer comptes | ✅ | ✅ (membres seulement) | ❌ |
| Gérer projets | ✅ | ✅ | Assignés seulement |
| Gérer clients | ✅ | ✅ | ❌ |
| Voir analytiques | ✅ | ✅ | ❌ |
| Gérer permissions | ✅ | ✅ (membres seulement) | ❌ |

---

## 🔒 Règles de Sécurité

### 1. Super Admin
- Peut tout faire sans restriction
- **IMPORTANT:** Un super admin **NE PEUT PAS** modifier son propre rôle
- Ceci empêche de se bloquer accidentellement en changeant son rôle
- Peut modifier tous les autres aspects de son compte (nom, email, mot de passe, etc.)
- Dernier recours pour la gestion du système
- Doit changer son mot de passe après première connexion

### 2. Admin
- **IMPORTANT:** Un admin **NE PEUT JAMAIS** modifier son propre compte
- Ceci empêche l'auto-promotion en Super Admin
- Seul un Super Admin peut modifier un compte Admin

### 3. Membre
- Permissions granulaires configurables individuellement
- Accès limité aux ressources assignées
- Peut modifier son profil (nom, avatar, etc.) mais pas son rôle

---

## 💾 Structure Base de Données

### Table `team_members`

```sql
CREATE TABLE team_members (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  userRole VARCHAR(20) DEFAULT 'member' NOT NULL,  -- 'super_admin', 'admin', 'member'
  isAdmin BOOLEAN DEFAULT false NOT NULL,           -- Deprecated (compatibilité)
  ...
);
```

### Champ `userRole`
- `super_admin` : Super Administrateur
- `admin` : Administrateur
- `member` : Membre standard

---

## 🚀 Utilisation dans le Code

### Vérifier le rôle d'un utilisateur

```typescript
// Dans un middleware ou route
if (member.userRole === 'super_admin') {
  // Autoriser action super admin
}

if (member.userRole === 'admin' || member.userRole === 'super_admin') {
  // Autoriser action admin
}

if (member.userRole === 'member') {
  // Limiter aux permissions spécifiques
}
```

### Protéger une route

```typescript
// Seuls les Super Admins
router.post('/create-admin', requireSuperAdmin, handler);

// Admins et Super Admins
router.post('/create-member', requireAdmin, handler);

// Tous authentifiés
router.get('/profile', requireAuth, handler);

// Permission spécifique
router.delete('/task/:id', requirePermission('canDeleteTasks'), handler);
```

---

## 📝 Notes Importantes

1. **Migration Progressive:** Le champ `isAdmin` existe toujours pour compatibilité mais `userRole` est prioritaire
2. **Sécurité:** Les mots de passe sont hashés avec bcrypt (salt rounds: 10)
3. **Sessions:** Stockées dans MySQL avec express-session
4. **Audit:** Toutes les actions importantes sont loggées dans `activity_logs`

---

## 🔄 Workflow de Création de Comptes

### Super Admin crée un Admin
1. Super Admin se connecte
2. Accède à la gestion d'équipe
3. Clique sur "Créer Administrateur"
4. Remplit le formulaire avec `userRole: 'admin'`
5. Le nouvel admin peut créer des membres mais pas d'autres admins

### Admin crée un Membre
1. Admin se connecte
2. Accède à la gestion d'équipe
3. Clique sur "Créer Membre"
4. Remplit le formulaire
5. Configure les permissions spécifiques
6. Le nouveau membre a accès limité selon ses permissions

---

## ⚠️ Restrictions Importantes

### Admin NE PEUT PAS :
- Créer un compte avec `userRole: 'admin'` ou `userRole: 'super_admin'`
- Modifier le champ `userRole` d'un compte existant vers 'admin' ou 'super_admin'
- Modifier son propre compte (username, password, userRole, etc.)
- Modifier d'autres comptes Admin ou Super Admin
- Supprimer d'autres comptes Admin ou Super Admin

### Super Admin NE PEUT PAS :
- Modifier son propre `userRole` (protection contre le blocage accidentel)
- Note: Un Super Admin peut modifier tous les autres aspects de son compte

### Ces restrictions sont implémentées dans :
- ✅ Les middlewares backend ([server/middleware/auth.ts](server/middleware/auth.ts))
- ✅ Les routes API ([server/routes/users.ts](server/routes/users.ts))
  - Route PUT /api/users/:id - Modification utilisateur
  - Route DELETE /api/users/:id - Suppression utilisateur
  - Route POST /api/users - Création utilisateur
- ⚠️ Le frontend (à faire)

---

## 📞 Support

Pour toute question sur le système de rôles, contactez l'équipe de développement.
