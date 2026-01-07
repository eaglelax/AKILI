import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'akili',
};

async function resetDatabase() {
  console.log('🗑️  Réinitialisation de la base de données...\n');

  const connection = await mysql.createConnection(dbConfig);

  try {
    // Désactiver les contraintes de clés étrangères temporairement
    console.log('🔓 Désactivation des contraintes de clés étrangères...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Récupérer toutes les tables
    const [rows] = await connection.query<any[]>('SHOW TABLES');
    const tables = rows.map((row: any) => Object.values(row)[0] as string);

    if (tables.length === 0) {
      console.log('ℹ️  Aucune table à supprimer');
    } else {
      console.log(`🗑️  Suppression de ${tables.length} tables...`);
      for (const table of tables) {
        console.log(`   - Suppression de ${table}`);
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
    }

    // Réactiver les contraintes de clés étrangères
    console.log('🔒 Réactivation des contraintes de clés étrangères...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ Base de données réinitialisée avec succès!\n');

    // Maintenant, exécuter les migrations
    console.log('📋 Exécution des migrations...');
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: './migrations' });

    console.log('\n✅ Toutes les tables ont été créées avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

resetDatabase().catch(console.error);
