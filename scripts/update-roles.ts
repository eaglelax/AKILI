import mysql from 'mysql2/promise';

async function updateRoles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || 'akili',
  });

  console.log('Mise à jour des rôles utilisateurs...');

  // Serge ASSALÉ = super_admin
  await connection.execute(
    "UPDATE team_members SET user_role = 'super_admin' WHERE username = 'serge.assale'"
  );
  console.log('✅ serge.assale -> super_admin');

  // Enos GOUBA = admin
  await connection.execute(
    "UPDATE team_members SET user_role = 'admin' WHERE username = 'enos.gouba'"
  );
  console.log('✅ enos.gouba -> admin');

  // Vérification
  const [rows] = await connection.execute(
    "SELECT username, name, user_role FROM team_members ORDER BY FIELD(user_role, 'super_admin', 'admin', 'member')"
  );
  console.log('\nListe des utilisateurs:');
  console.table(rows);

  await connection.end();
  console.log('\n🎉 Mise à jour terminée!');
}

updateRoles().catch(console.error);
