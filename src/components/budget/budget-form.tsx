"use client";

import { Save } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import { upsertBudget } from "@/actions/budgets";
import { formatMoney } from "@/lib/money";

type BudgetFormProps = {
  month: string;
  initialAmount: number | null;
};

export function BudgetForm({ month, initialAmount }: BudgetFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await upsertBudget({ month, amount });
      setMessage(result.message ?? null);
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#151813]">ตั้งงบรายเดือน</h2>
      <p className="mt-2 text-sm text-[#67715f]">งบปัจจุบัน: {initialAmount ? formatMoney(initialAmount) : "-"}</p>

      {message ? (
        <div className="mt-4 rounded-md border border-[#d9dbd2] bg-[#f7f7f4] px-3 py-2 text-sm font-medium text-[#465044]">
          {message}
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">จำนวนเงิน</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          <Save size={18} />
          {isPending ? "กำลังบันทึก" : "บันทึกงบ"}
        </button>
      </form>
    </section>
  );
}
