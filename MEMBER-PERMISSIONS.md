# 👤 Permissions des Membres Standards - AKILI

## Vue d'ensemble

Les membres standards (userRole: `member`) ont un accès limité au système AKILI. Ils ne voient que les projets auxquels ils sont assignés et ne peuvent pas voir les informations budgétaires.

---

## 🔐 Restrictions Implémentées

### 1. Projets Visibles

#### Backend ([server/routes/projects.ts](server/routes/projects.ts))

**Route GET /api/projects** (lignes 16-53)

```typescript
// Admin et Super Admin voient tous les projets
if (userRole === 'admin' || userRole === 'super_admin') {
  projects = await storage.getAllProjects({ page, limit, sortBy, sortOrder });
} else {
  // Membres standards voient seulement les projets auxquels ils sont assignés
  projects = await storage.getProjectsForMember(currentUserId, { page, limit, sortBy, sortOrder });
}

// Masquer les informations budgétaires pour les membres standards
if (userRole === 'member') {
  projects.data = projects.data.map((project: any) => ({
    ...project,
    budget: undefined,
    actualCost: undefined,
  }));
}
```

**Comportement :**
- ✅ **Admin/Super Admin** : Voient TOUS les projets
- ✅ **Membre standard** : Voient UNIQUEMENT les projets où ils sont assignés dans la table `project_members`

---

### 2. Détail d'un Projet

#### Backend ([server/routes/projects.ts](server/routes/projects.ts))

**Route GET /api/projects/:id** (lignes 59-110)

```typescript
// Vérifier si le membre standard a accès à ce projet
if (userRole === 'member') {
  const projectMembers = await storage.getProjectMembers(id);
  const isMemberOfProject = projectMembers.some((pm: any) => pm.memberId === currentUserId);

  if (!isMemberOfProject) {
    return res.status(403).json({
      success: false,
      message: "Vous n'avez pas accès à ce projet"
    });
  }
}

// Masquer les informations budgétaires pour les membres standards
if (userRole === 'member') {
  projectWithRelations = {
    ...projectWithRelations,
    budget: undefined,
    actualCost: undefined,
  };
}
```

**Comportement :**
- ✅ **Contrôle d'accès** : Un membre standard ne peut pas accéder aux détails d'un projet où il n'est pas assigné (erreur 403)
- ✅ **Masquage du budget** : Les champs `budget` et `actualCost` sont supprimés de la réponse

---

### 3. Informations Budgétaires Masquées

#### Dashboard ([client/src/pages/dashboard.tsx](client/src/pages/dashboard.tsx))

**Lignes 36-44 :**

```typescript
// Vérifier le rôle de l'utilisateur
const userRole = (user as any)?.userRole || 'member';
const isAdmin = userRole === 'admin' || userRole === 'super_admin';

// Calculate total revenue from all project budgets (only for admins)
const totalRevenue = isAdmin ? ((projects as any)?.data?.reduce((sum: number, project: any) => {
  const budget = parseFloat(project.budget || 0);
  return sum + budget;
}, 0) || 0) : 0;
```

**Lignes 89-121 (Carte KPI) :**

```typescript
{/* Chiffre d'Affaires Total - Visible uniquement pour admin et super_admin */}
{isAdmin && (
  <div className="kpi-card">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-green-500/10 flex-shrink-0">
        <DollarSign className="w-6 h-6 text-green-500" />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold jofe-font text-primary">
        {formatCurrency(totalRevenue)}
      </p>
      <p className="text-sm text-muted-foreground mt-2">Chiffre d'Affaires Total (FCFA)</p>
    </div>
  </div>
)}
```

**Comportement :**
- ❌ **Membre standard** : Ne voit PAS la carte "Chiffre d'Affaires Total"
- ✅ **Admin/Super Admin** : Voit la carte avec le total des budgets de tous les projets

---

#### Page Projets ([client/src/pages/projects.tsx](client/src/pages/projects.tsx))

**Lignes 55-57 :**

```typescript
// Vérifier le rôle de l'utilisateur
const userRole = (user as any)?.userRole || 'member';
const isAdminRole = userRole === 'admin' || userRole === 'super_admin';
```

**Lignes 461-474 (Carte Budget Total) :**

```typescript
{/* Budget Total - Visible uniquement pour admin et super_admin */}
{isAdminRole && (
  <Card className="p-6 border border-[var(--jofe-gray)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">Budget Total</p>
        <p className="text-2xl font-bold text-[var(--jofe-blue-medium)]">
          {(stats.budget / 1000000).toFixed(1)}M FCFA
        </p>
      </div>
      <DollarSign className="w-8 h-8 text-blue-500" />
    </div>
  </Card>
)}
```

**Lignes 584-603 (Budget dans les cartes projet) :**

```typescript
{/* Budget et Deadline */}
<div className={`grid ${isAdminRole ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
  {/* Budget - Visible uniquement pour admin et super_admin */}
  {isAdminRole && (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
      <p className={`font-bold ${(project.status === 'completed' || project.status === 'termine') ? 'text-green-600' : 'text-[var(--jofe-blue-medium)]'}`}>
        {formatCurrency(parseFloat(String(project.budget)) || 0)}
      </p>
    </div>
  )}
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide">
      {(project.status === 'completed' || project.status === 'termine') ? 'Terminé le' : 'Deadline'}
    </p>
    <p className={`font-bold ${(project.status === 'completed' || project.status === 'termine') ? 'text-green-600' : 'text-orange-600'}`}>
      {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '-'}
    </p>
  </div>
</div>
```

**Comportement :**
- ❌ **Membre standard** : Ne voit PAS :
  - La carte "Budget Total" dans les statistiques
  - Le budget de chaque projet dans la liste
- ✅ **Admin/Super Admin** : Voit toutes les informations budgétaires

---

## 📋 Tâches et Projets

### Tâches Visibles

Les membres standards voient :

1. **Leurs propres tâches** (tâches qui leur sont assignées)
2. **Tâches des projets auxquels ils sont assignés**

### Projets Visibles

Les membres standards voient :

1. **Uniquement les projets** où ils apparaissent dans la table `project_members`
2. **Informations du projet SANS budget** :
   - Nom du projet
   - Description
   - Client
   - Statut
   - Progression
   - Dates (début, fin, deadline)
   - Membres de l'équipe
   - Tâches liées

---

## 🔄 Flux de Données

### 1. Connexion d'un Membre Standard

```
1. Membre se connecte → Session créée avec userRole = 'member'
2. Accès au Dashboard → API charge seulement les projets assignés
3. Informations budgétaires → Supprimées côté backend ET masquées côté frontend
```

### 2. Navigation dans les Projets

```
1. Liste des projets → Filtrée par storage.getProjectsForMember(memberId)
2. Clic sur un projet → Vérification d'accès dans project_members
3. Si non assigné → Erreur 403 "Vous n'avez pas accès à ce projet"
4. Si assigné → Détails du projet SANS budget/actualCost
```

---

## 📊 Matrice de Permissions - Projets

| Action | Super Admin | Admin | Membre |
|--------|-------------|-------|--------|
| **Voir tous les projets** | ✅ | ✅ | ❌ |
| **Voir projets assignés** | ✅ | ✅ | ✅ |
| **Voir budget du projet** | ✅ | ✅ | ❌ |
| **Voir coût réel du projet** | ✅ | ✅ | ❌ |
| **Voir budget total** | ✅ | ✅ | ❌ |
| **Voir progression du projet** | ✅ | ✅ | ✅ |
| **Voir deadline du projet** | ✅ | ✅ | ✅ |
| **Voir membres du projet** | ✅ | ✅ | ✅ |
| **Créer un projet** | ✅ | ✅ | ❌ |
| **Modifier un projet** | ✅ | ✅ | ❌ |
| **Supprimer un projet** | ✅ | ✅ | ❌ |

---

## 📊 Matrice de Permissions - Tâches

| Action | Super Admin | Admin | Membre |
|--------|-------------|-------|--------|
| **Voir toutes les tâches** | ✅ | ✅ | ❌ |
| **Voir ses propres tâches** | ✅ | ✅ | ✅ |
| **Créer une tâche** | ✅ | ✅ | ❌ |
| **Modifier sa tâche** | ✅ | ✅ | ✅ |
| **Modifier tâche d'autrui** | ✅ | ✅ | ❌ |
| **Supprimer une tâche** | ✅ | ✅ | ❌ |
| **Voir tâches du projet assigné** | ✅ | ✅ | ✅ |
| **Mettre à jour progression** | ✅ | ✅ | ✅ |

---

## 🛡️ Sécurité

### Protection Double Couche

1. **Backend (Sécurité principale)**
   - Filtrage des données selon le rôle
   - Suppression des champs sensibles (budget, actualCost)
   - Vérification d'accès aux projets

2. **Frontend (Interface utilisateur)**
   - Masquage conditionnel des composants
   - Affichage adapté selon le rôle
   - Prévention de l'affichage d'informations sensibles

### Pourquoi Double Protection ?

- **Backend** : Garantit que les données sensibles ne sont JAMAIS envoyées au client
- **Frontend** : Améliore l'expérience utilisateur en ne montrant que les fonctionnalités accessibles
- **Sécurité** : Même si le frontend est contourné, le backend bloque l'accès

---

## 🔍 Tests Recommandés

### Test 1 : Accès aux Projets

1. Se connecter en tant que **membre standard**
2. Aller sur `/projects`
3. ✅ Vérifier : Seuls les projets assignés sont visibles
4. ✅ Vérifier : Aucun budget n'est affiché

### Test 2 : Accès Direct à un Projet Non Assigné

1. Se connecter en tant que **membre standard**
2. Essayer d'accéder à `/projects/[id-projet-non-assigne]`
3. ✅ Vérifier : Erreur 403 "Vous n'avez pas accès à ce projet"

### Test 3 : Dashboard

1. Se connecter en tant que **membre standard**
2. Aller sur `/dashboard`
3. ✅ Vérifier : Carte "Chiffre d'Affaires Total" est masquée
4. ✅ Vérifier : Seuls les projets assignés apparaissent

### Test 4 : Inspection API

1. Se connecter en tant que **membre standard**
2. Ouvrir DevTools Network
3. Appeler `GET /api/projects`
4. ✅ Vérifier : `budget` et `actualCost` sont `undefined` dans la réponse JSON

---

## 📝 Notes Importantes

### Assignation aux Projets

Pour qu'un membre standard voie un projet, il DOIT être ajouté à la table `project_members` :

```sql
INSERT INTO project_members (id, projectId, memberId, role)
VALUES (UUID(), 'project-id', 'member-id', 'Développeur');
```

### Tâches Liées aux Projets

Quand une tâche est créée dans un projet :
- Si le membre est assigné à la tâche ET au projet → Voit la tâche
- Si le membre n'est pas assigné au projet → Ne voit PAS la tâche
- La route `/api/tasks` filtre automatiquement selon le rôle

### Données Sensibles

Les champs considérés comme **sensibles** et masqués pour les membres standards :
- `budget` (budget du projet)
- `actualCost` (coût réel du projet)
- `monthlyBudget` (budget mensuel du client)
- `totalRevenue` (revenu total du client)

---

## 🚀 Évolutions Futures Possibles

1. **Permissions Granulaires** : Certains membres peuvent voir les budgets de certains projets
2. **Budgets Partiels** : Afficher une fourchette au lieu du budget exact
3. **Notifications** : Alerter quand un membre est ajouté/retiré d'un projet
4. **Historique** : Tracer qui a accédé à quel projet et quand
5. **Rôles dans les Projets** : Chef de projet, développeur, designer (avec permissions différentes)

---

## 📞 Support

Pour toute question sur les permissions des membres standards, contactez l'équipe de développement.
