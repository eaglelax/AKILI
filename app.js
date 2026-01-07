/**
 * Point d'entrée pour Phusion Passenger (cPanel)
 * Fichier d'entrée ESM pour le déploiement
 */

// Forcer le mode production
process.env.NODE_ENV = 'production';

// Charger le serveur compilé
import('./dist/index.js').catch(err => {
  console.error('Erreur de chargement du serveur:', err);
  process.exit(1);
});
