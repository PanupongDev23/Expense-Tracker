export const TRANSACTION_TYPES = ["income", "expense"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type CategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
  userId: string | null;
};

export type TransactionRow = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  transactionDate: string;
  note: string | null;
};

export type BudgetStatus = "not_set" | "within_budget" | "near_limit" | "over_budget";

export type ActionResult<T = undefined> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
