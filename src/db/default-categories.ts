import type { TransactionType } from "@/types/domain";

export const DEFAULT_CATEGORIES: Array<{ name: string; type: TransactionType }> = [
  { name: "Food", type: "expense" },
  { name: "Transport", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Bills", type: "expense" },
  { name: "Health", type: "expense" },
  { name: "Other", type: "expense" },
  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
  { name: "Bonus", type: "income" },
  { name: "Other", type: "income" }
];
