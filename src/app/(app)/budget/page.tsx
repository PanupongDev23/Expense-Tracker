import { getDashboardSummary } from "@/actions/dashboard";
import { BudgetForm } from "@/components/budget/budget-form";
import { BudgetStatusCard } from "@/components/budget/budget-status-card";
import { MonthPicker } from "@/components/ui/month-picker";
import { normalizeMonth, toMonthDisplay } from "@/lib/dates";

type BudgetPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const summary = await getDashboardSummary(month);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#67715f]">งบเดือน {toMonthDisplay(month)}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">Budget</h1>
        </div>
        <MonthPicker month={month} action="/budget" />
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <BudgetForm month={month} initialAmount={summary.budget.amount} />
        <BudgetStatusCard budget={summary.budget} totalExpense={summary.totalExpense} />
      </section>
    </div>
  );
}
