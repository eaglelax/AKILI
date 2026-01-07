# 💬 Système de Chat Lié aux Projets - AKILI

## Vue d'ensemble

Le système de chat AKILI permet aux membres de l'équipe de communiquer dans des canaux liés aux projets. Chaque projet dispose de son propre canal de discussion accessible uniquement aux membres assignés à ce projet.

---

## 🎯 Fonctionnalités Principales

### 1. Canaux Liés aux Projets
- **Création automatique** : Chaque projet peut avoir son propre canal de chat
- **Accès contrôlé** : Seuls les membres assignés au projet peuvent voir et participer au canal
- **Notifications** : Les membres reçoivent des notifications pour les nouveaux messages

### 2. Types de Canaux
- **Projet** (`project`) : Lié à un projet spécifique, accessible aux membres du projet
- **Général** (`general`) : Accessible à tous les membres de l'équipe
- **Direct** (`direct`) : Conversations privées entre deux membres (à venir)

### 3. Permissions par Rôle

| Action | Super Admin | Admin | Membre |
|--------|-------------|-------|--------|
| **Voir tous les canaux** | ✅ | ✅ | ❌ |
| **Voir canaux de ses projets** | ✅ | ✅ | ✅ |
| **Créer un canal** | ✅ | ✅ | ❌ |
| **Envoyer des messages** | ✅ | ✅ | ✅ (dans ses projets) |
| **Modifier ses messages** | ✅ | ✅ | ✅ |
| **Supprimer des messages** | ✅ | ✅ | ❌ |

---

## 📊 Structure des Données

### Table: chat_channels
```sql
- id (UUID)
- name (Nom du canal)
- description (Description optionnelle)
- type ('general' | 'project' | 'direct')
- projectId (ID du projet lié, NULL si général)
- isPrivate (Canal privé ou public)
- createdBy (ID du créateur)
- createdAt, updatedAt
```

### Table: channel_members
```sql
- id (UUID)
- channelId (ID du canal)
- memberId (ID du membre)
- role ('admin' | 'member')
- joinedAt (Date d'ajout)
- lastReadAt (Dernière lecture)
```

### Table: chat_messages
```sql
- id (UUID)
- content (Contenu du message)
- senderId (ID de l'expéditeur)
- channelId (ID du canal)
- messageType ('text' | 'file' | 'system')
- fileUrl, fileName (Pour les fichiers)
- mentions (Array d'IDs de membres mentionnés)
- isEdited (Message modifié ?)
- editedAt (Date de modification)
- createdAt
```

---

## 🔐 Contrôle d'Accès

### Pour les Membres Standards

Un membre standard peut accéder à un canal si :
1. Le canal est de type `general` (accessible à tous)
2. Le canal est lié à un projet où le membre est assigné (dans `project_members`)

### Exemple de Vérification d'Accès

```typescript
// Backend: server/routes/chat.ts
const channel = await storage.getChatChannel(channelId);

if (!isAdmin) {
  // Vérifier si membre du canal
  const isMemberOfChannel = await storage.isChannelMember(channelId, currentUserId);

  if (!isMemberOfChannel && channel.projectId) {
    // Vérifier si membre du projet lié
    const projectMembers = await storage.getProjectMembers(channel.projectId);
    const isMemberOfProject = projectMembers.some(pm => pm.memberId === currentUserId);

    if (!isMemberOfProject) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à ce canal"
      });
    }
  }
}
```

---

## 🚀 Routes API

### GET /api/chat/channels
Récupère la liste des canaux accessibles par l'utilisateur

**Permissions** : `requireAuth`

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "channel-id",
      "name": "💼 Projet MOOV AFRICA",
      "description": "Discussion du projet MOOV AFRICA",
      "type": "project",
      "projectId": "project-id",
      "projectName": "MOOV AFRICA",
      "isPrivate": false,
      "unreadCount": 3,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/chat/messages/:channelId
Récupère les messages d'un canal

**Permissions** : `requireAuth` + accès au canal

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "message-id",
      "content": "Bonjour, avancement du projet ?",
      "senderId": "user-id",
      "senderName": "Paul OUEDRAOGO",
      "senderAvatar": "PO",
      "channelId": "channel-id",
      "messageType": "text",
      "isEdited": false,
      "createdAt": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

---

### POST /api/chat/messages
Envoie un message dans un canal

**Permissions** : `requireAuth` + accès au canal

**Body** :
```json
{
  "channelId": "channel-id",
  "content": "Message à envoyer"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id": "new-message-id",
    "content": "Message à envoyer",
    "senderId": "user-id",
    "channelId": "channel-id",
    "messageType": "text",
    "createdAt": "2024-01-15T10:10:00.000Z"
  },
  "message": "Message envoyé"
}
```

---

### POST /api/chat/channels
Crée un nouveau canal (Admin uniquement)

**Permissions** : `requireAuth` + `isAdmin`

**Body** :
```json
{
  "name": "Nouveau Canal",
  "description": "Description du canal",
  "type": "project",
  "projectId": "project-id",
  "isPrivate": false
}
```

---

## 📱 Interface Frontend

### Page Chat ([client/src/pages/chat.tsx](client/src/pages/chat.tsx))

**Composants principaux** :
1. **Sidebar** : Liste des canaux avec recherche
2. **Zone de messages** : Affichage des messages du canal sélectionné
3. **Input** : Zone de saisie pour envoyer des messages

**Features** :
- ✅ Auto-scroll vers les nouveaux messages
- ✅ Affichage des métadonnées (heure, expéditeur)
- ✅ Distinction visuelle entre messages envoyés/reçus
- ✅ Recherche de canaux
- ✅ Indicateur de messages non lus

---

## 🔄 Workflow Complet

### 1. Création d'un Projet

```
1. Admin crée un projet
2. Admin assigne des membres au projet (project_members)
3. Script crée automatiquement un canal de chat pour le projet
4. Tous les membres assignés sont ajoutés au canal (channel_members)
```

### 2. Membre Accède au Chat

```
1. Membre se connecte
2. Frontend appelle GET /api/chat/channels
3. Backend filtre les canaux :
   - Canaux "general" (tous)
   - Canaux "project" où le membre est assigné
4. Frontend affiche la liste des canaux accessibles
```

### 3. Envoi d'un Message

```
1. Membre sélectionne un canal
2. Frontend charge les messages du canal
3. Membre tape un message et appuie sur Entrée
4. POST /api/chat/messages
5. Backend vérifie l'accès au canal
6. Message sauvegardé en base de données
7. Frontend recharge les messages
8. (Future) WebSocket notifie les autres membres en temps réel
```

---

## 🛠️ Scripts Utiles

### Créer des Canaux pour Projets Existants

```bash
npx tsx scripts/create-project-channels.ts
```

Ce script :
- Crée un canal pour chaque projet existant
- Ajoute automatiquement tous les membres du projet au canal
- Crée un canal général pour toute l'équipe

---

## ⚡ Améliorations Futures

### 1. WebSocket en Temps Réel
- Réception instantanée des nouveaux messages
- Indicateur "en train d'écrire..."
- Notifications push

### 2. Mentions et Notifications
- @mention d'utilisateurs dans les messages
- Notifications pour les mentions
- Surlignage des mentions

### 3. Pièces Jointes
- Upload de fichiers dans les messages
- Prévisualisation d'images
- Téléchargement de documents

### 4. Recherche dans l'Historique
- Recherche de messages par contenu
- Filtres par date, expéditeur
- Résultats surlignés

### 5. Messages Système
- Notifications automatiques (membre ajouté, projet mis à jour)
- Historique d'activité du projet dans le chat

---

## 🔍 Exemples d'Utilisation

### Exemple 1 : Chef de Pub Assigne une Tâche

```
Canal: 💼 Campagne MOOV AFRICA
Membres: Enos (Coordinateur), Paul (Graphiste), Fortune (Photographe)

Enos: @paul Peux-tu créer 3 visuels pour la campagne d'ici jeudi ?
Paul: OK, je vais commencer ce matin. Tu as un brief détaillé ?
Enos: Oui, je l'ai uploadé dans les fichiers du projet
Fortune: Je peux faire les photos de stock si besoin
```

### Exemple 2 : Suivi d'Avancement

```
Canal: 💼 Refonte Site Web Client X
Membres: Serge, Latif (Designer), Jean-Jacques (DA)

Latif: Maquettes de la homepage terminées à 80%
Jean-Jacques: Super ! Tu peux les partager pour validation ?
Serge: Parfait, je regarde ça dans la journée
```

---

## 📞 Support

Pour toute question sur le système de chat, contactez l'équipe de développement.

---

## 📄 Fichiers Clés

- **Frontend** : [client/src/pages/chat.tsx](client/src/pages/chat.tsx)
- **Backend Routes** : [server/routes/chat.ts](server/routes/chat.ts)
- **Storage Methods** : [server/storage.ts](server/storage.ts) (lignes 1810-1923)
- **Schema** : [shared/schema.ts](shared/schema.ts) (tables `chatChannels`, `channelMembers`, `chatMessages`)
- **Script Init** : [scripts/create-project-channels.ts](scripts/create-project-channels.ts)
