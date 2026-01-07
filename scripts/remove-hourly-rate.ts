import mysql from 'mysql2/promise';

/**
 * Script pour supprimer la colonne hourly_rate de la table team_members
 */

async function removeHourlyRate() {
  console.log('🔧 Suppression de la colonne hourly_rate...');
  console.log('');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'akili',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('📦 Configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log('');

    // Vérifier si la colonne existe
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM team_members LIKE 'hourly_rate'`
    );

    if (Array.isArray(columns) && columns.length > 0) {
      console.log('🗑️  Suppression de la colonne hourly_rate de team_members...');
      await connection.query('ALTER TABLE team_members DROP COLUMN hourly_rate');
      console.log('✅ Colonne hourly_rate supprimée avec succès');
    } else {
      console.log('ℹ️  La colonne hourly_rate n\'existe pas ou a déjà été supprimée');
    }

    await connection.end();

    console.log('');
    console.log('🎉 Migration terminée avec succès!');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

removeHourlyRate();
