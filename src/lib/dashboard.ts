import type { BudgetStatus, TransactionRow } from "@/types/domain";

export function getBudgetStatus(expense: number, budgetAmount: number | null | undefined): BudgetStatus {
  if (!budgetAmount || budgetAmount <= 0) {
    return "not_set";
  }

  const usage = expense / budgetAmount;

  if (usage < 0.8) {
    return "within_budget";
  }

  if (usage <= 1) {
    return "near_limit";
  }

  return "over_budget";
}

export function getBudgetStatusLabel(status: BudgetStatus) {
  const labels: Record<BudgetStatus, string> = {
    not_set: "ยังไม่ได้ตั้งงบ",
    within_budget: "อยู่ในงบ",
    near_limit: "ใกล้ถึงงบ",
    over_budget: "เกินงบ"
  };

  return labels[status];
}

export function summarizeTransactions(transactions: TransactionRow[]) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenseByCategory = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((accumulator, transaction) => {
      accumulator[transaction.categoryName] = (accumulator[transaction.categoryName] ?? 0) + transaction.amount;
      return accumulator;
    }, {});

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expenseBreakdown: Object.entries(expenseByCategory).map(([name, amount]) => ({ name, amount }))
  };
}
