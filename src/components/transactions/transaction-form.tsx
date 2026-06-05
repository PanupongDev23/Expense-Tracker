"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";

import { createTransaction, updateTransaction } from "@/actions/transactions";
import type { CategoryOption, TransactionType } from "@/types/domain";

type TransactionFormState = {
  type: TransactionType;
  amount: string;
  categoryId: string;
  transactionDate: string;
  note: string;
};

type TransactionFormProps = {
  categories: CategoryOption[];
  transactionId?: string;
  initialTransaction: TransactionFormState;
};

export function TransactionForm({ categories, transactionId, initialTransaction }: TransactionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<TransactionFormState>(() => ({
    ...initialTransaction,
    categoryId:
      initialTransaction.categoryId ||
      categories.find((category) => category.type === initialTransaction.type)?.id ||
      ""
  }));
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const [isPending, startTransition] = useTransition();
  const matchingCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  function setType(type: TransactionType) {
    const firstCategory = categories.find((category) => category.type === type);
    setForm((current) => ({
      ...current,
      type,
      categoryId: firstCategory?.id ?? ""
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors(undefined);

    const input = {
      type: form.type,
      amount: form.amount,
      categoryId: form.categoryId,
      transactionDate: form.transactionDate,
      note: form.note
    };

    startTransition(async () => {
      const result = transactionId ? await updateTransaction(transactionId, input) : await createTransaction(input);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors);
        return;
      }

      router.push("/transactions");
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      {message ? (
        <div className="mb-4 rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">
          {message}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <span className="text-sm font-semibold text-[#151813]">ประเภท</span>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-[#eef1e8] p-1">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                form.type === "income" ? "bg-white text-[#205b45] shadow-sm" : "text-[#465044]"
              }`}
            >
              รายรับ
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                form.type === "expense" ? "bg-white text-[#9c2f1b] shadow-sm" : "text-[#465044]"
              }`}
            >
              รายจ่าย
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#151813]">จำนวนเงิน</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              required
            />
            {fieldErrors?.amount ? <p className="mt-1 text-xs font-medium text-[#9c2f1b]">{fieldErrors.amount[0]}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#151813]">วันที่</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
              required
            />
            {fieldErrors?.transactionDate ? (
              <p className="mt-1 text-xs font-medium text-[#9c2f1b]">{fieldErrors.transactionDate[0]}</p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">หมวดหมู่</span>
          <select
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            value={form.categoryId}
            onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
            required
          >
            <option value="" disabled>
              เลือกหมวดหมู่
            </option>
            {matchingCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldErrors?.categoryId ? <p className="mt-1 text-xs font-medium text-[#9c2f1b]">{fieldErrors.categoryId[0]}</p> : null}
          {matchingCategories.length === 0 ? (
            <p className="mt-2 text-xs font-medium text-[#9c2f1b]">ยังไม่มีหมวดหมู่สำหรับประเภทนี้ กรุณาเพิ่มที่ Settings</p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">โน้ต</span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-[#d9dbd2] px-3 py-2 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            maxLength={280}
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/transactions"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d9dbd2] px-4 text-sm font-semibold text-[#465044] transition hover:bg-[#eef1e8]"
          >
            <ArrowLeft size={18} />
            กลับ
          </Link>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#205b45] px-5 text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
            type="submit"
            disabled={isPending || matchingCategories.length === 0}
          >
            <Save size={18} />
            {isPending ? "กำลังบันทึก" : "บันทึก"}
          </button>
        </div>
      </form>
    </section>
  );
}
