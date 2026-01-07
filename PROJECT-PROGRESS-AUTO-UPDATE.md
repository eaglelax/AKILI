# 📊 Mise à Jour Automatique de l'Avancement des Projets

## Vue d'ensemble

Le système AKILI calcule automatiquement l'avancement d'un projet en fonction de l'avancement de toutes ses tâches liées.

---

## 🔄 Fonctionnement

### Calcul Automatique

Lorsqu'une **tâche liée à un projet** est modifiée, le système :

1. **Récupère toutes les tâches** du projet
2. **Calcule la moyenne** de l'avancement de toutes les tâches
3. **Met à jour automatiquement** l'avancement du projet

### Formule

```
Avancement du Projet = Moyenne(Avancement de toutes les tâches)
```

**Exemple :**
- Tâche 1 : 50% d'avancement
- Tâche 2 : 75% d'avancement
- Tâche 3 : 25% d'avancement
- **Projet : 50% d'avancement** (moyenne arrondie)

---

## ⚙️ Déclencheurs

L'avancement du projet est **automatiquement recalculé** dans les cas suivants :

### 1. ✅ Création d'une tâche

Quand une nouvelle tâche est créée et liée à un projet :
- Le système recalcule l'avancement du projet
- Inclut la nouvelle tâche dans le calcul (généralement 0%)

**Fichier :** [server/routes/tasks.ts](server/routes/tasks.ts) (lignes 120-134)

### 2. 📝 Modification de l'avancement d'une tâche

Quand l'avancement d'une tâche est modifié :
- Le système recalcule automatiquement l'avancement du projet
- Prend en compte le nouvel avancement de la tâche

**Fichier :** [server/routes/tasks.ts](server/routes/tasks.ts) (lignes 206-229)

### 3. ✔️ Changement de statut d'une tâche

Quand le statut d'une tâche passe à "terminé" :
- L'avancement de la tâche passe automatiquement à 100%
- L'avancement du projet est recalculé

**Fichier :** [server/routes/tasks.ts](server/routes/tasks.ts) (lignes 198-202)

### 4. 🗑️ Suppression d'une tâche

Quand une tâche est supprimée :
- Le système recalcule l'avancement du projet sans cette tâche
- Si toutes les tâches sont supprimées, le projet revient à 0%

**Fichier :** [server/routes/tasks.ts](server/routes/tasks.ts) (lignes 292-310)

---

## 📋 Implémentation Technique

### Route POST /api/tasks (Création)

```typescript
const task = await storage.createTask(taskData);

// Mise à jour automatique de l'avancement du projet
if (task.projectId) {
  const projectTasks = await storage.getTasksByProject(task.projectId, { limit: 1000 });

  if (projectTasks.data.length > 0) {
    const totalProgress = projectTasks.data.reduce((sum, t) => sum + (t.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / projectTasks.data.length);

    await storage.updateProject(task.projectId, { progress: averageProgress });
  }
}
```

### Route PUT /api/tasks/:id (Modification)

```typescript
const updatedTask = await storage.updateTask(id, req.body);

// Mise à jour automatique si changement d'avancement ou de statut
if (updatedTask.projectId && ('progress' in req.body || 'status' in req.body)) {
  const projectTasks = await storage.getTasksByProject(updatedTask.projectId, { limit: 1000 });

  if (projectTasks.data.length > 0) {
    const totalProgress = projectTasks.data.reduce((sum, task) => {
      return sum + (task.progress || 0);
    }, 0);

    const averageProgress = Math.round(totalProgress / projectTasks.data.length);

    await storage.updateProject(updatedTask.projectId, { progress: averageProgress });
  }
}
```

### Route DELETE /api/tasks/:id (Suppression)

```typescript
const projectId = task.projectId;
await storage.deleteTask(id);

// Mise à jour après suppression
if (projectId) {
  const projectTasks = await storage.getTasksByProject(projectId, { limit: 1000 });

  if (projectTasks.data.length > 0) {
    const totalProgress = projectTasks.data.reduce((sum, t) => sum + (t.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / projectTasks.data.length);

    await storage.updateProject(projectId, { progress: averageProgress });
  } else {
    // Si plus de tâches, remettre le projet à 0%
    await storage.updateProject(projectId, { progress: 0 });
  }
}
```

---

## 🛡️ Gestion des Erreurs

Le système utilise des **try/catch** pour éviter de bloquer les opérations sur les tâches en cas d'erreur de calcul :

```typescript
try {
  // Calcul et mise à jour de l'avancement du projet
} catch (error) {
  console.error("Erreur lors de la mise à jour de l'avancement du projet:", error);
  // Ne pas bloquer la mise à jour de la tâche
}
```

**Principe :** Si le calcul de l'avancement du projet échoue, l'opération sur la tâche (création, modification, suppression) continue normalement.

---

## 📊 Exemples d'Utilisation

### Exemple 1 : Projet vide

- **Aucune tâche créée**
- Avancement du projet : **0%** (valeur par défaut)

### Exemple 2 : Ajout de tâches

1. Créer Tâche A (0% d'avancement)
   - Avancement projet : **0%**

2. Créer Tâche B (0% d'avancement)
   - Avancement projet : **0%** (moyenne de 0% et 0%)

3. Modifier Tâche A → 50%
   - Avancement projet : **25%** (moyenne de 50% et 0%)

4. Modifier Tâche B → 100%
   - Avancement projet : **75%** (moyenne de 50% et 100%)

5. Modifier Tâche A → 100%
   - Avancement projet : **100%** (moyenne de 100% et 100%)

### Exemple 3 : Suppression de tâches

Projet avec 3 tâches :
- Tâche 1 : 100%
- Tâche 2 : 50%
- Tâche 3 : 0%
- **Avancement projet : 50%**

Supprimer Tâche 3 (0%) :
- Tâche 1 : 100%
- Tâche 2 : 50%
- **Avancement projet : 75%** (moyenne augmente)

Supprimer toutes les tâches :
- **Avancement projet : 0%**

---

## 🔍 Points Importants

### ✅ Avantages

1. **Automatique** : Pas besoin de mettre à jour manuellement l'avancement du projet
2. **Temps réel** : L'avancement est toujours à jour
3. **Fiable** : Basé sur les données réelles des tâches
4. **Transparent** : Le calcul est simple et compréhensible

### ⚠️ Limites

1. **Moyenne simple** : Toutes les tâches ont le même poids dans le calcul
2. **Limite de 1000 tâches** : Pour des raisons de performance (limite configurable)
3. **Pas de pondération** : Les tâches prioritaires ne pèsent pas plus lourd

### 💡 Bonnes Pratiques

1. **Créer des tâches de taille similaire** pour un calcul d'avancement plus précis
2. **Mettre à jour régulièrement l'avancement des tâches** pour refléter la réalité
3. **Utiliser le statut "terminé"** qui met automatiquement la tâche à 100%
4. **Ne pas modifier manuellement l'avancement du projet** (sera écrasé automatiquement)

---

## 🔧 Configuration

### Nombre Maximum de Tâches

Actuellement défini à **1000 tâches** par projet pour le calcul :

```typescript
const projectTasks = await storage.getTasksByProject(projectId, { limit: 1000 });
```

Pour modifier cette limite, changer le paramètre `limit` dans les trois routes :
- POST /api/tasks (ligne 123)
- PUT /api/tasks/:id (ligne 210)
- DELETE /api/tasks/:id (ligne 295)

---

## 📝 Notes Techniques

### Base de Données

- **Table concernée** : `projects`
- **Champ mis à jour** : `progress` (INT, 0-100)
- **Relation** : Lien avec `tasks` via `tasks.projectId`

### Performance

- **Calcul simple** : Addition et division (O(n))
- **Optimisé** : Un seul appel à la base de données
- **Non bloquant** : En cas d'erreur, n'empêche pas l'opération sur la tâche

---

## 🚀 Évolutions Futures Possibles

1. **Pondération des tâches** : Certaines tâches comptent plus que d'autres
2. **Calcul basé sur les heures** : Avancement en fonction des heures estimées vs réelles
3. **Exclusion des tâches annulées** : Ne pas compter les tâches annulées dans le calcul
4. **Notification automatique** : Alerter quand un projet atteint 100%
5. **Historique d'avancement** : Tracer l'évolution de l'avancement dans le temps

---

## 📞 Support

Pour toute question sur le système de mise à jour automatique de l'avancement des projets, contactez l'équipe de développement.
