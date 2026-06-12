"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteTransaction } from "@/actions/transactions";
import { formatMoney } from "@/lib/money";
import type { TransactionRow } from "@/types/domain";

type TransactionTableProps = {
  transactions: TransactionRow[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDeleteClick(id: string) {
    setConfirmId(id);
  }

  function onConfirmDelete() {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    setPendingId(id);
    setMessage(null);

    startTransition(async () => {
      const result = await deleteTransaction(id);
      setMessage(result.message ?? null);
      setPendingId(null);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white shadow-sm">
      {message ? (
        <div className="border-b border-[#eceee7] px-4 py-3 text-sm font-medium text-[#465044]">{message}</div>
      ) : null}

      {/* Confirm dialog */}
      {confirmId ? (
        <div className="border-b border-[#f0c9c2] bg-[#fff2ef] px-4 py-3 text-sm">
          <p className="font-semibold text-[#9c2f1b]">ยืนยันการลบรายการนี้?</p>
          <div className="mt-2 flex gap-2">
            <button
              className="inline-flex h-8 items-center justify-center rounded-md bg-[#9c2f1b] px-3 text-xs font-semibold text-white transition hover:bg-[#7a2414]"
              onClick={onConfirmDelete}
              disabled={isPending}
            >
              ลบ
            </button>
            <button
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#d9dbd2] px-3 text-xs font-semibold text-[#465044] transition hover:bg-[#f3f4ef]"
              onClick={() => setConfirmId(null)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ) : null}

      {transactions.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm font-medium text-[#67715f]">ยังไม่มีรายการในเงื่อนไขนี้</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#eceee7] text-left text-xs font-semibold uppercase tracking-normal text-[#67715f]">
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3">โน้ต</th>
                <th className="px-4 py-3 text-right">จำนวนเงิน</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-[#f0f1ec] last:border-0">
                  <td className="px-4 py-3 font-medium text-[#151813]">{transaction.transactionDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        transaction.type === "income" ? "bg-[#eef8f2] text-[#205b45]" : "bg-[#fff2ef] text-[#9c2f1b]"
                      }`}
                    >
                      {transaction.type === "income" ? "รายรับ" : "รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#151813]">{transaction.categoryName}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[#67715f]">{transaction.note ?? "-"}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums ${
                      transaction.type === "income" ? "text-[#205b45]" : "text-[#9c2f1b]"
                    }`}
                  >
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/transactions/${transaction.id}/edit`}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-[#d9dbd2] text-[#465044] transition hover:bg-[#eef1e8]"
                        title="แก้ไข"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(transaction.id)}
                        disabled={isPending && pendingId === transaction.id}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-[#f0c9c2] text-[#9c2f1b] transition hover:bg-[#fff2ef] disabled:opacity-60"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
