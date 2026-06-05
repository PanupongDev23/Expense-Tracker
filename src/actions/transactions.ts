"use server";

import { and, desc, eq, gte, isNull, lt, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { categories, transactions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { monthBounds, normalizeMonth } from "@/lib/dates";
import { isDemoUser } from "@/lib/demo-mode";
import {
  demoCreateTransaction,
  demoDeleteTransaction,
  demoGetTransaction,
  demoListTransactions,
  demoUpdateTransaction
} from "@/lib/demo-store";
import { idSchema, transactionInputSchema, transactionTypeSchema } from "@/lib/validators";
import type { ActionResult, TransactionRow, TransactionType } from "@/types/domain";

async function ensureCategoryAccess(categoryId: string, type: TransactionType, userId: string) {
  const db = getDb();
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.type, type),
        or(isNull(categories.userId), eq(categories.userId, userId))
      )
    )
    .limit(1);

  return category;
}

export async function createTransaction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = transactionInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลรายการ",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const created = demoCreateTransaction({
      type: parsed.data.type,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      transactionDate: parsed.data.transactionDate,
      note: parsed.data.note ?? null
    });

    if (!created) {
      return {
        ok: false,
        message: "หมวดหมู่ไม่ตรงกับประเภทรายการ"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budget");

    return {
      ok: true,
      data: { id: created.id },
      message: "บันทึกรายการสำเร็จ"
    };
  }

  const db = getDb();
  const category = await ensureCategoryAccess(parsed.data.categoryId, parsed.data.type, user.id);

  if (!category) {
    return {
      ok: false,
      message: "หมวดหมู่ไม่ตรงกับประเภทรายการ"
    };
  }

  const [created] = await db
    .insert(transactions)
    .values({
      userId: user.id,
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      transactionDate: parsed.data.transactionDate,
      note: parsed.data.note ?? null
    })
    .returning({ id: transactions.id });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");

  return {
    ok: true,
    data: created,
    message: "บันทึกรายการสำเร็จ"
  };
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsedId = idSchema.safeParse(id);
  const parsed = transactionInputSchema.safeParse(input);

  if (!parsedId.success || !parsed.success) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลรายการ",
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const updated = demoUpdateTransaction(parsedId.data, {
      type: parsed.data.type,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      transactionDate: parsed.data.transactionDate,
      note: parsed.data.note ?? null
    });

    if (!updated) {
      return {
        ok: false,
        message: "ไม่พบรายการที่ต้องการแก้ไข"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budget");

    return {
      ok: true,
      data: { id: updated.id },
      message: "แก้ไขรายการสำเร็จ"
    };
  }

  const db = getDb();
  const category = await ensureCategoryAccess(parsed.data.categoryId, parsed.data.type, user.id);

  if (!category) {
    return {
      ok: false,
      message: "หมวดหมู่ไม่ตรงกับประเภทรายการ"
    };
  }

  const [updated] = await db
    .update(transactions)
    .set({
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      transactionDate: parsed.data.transactionDate,
      note: parsed.data.note ?? null,
      updatedAt: new Date()
    })
    .where(and(eq(transactions.id, parsedId.data), eq(transactions.userId, user.id)))
    .returning({ id: transactions.id });

  if (!updated) {
    return {
      ok: false,
      message: "ไม่พบรายการที่ต้องการแก้ไข"
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");

  return {
    ok: true,
    data: updated,
    message: "แก้ไขรายการสำเร็จ"
  };
}

export async function deleteTransaction(id: string): Promise<ActionResult<{ id: string }>> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return {
      ok: false,
      message: "รหัสรายการไม่ถูกต้อง"
    };
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const deleted = demoDeleteTransaction(parsedId.data);

    if (!deleted) {
      return {
        ok: false,
        message: "ไม่พบรายการที่ต้องการลบ"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budget");

    return {
      ok: true,
      data: { id: deleted.id },
      message: "ลบรายการสำเร็จ"
    };
  }

  const db = getDb();
  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, parsedId.data), eq(transactions.userId, user.id)))
    .returning({ id: transactions.id });

  if (!deleted) {
    return {
      ok: false,
      message: "ไม่พบรายการที่ต้องการลบ"
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");

  return {
    ok: true,
    data: deleted,
    message: "ลบรายการสำเร็จ"
  };
}

type ListTransactionInput = {
  month?: string;
  type?: TransactionType | "all";
  categoryId?: string;
};

export async function listTransactions(input: ListTransactionInput = {}): Promise<TransactionRow[]> {
  const user = await requireUser();

  if (isDemoUser(user.id)) {
    return demoListTransactions(input);
  }

  const db = getDb();
  const month = normalizeMonth(input.month);
  const { start, end } = monthBounds(month);
  const conditions = [
    eq(transactions.userId, user.id),
    gte(transactions.transactionDate, start),
    lt(transactions.transactionDate, end)
  ];

  if (input.type && input.type !== "all") {
    conditions.push(eq(transactions.type, input.type));
  }

  if (input.categoryId) {
    conditions.push(eq(transactions.categoryId, input.categoryId));
  }

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      transactionDate: transactions.transactionDate,
      note: transactions.note
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));

  return rows.map((row) => ({
    ...row,
    type: transactionTypeSchema.parse(row.type)
  }));
}

export async function getTransactionForEdit(id: string): Promise<TransactionRow> {
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const user = await requireUser();

  if (isDemoUser(user.id)) {
    const transaction = demoGetTransaction(parsedId.data);

    if (!transaction) {
      notFound();
    }

    return transaction;
  }

  const db = getDb();
  const [row] = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      transactionDate: transactions.transactionDate,
      note: transactions.note
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.id, parsedId.data), eq(transactions.userId, user.id)))
    .limit(1);

  if (!row) {
    notFound();
  }

  return {
    ...row,
    type: transactionTypeSchema.parse(row.type)
  };
}
