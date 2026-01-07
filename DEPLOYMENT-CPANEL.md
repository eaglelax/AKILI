# Guide de Déploiement AKILI sur cPanel

## Prérequis
- Node.js 20.x configuré sur cPanel
- Base de données MySQL créée sur cPanel
- Accès FTP ou File Manager

---

## Étape 1: Préparer le Build Local

Exécutez ces commandes sur votre machine locale:

```bash
# Installer les dépendances
npm install

# Créer le build de production
npm run build
```

Cela crée le dossier `dist/` contenant:
- `dist/index.js` - Serveur compilé
- `dist/public/` - Assets frontend

---

## Étape 2: Créer la Base de Données MySQL sur cPanel

1. Allez dans **cPanel > MySQL Databases**
2. Créez une nouvelle base de données (ex: `jofedigi_akili`)
3. Créez un nouvel utilisateur (ex: `jofedigi_akili`)
4. Assignez l'utilisateur à la base avec **ALL PRIVILEGES**
5. Notez les identifiants

---

## Étape 3: Fichiers à Uploader sur cPanel

Uploadez ces fichiers dans `public_html/akili/`:

```
akili/
├── dist/                    ← TOUT le dossier dist
│   ├── index.js
│   └── public/
│       ├── index.html
│       └── assets/
├── app.js                   ← Point d'entrée Passenger
├── package.json
├── package-lock.json
├── .htaccess
└── .env                     ← Créez-le à partir de .env.production
```

**IMPORTANT**: Ne pas uploader `node_modules` - on le génère sur le serveur.

---

## Étape 4: Configurer le fichier .env sur le Serveur

Créez un fichier `.env` dans `public_html/akili/` avec:

```env
# Base de données MySQL cPanel
DB_HOST=localhost
DB_PORT=3306
DB_USER=jofedigi_akili
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL
DB_NAME=jofedigi_akili

# Session
SESSION_SECRET=une-cle-secrete-longue-et-aleatoire

# Mots de passe admin
ADMIN_PASSWORD_SERGE=VotreMotDePasse1
ADMIN_PASSWORD_ENOS=VotreMotDePasse2
DEFAULT_MEMBER_PASSWORD=MotDePasseMembre

# Production
NODE_ENV=production
PORT=3000
```

---

## Étape 5: Configuration cPanel Node.js

1. Allez dans **cPanel > Setup Node.js App**
2. Cliquez sur **Create Application**
3. Configurez:
   - **Node.js version**: 20.x.x
   - **Application mode**: Production
   - **Application root**: public_html/akili
   - **Application URL**: akili.jofedigital.com (ou votre domaine)
   - **Application startup file**: `app.js`

4. Cliquez **Create**

---

## Étape 6: Installer les Dépendances sur le Serveur

1. Dans la page Node.js App, cliquez sur **Run NPM Install**
   OU
2. Utilisez le Terminal cPanel:
   ```bash
   cd ~/public_html/akili
   source /home/jofedigi/nodevenv/public_html/akili/20/bin/activate
   npm install --production
   ```

---

## Étape 7: Initialiser la Base de Données

Dans le Terminal cPanel:

```bash
cd ~/public_html/akili
source /home/jofedigi/nodevenv/public_html/akili/20/bin/activate
npm run db:migrate
npm run db:seed
```

---

## Étape 8: Démarrer l'Application

1. Retournez dans **cPanel > Setup Node.js App**
2. Cliquez sur **Restart** pour redémarrer l'application

---

## Dépannage

### Erreur "Something went wrong"
- Vérifiez les logs: **cPanel > Errors** ou le fichier `stderr.log`
- Vérifiez que `.env` existe avec les bonnes valeurs
- Vérifiez que `dist/` contient les fichiers

### Erreur de connexion MySQL
- Vérifiez les identifiants dans `.env`
- Vérifiez que l'utilisateur a les privilèges sur la base

### Page blanche
- Vérifiez que `dist/public/index.html` existe
- Vérifiez les logs pour des erreurs

### Voir les logs
```bash
cd ~/public_html/akili
cat stderr.log
```

---

## Structure Finale sur le Serveur

```
public_html/akili/
├── app.js
├── dist/
│   ├── index.js
│   └── public/
│       ├── index.html
│       └── assets/
├── node_modules/
├── package.json
├── package-lock.json
├── .htaccess
└── .env
```
