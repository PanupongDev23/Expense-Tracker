"use client";

import { Plus } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "@/actions/categories";
import type { TransactionType } from "@/types/domain";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await createCategory({ name, type });
      setMessage(result.message ?? null);

      if (result.ok) {
        setName("");
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#151813]">เพิ่มหมวดหมู่</h2>
      {message ? (
        <div className="mt-4 rounded-md border border-[#d9dbd2] bg-[#f7f7f4] px-3 py-2 text-sm font-medium text-[#465044]">
          {message}
        </div>
      ) : null}
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">ชื่อหมวดหมู่</span>
          <input
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#151813]">ประเภท</span>
          <select
            className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
          >
            <option value="expense">รายจ่าย</option>
            <option value="income">รายรับ</option>
          </select>
        </label>
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          <Plus size={18} />
          {isPending ? "กำลังเพิ่ม" : "เพิ่มหมวดหมู่"}
        </button>
      </form>
    </section>
  );
}
