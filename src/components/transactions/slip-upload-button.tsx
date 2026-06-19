"use client";

import { ScanLine } from "lucide-react";
import { useState } from "react";

import { SlipUploadModal } from "./slip-upload-modal";
import type { CategoryOption } from "@/types/domain";

type Props = {
  categories: CategoryOption[];
};

export function SlipUploadButton({ categories }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#205b45] px-4 text-sm font-semibold text-[#205b45] transition hover:bg-[#eef8f2]"
      >
        <ScanLine size={18} />
        อัพโหลด Slip
      </button>

      {open && <SlipUploadModal categories={categories} onClose={() => setOpen(false)} />}
    </>
  );
}
