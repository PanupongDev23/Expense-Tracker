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
    <div className="w-full">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-[#465044]">{entry.name}</span>
            <span className="shrink-0 font-semibold tabular-nums text-[#151813]">{formatMoney(entry.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
