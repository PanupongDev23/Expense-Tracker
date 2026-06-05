"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatMoney } from "@/lib/money";

type ExpenseCategoryChartProps = {
  data: Array<{
    name: string;
    amount: number;
  }>;
};

const colors = ["#205b45", "#9c2f1b", "#2f3f8f", "#b47b20", "#5f6f52", "#6d4b8d"];

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-[#d9dbd2] text-center text-sm font-medium text-[#67715f]">
        ยังไม่มีรายจ่ายในเดือนนี้
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[#465044]">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-[#151813]">{formatMoney(entry.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
