import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema';

// ============================================
// Script de Migration MySQL - Akili
// ============================================

async function runMigration() {
  console.log('🚀 Démarrage de la migration...');
  console.log('');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'akili',
    multipleStatements: true,
  };

  console.log('📦 Configuration de la base de données:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log('');

  try {
    // Créer la base de données si elle n'existe pas
    console.log('📁 Création de la base de données si nécessaire...');
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConnection.end();
    console.log('✅ Base de données prête');
    console.log('');

    // Connexion à la base de données
    console.log('🔗 Connexion à la base de données...');
    const connection = await mysql.createConnection(dbConfig);
    const db = drizzle(connection, { schema, mode: 'default' });
    console.log('✅ Connexion établie');
    console.log('');

    // Exécuter les migrations
    console.log('📋 Exécution des migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations terminées');
    console.log('');

    await connection.end();

    console.log('🎉 Migration réussie!');
    console.log('');
    console.log('Prochaines étapes:');
    console.log('  1. Exécutez "npm run db:seed" pour insérer les données initiales');
    console.log('  2. Démarrez le serveur avec "npm run dev"');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration();
