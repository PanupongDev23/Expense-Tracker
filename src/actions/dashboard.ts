"use server";

import { and, desc, eq, gte, lt } from "drizzle-orm";

import { getBudget } from "@/actions/budgets";
import { getDb } from "@/db";
import { categories, transactions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getBudgetStatus, summarizeTransactions } from "@/lib/dashboard";
import { isDemoUser } from "@/lib/demo-mode";
import { demoDashboardSummary } from "@/lib/demo-store";
import { monthBounds, normalizeMonth } from "@/lib/dates";
import { transactionTypeSchema } from "@/lib/validators";
import type { TransactionRow } from "@/types/domain";

export async function getDashboardSummary(monthInput?: string) {
  const user = await requireUser();

  if (isDemoUser(user.id)) {
    return demoDashboardSummary(monthInput);
  }

  const db = getDb();
  const month = normalizeMonth(monthInput);
  const { start, end } = monthBounds(month);

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
    .where(
      and(
        eq(transactions.userId, user.id),
        gte(transactions.transactionDate, start),
        lt(transactions.transactionDate, end)
      )
    )
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));

  const transactionRows: TransactionRow[] = rows.map((row) => ({
    ...row,
    type: transactionTypeSchema.parse(row.type)
  }));
  const summary = summarizeTransactions(transactionRows);
  const budget = await getBudget(month);
  const budgetStatus = getBudgetStatus(summary.totalExpense, budget?.amount);

  return {
    month,
    ...summary,
    recentTransactions: transactionRows.slice(0, 5),
    budget: budget
      ? {
          amount: budget.amount,
          usage: budget.amount > 0 ? summary.totalExpense / budget.amount : 0,
          status: budgetStatus
        }
      : {
          amount: null,
          usage: 0,
          status: budgetStatus
        }
  };
}
