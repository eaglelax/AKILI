import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'akili',
};

async function checkTables() {
  console.log('🔍 Vérification des tables existantes...\n');

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.query<any[]>('SHOW TABLES');

    const expectedTables = [
      'sessions',
      'users',
      'team_members',
      'clients',
      'projects',
      'project_members',
      'tasks',
      'time_entries',
      'chat_channels',
      'channel_members',
      'chat_messages',
      'notifications',
      'performance_metrics',
      'activity_logs',
      'permissions',
      'project_files',
      'settings',
    ];

    const existingTables = rows.map((row: any) => Object.values(row)[0] as string);

    console.log(`✅ Tables existantes (${existingTables.length}):`);
    existingTables.forEach(table => console.log(`   - ${table}`));

    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log(`\n❌ Tables manquantes (${missingTables.length}):`);
      missingTables.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('\n✅ Toutes les tables sont présentes!');
    }

  } finally {
    await connection.end();
  }
}

checkTables().catch(console.error);
