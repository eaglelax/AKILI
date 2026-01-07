# 🔒 Règles de Sécurité - Système de Rôles

## Résumé des Protections Implémentées

### ✅ Protections Backend Actives

#### 1. **Super Admin**

| Action | Autorisé | Protection |
|--------|----------|------------|
| Modifier son propre nom/email/mot de passe | ✅ Oui | - |
| Modifier son propre `userRole` | ❌ Non | Route: `PUT /api/users/:id` ligne 226 |
| Modifier d'autres comptes | ✅ Oui | - |
| Créer admin/super_admin | ✅ Oui | - |
| Se supprimer | ❌ Non | Route: `DELETE /api/users/:id` ligne 321 |

**Raison :** Empêcher le super admin de se bloquer accidentellement en changeant son rôle.

---

#### 2. **Administrateur**

| Action | Autorisé | Protection |
|--------|----------|------------|
| Modifier son propre compte | ❌ Non | Route: `PUT /api/users/:id` ligne 218 |
| Modifier compte membre | ✅ Oui | - |
| Modifier compte admin/super_admin | ❌ Non | Route: `PUT /api/users/:id` ligne 234 |
| Créer membre | ✅ Oui | - |
| Créer admin/super_admin | ❌ Non | Route: `POST /api/users` lignes 110-123 |
| Supprimer membre | ✅ Oui | - |
| Supprimer admin/super_admin | ❌ Non | Route: `DELETE /api/users/:id` ligne 329 |
| Se supprimer | ❌ Non | Route: `DELETE /api/users/:id` ligne 321 |

**Raisons :**
- Empêcher l'auto-promotion en super admin
- Empêcher la modification/suppression d'autres administrateurs
- Maintenir l'intégrité du système de permissions

---

#### 3. **Membre**

| Action | Autorisé | Protection |
|--------|----------|------------|
| Modifier son profil (limité) | ✅ Oui | Middleware: `requireAuth` |
| Modifier son `userRole` | ❌ Non | Middleware: `requireAdmin` |
| Créer des comptes | ❌ Non | Middleware: `requireAdmin` |
| Supprimer des comptes | ❌ Non | Middleware: `requireAdmin` |
| Accéder à la gestion d'équipe | ❌ Non | Middleware: `requireAdmin` |

---

## 📋 Détails des Validations

### Route: `POST /api/users` (Création)

```typescript
// Ligne 106-123
const currentUserRole = req.session.userRole || 'member';
const requestedRole = req.body.userRole || 'member';

// Protection 1: Seul super_admin peut créer super_admin
if (requestedRole === 'super_admin' && currentUserRole !== 'super_admin') {
  return res.status(403).json({ message: "Seul un super administrateur peut créer un compte super administrateur" });
}

// Protection 2: Seul super_admin peut créer admin
if (requestedRole === 'admin' && currentUserRole !== 'super_admin') {
  return res.status(403).json({ message: "Seul un super administrateur peut créer un compte administrateur" });
}
```

---

### Route: `PUT /api/users/:id` (Modification)

```typescript
// Ligne 201-260
const currentUserId = req.teamMember!.id;
const currentUserRole = req.teamMember!.userRole || 'member';

// RÈGLE 1: Admin ne peut pas modifier son propre compte
if (currentUserRole === 'admin' && id === currentUserId) {
  return res.status(403).json({
    message: "Un administrateur ne peut pas modifier son propre compte"
  });
}

// RÈGLE 2: Super admin ne peut pas modifier son propre rôle
if (currentUserRole === 'super_admin' && id === currentUserId &&
    requestedRole && requestedRole !== 'super_admin') {
  return res.status(403).json({
    message: "Vous ne pouvez pas modifier votre propre rôle de super administrateur"
  });
}

// RÈGLE 3: Admin ne peut pas modifier admin/super_admin
if (currentUserRole === 'admin' &&
    (existingMember.userRole === 'admin' || existingMember.userRole === 'super_admin')) {
  return res.status(403).json({
    message: "Un administrateur ne peut pas modifier un autre administrateur"
  });
}
```

---

### Route: `DELETE /api/users/:id` (Suppression)

```typescript
// Ligne 305-334
const currentUserId = req.teamMember!.id;
const currentUserRole = req.teamMember!.userRole || 'member';

// Protection 1: Personne ne peut se supprimer
if (id === currentUserId) {
  return res.status(400).json({
    message: "Vous ne pouvez pas vous supprimer vous-même"
  });
}

// Protection 2: Admin ne peut pas supprimer admin/super_admin
if (currentUserRole === 'admin' &&
    (member.userRole === 'admin' || member.userRole === 'super_admin')) {
  return res.status(403).json({
    message: "Un administrateur ne peut pas supprimer un autre administrateur"
  });
}
```

---

## 🛡️ Middlewares de Protection

### `requireSuperAdmin` ([server/middleware/auth.ts](server/middleware/auth.ts):88)

```typescript
if (member.userRole !== 'super_admin') {
  return res.status(403).json({
    message: "Accès refusé - Droits super administrateur requis"
  });
}
```

**Utilisé pour :**
- Création de comptes admin/super_admin
- Modification de rôles admin/super_admin
- Opérations critiques du système

---

### `requireAdmin` ([server/middleware/auth.ts](server/middleware/auth.ts):149)

```typescript
if (member.userRole !== 'admin' && member.userRole !== 'super_admin') {
  return res.status(403).json({
    message: "Accès refusé - Droits administrateur requis"
  });
}
```

**Utilisé pour :**
- Gestion des membres (CRUD)
- Gestion des projets et clients
- Accès aux analytiques

---

### `requireAuth` ([server/middleware/auth.ts](server/middleware/auth.ts):32)

```typescript
if (!req.session.teamMember) {
  return res.status(401).json({
    message: "Non autorisé - Veuillez vous connecter"
  });
}
```

**Utilisé pour :**
- Toutes les routes nécessitant une authentification
- Accès aux ressources personnelles

---

## 🔐 Audit Trail

Toutes les actions importantes sont loggées dans la table `activity_logs` :

- Création de compte
- Modification de compte
- Suppression de compte
- Réinitialisation de mot de passe
- Modification de permissions

**Données loggées :**
- `userId`: ID de l'utilisateur qui effectue l'action
- `action`: Type d'action (create, update, delete, etc.)
- `entityType`: Type d'entité (team_member, permissions, etc.)
- `entityId`: ID de l'entité affectée
- `oldValue`: Valeur avant modification (JSON)
- `newValue`: Valeur après modification (JSON)
- `ipAddress`: Adresse IP de la requête
- `userAgent`: User agent du navigateur
- `createdAt`: Timestamp de l'action

---

## 🚨 Messages d'Erreur

### Codes HTTP utilisés :

- **401 Unauthorized**: Session invalide ou expirée
- **403 Forbidden**: Permissions insuffisantes pour l'action
- **400 Bad Request**: Données invalides ou action non autorisée
- **404 Not Found**: Ressource introuvable
- **500 Internal Server Error**: Erreur serveur

### Exemples de messages :

```json
// Admin tente de modifier son compte
{
  "success": false,
  "message": "Un administrateur ne peut pas modifier son propre compte. Contactez un super administrateur."
}

// Admin tente de créer un admin
{
  "success": false,
  "message": "Seul un super administrateur peut créer un compte administrateur"
}

// Super admin tente de changer son rôle
{
  "success": false,
  "message": "Vous ne pouvez pas modifier votre propre rôle de super administrateur"
}

// Tentative de suppression de soi-même
{
  "success": false,
  "message": "Vous ne pouvez pas vous supprimer vous-même"
}
```

---

## 📊 Matrice de Permissions Complète

| Action | Super Admin | Admin | Membre |
|--------|-------------|-------|--------|
| **Créer super_admin** | ✅ | ❌ | ❌ |
| **Créer admin** | ✅ | ❌ | ❌ |
| **Créer membre** | ✅ | ✅ | ❌ |
| **Modifier son rôle** | ❌ | ❌ | ❌ |
| **Modifier son compte (autres)** | ✅ | ❌ | ✅ (limité) |
| **Modifier compte membre** | ✅ | ✅ | ❌ |
| **Modifier compte admin** | ✅ | ❌ | ❌ |
| **Modifier compte super_admin** | ✅ | ❌ | ❌ |
| **Supprimer membre** | ✅ | ✅ | ❌ |
| **Supprimer admin** | ✅ | ❌ | ❌ |
| **Supprimer super_admin** | ✅ | ❌ | ❌ |
| **Se supprimer** | ❌ | ❌ | ❌ |
| **Gérer permissions** | ✅ | ✅ (membres) | ❌ |
| **Voir analytiques** | ✅ | ✅ | ❌ |

---

## ✅ Tests de Sécurité Recommandés

### 1. Test Super Admin
- ✅ Peut créer admin
- ✅ Peut créer super_admin
- ✅ Peut modifier son nom/email
- ❌ Ne peut pas modifier son userRole
- ✅ Peut modifier comptes admin
- ✅ Peut supprimer comptes admin

### 2. Test Admin
- ✅ Peut créer membre
- ❌ Ne peut pas créer admin
- ❌ Ne peut pas modifier son compte
- ❌ Ne peut pas modifier compte admin
- ❌ Ne peut pas supprimer compte admin
- ✅ Peut modifier compte membre
- ✅ Peut supprimer compte membre

### 3. Test Membre
- ❌ Ne peut pas créer de comptes
- ❌ Ne peut pas accéder à /api/users (POST/PUT/DELETE)
- ✅ Peut voir ses propres données
- ✅ Peut modifier son profil (limité)

---

## 🔄 Prochaines Étapes

### Backend (Complété ✅)
- ✅ Middlewares de rôles
- ✅ Validation des routes
- ✅ Protection contre auto-modification
- ✅ Audit trail

### Frontend (À faire ⚠️)
- ⚠️ Cacher boutons selon rôle
- ⚠️ Désactiver champs userRole pour admin
- ⚠️ Afficher messages d'erreur appropriés
- ⚠️ Valider côté client avant envoi

---

## 📞 Contact

Pour toute question sur les règles de sécurité, contactez l'équipe de développement.
