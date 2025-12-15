import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Configuration MySQL pour Jo'Fé Digital - Akili
// Supporte les connexions avec ou sans mot de passe

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined, // Pas de mot de passe en local
  database: process.env.DB_NAME || 'akili',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Créer le pool de connexions MySQL
export const connection = mysql.createPool(dbConfig);
export const db = drizzle(connection, { schema, mode: 'default' });
