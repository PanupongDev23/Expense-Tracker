import { Filter } from "lucide-react";

import type { CategoryOption, TransactionType } from "@/types/domain";

type TransactionFiltersProps = {
  month: string;
  type: TransactionType | "all";
  categoryId?: string;
  categories: CategoryOption[];
};

export function TransactionFilters({ month, type, categoryId, categories }: TransactionFiltersProps) {
  const visibleCategories = type === "all" ? categories : categories.filter((category) => category.type === type);

  return (
    <form
      action="/transactions"
      className="grid gap-3 rounded-lg border border-[#dedfd8] bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_1.2fr_auto]"
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-normal text-[#67715f]">เดือน</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
          type="month"
          name="month"
          defaultValue={month}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-normal text-[#67715f]">ประเภท</span>
        <select
          className="mt-1 h-10 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
          name="type"
          defaultValue={type}
        >
          <option value="all">ทั้งหมด</option>
          <option value="income">รายรับ</option>
          <option value="expense">รายจ่าย</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-normal text-[#67715f]">หมวดหมู่</span>
        <select
          className="mt-1 h-10 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
          name="categoryId"
          defaultValue={categoryId ?? ""}
        >
          <option value="">ทุกหมวดหมู่</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-[#205b45] px-4 text-sm font-semibold text-white transition hover:bg-[#184835]"
        type="submit"
      >
        <Filter size={18} />
        Filter
      </button>
    </form>
  );
}
