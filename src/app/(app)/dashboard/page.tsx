import Link from "next/link";
import { Plus, WalletCards } from "lucide-react";

import { getDashboardSummary } from "@/actions/dashboard";
import { BudgetStatusCard } from "@/components/budget/budget-status-card";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { MonthPicker } from "@/components/ui/month-picker";
import { formatMoney } from "@/lib/money";
import { normalizeMonth, toMonthDisplay } from "@/lib/dates";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const summary = await getDashboardSummary(month);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#67715f]">ภาพรวมเดือน {toMonthDisplay(summary.month)}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">Dashboard</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <MonthPicker month={month} action="/dashboard" />
          <Link
            href="/transactions/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#184835]"
          >
            <Plus size={18} />
            เพิ่มรายการ
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="รายรับรวม" value={formatMoney(summary.totalIncome)} tone="income" />
        <SummaryCard label="รายจ่ายรวม" value={formatMoney(summary.totalExpense)} tone="expense" />
        <SummaryCard label="คงเหลือ" value={formatMoney(summary.balance)} tone="balance" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <WalletCards className="text-[#205b45]" size={20} />
            <h2 className="text-lg font-semibold text-[#151813]">สัดส่วนรายจ่าย</h2>
          </div>
          <ExpenseCategoryChart data={summary.expenseBreakdown} />
        </div>
        <BudgetStatusCard budget={summary.budget} totalExpense={summary.totalExpense} />
      </section>

      <RecentTransactions transactions={summary.recentTransactions} />
    </div>
  );
}
