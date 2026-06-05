import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DbClient | null = null;
let cachedSql: postgres.Sql | null = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Create a Neon database, copy .env.example to .env.local, and set DATABASE_URL."
    );
  }

  cachedSql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: "require"
  });
  cachedDb = drizzle(cachedSql, { schema });

  return cachedDb;
}

export async function closeDbConnection() {
  if (cachedSql) {
    await cachedSql.end();
    cachedSql = null;
    cachedDb = null;
  }
}
