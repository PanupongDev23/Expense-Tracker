"use client";

import { useRouter } from "next/navigation";
import { ImageUp, Loader2, Plus, ScanLine, X } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";

import { createCategory } from "@/actions/categories";
import { createTransaction } from "@/actions/transactions";
import type { CategoryOption, TransactionType } from "@/types/domain";

type SlipResult = {
  amount: number;
  merchant: string;
  type: TransactionType;
  categoryId: string | null;
  suggestedCategoryName: string | null;
  date: string;
  note: string;
};

type FormState = {
  type: TransactionType;
  amount: string;
  categoryId: string;
  transactionDate: string;
  note: string;
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
  const [form, setForm] = useState<FormState | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<{ name: string; type: TransactionType } | null>(null);
  const [isAddingCategory, startAddCategoryTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  const matchingCategories = useMemo(
    () => categories.filter((c) => c.type === form?.type),
    [categories, form?.type]
  );

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setForm(null);
    setSuggestedCategory(null);
    setAnalyzeError(null);
    setSaveMessage(null);
  }

  async function onAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setForm(null);
    setSuggestedCategory(null);

    const fd = new FormData();
    fd.append("slip", file);
    // Send categories from client so API route doesn't need a DB call
    const categoryLines = categories.map((c) => `${c.id} | ${c.name} | ${c.type}`).join("\n");
    fd.append("categories", categoryLines);

    try {
      const res = await fetch("/api/analyze-slip", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setAnalyzeError(json.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        return;
      }

      const data = json.data as SlipResult;
      const today = new Date().toISOString().slice(0, 10);
      const type: TransactionType = data.type ?? "expense";

      // If AI matched a categoryId, use it; otherwise mark as unmatched
      const matchedCat = data.categoryId
        ? categories.find((c) => c.id === data.categoryId)
        : null;

      const fallbackCat = categories.find((c) => c.type === type);

      if (!matchedCat && data.suggestedCategoryName) {
        setSuggestedCategory({ name: data.suggestedCategoryName, type });
      }

      setForm({
        type,
        amount: String(data.amount ?? ""),
        categoryId: matchedCat?.id ?? fallbackCat?.id ?? "",
        transactionDate: data.date ?? today,
        note: data.note ?? data.merchant ?? ""
      });
    } catch {
      setAnalyzeError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function onAddSuggestedCategory() {
    if (!suggestedCategory || !form) return;

    startAddCategoryTransition(async () => {
      const result = await createCategory({
        name: suggestedCategory.name,
        type: suggestedCategory.type
      });

      if (!result.ok || !result.data) return;

      const newCat = result.data;
      setCategories((prev) => [...prev, newCat]);
      setForm((f) => f ? { ...f, categoryId: newCat.id } : f);
      setSuggestedCategory(null);
    });
  }

  function setType(type: TransactionType) {
    const firstCat = categories.find((c) => c.type === type);
    setSuggestedCategory(null);
    setForm((f) => f ? { ...f, type, categoryId: firstCat?.id ?? "" } : f);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveMessage(null);

    startSaveTransition(async () => {
      const result = await createTransaction({
        type: form.type,
        amount: form.amount,
        categoryId: form.categoryId,
        transactionDate: form.transactionDate,
        note: form.note
      });

      if (!result.ok) {
        setSaveMessage(result.message ?? "เกิดข้อผิดพลาด");
        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-[#dedfd8] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eceee7] px-5 py-4">
          <div className="flex items-center gap-2">
            <ScanLine size={20} className="text-[#205b45]" />
            <h2 className="text-base font-semibold text-[#151813]">อ่านจาก Slip</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-[#67715f] transition hover:bg-[#f3f4ef]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
          {/* Upload zone */}
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c9d0c3] bg-[#f8f9f5] py-6 transition hover:border-[#205b45] hover:bg-[#eef8f2]"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="slip preview" className="max-h-40 rounded-md object-contain" />
            ) : (
              <>
                <ImageUp size={32} className="text-[#67715f]" />
                <p className="text-sm font-medium text-[#465044]">คลิกเพื่อเลือกรูป Slip</p>
                <p className="text-xs text-[#67715f]">JPG, PNG, WEBP — ไม่เกิน 10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Analyze button */}
          {file && !form && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#205b45] text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  AI กำลังอ่าน Slip...
                </>
              ) : (
                <>
                  <ScanLine size={18} />
                  วิเคราะห์ Slip
                </>
              )}
            </button>
          )}

          {analyzeError && (
            <p className="rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">
              {analyzeError}
            </p>
          )}

          {/* Review form */}
          {form && (
            <form className="space-y-4" onSubmit={onSave}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#67715f]">ตรวจสอบข้อมูล</p>

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 rounded-md bg-[#eef1e8] p-1">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`h-9 rounded-md text-sm font-semibold transition ${
                    form.type === "income" ? "bg-white text-[#205b45] shadow-sm" : "text-[#465044]"
                  }`}
                >
                  รายรับ
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`h-9 rounded-md text-sm font-semibold transition ${
                    form.type === "expense" ? "bg-white text-[#9c2f1b] shadow-sm" : "text-[#465044]"
                  }`}
                >
                  รายจ่าย
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#151813]">จำนวนเงิน</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => f ? { ...f, amount: e.target.value } : f)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[#151813]">วันที่</span>
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => setForm((f) => f ? { ...f, transactionDate: e.target.value } : f)}
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-[#151813]">หมวดหมู่</span>
                <select
                  className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] bg-white px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                  value={form.categoryId}
                  onChange={(e) => {
                    setForm((f) => f ? { ...f, categoryId: e.target.value } : f);
                    setSuggestedCategory(null);
                  }}
                  required
                >
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  {matchingCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              {/* Suggested new category banner */}
              {suggestedCategory && (
                <div className="flex items-center justify-between rounded-md border border-[#c9dfd4] bg-[#eef8f2] px-3 py-2">
                  <p className="text-sm text-[#205b45]">
                    AI แนะนำหมวดหมู่ใหม่:{" "}
                    <span className="font-semibold">"{suggestedCategory.name}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={onAddSuggestedCategory}
                    disabled={isAddingCategory}
                    className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-md bg-[#205b45] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
                  >
                    {isAddingCategory ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    เพิ่ม
                  </button>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-[#151813]">โน้ต</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-[#d9dbd2] px-3 text-sm outline-none transition focus:border-[#205b45] focus:ring-2 focus:ring-[#c9dfd4]"
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((f) => f ? { ...f, note: e.target.value } : f)}
                  maxLength={280}
                />
              </label>

              {saveMessage && (
                <p className="rounded-md border border-[#f0c9c2] bg-[#fff2ef] px-3 py-2 text-sm font-medium text-[#9c2f1b]">
                  {saveMessage}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setForm(null); setPreview(null); setFile(null); setSuggestedCategory(null); }}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-[#d9dbd2] text-sm font-semibold text-[#465044] transition hover:bg-[#eef1e8]"
                >
                  สแกนใหม่
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !form.categoryId}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#205b45] text-sm font-semibold text-white transition hover:bg-[#184835] disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSaving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
