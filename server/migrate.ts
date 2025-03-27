import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool } from "@neondatabase/serverless";

// This script will run all pending migrations
// It is meant to be run after deployment to apply any pending migrations
async function main() {
  console.log("Starting database migration...");
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  console.log("Connected to database. Running migrations...");
  
  // This will automatically run needed migrations
  await migrate(db, { migrationsFolder: "./migrations" });
  
  console.log("Migrations completed successfully");
  
  await pool.end();
}

main().catch((e) => {
  console.error("Migration failed:");
  console.error(e);
  process.exit(1);
});