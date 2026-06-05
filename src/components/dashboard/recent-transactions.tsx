import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatMoney } from "@/lib/money";
import type { TransactionRow } from "@/types/domain";

type RecentTransactionsProps = {
  transactions: TransactionRow[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#151813]">รายการล่าสุด</h2>
        <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#205b45]" href="/transactions">
          ดูทั้งหมด
          <ArrowRight size={16} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-[#d9dbd2] px-4 py-8 text-center text-sm font-medium text-[#67715f]">
          ยังไม่มีรายการในเดือนนี้
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#eceee7]">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#151813]">{transaction.categoryName}</p>
                <p className="text-xs text-[#67715f]">{transaction.transactionDate}</p>
              </div>
              <p className={`shrink-0 text-sm font-semibold ${transaction.type === "income" ? "text-[#205b45]" : "text-[#9c2f1b]"}`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatMoney(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
