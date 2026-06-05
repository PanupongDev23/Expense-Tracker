import Link from "next/link";
import { Gauge, Pencil } from "lucide-react";

import { getBudgetStatusLabel } from "@/lib/dashboard";
import { formatMoney } from "@/lib/money";
import type { BudgetStatus } from "@/types/domain";

type BudgetStatusCardProps = {
  totalExpense: number;
  budget: {
    amount: number | null;
    usage: number;
    status: BudgetStatus;
  };
};

const statusClass: Record<BudgetStatus, string> = {
  not_set: "bg-[#f3f5ff] text-[#2f3f8f]",
  within_budget: "bg-[#eef8f2] text-[#205b45]",
  near_limit: "bg-[#fff6e8] text-[#8a5b12]",
  over_budget: "bg-[#fff2ef] text-[#9c2f1b]"
};

export function BudgetStatusCard({ budget, totalExpense }: BudgetStatusCardProps) {
  const percent = budget.amount ? Math.min(Math.round(budget.usage * 100), 999) : 0;
  const barWidth = budget.amount ? Math.min(percent, 100) : 0;

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge className="text-[#205b45]" size={20} />
          <h2 className="text-lg font-semibold text-[#151813]">สถานะงบประมาณ</h2>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusClass[budget.status]}`}>
          {getBudgetStatusLabel(budget.status)}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-[#67715f]">ใช้ไปแล้ว</span>
          <span className="font-semibold text-[#151813]">{formatMoney(totalExpense)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-[#67715f]">งบเดือนนี้</span>
          <span className="font-semibold text-[#151813]">{budget.amount ? formatMoney(budget.amount) : "-"}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#eef1e8]">
          <div
            className={`h-full rounded-full ${budget.status === "over_budget" ? "bg-[#9c2f1b]" : "bg-[#205b45]"}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="text-sm font-medium text-[#67715f]">{budget.amount ? `${percent}% ของงบเดือนนี้` : "ตั้งงบเพื่อเริ่มติดตามการใช้จ่าย"}</p>
      </div>

      <Link
        href="/budget"
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d9dbd2] px-4 text-sm font-semibold text-[#205b45] transition hover:bg-[#eef1e8]"
      >
        <Pencil size={16} />
        ตั้งงบ
      </Link>
    </section>
  );
}
