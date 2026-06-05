import { DEFAULT_CATEGORIES } from "@/db/default-categories";
import { getBudgetStatus, summarizeTransactions } from "@/lib/dashboard";
import { DEMO_USER_ID } from "@/lib/demo-mode";
import { monthBounds, normalizeMonth } from "@/lib/dates";
import type { CategoryOption, TransactionRow, TransactionType } from "@/types/domain";

type DemoBudget = {
  id: string;
  userId: string;
  month: string;
  amount: number;
};

type DemoStore = {
  categories: CategoryOption[];
  transactions: TransactionRow[];
  budgets: DemoBudget[];
};

declare global {
  var __expenseTrackerDemoStore: DemoStore | undefined;
}

function newId() {
  return crypto.randomUUID();
}

function makeCategoryId(name: string, type: TransactionType) {
  return `demo-${type}-${name.toLowerCase().replaceAll(" ", "-")}`;
}

function createInitialStore(): DemoStore {
  const categories = DEFAULT_CATEGORIES.map((category) => ({
    id: makeCategoryId(category.name, category.type),
    name: category.name,
    type: category.type,
    userId: null
  }));

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  const catId = (name: string, type: TransactionType) => makeCategoryId(name, type);

  const transactions: TransactionRow[] = [
    // Current month
    { id: "demo-t-01", type: "income",  categoryId: catId("Salary", "income"),    categoryName: "Salary",    amount: 50000, note: "Monthly salary",    transactionDate: `${currentMonth}-01` },
    { id: "demo-t-02", type: "expense", categoryId: catId("Food", "expense"),     categoryName: "Food",      amount: 350,   note: "Lunch",              transactionDate: `${currentMonth}-02` },
    { id: "demo-t-03", type: "expense", categoryId: catId("Transport", "expense"),categoryName: "Transport", amount: 120,   note: "BTS monthly pass",   transactionDate: `${currentMonth}-03` },
    { id: "demo-t-04", type: "expense", categoryId: catId("Shopping", "expense"), categoryName: "Shopping",  amount: 1800,  note: "Clothes",            transactionDate: `${currentMonth}-05` },
    { id: "demo-t-05", type: "expense", categoryId: catId("Bills", "expense"),    categoryName: "Bills",     amount: 2200,  note: "Electricity & water",transactionDate: `${currentMonth}-07` },
    { id: "demo-t-06", type: "expense", categoryId: catId("Food", "expense"),     categoryName: "Food",      amount: 420,   note: "Dinner with friends",transactionDate: `${currentMonth}-08` },
    { id: "demo-t-07", type: "income",  categoryId: catId("Freelance", "income"), categoryName: "Freelance", amount: 8000,  note: "Web project",        transactionDate: `${currentMonth}-10` },
    { id: "demo-t-08", type: "expense", categoryId: catId("Health", "expense"),   categoryName: "Health",    amount: 650,   note: "Gym membership",     transactionDate: `${currentMonth}-12` },
    { id: "demo-t-09", type: "expense", categoryId: catId("Food", "expense"),     categoryName: "Food",      amount: 280,   note: "Groceries",          transactionDate: `${currentMonth}-14` },
    { id: "demo-t-10", type: "expense", categoryId: catId("Other", "expense"),    categoryName: "Other",     amount: 500,   note: "Miscellaneous",      transactionDate: `${currentMonth}-15` },
    // Previous month
    { id: "demo-t-11", type: "income",  categoryId: catId("Salary", "income"),    categoryName: "Salary",    amount: 50000, note: "Monthly salary",    transactionDate: `${prevMonth}-01` },
    { id: "demo-t-12", type: "expense", categoryId: catId("Food", "expense"),     categoryName: "Food",      amount: 8500,  note: "Food (whole month)", transactionDate: `${prevMonth}-15` },
    { id: "demo-t-13", type: "expense", categoryId: catId("Transport", "expense"),categoryName: "Transport", amount: 2400,  note: "Transport",          transactionDate: `${prevMonth}-15` },
    { id: "demo-t-14", type: "expense", categoryId: catId("Bills", "expense"),    categoryName: "Bills",     amount: 2100,  note: "Utilities",          transactionDate: `${prevMonth}-16` },
    { id: "demo-t-15", type: "income",  categoryId: catId("Bonus", "income"),     categoryName: "Bonus",     amount: 5000,  note: "Performance bonus",  transactionDate: `${prevMonth}-20` },
    { id: "demo-t-16", type: "expense", categoryId: catId("Shopping", "expense"), categoryName: "Shopping",  amount: 3200,  note: "Electronics",        transactionDate: `${prevMonth}-22` },
  ];

  const budgets = [
    { id: "demo-b-01", userId: DEMO_USER_ID, month: currentMonth, amount: 25000 },
    { id: "demo-b-02", userId: DEMO_USER_ID, month: prevMonth,    amount: 25000 },
  ];

  return { categories, transactions, budgets };
}

function getStore() {
  globalThis.__expenseTrackerDemoStore ??= createInitialStore();

  return globalThis.__expenseTrackerDemoStore;
}

export function demoListCategories(type?: TransactionType) {
  const store = getStore();

  return store.categories
    .filter((category) => (type ? category.type === type : true))
    .sort((a, b) => `${a.type}-${a.name}`.localeCompare(`${b.type}-${b.name}`));
}

export function demoCreateCategory(input: { name: string; type: TransactionType }) {
  const store = getStore();
  const duplicate = store.categories.some(
    (category) => category.type === input.type && category.name.toLowerCase() === input.name.toLowerCase()
  );

  if (duplicate) {
    return null;
  }

  const category: CategoryOption = {
    id: newId(),
    name: input.name,
    type: input.type,
    userId: DEMO_USER_ID
  };

  store.categories.push(category);

  return category;
}

export function demoCategoryMatches(categoryId: string, type: TransactionType) {
  return getStore().categories.some((category) => category.id === categoryId && category.type === type);
}

export function demoCreateTransaction(input: Omit<TransactionRow, "id" | "categoryName">) {
  const store = getStore();
  const category = store.categories.find((item) => item.id === input.categoryId && item.type === input.type);

  if (!category) {
    return null;
  }

  const transaction: TransactionRow = {
    ...input,
    id: newId(),
    categoryName: category.name
  };

  store.transactions.unshift(transaction);

  return transaction;
}

export function demoUpdateTransaction(id: string, input: Omit<TransactionRow, "id" | "categoryName">) {
  const store = getStore();
  const category = store.categories.find((item) => item.id === input.categoryId && item.type === input.type);
  const index = store.transactions.findIndex((transaction) => transaction.id === id);

  if (!category || index === -1) {
    return null;
  }

  const transaction: TransactionRow = {
    ...input,
    id,
    categoryName: category.name
  };

  store.transactions[index] = transaction;

  return transaction;
}

export function demoDeleteTransaction(id: string) {
  const store = getStore();
  const index = store.transactions.findIndex((transaction) => transaction.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = store.transactions.splice(index, 1);

  return deleted;
}

export function demoListTransactions(input: {
  month?: string;
  type?: TransactionType | "all";
  categoryId?: string;
}) {
  const month = normalizeMonth(input.month);
  const { start, end } = monthBounds(month);

  return getStore()
    .transactions.filter((transaction) => {
      const inMonth = transaction.transactionDate >= start && transaction.transactionDate < end;
      const matchesType = input.type && input.type !== "all" ? transaction.type === input.type : true;
      const matchesCategory = input.categoryId ? transaction.categoryId === input.categoryId : true;

      return inMonth && matchesType && matchesCategory;
    })
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
}

export function demoGetTransaction(id: string) {
  return getStore().transactions.find((transaction) => transaction.id === id) ?? null;
}

export function demoGetBudget(monthInput?: string) {
  const month = normalizeMonth(monthInput);

  return getStore().budgets.find((budget) => budget.month === month) ?? null;
}

export function demoUpsertBudget(input: { month: string; amount: number }) {
  const store = getStore();
  const existing = store.budgets.find((budget) => budget.month === input.month);

  if (existing) {
    existing.amount = input.amount;
    return existing;
  }

  const budget = {
    id: newId(),
    userId: DEMO_USER_ID,
    month: input.month,
    amount: input.amount
  };

  store.budgets.push(budget);

  return budget;
}

export function demoDashboardSummary(monthInput?: string) {
  const month = normalizeMonth(monthInput);
  const transactions = demoListTransactions({ month });
  const summary = summarizeTransactions(transactions);
  const budget = demoGetBudget(month);
  const budgetStatus = getBudgetStatus(summary.totalExpense, budget?.amount);

  return {
    month,
    ...summary,
    recentTransactions: transactions.slice(0, 5),
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
