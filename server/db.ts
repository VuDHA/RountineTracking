import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

const url = 'postgresql://postgres:1@localhost:5432/habit';

if (!url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Simplified connection - always use node-postgres
const pgPool = new pg.Pool({
  connectionString: url,
  ssl: false, // Disable SSL for local connections
  password: '1'
});

const db: NodePgDatabase<typeof schema> = drizzle(pgPool, { schema });
console.log("Using PostgreSQL connection with Drizzle ORM");

export { db };
