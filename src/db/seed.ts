import { and, eq, isNull } from "drizzle-orm";
import { config } from "dotenv";

import { DEFAULT_CATEGORIES } from "@/db/default-categories";
import { closeDbConnection, getDb } from "@/db";
import { categories } from "@/db/schema";

config({ path: ".env.local" });
config();

async function seed() {
  const db = getDb();

  for (const category of DEFAULT_CATEGORIES) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          isNull(categories.userId),
          eq(categories.name, category.name),
          eq(categories.type, category.type)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(categories).values(category);
    }
  }
}

seed()
  .then(async () => {
    await closeDbConnection();
    console.log("Default categories seeded.");
  })
  .catch(async (error) => {
    await closeDbConnection();
    console.error(error);
    process.exit(1);
  });
