import Link from "next/link";
import { Plus } from "lucide-react";

import { listCategories } from "@/actions/categories";
import { listTransactions } from "@/actions/transactions";
import { SlipUploadButton } from "@/components/transactions/slip-upload-button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { normalizeMonth } from "@/lib/dates";
import type { TransactionType } from "@/types/domain";

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;
  const month = normalizeMonth(readString(params.month));
  const type = readString(params.type) as TransactionType | "all" | undefined;
  const categoryId = readString(params.categoryId);
  const [categories, transactions] = await Promise.all([
    listCategories(),
    listTransactions({ month, type, categoryId })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#67715f]">จัดการรายรับรายจ่าย</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <SlipUploadButton categories={categories} />
          <Link
            href="/transactions/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#184835]"
          >
            <Plus size={18} />
            เพิ่มรายการ
          </Link>
        </div>
      </div>

      <TransactionFilters month={month} type={type ?? "all"} categoryId={categoryId} categories={categories} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
