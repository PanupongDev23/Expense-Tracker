"use client";

import { useRouter } from "next/navigation";
import { ImageUp, Loader2, Plus, ScanLine, X } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";

import { createCategory } from "@/actions/categories";
import { createTransaction } from "@/actions/transactions";
import type { CategoryOption, TransactionType } from "@/types/domain";

type SlipItem = {
  id: string;
  note: string;
  amount: string;
  categoryId: string;
  suggestedCategoryName: string | null;
  selected: boolean;
};

type SlipHeader = {
  merchant: string;
  date: string;
  type: TransactionType;
};

type Props = {
  categories: CategoryOption[];
  onClose: () => void;
};

export function SlipUploadModal({ categories: initialCategories, onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [header, setHeader] = useState<SlipHeader | null>(null);
  const [items, setItems] = useState<SlipItem[]>([]);
  const [addingCategoryFor, setAddingCategoryFor] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isAddingCategory, startAddCategoryTransition] = useTransition();

  const categoriesByType = useMemo(() => ({
    expense: categories.filter((c) => c.type === "expense"),
    income: categories.filter((c) => c.type === "income")
  }), [categories]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setHeader(null);
    setItems([]);
    setAnalyzeError(null);
    setSaveMessage(null);
  }

  async function onAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setHeader(null);
    setItems([]);

    const fd = new FormData();
    fd.append("slip", file);
    const categoryLines = categories.map((c) => `${c.id} | ${c.name} | ${c.type}`).join("\n");
    fd.append("categories", categoryLines);

    try {
      const res = await fetch("/api/analyze-slip", { method: "POST", body: fd });
      let json: { ok?: boolean; error?: string; data?: unknown };
      try {
        json = await res.json();
      } catch {
        setAnalyzeError(`Server error ${res.status}`);
        return;
      }

      if (!res.ok || !json.ok) {
        setAnalyzeError(json.error ?? `Error ${res.status}`);
        return;
      }

      const data = json.data as {
        merchant: string;
        date: string;
        type: TransactionType;
        items: Array<{ note: string; amount: number; categoryId: string | null; suggestedCategoryName: string | null }>;
      };

      const today = new Date().toISOString().slice(0, 10);
      const type: TransactionType = data.type ?? "expense";
      const cats = categoriesByType[type];

      setHeader({
        merchant: data.merchant ?? "",
        date: data.date ?? today,
        type
      });

      setItems(
        (data.items ?? []).map((item, i) => {
          const matchedCat = item.categoryId ? categories.find((c) => c.id === item.categoryId) : null;
          const fallbackCat = cats[0];
          return {
            id: String(i),
            note: item.note ?? "",
            amount: String(item.amount ?? ""),
            categoryId: matchedCat?.id ?? fallbackCat?.id ?? "",
            suggestedCategoryName: !matchedCat ? (item.suggestedCategoryName ?? null) : null,
            selected: true
          };
        })
      );
    } catch (err) {
      setAnalyzeError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateItem(id: string, patch: Partial<SlipItem>) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function onAddSuggestedCategory(itemId: string, name: string, type: TransactionType) {
    setAddingCategoryFor(itemId);
    startAddCategoryTransition(async () => {
      const result = await createCategory({ name, type });
      if (!result.ok || !result.data) {
        setAddingCategoryFor(null);
        return;
      }
      const newCat = result.data;
      setCategories((prev) => [...prev, newCat]);
      updateItem(itemId, { categoryId: newCat.id, suggestedCategoryName: null });
      setAddingCategoryFor(null);
    });
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    if (!header) return;
    setSaveMessage(null);

    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      setSaveMessage("กรุณาเลือกอย่างน้อย 1 รายการ");
      return;
    }

    startSaveTransition(async () => {
      for (const item of selected) {
        const result = await createTransaction({
          type: header.type,
          amount: item.amount,
          categoryId: item.categoryId,
          transactionDate: header.date,
          note: item.note
        });
        if (!result.ok) {
          setSaveMessage(`บันทึก "${item.note}" ไม่สำเร็จ: ${result.message}`);
          return;
        }
      }
      router.refresh();
      onClose();
    });
  }

  const selectedCount = items.filter((i) => i.selected).length;
  const totalSelected = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl border border-[#dedfd8] bg-white shadow-xl" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eceee7] px-5 py-4">
          <div className="flex items-center gap-2">
            <ScanLine size={20} className="text-[#205b45]" />
            <h2 className="text-base font-semibold text-[#151813]">อ่านจาก Slip</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-md text-[#67715f] transition hover:bg-[#f3f4ef]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-5">
            {/* Upload zone */}
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c9d0c3] bg-[#f8f9f5] py-5 transition hover:border-[#205b45] hover:bg-[#eef8f2]"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="slip preview" className="max-h-32 rounded-md object-contain" />
              ) : (
                <>
                  <ImageUp size={28} className="text-[#67715f]" />
                  <p className="text-sm font-medium text-[#465044]">คลิกเพื่อเลือกรูป Slip</p>
                  <p className="text-xs text-[#67715f]">JPG, PNG, WEBP — ไม่เกิน 10MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={onFileChange} />
            </div>

            {/* Analyze button */}
            {file && items.length === 0 && (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
              >
                {isAnalyzing ? <><Loader2 size={18} className="animate-spin" />AI กำลังอ่าน Slip...</> : <><ScanLine size={18} />วิเคราะห์ Slip</>}
              </button>
            )}

            {analyzeError && (
              <p className="rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">{analyzeError}</p>
            )}

            {/* Header + Items */}
            {header && (
              <form onSubmit={onSave} className="space-y-4">
                {/* Slip Header */}
                <div className="rounded-lg border border-[#eceee7] bg-[#f8f9f5] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#67715f]">ข้อมูล Slip</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-[#151813]">ร้าน / ผู้รับเงิน</span>
                      <input
                        className="mt-1 h-9 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                        value={header.merchant}
                        onChange={(e) => setHeader((h) => h ? { ...h, merchant: e.target.value } : h)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-[#151813]">วันที่</span>
                      <input
                        className="mt-1 h-9 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                        type="date"
                        value={header.date}
                        onChange={(e) => setHeader((h) => h ? { ...h, date: e.target.value } : h)}
                        required
                      />
                    </label>
                    <div>
                      <span className="text-xs font-semibold text-[#151813]">ประเภท</span>
                      <div className="mt-1 grid grid-cols-2 gap-1 rounded-md bg-[#eef1e8] p-0.5">
                        {(["expense", "income"] as TransactionType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setHeader((h) => h ? { ...h, type: t } : h)}
                            className={`h-8 rounded-md text-xs font-semibold transition ${header.type === t ? (t === "expense" ? "bg-white text-[#9c2f1b] shadow-sm" : "bg-white text-[#205b45] shadow-sm") : "text-[#465044]"}`}
                          >
                            {t === "expense" ? "รายจ่าย" : "รายรับ"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#67715f]">รายการ ({items.length})</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setItems((prev) => prev.map((i) => ({ ...i, selected: true })))} className="text-xs font-medium text-[#205b45] hover:underline">เลือกทั้งหมด</button>
                      <span className="text-xs text-[#d9dbd2]">|</span>
                      <button type="button" onClick={() => setItems((prev) => prev.map((i) => ({ ...i, selected: false })))} className="text-xs font-medium text-[#67715f] hover:underline">ยกเลิกทั้งหมด</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => {
                      const cats = categoriesByType[header.type];
                      return (
                        <div key={item.id} className={`rounded-lg border p-3 transition ${item.selected ? "border-[#c9dfd4] bg-white" : "border-[#eceee7] bg-[#f8f9f5] opacity-60"}`}>
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => updateItem(item.id, { selected: e.target.checked })}
                              className="mt-1 size-4 accent-[#205b45]"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="grid gap-2 sm:grid-cols-3">
                                {/* Note */}
                                <label className="sm:col-span-2">
                                  <span className="text-xs font-semibold text-[#151813]">รายการ</span>
                                  <input
                                    className="mt-1 h-9 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                                    value={item.note}
                                    onChange={(e) => updateItem(item.id, { note: e.target.value })}
                                    maxLength={280}
                                  />
                                </label>
                                {/* Amount */}
                                <label>
                                  <span className="text-xs font-semibold text-[#151813]">จำนวนเงิน</span>
                                  <input
                                    className="mt-1 h-9 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0.01"
                                    value={item.amount}
                                    onChange={(e) => updateItem(item.id, { amount: e.target.value })}
                                    required={item.selected}
                                  />
                                </label>
                              </div>
                              {/* Category */}
                              <div>
                                <span className="text-xs font-semibold text-[#151813]">หมวดหมู่</span>
                                <select
                                  className="mt-1 h-9 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                                  value={item.categoryId}
                                  onChange={(e) => updateItem(item.id, { categoryId: e.target.value, suggestedCategoryName: null })}
                                  required={item.selected}
                                >
                                  <option value="" disabled>เลือกหมวดหมู่</option>
                                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                              {/* Suggested category banner */}
                              {item.suggestedCategoryName && (
                                <div className="flex items-center justify-between rounded-md border border-[#c9dfd4] bg-[#eef8f2] px-3 py-1.5">
                                  <p className="text-xs text-[#205b45]">
                                    AI แนะนำ: <span className="font-semibold">"{item.suggestedCategoryName}"</span>
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => onAddSuggestedCategory(item.id, item.suggestedCategoryName!, header.type)}
                                    disabled={isAddingCategory && addingCategoryFor === item.id}
                                    className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-[#205b45] px-2 py-1 text-xs font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
                                  >
                                    {isAddingCategory && addingCategoryFor === item.id ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                                    เพิ่ม
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {saveMessage && (
                  <p className="rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">{saveMessage}</p>
                )}

                {/* Footer */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setHeader(null); setItems([]); setPreview(null); setFile(null); }}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-[#d9dbd2] text-sm font-semibold text-[#465044] transition hover:bg-[#eef1e8]"
                  >
                    สแกนใหม่
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || selectedCount === 0}
                    className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-md bg-[#205b45] text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isSaving ? "กำลังบันทึก..." : `บันทึก ${selectedCount} รายการ (฿${totalSelected.toLocaleString("th-TH", { minimumFractionDigits: 2 })})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
