"use server";

import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isDemoUser } from "@/lib/demo-mode";
import { demoCreateCategory, demoListCategories } from "@/lib/demo-store";
import { categoryInputSchema, transactionTypeSchema } from "@/lib/validators";
import type { ActionResult, CategoryOption, TransactionType } from "@/types/domain";

export async function listCategories(type?: TransactionType): Promise<CategoryOption[]> {
  const user = await requireUser();

  if (isDemoUser(user.id)) {
    return demoListCategories(type);
  }

  const db = getDb();

  const conditions = [or(isNull(categories.userId), eq(categories.userId, user.id))];

  if (type) {
    conditions.push(eq(categories.type, type));
  }

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      userId: categories.userId
    })
    .from(categories)
    .where(and(...conditions))
    .orderBy(asc(categories.type), asc(categories.name));

  return rows.map((row) => ({
    ...row,
    type: transactionTypeSchema.parse(row.type)
  }));
}

export async function createCategory(input: unknown): Promise<ActionResult<CategoryOption>> {
  const parsed = categoryInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลหมวดหมู่",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const created = demoCreateCategory(parsed.data);

    if (!created) {
      return {
        ok: false,
        message: "มีหมวดหมู่นี้อยู่แล้ว"
      };
    }

    revalidatePath("/settings");
    revalidatePath("/transactions");
    revalidatePath("/transactions/new");

    return {
      ok: true,
      data: created,
      message: "เพิ่มหมวดหมู่สำเร็จ"
    };
  }

  const db = getDb();
  const { name, type } = parsed.data;

  const duplicate = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.type, type),
        or(isNull(categories.userId), eq(categories.userId, user.id)),
        sql`lower(${categories.name}) = lower(${name})`
      )
    )
    .limit(1);

  if (duplicate.length > 0) {
    return {
      ok: false,
      message: "มีหมวดหมู่นี้อยู่แล้ว"
    };
  }

  const [created] = await db
    .insert(categories)
    .values({
      userId: user.id,
      name,
      type
    })
    .returning({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      userId: categories.userId
    });

  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/transactions/new");

  return {
    ok: true,
    data: {
      ...created,
      type: transactionTypeSchema.parse(created.type)
    },
    message: "เพิ่มหมวดหมู่สำเร็จ"
  };
}
