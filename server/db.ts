import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

// Check if we're running locally (based on DATABASE_URL format)
const isLocal = process.env.DATABASE_URL?.startsWith('postgres://') || process.env.DATABASE_URL?.startsWith('postgresql://');

// For Neon serverless connections
if (!isLocal) {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: NodePgDatabase<typeof schema> | any;

if (isLocal) {
  // Use standard node-postgres for local development
  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Disable SSL for local connections
  });
  
  db = drizzlePg(pgPool, { schema });
  console.log("Using direct PostgreSQL connection for local development");
} else {
  // Use Neon serverless for production
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log("Using Neon serverless connection for production");
}

export { db };
