import { describe, expect, it } from "vitest";

import { getBudgetStatus, summarizeTransactions } from "@/lib/dashboard";
import { transactionInputSchema } from "@/lib/validators";

describe("budget status", () => {
  it("handles missing, within, near, and over budget states", () => {
    expect(getBudgetStatus(100, null)).toBe("not_set");
    expect(getBudgetStatus(799, 1000)).toBe("within_budget");
    expect(getBudgetStatus(800, 1000)).toBe("near_limit");
    expect(getBudgetStatus(1000, 1000)).toBe("near_limit");
    expect(getBudgetStatus(1001, 1000)).toBe("over_budget");
  });
});

describe("dashboard summaries", () => {
  it("calculates totals and category breakdowns", () => {
    const summary = summarizeTransactions([
      {
        id: "1",
        type: "income",
        amount: 30000,
        categoryId: "salary",
        categoryName: "Salary",
        transactionDate: "2026-06-01",
        note: null
      },
      {
        id: "2",
        type: "expense",
        amount: 250,
        categoryId: "food",
        categoryName: "Food",
        transactionDate: "2026-06-02",
        note: null
      },
      {
        id: "3",
        type: "expense",
        amount: 80,
        categoryId: "transport",
        categoryName: "Transport",
        transactionDate: "2026-06-02",
        note: null
      }
    ]);

    expect(summary.totalIncome).toBe(30000);
    expect(summary.totalExpense).toBe(330);
    expect(summary.balance).toBe(29670);
    expect(summary.expenseBreakdown).toEqual([
      { name: "Food", amount: 250 },
      { name: "Transport", amount: 80 }
    ]);
  });
});

describe("transaction validation", () => {
  it("rejects zero or negative amounts", () => {
    const parsed = transactionInputSchema.safeParse({
      type: "expense",
      amount: 0,
      categoryId: "00000000-0000-0000-0000-000000000000",
      transactionDate: "2026-06-05",
      note: ""
    });

    expect(parsed.success).toBe(false);
  });
});
