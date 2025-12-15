import { defineConfig } from "drizzle-kit";

// Configuration MySQL pour Jo'Fé Digital - Akili
// Base de données: akili
// User: root
// Password: (empty)

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? undefined,
    database: process.env.DB_NAME || "akili",
  },
  verbose: true,
  strict: true,
});
