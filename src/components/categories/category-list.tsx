"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteCategory } from "@/actions/categories";
import type { CategoryOption } from "@/types/domain";

type CategoryListProps = {
  categories: CategoryOption[];
};

export function CategoryList({ categories }: CategoryListProps) {
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
      const result = await deleteCategory(id);
      setMessage(result.message ?? null);
      setPendingId(null);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#151813]">หมวดหมู่ทั้งหมด</h2>

      {message ? (
        <div className="mt-3 rounded-md border border-[#d9dbd2] bg-[#f7f7f4] px-3 py-2 text-sm font-medium text-[#465044]">
          {message}
        </div>
      ) : null}

      {/* Confirm dialog */}
      {confirmId ? (
        <div className="mt-3 rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-4 py-3 text-sm">
          <p className="font-semibold text-[#9c2f1b]">ยืนยันการลบหมวดหมู่นี้?</p>
          <p className="mt-0.5 text-[#67715f]">หมวดหมู่ที่มีรายการอยู่อาจไม่สามารถลบได้</p>
          <div className="mt-3 flex gap-2">
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-2 rounded-md border border-[#e6e7e0] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#151813]">{category.name}</p>
              <p className="text-xs uppercase tracking-normal text-[#67715f]">
                {category.type === "income" ? "รายรับ" : "รายจ่าย"}
                {category.userId ? " · custom" : " · default"}
              </p>
            </div>
            {category.userId ? (
              <button
                className="shrink-0 rounded-md p-1.5 text-[#9c2f1b] transition hover:bg-[#fff2ef] disabled:opacity-40"
                onClick={() => onDeleteClick(category.id)}
                disabled={isPending && pendingId === category.id}
                title="ลบหมวดหมู่"
              >
                <Trash2 size={15} />
              </button>
            ) : (
              <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-[#9ea89a]">default</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
