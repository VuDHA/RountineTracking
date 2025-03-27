import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

// Try environment variable first, fallback to local hardcoded value if needed
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1@localhost:5432/habit';

console.log("Connecting to database using:", connectionString);

// Break down the connection parameters explicitly
let pgConfig: pg.PoolConfig;

// For local development in Windows environments
if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
  // Parse the connection string manually for better control
  try {
    const url = new URL(connectionString);
    pgConfig = {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.substring(1), // Remove leading /
      user: url.username || 'postgres',
      password: url.password || '1',
      ssl: false
    };
  } catch (err) {
    console.error("Failed to parse connection string, using direct config:", err);
    pgConfig = {
      host: 'localhost',
      port: 5432,
      database: 'habit',
      user: 'postgres',
      password: '1',
      ssl: false
    };
  }
} else {
  // For remote or production databases, use the connection string as-is
  pgConfig = {
    connectionString,
    ssl: false // Adjust as needed
  };
}

console.log("PostgreSQL configuration:", {
  host: pgConfig.host,
  port: pgConfig.port,
  database: pgConfig.database,
  user: pgConfig.user,
  // Don't log the actual password
  password: pgConfig.password ? '******' : undefined
});

const pgPool = new pg.Pool(pgConfig);
const db: NodePgDatabase<typeof schema> = drizzle(pgPool, { schema });
console.log("Using PostgreSQL connection with Drizzle ORM");

export { db };
