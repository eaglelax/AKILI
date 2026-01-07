import mysql from 'mysql2/promise';

async function resetDatabase() {
  console.log('🗑️  Réinitialisation de la base de données...');
  console.log('');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'akili',
  };

  console.log('📦 Configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log('');

  try {
    // Connexion sans spécifier la base de données
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log('🔗 Connexion établie');

    // Supprimer la base de données si elle existe
    console.log(`🗑️  Suppression de la base de données "${dbConfig.database}"...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);
    console.log('✅ Base de données supprimée');

    // Recréer la base de données
    console.log(`📁 Création de la base de données "${dbConfig.database}"...`);
    await connection.query(
      `CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ Base de données créée');
    console.log('');

    await connection.end();

    console.log('🎉 Réinitialisation réussie!');
    console.log('');
    console.log('Prochaines étapes:');
    console.log('  1. Exécutez "npm run db:migrate" pour créer les tables');
    console.log('  2. Exécutez "npm run db:seed" pour insérer les données initiales');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetDatabase();
