import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, migrationClient } from "./db";

async function main() {
  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./migrations" });

  console.log("Migrations completed!");

  await migrationClient.end();
  
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 