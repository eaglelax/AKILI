# 🌱 Guide de Seed de la Base de Données

Ce guide explique comment initialiser la base de données AKILI avec des données de test.

## 📋 Prérequis

1. **XAMPP installé et démarré**
   - MySQL doit être en cours d'exécution
   - Port 3306 disponible

2. **Base de données créée**
   ```bash
   # Créer la base de données si elle n'existe pas encore
   mysql -u root -p
   CREATE DATABASE akili;
   EXIT;
   ```

3. **Migrations exécutées**
   ```bash
   npm run db:push
   ```

## 🚀 Exécution du Seed

### Méthode 1 : Commande NPM (recommandée)

```bash
npm run db:seed
```

### Méthode 2 : Commande directe

```bash
npx tsx scripts/seed.ts
```

### ⚡ Reset complet + Seed

Si vous voulez tout réinitialiser et repartir de zéro :

```bash
# Option 1 : Reset + Seed automatique
npm run db:reset

# Option 2 : Étape par étape
npx tsx scripts/reset-db.ts
npm run db:push
npm run db:seed
```

## 📊 Données créées

Le script de seed crée automatiquement :

### 👥 Membres de l'équipe (15 personnes)

#### Super Administrateur (1)
1. **admin** / jofe2024
   - Rôle : Super Administrateur (compte système)
   - Permissions : Peut créer des admins et super_admins
   - Email : admin@jofedigital.com

#### Administrateurs (2)
2. **serge.assale** / jofe2024
   - Rôle : Directeur Création & Marketing
   - Permissions : Peut créer seulement des membres
   - Email : serge@jofedigital.com

3. **enos.gouba** / jofe2024
   - Rôle : Coordinateur Production
   - Permissions : Peut créer seulement des membres
   - Email : enos@jofedigital.com

#### Membres (12)
- **paul.ouedraogo** - Graphiste Photomonteur
- **fortune.yanogo** - Photographe/Vidéaste
- **bientama.pare** - Motion Designer
- **issa.cisse** - Graphiste Junior
- **jean.sampabao** - Directeur Artistique Junior
- **latif.ouedraogo** - Designer UI/UX
- **florita.kabore** - Responsable Médias Sociaux
- **nebie.webou** - Chef de Pub/Concepteur Rédacteur
- **djamilatou.guiguemde** - Chef de Pub Stagiaire
- **linda.kabore** - Conceptrice Rédactrice Lead
- **maryse.bombiri** - Community Manager
- **faridatou.barry** - Chef de Pub/CM

**Mot de passe pour tous** : `jofe2024`

### 🏢 Clients (10)

1. MOOV AFRICA - Télécommunications (2,500,000 FCFA/mois)
2. BANK OF AFRICA - Services Financiers (1,800,000 FCFA/mois)
3. VINCENT & ASSOCIES - Cabinet d'Avocats (650,000 FCFA/mois)
4. ANEREE - Énergie (450,000 FCFA/mois)
5. JO'FE DIGITAL - Marketing Digital (300,000 FCFA/mois)
6. ORANGE BURKINA - Télécommunications (2,200,000 FCFA/mois)
7. CORIS BANK - Services Financiers (1,500,000 FCFA/mois)
8. ONATEL - Télécommunications (1,800,000 FCFA/mois)
9. SONABEL - Énergie (900,000 FCFA/mois)
10. TOTAL BURKINA - Pétrole & Gaz (1,200,000 FCFA/mois)

### 💬 Chat

- **1 canal général** : Tous les membres y sont automatiquement ajoutés

### ⚙️ Paramètres système (9)

- Auto-start timers : activé
- Background timers : activé
- Deadline alerts : activé
- Daily limit hours : 8h
- Mandatory break : 60 minutes
- Overtime multiplier : 1.5x
- Company name : Jo'Fé Digital
- Currency : FCFA

## 🔐 Connexion après le seed

### Compte Super Admin (recommandé pour les tests)

```
Username: admin
Password: jofe2024
```

Ce compte a tous les droits et peut :
- Créer des projets
- Assigner des membres
- Gérer l'équipe
- Créer des admins et super_admins
- Accéder à toutes les fonctionnalités

### Autres comptes disponibles

Vous pouvez aussi vous connecter avec :
- `serge.assale` / `jofe2024` (Super Admin)
- `enos.gouba` / `jofe2024` (Admin)
- N'importe quel membre avec son username / `jofe2024`

## ⚠️ Sécurité

**IMPORTANT** : Après le premier seed et la première connexion, il est **fortement recommandé** de :

1. Changer le mot de passe du compte `admin`
2. Changer le mot de passe de `serge.assale`
3. Demander à chaque membre de changer son mot de passe

## 🔄 Réinitialisation complète

Si vous voulez repartir de zéro :

```bash
# 1. Supprimer toutes les données
mysql -u root -p akili < scripts/reset-db.sql

# 2. Recréer les tables
npm run db:push

# 3. Relancer le seed
npx tsx scripts/seed.ts
```

## 📝 Notes

- Le script crée automatiquement les permissions pour chaque membre
- Tous les utilisateurs sont créés avec le statut "offline"
- Les clients ont tous le statut "active" par défaut
- Le canal de chat général inclut automatiquement tous les membres

## 🆘 En cas d'erreur

Si le seed échoue :

1. Vérifiez que MySQL est démarré dans XAMPP
2. Vérifiez que la base de données `akili` existe
3. Vérifiez que les migrations sont à jour (`npm run db:push`)
4. Vérifiez les logs d'erreur pour identifier le problème

Pour plus d'aide, consultez la documentation ou contactez l'équipe de développement.
