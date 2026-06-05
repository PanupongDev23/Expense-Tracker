"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { budgets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { normalizeMonth } from "@/lib/dates";
import { isDemoUser } from "@/lib/demo-mode";
import { demoGetBudget, demoUpsertBudget } from "@/lib/demo-store";
import { budgetInputSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/domain";

export async function getBudget(monthInput?: string) {
  const user = await requireUser();

  if (isDemoUser(user.id)) {
    return demoGetBudget(monthInput);
  }

  const db = getDb();
  const month = normalizeMonth(monthInput);
  const [budget] = await db
    .select({
      id: budgets.id,
      month: budgets.month,
      amount: budgets.amount
    })
    .from(budgets)
    .where(and(eq(budgets.userId, user.id), eq(budgets.month, month)))
    .limit(1);

  return budget ?? null;
}

export async function upsertBudget(input: unknown): Promise<ActionResult<{ month: string; amount: number }>> {
  const parsed = budgetInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลงบประมาณ",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const saved = demoUpsertBudget(parsed.data);

    revalidatePath("/dashboard");
    revalidatePath("/budget");

    return {
      ok: true,
      data: {
        month: saved.month,
        amount: saved.amount
      },
      message: "บันทึกงบประมาณสำเร็จ"
    };
  }

  const db = getDb();

  const [saved] = await db
    .insert(budgets)
    .values({
      userId: user.id,
      month: parsed.data.month,
      amount: parsed.data.amount
    })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.month],
      set: {
        amount: parsed.data.amount,
        updatedAt: new Date()
      }
    })
    .returning({
      month: budgets.month,
      amount: budgets.amount
    });

  revalidatePath("/dashboard");
  revalidatePath("/budget");

  return {
    ok: true,
    data: saved,
    message: "บันทึกงบประมาณสำเร็จ"
  };
}
