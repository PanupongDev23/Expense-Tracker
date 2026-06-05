"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  async function onLogout() {
    await signOut({ redirect: false });
    await fetch("/api/demo-logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d9dbd2] bg-white px-3 text-sm font-semibold text-[#465044] transition hover:bg-[#eef1e8]"
    >
      <LogOut size={18} />
      ออกจากระบบ
    </button>
  );
}
