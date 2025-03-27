import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import * as schema from "@shared/schema";

// This function pushes the schema directly to the database (no migrations)
export async function pushSchema() {
  console.log("Starting schema push...");
  
  // Use standard node-postgres for the connection
  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Disable SSL for local connections
  });
  
  // Create a direct connection to the database
  const db = drizzle(pgPool, { schema });
  
  try {
    // Create tables based on schema
    await pgPool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Habits table
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        user_id INTEGER REFERENCES users(id),
        frequency VARCHAR(20) NOT NULL,
        reminder_time VARCHAR(5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Habit Completions table
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        completed_at TIMESTAMP NOT NULL,
        completed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- User session table (for connect-pg-simple)
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid VARCHAR NOT NULL,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT user_sessions_pkey PRIMARY KEY (sid)
      );
      CREATE INDEX IF NOT EXISTS IDX_user_sessions_expire ON user_sessions (expire);
    `);
    
    console.log("Schema push completed successfully");
  } catch (error) {
    console.error("Schema push failed:", error);
  } finally {
    await pgPool.end();
  }
}