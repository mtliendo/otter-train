import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

config({ path: ".env.local" });
config({ path: ".env" });

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

export type AppDb = ReturnType<typeof createDb>;

function createDb() {
  return drizzle(neon(requireDatabaseUrl()), { schema });
}

let dbInstance: AppDb | undefined;

export function getDb() {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}
