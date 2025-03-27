import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Simplified connection - always use node-postgres
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local connections
});

const db: NodePgDatabase<typeof schema> = drizzle(pgPool, { schema });
console.log("Using PostgreSQL connection with Drizzle ORM");

export { db };
