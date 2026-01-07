# 🚀 Guide de Démarrage Rapide - AKILI

Guide pour démarrer rapidement avec l'application AKILI Jo'Fé Digital.

## ⚡ Installation en 5 minutes

### 1. Prérequis

- **Node.js** 18+ installé
- **XAMPP** avec MySQL installé
- **Git** (optionnel)

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration de la base de données

#### Démarrer XAMPP
1. Ouvrir XAMPP Control Panel
2. Démarrer **Apache** et **MySQL**

#### Créer la base de données

**Option A - Via XAMPP phpMyAdmin:**
1. Ouvrir http://localhost/phpmyadmin
2. Cliquer sur "Nouvelle base de données"
3. Nom : `akili`
4. Encodage : `utf8mb4_unicode_ci`
5. Cliquer sur "Créer"

**Option B - Via ligne de commande:**
```bash
mysql -u root
CREATE DATABASE akili CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Créer les tables

```bash
npm run db:push
```

### 5. Insérer les données initiales

```bash
npm run db:seed
```

Cela va créer :
- ✅ 15 membres de l'équipe (dont 1 super admin système)
- ✅ 10 clients
- ✅ 1 canal de chat général
- ✅ Paramètres système

### 6. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5000**

## 🔐 Première Connexion

### Compte Super Admin

```
Username: admin
Password: jofe2024
```

Ce compte vous donne accès à toutes les fonctionnalités.

### Autres comptes disponibles

Tous les comptes utilisent le même mot de passe : `jofe2024`

**Super Admin:**
- `admin` (compte système)

**Admins:**
- `serge.assale` (Directeur Création)
- `enos.gouba` (Coordinateur Production)

**Membres:** (12 personnes)
- `paul.ouedraogo`, `fortune.yanogo`, `bientama.pare`, etc.

Voir [SEED-DATABASE.md](SEED-DATABASE.md) pour la liste complète.

## 📱 Fonctionnalités Principales

### Pour Super Admin / Admin

1. **Gestion des projets**
   - Créer des projets
   - Assigner des membres
   - Suivre l'avancement

2. **Gestion de l'équipe**
   - Ajouter/modifier des membres
   - Gérer les rôles et permissions
   - Consulter les performances

3. **Gestion des clients**
   - Créer des clients
   - Suivre les budgets
   - Analyser la satisfaction

4. **Chat projet**
   - Communiquer par projet
   - Notifications automatiques

### Pour Membres

1. **Voir leurs projets assignés**
2. **Créer et gérer leurs tâches**
3. **Participer aux chats projet**
4. **Voir leur dashboard personnel**

## 🔄 Réinitialisation

Si vous voulez repartir de zéro :

```bash
# Tout supprimer et recréer
npx tsx scripts/reset-db.ts
npm run db:push
npm run db:seed
```

## ⚠️ Sécurité

**IMPORTANT :** Après la première connexion, changez immédiatement :
1. Le mot de passe du compte `admin`
2. Le `SESSION_SECRET` dans le fichier `.env`

## 🐛 Dépannage

### MySQL ne démarre pas
- Vérifiez qu'aucun autre service n'utilise le port 3306
- Redémarrez XAMPP

### Erreur "ER_DUP_ENTRY" lors du seed
- La base contient déjà des données
- Utilisez `npx tsx scripts/reset-db.ts` pour réinitialiser

### L'application ne démarre pas
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez le fichier `.env`

## 📚 Documentation Complète

- [SEED-DATABASE.md](SEED-DATABASE.md) - Guide complet du seed
- [CHAT-SYSTEM.md](CHAT-SYSTEM.md) - Documentation du système de chat
- [DEPLOYMENT-CPANEL.md](DEPLOYMENT-CPANEL.md) - Guide de déploiement

## 🆘 Support

Pour toute question, consultez la documentation ou contactez l'équipe de développement.

---

**Bon développement ! 🚀**
